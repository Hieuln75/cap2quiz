import React from 'react';

export default function TimerBadge({ time }) {
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 24,
        right: 24,
        fontWeight: 'bold',
        backgroundColor: '#007bff',
        color: 'white',
        padding: '8px 12px',
        borderRadius: 6,
        userSelect: 'none',
        fontSize: '1rem',
      }}
    >
      Thời gian: {formatTime(time)}
    </div>
  );
}
