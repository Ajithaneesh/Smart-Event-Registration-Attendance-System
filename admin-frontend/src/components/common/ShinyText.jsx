import React from 'react';

export default function ShinyText({ text, speed = 4, className = '', disabled = false }) {
  const duration = `${speed}s`;

  if (disabled) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span
      className={`shiny-text ${className}`}
      style={{
        animationDuration: duration,
      }}
    >
      {text}
    </span>
  );
}
