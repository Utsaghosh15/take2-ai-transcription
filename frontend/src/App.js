import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import TranscriptEditor from './components/TranscriptEditor';
import AudioPlayer from './components/AudioPlayer';

// Import icons inline (simple SVG)
const MicIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);

const FileAudioIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <path d="M9 18v-7"/>
    <path d="M12 18v-5"/>
  </svg>
);

const apiBase = process.env.REACT_APP_API_URL || '';

function App() {
  const [segments, setSegments] = useState([]);
  const [audioUrl, setAudioUrl] = useState(null);
  const [transcriptId, setTranscriptId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (file) => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', file);

      const response = await fetch(apiBase + '/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const text = await response.text();
        let errorMessage = 'Upload failed';
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.error || errorMessage;
        } catch (_) {}
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setSegments(data.segments);
      setAudioUrl(data.audioUrl?.startsWith('http') ? data.audioUrl : apiBase + data.audioUrl);
      setTranscriptId(data.transcriptId);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSegmentUpdate = async (segmentId, field, value) => {
    // Update local state
    const updatedSegments = segments.map(seg =>
      seg.id === segmentId ? { ...seg, [field]: value } : seg
    );
    setSegments(updatedSegments);

    // Save to backend
    if (transcriptId) {
      try {
        await fetch(apiBase + `/api/transcript/${transcriptId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ segments: updatedSegments })
        });
      } catch (err) {
        console.error('Failed to save:', err);
      }
    }
  };

  const handleReset = () => {
    setSegments([]);
    setAudioUrl(null);
    setTranscriptId(null);
    setError(null);
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo-section">
              <div className="logo-icon" style={{ color: 'white' }}>
                <MicIcon />
              </div>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Take2 AI</h1>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Interview Transcription</p>
              </div>
            </div>
            {segments.length > 0 && (
              <button onClick={handleReset} className="btn">
                New Transcript
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        {error && (
          <div className="error-box">
            <p style={{ fontSize: '0.875rem', color: '#991b1b' }}>{error}</p>
          </div>
        )}

        {segments.length === 0 ? (
          <div style={{ maxWidth: '42rem', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ color: '#3b82f6', margin: '0 auto 1rem' }}>
                <FileAudioIcon />
              </div>
              <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Upload Interview Recording
              </h2>
              <p style={{ color: '#6b7280' }}>
                Upload an audio file to automatically transcribe
              </p>
            </div>

            <FileUpload onUpload={handleFileUpload} isUploading={isUploading} />

            <div className="feature-grid">
              <div className="feature-card">
                <div style={{ background: '#dbeafe', width: '3rem', height: '3rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                  <span style={{ color: '#2563eb' }}>🎤</span>
                </div>
                <h3 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Auto-Transcribe</h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Deepgram AI</p>
              </div>
              <div className="feature-card">
                <div style={{ background: '#f3e8ff', width: '3rem', height: '3rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                  <span style={{ color: '#7c3aed' }}>✏️</span>
                </div>
                <h3 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Easy Editing</h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Fix text & speakers</p>
              </div>
              <div className="feature-card">
                <div style={{ background: '#d1fae5', width: '3rem', height: '3rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                  <span style={{ color: '#059669' }}>▶️</span>
                </div>
                <h3 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Playback</h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Listen while reading</p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="card">
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                Transcript ({segments.length} segments)
              </h2>
              <TranscriptEditor segments={segments} onUpdate={handleSegmentUpdate} />
            </div>

            {audioUrl && (
              <div className="card">
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Audio Playback</h2>
                <AudioPlayer audioUrl={audioUrl} />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
