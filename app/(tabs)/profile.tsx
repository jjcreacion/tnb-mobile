import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { FontAwesome } from '@expo/vector-icons';

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
    pkUser: null,
    createdAt: null,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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
              formattedCreatedAt = date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });
            }

            const fullProfilePictureUrl = userDataFromApi.img_profile
              ? `${API_URL}/${userDataFromApi.img_profile}`
              : '';

            console.log("Imagen de usuario: " + fullProfilePictureUrl + " API " + API_URL);

            setUserData({
              ...userData,
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
            });
          } else {
            console.error('Error al cargar los datos del usuario:', response.status);
            Alert.alert('Error', 'No se pudieron cargar los datos del usuario. Inténtalo de nuevo más tarde.');
          }
        }
      } catch (error) {
        console.error('Error al cargar los datos del usuario:', error);
        Alert.alert('Error', 'Hubo un problema de conexión al cargar los datos del usuario.');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  /**
   * Maneja los cambios en los campos de entrada de texto y actualiza el estado userData.
   * @param {string} name - El nombre del campo que se está cambiando (ej., 'firstName').
   * @param {string} value - El nuevo valor para el campo.
   */
  const handleChange = (name, value) => {
    setUserData({ ...userData, [name]: value });
  };

  const handleSaveProfile = async () => {
    if (!userData.firstName || !userData.lastName || !userData.phone || !userData.address || !userData.email) {
      Alert.alert('Error', 'Todos los campos de nombre, apellido, teléfono, dirección y correo electrónico son obligatorios.');
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
        const result = await response.json();
        Alert.alert('Perfil Guardado', 'Los cambios en tu perfil han sido guardados.');
        setIsEditing(false);
      } else {
        const errorText = await response.text();
        console.error('Error al guardar el perfil:', response.status, errorText);
        Alert.alert('Error', 'No se pudieron guardar los cambios en el perfil. Inténtalo de nuevo.');
      }

    } catch (error) {
      console.error('Error de red al guardar el perfil:', error);
      Alert.alert('Error', 'Hubo un problema de conexión al guardar el perfil.');
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Sube la imagen de perfil al servidor.
   * @param {string} imageUri - La URI local de la imagen seleccionada.
   * @param {string} pkUser - El ID del usuario.
   */
  const uploadProfileImage = async (imageUri, pkUser) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('pkUser', pkUser);
    formData.append('file', {
      uri: imageUri,
      name: `profile_${pkUser}.jpg`,
      type: 'image/jpeg',
    });

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
          Alert.alert('Éxito', 'Imagen de perfil subida correctamente.');
        } else {
          setUserData(prevData => ({
            ...prevData,
            profilePicture: imageUri 
          }));
        }
      } else {
        const errorText = await response.text();
        console.error('Error al subir la imagen al servidor:', response.status, errorText);
        setUserData(prevData => ({
          ...prevData,
          profilePicture: imageUri 
        }));
        Alert.alert('Advertencia', 'La imagen se guardó localmente, pero hubo un problema al subirla al servidor.');
      }
    } catch (error) {
      console.error('Error de red al subir la imagen:', error);
      setUserData(prevData => ({
        ...prevData,
        profilePicture: imageUri 
      }));
      Alert.alert('Error', 'Hubo un problema de conexión al subir la imagen, pero se guardó localmente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos permiso para acceder a tu galería de imágenes para cambiar la foto de perfil.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImageUri = result.assets[0].uri;

      try {
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          selectedImageUri,
          [],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

        setUserData(prevData => ({ ...prevData, profilePicture: manipulatedImage.uri }));

        if (userData.pkUser) {
          uploadProfileImage(manipulatedImage.uri, userData.pkUser);
        } else {
          Alert.alert('Error', 'No se pudo obtener el ID de usuario para subir la imagen. Asegúrate de que el perfil se haya cargado correctamente.');
        }
      } catch (error) {
        console.error('Error al manipular la imagen:', error);
        Alert.alert('Error', 'No se pudo procesar la imagen seleccionada.');
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      )}

      <ImageBackground source={require('@/assets/images/roof-repair.jpg')} style={styles.backgroundImage}>
        <View style={styles.profileHeader}>
          <View style={styles.profilePictureContainer}>
            <Image
              source={
                userData.profilePicture
                  ? { uri: userData.profilePicture } 
                  : require('@/assets/images/user.png')
              }
              style={styles.profilePicture}
              key={userData.profilePicture} 
            />
            {isEditing && (
              <TouchableOpacity
                style={styles.changePictureButton}
                onPress={handleImagePick}
              >
                <Icon name="camera-alt" size={24} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.pkUserText}>
            {userData.email}
          </Text>
          <Text style={styles.pkUserText}>
            Client ID: {userData.pkUser}
          </Text>
        </View>
      </ImageBackground>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.header}>Mi Perfil</Text>
          <TouchableOpacity onPress={handleEdit}>
            <Icon name="edit" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Nombre</Text>
          {isEditing ? (
            <TextInput
              style={[styles.detailInput, focusedInput === 'firstName' && styles.focusedInput]}
              value={userData.firstName}
              onChangeText={(text) => handleChange('firstName', text)}
              onFocus={() => setFocusedInput('firstName')}
              onBlur={() => setFocusedInput(null)}
            />
          ) : (
            <Text style={styles.sectionValue}>{userData.firstName || 'N/A'}</Text>
          )}
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Apellido</Text>
          {isEditing ? (
            <TextInput
              style={[styles.detailInput, focusedInput === 'lastName' && styles.focusedInput]}
              value={userData.lastName}
              onChangeText={(text) => handleChange('lastName', text)}
              onFocus={() => setFocusedInput('lastName')}
              onBlur={() => setFocusedInput(null)}
            />
          ) : (
            <Text style={styles.sectionValue}>{userData.lastName || 'N/A'}</Text>
          )}
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Teléfono</Text>
          {isEditing ? (
            <TextInput
              style={[styles.detailInput, focusedInput === 'phone' && styles.focusedInput]}
              value={userData.phone}
              onChangeText={(text) => handleChange('phone', text)}
              onFocus={() => setFocusedInput('phone')}
              onBlur={() => setFocusedInput(null)}
            />
          ) : (
            <Text style={styles.sectionValue}>{userData.phone || 'N/A'}</Text>
          )}
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Dirección</Text>
          {isEditing ? (
            <TextInput
              style={[styles.detailInput, focusedInput === 'address' && styles.focusedInput]}
              value={userData.address}
              onChangeText={(text) => handleChange('address', text)}
              onFocus={() => setFocusedInput('address')}
              onBlur={() => setFocusedInput(null)}
            />
          ) : (
            <Text style={styles.sectionValue}>{userData.address || 'N/A'}</Text>
          )}
        </View>

        {isEditing &&
          <View style={styles.contSave}>
            <TouchableOpacity style={styles.buttomSave} onPress={handleSaveProfile}>
              <Text style={styles.buttonSaveText}>Save</Text>
            </TouchableOpacity>
          </View>
        }

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  backgroundImage: {
    height: 150,
    justifyContent: 'flex-end',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'visible',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: 'gray',
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
    bottom: -70,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 1,
  },
  profilePictureContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: 'gray',
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
    zIndex: 3,
  },
  pkUserText: {
    marginTop: 0,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    width: '100%',
  },
  buttomSave: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    width: '60%',
    alignItems: 'center',
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonSaveText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contSave: {
    marginTop: 20,
    marginBottom: 10,
    alignItems: 'center',
    width: '100%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    marginTop: 90,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  detailSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  sectionValue: {
    fontSize: 16,
    color: '#555',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 5,
    fontSize: 16,
    marginLeft: 10,
  },
  focusedInput: {
    borderBottomColor: 'blue',
    color: 'black',
  },
});