import React, { useEffect } from 'react';
import './ErrorTooltip.css';

interface ErrorTooltipProps {
  message: string | null;
  onClose: () => void;
}

const ErrorTooltip: React.FC<ErrorTooltipProps> = ({ message, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) {
    return null;
  }

  return (
    <div className="error-tooltip">
      <div className="error-content">{message}</div>
    </div>
  );
};

export default ErrorTooltip;
