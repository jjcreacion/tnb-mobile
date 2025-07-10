import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import styles from '../styles';
import { FontAwesome } from '@expo/vector-icons'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

interface SetNewPasswordProps {
  isVisible: boolean;
  onClose: () => void;
}

const SetNewPassword: React.FC<SetNewPasswordProps> = ({ isVisible, onClose }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false); 
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); 

  const API_URL = Constants.expoConfig?.extra?.API_BASE_URL;

  const validatePassword = () => {
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) {
      return;
    }

    setLoading(true);
    let userEmail = '';
    try {
      userEmail = await AsyncStorage.getItem('emailForPasswordReset') || '';
      if (!userEmail) {
        Alert.alert('Error', 'User email not found. Please restart the password reset process.');
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('Error getting email from AsyncStorage:', error);
      Alert.alert('Error', 'Could not retrieve user information. Please try again.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/user/reset-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          newPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Your password has been successfully changed!', [
          { text: 'OK', onPress: onClose }
        ]);
        await AsyncStorage.removeItem('emailForPasswordReset');
      } else {
        Alert.alert('Error', data.message || 'Failed to change password. Please try again.');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.modalContainer}>
      <Text style={[{ marginBottom: 20, textAlign: 'center' }, styles.textH1]}>Set New Password</Text>

      <Text style={styles.textH2Black}>New Password</Text>
      <View style={localStyles.passwordInputContainer}>
        <TextInput
          style={[styles.input, localStyles.passwordInput, passwordError && { borderColor: 'red', borderWidth: 1 }]}
          placeholder="Enter your new password"
          secureTextEntry={!showNewPassword} 
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TouchableOpacity
          onPress={() => setShowNewPassword(!showNewPassword)}
          style={localStyles.eyeIcon}
        >
          <FontAwesome
            name={showNewPassword ? 'eye-slash' : 'eye'} 
            size={20}
            color="gray"
          />
        </TouchableOpacity>
      </View>


      <Text style={styles.textH2Black}>Confirm New Password</Text>
      <View style={localStyles.passwordInputContainer}>
        <TextInput
          style={[styles.input, localStyles.passwordInput, passwordError && { borderColor: 'red', borderWidth: 1 }]}
          placeholder="Confirm your new password"
          secureTextEntry={!showConfirmPassword} 
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          onBlur={validatePassword}
        />
        <TouchableOpacity
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          style={localStyles.eyeIcon}
        >
          <FontAwesome
            name={showConfirmPassword ? 'eye-slash' : 'eye'} 
            size={20}
            color="gray"
          />
        </TouchableOpacity>
      </View>


      {passwordError ? <Text style={{ color: 'red', marginBottom: 10 }}>{passwordError}</Text> : null}

      <View style={localStyles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, localStyles.cancelButton]}
          onPress={onClose}
        >
          <Text style={styles.buttonText}>Cancel</Text>
          <FontAwesome name="times" size={24} color="white" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, localStyles.resetPasswordButton]}
          onPress={handleChangePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={styles.buttonText}>Reset Password</Text>
              <FontAwesome name="check" size={24} color="white" style={{ marginLeft: 8 }} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    flex: 1,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 5,
  },
  resetPasswordButton: {
    backgroundColor: '#28a745',
    flex: 1,
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 5,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
    borderColor: '#ccc', 
    borderWidth: 1,      
    borderRadius: 5,     
    backgroundColor: '#fff', 
  },
  passwordInput: {
    flex: 1, 
    paddingRight: 40, 
    borderWidth: 0, 
    marginBottom: 0, 
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    padding: 10, 
  },
});

export default SetNewPassword;