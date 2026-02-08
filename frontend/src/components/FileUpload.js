import React, { useState } from 'react';

function FileUpload({ onUpload, isUploading }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <div
        className={`upload-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="upload-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '0.25rem' }}>
            {isDragging ? 'Drop your file here' : 'Drop your audio file here'}
          </p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>or</p>
        </div>
        <label>
          <input
            type="file"
            accept="audio/*,video/mp4"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            disabled={isUploading}
          />
          <span className="btn btn-primary" style={{ display: 'inline-block', cursor: 'pointer' }}>
            Browse Files
          </span>
        </label>
        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '1rem' }}>
          MP3, MP4, M4A, WAV (Max 50MB)
        </p>
      </div>

      {selectedFile && (
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>📄</span>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: '500', margin: 0 }}>{selectedFile.name}</p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            {isUploading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6' }}>
                <div style={{ width: '1.25rem', height: '1.25rem', border: '2px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Processing...</span>
              </div>
            ) : (
              <button onClick={() => onUpload(selectedFile)} className="btn btn-success">
                Transcribe
              </button>
            )}
          </div>
        </div>
      )}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default FileUpload;
