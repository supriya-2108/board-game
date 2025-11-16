import React, { useState } from 'react';
import { ProfileManager } from '../../logic/profileManager';
import './EditDisplayName.css';

interface EditDisplayNameProps {
  currentName: string;
  onClose: () => void;
  onSave: (newName: string) => void;
}

export const EditDisplayName: React.FC<EditDisplayNameProps> = ({
  currentName,
  onClose,
  onSave,
}) => {
  const [displayName, setDisplayName] = useState(currentName);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const profileManager = new ProfileManager();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDisplayName(value);
    setShowSuccess(false);
    
    // Real-time validation
    if (value.length > 0) {
      const validation = profileManager.validateDisplayName(value);
      setError(validation.valid ? null : validation.error || null);
    } else {
      setError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = profileManager.validateDisplayName(displayName);
    if (!validation.valid) {
      setError(validation.error || 'Invalid display name');
      return;
    }

    const result = profileManager.updateDisplayName(displayName);
    if (result.valid) {
      setShowSuccess(true);
      onSave(displayName);
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setError(result.error || 'Failed to update display name');
    }
  };

  const isValid = displayName.length > 0 && !error && displayName !== currentName;
  const charCount = displayName.length;

  return (
    <div className="edit-display-name-overlay" onClick={onClose}>
      <div className="edit-display-name-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Display Name</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="displayName">Display Name</label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={handleInputChange}
              placeholder="Enter your name"
              maxLength={20}
              autoFocus
            />
            <div className="input-footer">
              <span className={`char-counter ${charCount > 20 ? 'error' : ''}`}>
                {charCount}/20
              </span>
            </div>
            {error && <div className="error-message">{error}</div>}
            {showSuccess && <div className="success-message">Display name updated successfully!</div>}
          </div>
          
          <div className="button-group">
            <button 
              type="submit" 
              className="save-button"
              disabled={!isValid}
            >
              Save
            </button>
            <button 
              type="button" 
              className="cancel-button"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
