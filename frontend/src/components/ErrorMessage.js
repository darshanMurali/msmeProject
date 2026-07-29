import React from 'react';
import './ErrorMessage.css';

const ErrorMessage = ({ message, onClose }) => {
  if (!message) return null;

  const getErrorIcon = () => {
    if (message.toLowerCase().includes('success') || message.includes('✅')) {
      return '✅';
    }
    if (message.toLowerCase().includes('warning') || message.includes('⚠️')) {
      return '⚠️';
    }
    return '❌';
  };

  const getErrorClass = () => {
    if (message.toLowerCase().includes('success') || message.includes('✅')) {
      return 'error-message success';
    }
    if (message.toLowerCase().includes('warning') || message.includes('⚠️')) {
      return 'error-message warning';
    }
    return 'error-message error';
  };

  return (
    <div className={getErrorClass()}>
      <span className="error-icon">{getErrorIcon()}</span>
      <span className="error-text">{message}</span>
      {onClose && (
        <button className="error-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
