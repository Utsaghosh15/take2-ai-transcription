# Take2 AI - Interview Transcription App

Full-stack application for transcribing AI-agent interviews with automatic speaker diarization.

## Tech Stack
- **Backend:** Node.js + Express + Deepgram API
- **Frontend:** React (Create React App)
- **Deployment:** Railway (Backend) + Vercel (Frontend)

## Features
✅ Upload audio files (MP3, MP4, M4A, WAV)
✅ Automatic transcription with speaker detection
✅ Inline editing (text + speaker labels)
✅ Speaker bubble visualization
✅ Audio playback with custom controls

## Local Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Add your DEEPGRAM_API_KEY to .env (get from https://console.deepgram.com)
npm run dev
```

Backend runs on http://localhost:3001

### Frontend
```bash
cd frontend
npm install
npm start
```

Frontend runs on http://localhost:3000 (proxies to backend automatically)

## API Endpoints
- `POST /api/upload` - Upload & transcribe audio
- `GET /api/transcript/:id` - Get transcript
- `PUT /api/transcript/:id` - Update segments
- `DELETE /api/transcript/:id` - Delete transcript

## Architecture
- **Deepgram Integration:** Nova-2 model with utterances for clean speaker separation
- **State Management:** Simple React useState hooks
- **File Storage:** Temporary server storage (in-memory Map + filesystem)
- **Editing:** ContentEditable with auto-save on blur

## Future Enhancements
- Persistent storage (PostgreSQL + S3)
- User authentication
- Edit history / undo-redo
- Audio-transcript sync
- Export formats (JSON, TXT, SRT)
