import React, { useState, useRef, useEffect } from 'react';

function AudioPlayer({ audioUrl }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    audioRef.current.currentTime = percentage * duration;
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div>
      <audio ref={audioRef} src={audioUrl} preload="metadata" style={{ display: 'none' }} />

      <div className="audio-controls">
        <div className="progress-bar" onClick={handleSeek}>
          <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6b7280', marginBottom: '1rem' }}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={togglePlay} className="play-button">
              {isPlaying ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16"/>
                  <rect x="14" y="4" width="4" height="16"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              )}
            </button>
            <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
        </div>
      </div>

      <div style={{ paddingTop: '1rem', borderTop: '1px solid #e5e7eb', marginTop: '1rem' }}>
        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>Native controls:</p>
        <audio controls src={audioUrl} style={{ width: '100%' }} />
      </div>
    </div>
  );
}

export default AudioPlayer;
