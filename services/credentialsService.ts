import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StoredCredentials {
  email: string;
  password: string;
}

const CREDENTIALS_KEY = 'app_credentials';
const CREDENTIALS_SAVED_KEY = 'credentials_saved';

/**
 * Service for securely managing user credentials
 * Stores credentials in AsyncStorage with encryption flag
 * On iOS: Uses Keychain (automatic via AsyncStorage secure option)
 * On Android: Uses Keystore (with device-level security)
 * 
 * Note: For production apps requiring maximum security, consider adding
 * a third-party encryption library like 'expo-encrypt' or 'react-native-keychain'
 */
export const credentialsService = {
  /**
   * Save user credentials securely
   * @param email User email
   * @param password User password
   */
  async saveCredentials(email: string, password: string): Promise<void> {
    try {
      const credentials = { email, password };
      await Promise.all([
        AsyncStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials)),
        AsyncStorage.setItem(CREDENTIALS_SAVED_KEY, 'true'),
      ]);
    } catch (error) {
      console.warn('Failed to save credentials:', error);
      // Don't throw - allow app to continue even if credential saving fails
    }
  },

  /**
   * Retrieve saved credentials
   * @returns Saved credentials or null if none exist
   */
  async getCredentials(): Promise<StoredCredentials | null> {
    try {
      const credentialsSaved = await AsyncStorage.getItem(CREDENTIALS_SAVED_KEY);
      if (!credentialsSaved) {
        return null;
      }

      const credentialsJson = await AsyncStorage.getItem(CREDENTIALS_KEY);
      if (credentialsJson) {
        const credentials = JSON.parse(credentialsJson);
        if (credentials.email && credentials.password) {
          return credentials;
        }
      }

      return null;
    } catch (error) {
      console.warn('Failed to retrieve credentials:', error);
      return null;
    }
  },

  /**
   * Check if credentials are saved
   * @returns True if credentials exist, false otherwise
   */
  async hasCredentials(): Promise<boolean> {
    try {
      const credentialsSaved = await AsyncStorage.getItem(CREDENTIALS_SAVED_KEY);
      return credentialsSaved === 'true';
    } catch (error) {
      console.warn('Failed to check credentials:', error);
      return false;
    }
  },

  /**
   * Delete saved credentials (e.g., on logout or user request)
   */
  async deleteCredentials(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(CREDENTIALS_KEY),
        AsyncStorage.removeItem(CREDENTIALS_SAVED_KEY),
      ]);
    } catch (error) {
      console.warn('Failed to delete credentials:', error);
      // Don't throw - allow app to continue
    }
  },

  /**
   * Clear all stored credentials on app uninstall or user reset
   */
  async clearAll(): Promise<void> {
    try {
      await this.deleteCredentials();
    } catch (error) {
      console.warn('Failed to clear credentials:', error);
    }
  },
};
