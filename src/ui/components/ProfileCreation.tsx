import React, { useState } from 'react';
import { ProfileManager } from '../../logic/profileManager';
import './ProfileCreation.css';

interface ProfileCreationProps {
  onProfileCreated: (displayName: string) => void;
}

export const ProfileCreation: React.FC<ProfileCreationProps> = ({ onProfileCreated }) => {
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const profileManager = new ProfileManager();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDisplayName(value);
    
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

    try {
      const profile = profileManager.createProfile(displayName);
      onProfileCreated(profile.displayName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
    }
  };

  const isValid = displayName.length > 0 && !error;
  const charCount = displayName.length;

  return (
    <div className="profile-creation-overlay">
      <div className="profile-creation-modal">
        <h2>Welcome!</h2>
        <p>Create your player profile to get started</p>
        
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
          </div>
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={!isValid}
          >
            Create Profile
          </button>
        </form>
      </div>
    </div>
  );
};
