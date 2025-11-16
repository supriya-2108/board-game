import { IProfileManager, PlayerProfile, ProfileValidationResult } from '../types';

const STORAGE_KEY = 'playerProfile';

export class ProfileManager implements IProfileManager {
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  validateDisplayName(name: string): ProfileValidationResult {
    const trimmed = name.trim();
    
    if (trimmed.length < 1) {
      return { valid: false, error: "Display name cannot be empty" };
    }
    
    if (trimmed.length > 20) {
      return { valid: false, error: "Display name must be 20 characters or less" };
    }
    
    // Check for leading/trailing spaces
    if (name !== trimmed) {
      return { valid: false, error: "Display name cannot have leading or trailing spaces" };
    }
    
    // Check for consecutive spaces and valid characters
    const validPattern = /^[a-zA-Z0-9]+( [a-zA-Z0-9]+)*$/;
    if (!validPattern.test(trimmed)) {
      return { valid: false, error: "Display name can only contain letters, numbers, and single spaces" };
    }
    
    return { valid: true };
  }

  createProfile(displayName: string): PlayerProfile {
    const validation = this.validateDisplayName(displayName);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const profile: PlayerProfile = {
      id: this.generateUUID(),
      displayName: displayName.trim(),
      createdAt: Date.now(),
      gamesPlayed: 0,
      wins: 0
    };

    this.updateProfile(profile);
    return profile;
  }

  getProfile(): PlayerProfile | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return null;
      }
      
      const profile = JSON.parse(stored) as PlayerProfile;
      
      // Validate the loaded profile has required fields
      if (!profile.id || !profile.displayName || !profile.createdAt) {
        console.error('Corrupted profile data detected');
        this.clearProfile();
        return null;
      }
      
      return profile;
    } catch (error) {
      console.error('Error loading profile:', error);
      this.clearProfile();
      return null;
    }
  }

  updateProfile(profile: PlayerProfile): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving profile to local storage:', error);
      // Fallback: profile will be session-only
    }
  }

  updateDisplayName(newDisplayName: string): ProfileValidationResult {
    const validation = this.validateDisplayName(newDisplayName);
    if (!validation.valid) {
      return validation;
    }

    const profile = this.getProfile();
    if (!profile) {
      return { valid: false, error: "No profile found" };
    }

    profile.displayName = newDisplayName.trim();
    this.updateProfile(profile);
    
    return { valid: true };
  }

  hasProfile(): boolean {
    return this.getProfile() !== null;
  }

  clearProfile(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing profile:', error);
    }
  }
}
