import React, { useState, useEffect } from 'react';
import { ProfileManager } from '../../logic/profileManager';
import { PlayerProfile } from '../../types';
import './ProfileSettings.css';

interface ProfileSettingsProps {
  profile: PlayerProfile;
  onClose: () => void;
  onProfileUpdated: (displayName: string) => void;
  onEditDisplayName: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  profile,
  onClose,
  onProfileUpdated,
  onEditDisplayName,
}) => {
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const profileManager = new ProfileManager();

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Handle escape key press
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 250); // Match animation duration
  };

  const handleClearProfile = () => {
    profileManager.clearProfile();
    handleClose();
    // Reload page to show profile creation after animation
    setTimeout(() => {
      window.location.reload();
    }, 250);
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div 
      className={`profile-settings-overlay ${isClosing ? 'fade-out-animation' : 'fade-in-animation'}`} 
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-settings-title"
    >
      <div 
        className={`profile-settings-modal ${isClosing ? 'modal-slide-out-animation' : 'modal-slide-in-animation'}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="profile-settings-title">Profile Settings</h2>
          <button 
            className="close-button" 
            onClick={handleClose}
            aria-label="Close profile settings"
          >
            ×
          </button>
        </div>

        <div className="profile-info" role="region" aria-label="Profile information">
          <div className="info-row">
            <span className="info-label">Display Name:</span>
            <span className="info-value">{profile.displayName}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Member Since:</span>
            <span className="info-value">{formatDate(profile.createdAt)}</span>
          </div>
          {profile.gamesPlayed !== undefined && (
            <div className="info-row">
              <span className="info-label">Games Played:</span>
              <span className="info-value">{profile.gamesPlayed}</span>
            </div>
          )}
          {profile.wins !== undefined && (
            <div className="info-row">
              <span className="info-label">Wins:</span>
              <span className="info-value">{profile.wins}</span>
            </div>
          )}
        </div>

        <div className="settings-actions">
          <button 
            className="action-button primary" 
            onClick={onEditDisplayName}
            aria-label="Edit your display name"
          >
            Edit Display Name
          </button>
          <button 
            className="action-button danger" 
            onClick={() => setShowConfirmClear(true)}
            aria-label="Clear your profile"
          >
            Clear Profile
          </button>
        </div>

        {showConfirmClear && (
          <div 
            className="confirm-dialog" 
            role="alertdialog"
            aria-labelledby="confirm-clear-title"
            aria-describedby="confirm-clear-description"
          >
            <p id="confirm-clear-description">Are you sure you want to clear your profile? This cannot be undone.</p>
            <div className="confirm-actions">
              <button 
                className="confirm-button danger" 
                onClick={handleClearProfile}
                aria-label="Confirm clear profile"
              >
                Yes, Clear Profile
              </button>
              <button 
                className="confirm-button" 
                onClick={() => setShowConfirmClear(false)}
                aria-label="Cancel clear profile"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
