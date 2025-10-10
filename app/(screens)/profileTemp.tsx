import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    ImageBackground,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import migrated components
import {
    ActionSheet,
    Button,
    Card,
    Input,
    Loading,
    Screen,
    Typography
} from '@/components/common';
import { Theme } from '@/constants/Theme';

export default function ProfileScreenMigrated() {
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
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showImageActionSheet, setShowImageActionSheet] = useState(false);
  
  const API_URL = Constants.expoConfig?.extra?.API_BASE_URL || 'http://localhost:12099';
  const UPLOAD_IMAGE_URL = `${API_URL}/user/upload-profile-image`;

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
              formattedCreatedAt = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });
            }

            const fullProfilePictureUrl = userDataFromApi.img_profile
              ? `${API_URL}/${userDataFromApi.img_profile}`
              : '';

            console.log("Imagen de usuario: " + fullProfilePictureUrl + " API " + API_URL);

            setUserData(prevData => ({
              ...prevData,
              username: userDataFromApi.username || '',
              email: userDataFromApi.email || '',
              phone: userDataFromApi.person?.phones?.[0]?.phone || '',
              firstName: userDataFromApi.person?.firstName || '',
              middleName: userDataFromApi.person?.middleName || '',
              lastName: userDataFromApi.person?.lastName || '',
              address: userDataFromApi.person?.addresses?.[0]?.address || '',
              pkUser: formattedPkUser,
              createdAt: formattedCreatedAt,
              profilePicture: fullProfilePictureUrl,
            }));
          } else {
            console.error('Error al cargar los datos del usuario:', response.status);
            Alert.alert('Error', 'Could not load user data. Please try again later.');
          }
        }
      } catch (error) {
        console.error('Error al cargar los datos del usuario:', error);
        Alert.alert('Error', 'There was a connection problem loading user data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [API_URL]);

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Denied', 'We need camera access to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await processAndUploadImage(result.assets[0].uri);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Denied', 'We need gallery access to select photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await processAndUploadImage(result.assets[0].uri);
    }
  };

  const processAndUploadImage = async (uri: string) => {
    try {
      setIsLoading(true);

      // Procesar imagen
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 300, height: 300 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      const userId = await AsyncStorage.getItem('userId');
      const accessToken = await AsyncStorage.getItem('accessToken');

      if (!userId || !accessToken) {
        Alert.alert('Error', 'User information not found.');
        return;
      }

      // Upload image
      const formData = new FormData();
      formData.append('image', {
        uri: manipulatedImage.uri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);
      formData.append('userId', userId);

      const response = await fetch(UPLOAD_IMAGE_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const responseData = await response.json();
        const newImageUrl = `${API_URL}/${responseData.imagePath}`;
        
        setUserData(prev => ({
          ...prev,
          profilePicture: newImageUrl,
        }));

        Alert.alert('Success', 'Profile picture updated successfully.');
      } else {
        Alert.alert('Error', 'Could not update profile picture.');
      }
    } catch (error) {
      console.error('Error al subir imagen:', error);
      Alert.alert('Error', 'There was a problem uploading the image.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveChanges = async () => {
    // Validation matching original profile.tsx
    if (!userData.firstName || !userData.lastName || !userData.phone || !userData.address || !userData.email) {
      Alert.alert('Error', 'All fields for first name, last name, phone, address and email are required.');
      return;
    }

    try {
      setIsLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      const accessToken = await AsyncStorage.getItem('accessToken');

      if (!userId || !accessToken) {
        Alert.alert('Error', 'User information not found.');
        return;
      }

      const updateData = {
        pkUser: userData.pkUser,
        person: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          phones: [{ phone: userData.phone, isPrimary: 1 }],
          addresses: [{ address: userData.address, isPrimary: 1 }],
        },
      };

      const response = await fetch(`${API_URL}/user/updateUserProfile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully.');
      } else {
        Alert.alert('Error', 'Could not save changes.');
      }
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      Alert.alert('Error', 'There was a problem saving changes.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setUserData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Screen safeArea={true} scrollable>
      <View style={styles.container}>
        {/* Header with Background Image */}
        <ImageBackground
          source={require('@/assets/images/roof-repair.jpg')}
          style={styles.backgroundImage}
          imageStyle={styles.backgroundImageStyle}
        >
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Icon name="arrow-back" size={28} color={Theme.colors.text.inverse} />
          </TouchableOpacity>

          {/* Profile Picture Section */}
          <View style={styles.profileHeader}>
            <View style={styles.profilePictureContainer}>
              <Image
                source={
                  userData.profilePicture
                    ? { uri: userData.profilePicture }
                    : require('@/assets/images/user.png')
                }
                style={styles.profilePicture}
              />
              <TouchableOpacity 
                style={styles.changePictureButton}
                onPress={() => setShowImageActionSheet(true)}
              >
                <Icon name="camera-alt" size={24} color={Theme.colors.text.inverse} />
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>

        {/* Profile Content */}
        <View style={styles.contentContainer}>
          {/* User ID and Join Date */}
          <Card variant="elevated" style={styles.userInfoCard}>
            <Typography variant="h3" color="secondary" style={styles.emailText}>
              {userData.email}
            </Typography>
            <Typography variant="h3" color="primary" style={styles.userIdText}>
              Client ID: #{userData.pkUser || '000000'}
            </Typography>
            {userData.createdAt && (
              <Typography variant="body2" color="secondary" style={styles.joinDateText}>
                Member since {userData.createdAt}
              </Typography>
            )}
          </Card>

          {/* Edit Button */}
          <View style={styles.editButtonContainer}>
            <Button
              title={isEditing ? "Cancel" : "Edit Profile"}
              variant={isEditing ? "outline" : "primary"}
              size="md"
              onPress={() => setIsEditing(!isEditing)}
              icon={<Icon name="edit" size={20} color={isEditing ? Theme.colors.primary[500] : Theme.colors.text.inverse} />}
              iconPosition="left"
            />
          </View>

          {/* Profile Form */}
          <Card variant="outlined" style={styles.formCard}>
            <Typography variant="h4" color="primary" style={styles.sectionTitle}>
              My Profile
            </Typography>

            <View style={styles.formSection}>
              <Input
                label="First Name"
                value={userData.firstName}
                onChangeText={(value) => handleInputChange('firstName', value)}
                disabled={!isEditing}
                leftIcon="person-outline"
                containerStyle={styles.inputContainer}
              />

              <Input
                label="Last Name"
                value={userData.lastName}
                onChangeText={(value) => handleInputChange('lastName', value)}
                disabled={!isEditing}
                leftIcon="person-outline"
                containerStyle={styles.inputContainer}
              />

              <Input
                label="Phone"
                value={userData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                disabled={!isEditing}
                leftIcon="call-outline"
                keyboardType="phone-pad"
                containerStyle={styles.inputContainer}
              />

              <Input
                label="Address" 
                value={userData.address}
                onChangeText={(value) => handleInputChange('address', value)}
                disabled={!isEditing}
                leftIcon="location-on"
                multiline
                numberOfLines={3}
                containerStyle={styles.inputContainer}
              />
            </View>

            {/* Save Button */}
            {isEditing && (
              <View style={styles.saveButtonContainer}>
                <Button
                  title="Save Changes"
                  variant="primary"
                  size="lg"
                  onPress={saveChanges}
                  fullWidth
                  loading={isLoading}
                  icon={<Icon name="save" size={20} color={Theme.colors.text.inverse} />}
                  iconPosition="left"
                />
              </View>
            )}
          </Card>
        </View>

        {/* Loading Overlay */}
        <Loading
          visible={isLoading}
          variant="overlay"
          message="Processing..."
          size="lg"
        />

        {/* Image Action Sheet */}
        <ActionSheet
          visible={showImageActionSheet}
          onClose={() => setShowImageActionSheet(false)}
          title="Update Profile Picture"
          options={[
            {
              id: 'camera',
              title: 'Take Photo',
              icon: 'camera-alt',
              onPress: takePhoto,
            },
            {
              id: 'gallery',
              title: 'Choose from Gallery',
              icon: 'photo-library',
              onPress: pickImage,
            },
          ]}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
  },

  backgroundImage: {
    height: 120,
    justifyContent: 'flex-end',
    position: 'relative',
  },

  backgroundImageStyle: {
    borderBottomLeftRadius: Theme.borderRadius.xl,
    borderBottomRightRadius: Theme.borderRadius.xl,
  },

  backButton: {
    position: 'absolute',
    top: Theme.spacing.base,
    left: Theme.spacing.base,
    backgroundColor: Theme.colors.overlay.medium,
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.full,
    zIndex: 10,
  },

  profileHeader: {
    alignItems: 'center',
    position: 'absolute',
    bottom: -75,
    left: 0,
    right: 0,
    zIndex: 1,
  },

  profilePictureContainer: {
    width: 150,
    height: 150,
    borderRadius: Theme.borderRadius.full,
    position: 'relative',
    borderWidth: 4,
    borderColor: Theme.colors.background.primary,
    ...Theme.shadows.lg,
  },

  profilePicture: {
    width: '100%',
    height: '100%',
    borderRadius: Theme.borderRadius.full,
  },

  changePictureButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: Theme.colors.primary[500],
    borderRadius: Theme.borderRadius.full,
    padding: Theme.spacing.sm,
    ...Theme.shadows.md,
  },

  contentContainer: {
    flex: 1,
    paddingTop: 85, // Space for profile picture
    paddingHorizontal: Theme.spacing.base,
  },

  userInfoCard: {
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
    paddingVertical: Theme.spacing.xl,
  },

  emailText: {
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },

  userIdText: {
    marginBottom: Theme.spacing.xs,
  },

  joinDateText: {
    textAlign: 'center',
  },

  editButtonContainer: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },

  formCard: {
    marginBottom: Theme.spacing.xl,
    padding: Theme.spacing.lg,
  },

  sectionTitle: {
    marginBottom: Theme.spacing.lg,
    paddingBottom: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.light,
  },

  formSection: {
    marginBottom: Theme.spacing.xl,
  },

  inputContainer: {
    marginBottom: Theme.spacing.base,
  },

  saveButtonContainer: {
    marginTop: Theme.spacing.lg,
    paddingTop: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border.light,
  },
});