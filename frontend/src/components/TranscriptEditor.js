import React from 'react';

function TranscriptEditor({ segments, onUpdate }) {
  const isAgent = (speaker) => String(speaker ?? '').includes('0');

  const toggleSpeaker = (currentSpeaker) => {
    return isAgent(currentSpeaker) ? 'Speaker 1' : 'Speaker 0';
  };

  const formatSpeaker = (speaker) => {
    return isAgent(speaker) ? 'AI Agent' : 'Candidate';
  };

  const getSpeakerClass = (speaker) => {
    return isAgent(speaker) ? 'agent' : 'candidate';
  };

  return (
    <div className="transcript-container">
      {segments.map((segment, index) => (
        <div key={segment.id} className={`bubble-row ${getSpeakerClass(segment.speaker)}`}>
          <div className={`speaker-bubble ${getSpeakerClass(segment.speaker)}`}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <button
              onClick={() => onUpdate(segment.id, 'speaker', toggleSpeaker(segment.speaker))}
              className={`speaker-label ${getSpeakerClass(segment.speaker)}`}
              style={{ background: 'none', border: 'none', padding: 0 }}
            >
              <span>👤</span>
              <span>{formatSpeaker(segment.speaker)}</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>✏️</span>
            </button>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Segment {index + 1}</span>
          </div>

          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onUpdate(segment.id, 'text', e.target.textContent.trim())}
            className="transcript-text"
          >
            {segment.text}
          </div>

          {segment.confidence && (
            <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                Confidence: {(segment.confidence * 100).toFixed(1)}%
              </div>
            </div>
          )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default TranscriptEditor;
