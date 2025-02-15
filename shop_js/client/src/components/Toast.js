import React, { useEffect } from 'react';

function Toast({ message, duration = 2000, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!message) return null;

  return (
    <div className="toast-popup">
      {message}
    </div>
  );
}

export default Toast;
