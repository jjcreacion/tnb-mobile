import { Button, Typography } from '@/components/common';
import { getCropperHtml } from '@/components/common/cropperHtml';
import { Theme } from '@/constants/Theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import * as FileSystemLegacy from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import WebView from 'react-native-webview';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { MigratedStyles } from '../../constants/MigratedStyles';

interface ProfileImageCropEditorProps {
  visible: boolean;
  imageUri: string;
  onClose: () => void;
  onCropComplete: (croppedUri: string) => void;
  onTakeAnother: () => void;
  onChooseAnother: () => void;
}

const ProfileImageCropEditor: React.FC<ProfileImageCropEditorProps> = ({
  visible,
  imageUri,
  onClose,
  onCropComplete,
  onTakeAnother,
  onChooseAnother,
}) => {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [imageBase64, setImageBase64] = useState<string>('');

  const loadImageAsBase64 = useCallback(async () => {
    try {
      setLoading(true);
      const file = new FileSystem.File(imageUri);
      const base64 = await file.base64();
      setImageBase64(`data:image/jpeg;base64,${base64}`);
    } catch (error) {
      console.error('Failed to load image:', error);
      Alert.alert('Error', 'Failed to load image for cropping');
      onClose();
    }
  }, [imageUri, onClose]);

  React.useEffect(() => {
    if (visible && imageUri) {
      loadImageAsBase64();
    }
  }, [visible, imageUri, loadImageAsBase64]);

  const handleMessage = async (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      switch (message.type) {
        case 'ready':
          setLoading(false);
          break;

        case 'cropped':
          setProcessing(true);
          try {
            const base64Data = message.data.split(',')[1];
            const filename = `cropped_${Date.now()}.jpg`;
            const fileUri = FileSystemLegacy.documentDirectory + filename;

            // Use legacy API for cross-platform compatibility
            await FileSystemLegacy.writeAsStringAsync(fileUri, base64Data, {
              encoding: 'base64',
            });

            onCropComplete(fileUri);
          } catch (error) {
            console.error('Failed to save cropped image:', error);
            Alert.alert('Error', 'Failed to save cropped image');
          } finally {
            setProcessing(false);
          }
          break;

        case 'error':
          Alert.alert('Error', message.message || 'An error occurred');
          setLoading(false);
          setProcessing(false);
          break;
      }
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  };

  const handleCrop = () => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({ action: 'crop' }));
    }
  };

  const handleRotate = () => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({ action: 'rotate', degrees: 90 }));
    }
  };

  const handleReset = () => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({ action: 'reset' }));
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[cropEditorStyles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={cropEditorStyles.header}>
          <TouchableOpacity onPress={onClose} style={cropEditorStyles.iconButton}>
            <MaterialIcons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Typography variant="h4" style={cropEditorStyles.headerTitle}>
            Crop Profile Picture
          </Typography>
          <View style={cropEditorStyles.iconButton} />
        </View>

        {/* WebView */}
        <View style={cropEditorStyles.webViewContainer}>
          {imageBase64 ? (
            <WebView
              ref={webViewRef}
              source={{ html: getCropperHtml(imageBase64) }}
              onMessage={handleMessage}
              style={cropEditorStyles.webView}
              scrollEnabled={false}
              bounces={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={false}
              mixedContentMode="always"
              allowFileAccess={true}
              allowUniversalAccessFromFileURLs={true}
            />
          ) : null}

          {/* Loading Overlay */}
          {(loading || processing) && (
            <View style={cropEditorStyles.loadingOverlay}>
              <ActivityIndicator size="large" color="white" />
              <Typography variant="body1" style={cropEditorStyles.loadingText}>
                {processing ? 'Processing...' : 'Loading...'}
              </Typography>
            </View>
          )}
        </View>

        {/* Toolbar */}
        <View style={[cropEditorStyles.toolbar, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <View style={cropEditorStyles.toolButtons}>
            <TouchableOpacity style={cropEditorStyles.toolButton} onPress={handleRotate}>
              <MaterialIcons name="rotate-right" size={24} color="white" />
              <Typography variant="caption" style={cropEditorStyles.toolText}>
                Rotate
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity style={cropEditorStyles.toolButton} onPress={handleReset}>
              <MaterialIcons name="refresh" size={24} color="white" />
              <Typography variant="caption" style={cropEditorStyles.toolText}>
                Reset
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity style={cropEditorStyles.toolButton} onPress={onTakeAnother}>
              <MaterialIcons name="camera-alt" size={24} color="white" />
              <Typography variant="caption" style={cropEditorStyles.toolText}>
                Take Another
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity style={cropEditorStyles.toolButton} onPress={onChooseAnother}>
              <MaterialIcons name="photo-library" size={24} color="white" />
              <Typography variant="caption" style={cropEditorStyles.toolText}>
                Choose Another
              </Typography>
            </TouchableOpacity>
          </View>

          <View style={cropEditorStyles.actionButtons}>
            <Button
              title="Done"
              onPress={handleCrop}
              variant="primary"
              fullWidth
              size="lg"
              disabled={loading || processing}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const cropEditorStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    color: 'white',
    fontWeight: '600',
  },
  iconButton: {
    padding: 8,
    width: 40,
  },
  webViewContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 16,
  },
  toolbar: {
    backgroundColor: '#000',
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  toolButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  toolButton: {
    alignItems: 'center',
    gap: 4,
  },
  toolText: {
    color: 'white',
    fontSize: 11,
  },
  actionButtons: {
    marginBottom: 8,
  },
});

export default function ProfileScreen() {
  const [userData, setUserData] = useState({
    profilePicture: '',
    username: '',
    email: '',
    phone: '',
    firstName: '',
    middleName: '',
    lastName: '',
    birthdate: '',
    address: '',
    pkUser: null as string | null,
    createdAt: null as string | null,
  });

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isEditing, setIsEditing] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showImageActionSheet, setShowImageActionSheet] = useState(false);
  const [pendingImageAction, setPendingImageAction] = useState<'camera' | 'gallery' | null>(null);
  const [originalUserData, setOriginalUserData] = useState(userData);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const [showCropEditor, setShowCropEditor] = useState(false);
  const [tempImageUri, setTempImageUri] = useState<string>('');
  const API_URL = Constants.expoConfig?.extra?.API_BASE_URL || 'http://localhost:12099';
  const UPLOAD_IMAGE_URL = `${API_URL}/user/upload-profile-image`;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // Refs for form inputs
  const lastNameRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const addressRef = useRef<TextInput>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          const response = await fetch(`${API_URL}/user/findOne/${userId}`);
          if (response.ok) {
            const userDataFromApi = await response.json();

            const rawPkUser = userDataFromApi.pkUser;
            const formattedPkUser = rawPkUser
              ? String(rawPkUser).padStart(6, '0')
              : null;

            let formattedCreatedAt = null;
            if (userDataFromApi.createdAt) {
              const date = new Date(userDataFromApi.createdAt);
              formattedCreatedAt = date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });
            }

            const fullProfilePictureUrl = userDataFromApi.img_profile
              ? `${API_URL}/${userDataFromApi.img_profile}`
              : '';

            console.log("User image: " + fullProfilePictureUrl + " API " + API_URL);

            setUserData({
              profilePicture: fullProfilePictureUrl,
              username: userDataFromApi.username || '',
              email: userDataFromApi.email || '',
              phone: userDataFromApi.person?.phones?.[0]?.phone || '',
              firstName: userDataFromApi.person?.firstName || '',
              middleName: userDataFromApi.person?.middleName || '',
              lastName: userDataFromApi.person?.lastName || '',
              birthdate: '',
              address: userDataFromApi.person?.addresses?.[0]?.address || '',
              pkUser: formattedPkUser,
              createdAt: formattedCreatedAt,
            });
          } else {
            console.error('Error loading user data:', response.status);
            Alert.alert('Error', 'Could not load user data. Please try again later.');
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        Alert.alert('Error', 'Connection problem loading user data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [API_URL]);

  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.showWithGravity(
        message,
        ToastAndroid.LONG,
        ToastAndroid.CENTER
      );
    } else {
      setToastMessage(message);
      setToastVisible(true);

      // Reset opacity to 0 first
      toastOpacity.setValue(0);

      Animated.sequence([
        Animated.timing(toastOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2500),
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setToastVisible(false);
      });
    }
  };

  const handleEdit = () => {
    setOriginalUserData(userData); // Save original data
    setIsEditing(true);
  };

  const hasChanges = () => {
    return (
      userData.firstName !== originalUserData.firstName ||
      userData.lastName !== originalUserData.lastName ||
      userData.phone !== originalUserData.phone ||
      userData.address !== originalUserData.address
    );
  };

  const handleCancel = async () => {
    setIsEditing(false);
    // Reload user data to revert changes
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const response = await fetch(`${API_URL}/user/findOne/${userId}`);
        if (response.ok) {
          const userDataFromApi = await response.json();

          const rawPkUser = userDataFromApi.pkUser;
          const formattedPkUser = rawPkUser
            ? String(rawPkUser).padStart(6, '0')
            : null;

          let formattedCreatedAt = null;
          if (userDataFromApi.createdAt) {
            const date = new Date(userDataFromApi.createdAt);
            formattedCreatedAt = date.toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
          }

          const fullProfilePictureUrl = userDataFromApi.img_profile
            ? `${API_URL}/${userDataFromApi.img_profile}`
            : '';

          setUserData({
            profilePicture: fullProfilePictureUrl,
            username: userDataFromApi.username || '',
            email: userDataFromApi.email || '',
            phone: userDataFromApi.person?.phones?.[0]?.phone || '',
            firstName: userDataFromApi.person?.firstName || '',
            middleName: userDataFromApi.person?.middleName || '',
            lastName: userDataFromApi.person?.lastName || '',
            birthdate: '',
            address: userDataFromApi.person?.addresses?.[0]?.address || '',
            pkUser: formattedPkUser,
            createdAt: formattedCreatedAt,
          });
        }
      }
    } catch (error) {
      console.error('Error reloading user data:', error);
    }
  };

  const handleEditOrSave = () => {
    if (isEditing) {
      handleSaveProfile();
    } else {
      handleEdit();
    }
  };

  /**
   * Maneja los cambios en los campos de entrada de texto y actualiza el estado userData.
   * @param {string} name - El nombre del campo que se está cambiando (ej., 'firstName').
   * @param {string} value - El nuevo valor para el campo.
   */
  const handleChange = (name: string, value: string) => {
    setUserData({ ...userData, [name]: value });
  };

  const handleSaveProfile = async () => {
    if (!userData.firstName || !userData.lastName || !userData.phone || !userData.address || !userData.email) {
      Alert.alert('Error', 'All fields (first name, last name, phone, address, and email) are required.');
      return;
    }

    const bodyData = {
      pkUser: userData.pkUser,
      person: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        phones: [
          {
            phone: userData.phone,
            isPrimary: 1,
          },
        ],
        addresses: [
          {
            address: userData.address,
            isPrimary: 1,
          },
        ],
      },
    };

    console.log("Saving profile data:", bodyData);

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/user/updateUserProfile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      });

      if (response.ok) {
        await response.json();
        Alert.alert('Profile Saved', 'Your profile changes have been saved.');
        setIsEditing(false);
      } else {
        const errorText = await response.text();
        console.error('Error saving profile:', response.status, errorText);
        Alert.alert('Error', 'Could not save profile changes. Please try again.');
      }

    } catch (error) {
      console.error('Network error saving profile:', error);
      Alert.alert('Error', 'Connection problem saving profile.');
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Sube la imagen de perfil al servidor.
   * @param {string} imageUri - La URI local de la imagen seleccionada.
   * @param {string} pkUser - El ID del usuario.
   */
  const uploadProfileImage = async (imageUri: string, pkUser: string) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('pkUser', pkUser);
    formData.append('file', {
      uri: imageUri,
      name: `profile_${pkUser}.jpg`,
      type: 'image/jpeg',
    } as any);

    try {
      const response = await fetch(UPLOAD_IMAGE_URL, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();

        if (result && typeof result.imageUrl === 'string') {
          const imageUrl = result.imageUrl.startsWith('http')
            ? result.imageUrl
            : `${API_URL}/${result.imageUrl}`;

          setUserData(prevData => ({
            ...prevData,
            profilePicture: imageUrl
          }));
          showToast('Profile picture saved successfully');
        } else {
          // Fallback to local URI if server response is not as expected
          setUserData(prevData => ({
            ...prevData,
            profilePicture: imageUri
          }));
          // Still show toast even if server response is unexpected
          showToast('Profile picture saved successfully');
        }
      } else {
        const errorText = await response.text();
        console.error('Error uploading image to server:', response.status, errorText);
        // Fallback to local URI on server error
        setUserData(prevData => ({
          ...prevData,
          profilePicture: imageUri
        }));
        Alert.alert('Warning', 'Image saved locally, but there was a problem uploading to server.');
      }
    } catch (error) {
      console.error('Network error uploading image:', error);
      // Fallback to local URI on network error
      setUserData(prevData => ({
        ...prevData,
        profilePicture: imageUri
      }));
      Alert.alert('Error', 'Connection problem uploading image, but it was saved locally.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need permission to access your photo gallery to change your profile picture.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImageUri = result.assets[0].uri;
      setTempImageUri(selectedImageUri);
      setShowCropEditor(true);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need permission to access your camera to take a profile photo.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImageUri = result.assets[0].uri;
      setTempImageUri(selectedImageUri);
      setShowCropEditor(true);
    }
  };

  const handleOptionPress = (option: 'camera' | 'gallery') => {
    setPendingImageAction(option);
    setShowImageActionSheet(false);
  };

  const handleCropComplete = async (croppedUri: string) => {
    setShowCropEditor(false);

    try {
      // Compress the cropped image
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        croppedUri,
        [],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Update preview immediately
      setUserData(prevData => ({ ...prevData, profilePicture: manipulatedImage.uri }));

      // Upload to server
      if (userData.pkUser) {
        uploadProfileImage(manipulatedImage.uri, userData.pkUser);
      } else {
        Alert.alert('Error', 'Could not get user ID to upload image. Make sure the profile has loaded correctly.');
      }
    } catch (error) {
      console.error('Error processing cropped image:', error);
      Alert.alert('Error', 'Could not process the image.');
    }
  };

  const handleCropEditorClose = () => {
    setShowCropEditor(false);
    setTempImageUri('');
  };

  const handleTakeAnotherPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need permission to access your camera.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setTempImageUri(result.assets[0].uri);
    }
  };

  const handleChooseAnotherImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need permission to access your gallery.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setTempImageUri(result.assets[0].uri);
    }
  };

  // Execute pending action after modal closes
  useEffect(() => {
    if (!showImageActionSheet && pendingImageAction) {
      // Wait for modal close animation to complete (iOS needs more time)
      const timer = setTimeout(async () => {
        const action = pendingImageAction;
        setPendingImageAction(null);

        if (action === 'camera') {
          await handleTakePhoto();
        } else {
          await handleImagePick();
        }
      }, Platform.OS === 'ios' ? 600 : 300);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showImageActionSheet, pendingImageAction]);

  const handleConfirmDelete = () => {
    setDeleteConfirmationText(''); 
    setShowDeleteModal(true);
  };

 
  const processDeleteAccount = async () => {
    try {
      setIsLoading(true);
      setShowDeleteModal(false);

      const token = await AsyncStorage.getItem('accessToken');

      if (!token) {
        Alert.alert("Error", "Session expired. Please log in again.");
        router.replace('/login');
        return;
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/user/delete-my-account`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await AsyncStorage.multiRemove(['accessToken', 'userData']); 
        
        Alert.alert(
          "Account Deleted",
          "Your account and data have been removed.",
          [{ 
            text: "OK", 
            onPress: () => router.replace('/login') 
          }]
        );
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Could not delete account");
      }
    } catch (error) {
      console.error("Delete account error:", error);
      Alert.alert("Error", "An error occurred while deleting your account.");
    } finally {
      setIsLoading(false);
      setDeleteConfirmationText('');
    }
  };
  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Theme.colors.primary[500]}
        translucent={false}
      />
      {/* iOS Status Bar Background */}
      {Platform.OS === 'ios' && (
        <View style={[styles.statusBarBackground, { height: insets.top }]} />
      )}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
        enabled
      >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Theme.colors.primary[500]} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      <ImageBackground
        source={require('@/assets/images/roof-repair.jpg')}
        blurRadius={3}
        style={[styles.backgroundImage, {
          paddingTop: Platform.OS === 'android' ? insets.top + 20 : insets.top,
          height: Platform.OS === 'android' ? 150 + insets.top + 20 : 150 + insets.top

        }]}
      >
        <TouchableOpacity
          style={[styles.backButton, { top: insets.top + 10 }]}
          onPress={() => router.back()}
        >
          <Icon name="arrow-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.profileHeader}>
          <View style={styles.profilePictureContainer}>
            {/* Modificación: Asegura que la prop 'source' siempre tenga un valor válido. */}
            <Image
              source={userData.profilePicture ? { uri: userData.profilePicture } : require('@/assets/images/user.png')}
              style={styles.profilePicture}
            />
            <TouchableOpacity
              style={styles.changePictureButton}
              onPress={() => setShowImageActionSheet(true)}
            >
              <Icon name="camera-alt" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.pkUserText]}>
            {userData.email}
          </Text>
          <Text style={styles.pkUserText}>
            Client ID: {userData.pkUser}
          </Text>

                {userData.createdAt && (
                  <Typography variant="body2" color="secondary" style={MigratedStyles.profileJoinDateText} pointerEvents="none">
                    Member since {userData.createdAt}
                  </Typography>
                )}

        </View>
      </ImageBackground>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.header}>My Profile</Text>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>First Name</Text>
          {isEditing ? (
            <TextInput
              style={[styles.detailInput, focusedInput === 'firstName' && styles.focusedInput]}
              value={userData.firstName}
              onChangeText={(text) => handleChange('firstName', text)}
              onFocus={() => setFocusedInput('firstName')}
              onBlur={() => setFocusedInput(null)}
              returnKeyType="next"
              onSubmitEditing={() => lastNameRef.current?.focus()}
              blurOnSubmit={false}
            />
          ) : (
            <Text style={styles.sectionValue}>{userData.firstName || 'N/A'}</Text>
          )}
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Last Name</Text>
          {isEditing ? (
            <TextInput
              ref={lastNameRef}
              style={[styles.detailInput, focusedInput === 'lastName' && styles.focusedInput]}
              value={userData.lastName}
              onChangeText={(text) => handleChange('lastName', text)}
              onFocus={() => setFocusedInput('lastName')}
              onBlur={() => setFocusedInput(null)}
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
              blurOnSubmit={false}
            />
          ) : (
            <Text style={styles.sectionValue}>{userData.lastName || 'N/A'}</Text>
          )}
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Phone</Text>
          {isEditing ? (
            <TextInput
              ref={phoneRef}
              style={[styles.detailInput, focusedInput === 'phone' && styles.focusedInput]}
              value={userData.phone}
              onChangeText={(text) => handleChange('phone', text)}
              onFocus={() => setFocusedInput('phone')}
              onBlur={() => setFocusedInput(null)}
              keyboardType="phone-pad"
              returnKeyType="next"
              onSubmitEditing={() => addressRef.current?.focus()}
              blurOnSubmit={false}
            />
          ) : (
            <Text style={styles.sectionValue}>{userData.phone || 'N/A'}</Text>
          )}
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Address</Text>
          {isEditing ? (
            <TextInput
              ref={addressRef}
              style={[styles.detailInput, focusedInput === 'address' && styles.focusedInput]}
              value={userData.address}
              onChangeText={(text) => handleChange('address', text)}
              onFocus={() => setFocusedInput('address')}
              onBlur={() => setFocusedInput(null)}
              returnKeyType="done"
            />
          ) : (
            <Text style={styles.sectionValue}>{userData.address || 'N/A'}</Text>
          )}
        </View>

        <View style={styles.buttonContainer}>
          {isEditing && (
            <Button
              title="Cancel"
              variant="outline"
              size="lg"
              onPress={handleCancel}
              style={styles.cancelBtn}
            />
          )}
          <Button
            title={isEditing ? "Save Changes" : "Edit"}
            variant="primary"
            size="lg"
            onPress={handleEditOrSave}
            style={isEditing ? styles.saveBtn : styles.editBtn}
            disabled={isEditing && !hasChanges()}
          />
        </View>

        <View style={{ height: 20, borderTopWidth: 1, borderTopColor: '#EEE', marginTop: 20 }} />

        <View style={styles.deleteSection}>
          <TouchableOpacity 
            style={styles.deleteBtn} 
            onPress={handleConfirmDelete}
            activeOpacity={0.7}
          >
            <Icon name="delete-forever" size={20} color="#FF4444" />
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
          <Text style={styles.deleteSubtext}>
            Permanently remove your account and all associated data. This action cannot be undone.
          </Text>
        </View>

      </View>
    </ScrollView>
    </KeyboardAvoidingView>

    {/* Image Action Sheet Modal */}
    <Modal
      visible={showImageActionSheet}
      transparent
      animationType="slide"
      onRequestClose={() => setShowImageActionSheet(false)}
      statusBarTranslucent
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setShowImageActionSheet(false)}
      >
        <Pressable
          style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 20) + Theme.spacing.lg }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Modal Handle Bar */}
          <View style={styles.modalHandleBar} />

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Typography variant="h4" color="primary" style={styles.modalTitle}>
              Update Profile Picture
            </Typography>
            <TouchableOpacity
              onPress={() => setShowImageActionSheet(false)}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="close" size={24} color={Theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Action Options */}
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleOptionPress('camera')}
              activeOpacity={0.7}
            >
              <View style={styles.optionIconContainer}>
                <Icon name="camera-alt" size={24} color={Theme.colors.primary[500]} />
              </View>
              <View style={styles.optionTextContainer}>
                <Typography variant="body1" style={styles.optionTitle}>
                  Take Photo
                </Typography>
                <Typography variant="caption" color="secondary">
                  Use your camera to take a new photo
                </Typography>
              </View>
              <Icon name="chevron-right" size={20} color={Theme.colors.text.tertiary} />
            </TouchableOpacity>

            <View style={styles.optionDivider} />

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleOptionPress('gallery')}
              activeOpacity={0.7}
            >
              <View style={styles.optionIconContainer}>
                <Icon name="photo-library" size={24} color={Theme.colors.primary[500]} />
              </View>
              <View style={styles.optionTextContainer}>
                <Typography variant="body1" style={styles.optionTitle}>
                  Choose from Gallery
                </Typography>
                <Typography variant="caption" color="secondary">
                  Select a photo from your gallery
                </Typography>
              </View>
              <Icon name="chevron-right" size={20} color={Theme.colors.text.tertiary} />
            </TouchableOpacity>
          </View>

          {/* Cancel Button */}
          <Button
            title="Cancel"
            variant="outline"
            size="lg"
            onPress={() => setShowImageActionSheet(false)}
            fullWidth
            style={styles.cancelButton}
          />
        </Pressable>
      </Pressable>
    </Modal>

    {/* Image Crop Editor */}
    <ProfileImageCropEditor
      visible={showCropEditor}
      imageUri={tempImageUri}
      onClose={handleCropEditorClose}
      onCropComplete={handleCropComplete}
      onTakeAnother={handleTakeAnotherPhoto}
      onChooseAnother={handleChooseAnotherImage}
    />

    {/* Toast for iOS */}
    {Platform.OS === 'ios' && toastVisible && (
      <Animated.View
        style={[
          styles.toastContainer,
          {
            opacity: toastOpacity,
            top: insets.top + 60,
          },
        ]}
        pointerEvents="none"
      >
        <View style={styles.toastContent}>
          <Icon name="check-circle" size={24} color="#4ADE80" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      </Animated.View>
    )}

    <Modal
      visible={showDeleteModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowDeleteModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.confirmDeleteContent}>
          <Typography variant="h4" color="primary" style={{ marginBottom: 15, color: '#FF4444' }}>
            Confirm Deletion
          </Typography>
          
          <Text style={styles.modalSubtext}>
            To confirm, please type the word <Text style={{ fontWeight: 'bold', color: '#000' }}>delete</Text> below. This action is permanent.
          </Text>

          <TextInput
            style={styles.confirmInput}
            placeholder='Type "delete" here'
            value={deleteConfirmationText}
            onChangeText={setDeleteConfirmationText}
            autoCapitalize="none"
          />

          <View style={styles.modalButtonContainer}>
            <TouchableOpacity 
              style={styles.modalCancelBtn} 
              onPress={() => {
                setShowDeleteModal(false);
                setDeleteConfirmationText('');
              }}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.modalDeleteBtn, 
                { opacity: deleteConfirmationText.toLowerCase() === 'delete' ? 1 : 0.5 }
              ]} 
              disabled={deleteConfirmationText.toLowerCase() !== 'delete'}
              onPress={processDeleteAccount}
            >
              <Text style={styles.modalDeleteText}>Confirm Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  confirmDeleteContent: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  deleteSection: {
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  deleteText: {
    color: '#FF4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  deleteSubtext: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 16,
  },
  modalSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  confirmInput: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 25,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#F9F9F9',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  modalDeleteBtn: {
    flex: 1,
    backgroundColor: '#FF4444',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalDeleteText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    padding: 0,
  },
  statusBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: Theme.colors.primary[500],
    zIndex: 100,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Theme.colors.overlay.medium,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: Theme.spacing.sm,
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.primary,
  },
  backgroundImage: {
    height: 150,
    justifyContent: 'flex-end',
    borderBottomLeftRadius: Theme.borderRadius.md,
    borderBottomRightRadius: Theme.borderRadius.md,
    overflow: 'visible',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: Theme.colors.text.secondary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  profileHeader: {
    alignItems: 'center',
    position: 'absolute',
    bottom: Platform.OS === 'android' ? -80 : -75,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 1,
  },
  backButton: {
    position: 'absolute',
    left: Theme.spacing.base,
    backgroundColor: Theme.colors.overlay.dark,
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.full,
    zIndex: 10,
  },
  profilePictureContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
    position: 'relative',
    zIndex: 2,
  },
  profilePicture: {
    width: '100%',
    height: '100%',
    borderRadius: 75,
  },
  changePictureButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Theme.colors.overlay.dark,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.sm,
    zIndex: 3,
  },
  pkUserText: {
    marginTop: 0,
    fontSize: 16,
    fontWeight: '600' as any,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
    gap: Theme.spacing.sm,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    minWidth: 0,
  },
  saveBtn: {
    flex: 1,
    minWidth: 0,
  },
  editBtn: {
    flex: 1,
  },
  card: {
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.base,
    padding: Theme.spacing.base,
    // marginBottom: Platform.OS === 'android' ? Theme.spacing['3xl'] : Theme.spacing.sm,
    marginBottom: Platform.OS === 'android' ? 5  : Theme.spacing.sm,
    marginTop: 90,
    zIndex: 10,
    ...Theme.shadows.base,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.base,
  },
  header: {
    fontSize: 18,
    fontWeight: '600' as any,
    color: Theme.colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  detailSection: {
    marginBottom: Theme.spacing.base,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as any,
    marginBottom: Theme.spacing.xs,
    color: Theme.colors.text.primary,
  },
  sectionValue: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.secondary,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.sm,
  },
  detailInput: {
    borderWidth: 1,
    borderColor: Theme.colors.border.default,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: Theme.colors.background.primary,
    fontSize: 16,
    color: Theme.colors.text.primary,
  },
  focusedInput: {
    borderColor: Theme.colors.border.focus,
    borderWidth: 1.5,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: Theme.colors.overlay.dark,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Theme.colors.background.primary,
    borderTopLeftRadius: Theme.borderRadius['3xl'],
    borderTopRightRadius: Theme.borderRadius['3xl'],
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.sm,
    minHeight: 300,
    ...Theme.shadows.xl,
  },
  modalHandleBar: {
    width: 40,
    height: 4,
    backgroundColor: Theme.colors.border.default,
    borderRadius: Theme.borderRadius.xs,
    alignSelf: 'center',
    marginBottom: Theme.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  modalTitle: {
    flex: 1,
  },
  closeButton: {
    padding: Theme.spacing.xs,
  },
  optionsContainer: {
    marginBottom: Theme.spacing.xl,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.base,
    paddingHorizontal: Theme.spacing.sm,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius['3xl'],
    backgroundColor: Theme.colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.base,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    marginBottom: Theme.spacing.xs,
  },
  optionDivider: {
    height: 1,
    backgroundColor: Theme.colors.border.light,
    marginHorizontal: Theme.spacing.sm,
  },
  cancelButton: {
    marginBottom: Theme.spacing.sm,
  },
  toastContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    elevation: 99999,
  },
  toastContent: {
    backgroundColor: '#2D3748',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 280,
    maxWidth: '90%',
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as any,
    flex: 1,
  },
});