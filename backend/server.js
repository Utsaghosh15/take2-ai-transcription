import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { createClient } from '@deepgram/sdk';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => cb(null, uuidv4() + '-' + (file.originalname || 'audio')),
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = file.mimetype.startsWith('audio/') || file.mimetype === 'video/mp4';
    if (ok) cb(null, true);
    else cb(new Error('Only audio files or video/mp4 are allowed'), false);
  },
});

const deepgram = createClient(process.env.DEEPGRAM_API_KEY || '');
const transcripts = new Map();

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/upload', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const filePath = req.file.path;
    const audioBuffer = fs.readFileSync(filePath);

    const options = {
      model: 'nova-2',
      language: 'en',
      diarize: true,
      multichannel: true, // Enable stereo channel processing
      punctuate: true,
      utterances: true,
      smart_format: true,
    };

    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(audioBuffer, options);

    if (error) {
      console.error('Deepgram error:', error);
      return res.status(500).json({ error: error.message || 'Transcription failed' });
    }

    console.log('=== DEEPGRAM RAW RESPONSE (JSON) ===');
    console.log(JSON.stringify(result, null, 2));
    console.log('====================================');

    // Process Deepgram result into segments
    let segments = [];

    if (result.results?.utterances && result.results.utterances.length > 0) {
      segments = result.results.utterances.map((utterance) => ({
        id: uuidv4(),
        speaker: `Speaker ${utterance.speaker ?? 0}`,
        text: utterance.transcript,
        start: utterance.start,
        end: utterance.end,
        confidence: utterance.confidence
      }));

      // If Deepgram labeled everyone as Speaker 0, use speaker_confidence to split Agent vs Candidate
      const uniqueSpeakers = [...new Set(segments.map((s) => s.speaker))];
      if (uniqueSpeakers.length === 1 && result.results.utterances.some((u) => u.words?.length > 0)) {
        segments = result.results.utterances.map((utterance) => {
          const avgConfidence =
            utterance.words?.length > 0
              ? utterance.words.reduce((sum, w) => sum + (w.speaker_confidence ?? 0.5), 0) / utterance.words.length
              : 0.5;
          const detectedSpeaker = avgConfidence > 0.5 ? 0 : 1;
          return {
            id: uuidv4(),
            speaker: `Speaker ${detectedSpeaker}`,
            text: utterance.transcript,
            start: utterance.start,
            end: utterance.end,
            confidence: utterance.confidence
          };
        });
      }
    } else {
      const transcript = result.results?.channels?.[0]?.alternatives?.[0]?.transcript || 'No transcription available';
      segments = [{
        id: uuidv4(),
        speaker: 'Speaker 0',
        text: transcript,
        start: 0,
        end: 0
      }];
    }

    // Dedupe 1: exact key (start + end + text) – removes identical multichannel copies
    const seenKey = new Set();
    segments = segments.filter((seg) => {
      const key = `${seg.start}-${seg.end}-${(seg.text || '').trim()}`;
      if (seenKey.has(key)) return false;
      seenKey.add(key);
      return true;
    });

    // Dedupe 2: consecutive same speaker + same text – removes back-to-back repeats
    segments = segments.filter((seg, i) => {
      if (i === 0) return true;
      const prev = segments[i - 1];
      const text = (seg.text || '').trim();
      const prevText = (prev.text || '').trim();
      if (prev.speaker === seg.speaker && prevText === text) return false;
      return true;
    });

    const transcriptId = uuidv4();
    transcripts.set(transcriptId, {
      id: transcriptId,
      segments,
      audioUrl: `/uploads/${path.basename(filePath)}`,
      filePath,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    res.json({
      transcriptId,
      segments,
      audioUrl: `/uploads/${path.basename(filePath)}`,
      message: 'Transcription successful',
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'Upload failed' });
  }
});

app.get('/api/transcript/:id', (req, res) => {
  const transcript = transcripts.get(req.params.id);
  if (!transcript) {
    return res.status(404).json({ error: 'Transcript not found' });
  }
  res.json(transcript);
});

app.put('/api/transcript/:id', (req, res) => {
  const transcript = transcripts.get(req.params.id);
  if (!transcript) {
    return res.status(404).json({ error: 'Transcript not found' });
  }
  const { segments } = req.body;
  if (!Array.isArray(segments)) {
    return res.status(400).json({ error: 'segments array is required' });
  }
  transcript.segments = segments;
  transcript.updatedAt = new Date().toISOString();
  res.json({ success: true, message: 'Transcript updated' });
});

app.delete('/api/transcript/:id', (req, res) => {
  const transcript = transcripts.get(req.params.id);
  if (!transcript) {
    return res.status(404).json({ error: 'Transcript not found' });
  }
  if (transcript.filePath && fs.existsSync(transcript.filePath)) {
    fs.unlinkSync(transcript.filePath);
  }
  transcripts.delete(req.params.id);
  res.json({ success: true, message: 'Transcript deleted' });
});

app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large (max 50MB)' });
    }
    if (err.code === 'LIMIT_FILE_TYPE' || err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Invalid file type. Use audio or video/mp4.' });
    }
  }
  if (err.message && (err.message.includes('audio') || err.message.includes('video'))) {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
