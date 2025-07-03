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
  ActivityIndicator, // Import ActivityIndicator for loading state
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator'; // Import ImageManipulator

export default function ProfileScreen() {
  const [userData, setUserData] = useState({
    profilePicture: require('@/assets/images/user.png'),
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
  const [isLoading, setIsLoading] = useState(false); // New state for loading indicator

  // Ensure API_URL is correctly defined for your environment
  const API_URL = Constants.expoConfig?.extra?.API_BASE_URL || 'http://localhost:12099';
  const UPLOAD_IMAGE_URL = 'http://216.246.113.71:8080/user/upload-profile-image'; // Specific endpoint for image upload

  useEffect(() => {
    /**
     * Carga los datos del usuario desde AsyncStorage y obtiene detalles adicionales de la API.
     * Actualiza el estado userData con la información obtenida.
     */
    const loadUserData = async () => {
      try {
        setIsLoading(true); // Start loading
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          const response = await fetch(`${API_URL}/user/findOne/${userId}`);
          if (response.ok) {
            const userDataFromApi = await response.json();

            // Formatea pkUser para que tenga 6 dígitos, rellenando con ceros a la izquierda
            const rawPkUser = userDataFromApi.pkUser;
            const formattedPkUser = rawPkUser
              ? String(rawPkUser).padStart(6, '0')
              : null;

            // Formatea la fecha de creación para mostrarla
            let formattedCreatedAt = null;
            if (userDataFromApi.createdAt) {
              const date = new Date(userDataFromApi.createdAt);
              formattedCreatedAt = date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });
            }

            setUserData({
              ...userData,
              username: userDataFromApi.username || '',
              email: userDataFromApi.email || '',
              phone: userDataFromApi.phone || '',
              firstName: userDataFromApi.person?.firstName || '',
              middleName: userDataFromApi.person?.middleName || '',
              lastName: userDataFromApi.person?.lastName || '',
              address: userDataFromApi.person?.addresses?.[0]?.address || '',
              pkUser: formattedPkUser,
              createdAt: formattedCreatedAt,
              // Si la URL de profilePicture está disponible desde la API, úsala; de lo contrario, mantén la predeterminada
              profilePicture: userDataFromApi.profilePicture ? { uri: userDataFromApi.profilePicture } : require('@/assets/images/user.png'),
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
        setIsLoading(false); // End loading
      }
    };

    loadUserData();
  }, []);

  /**
   * Alterna el modo de edición para los detalles del perfil.
   */
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

  /**
   * Sube la imagen de perfil al servidor.
   * @param {string} imageUri - La URI local de la imagen seleccionada.
   * @param {string} pkUser - El ID del usuario.
   */
  const uploadProfileImage = async (imageUri, pkUser) => {
    setIsLoading(true); // Start loading for upload
    const formData = new FormData();
    formData.append('pkUser', pkUser);
    formData.append('file', {
      uri: imageUri,
      name: `profile_${pkUser}.jpg`, // Nombre del archivo, puedes ajustar la extensión
      type: 'image/jpeg', // Tipo MIME de la imagen, ajusta si es necesario (e.g., 'image/png')
    });

    try {
      const response = await fetch(UPLOAD_IMAGE_URL, {
        method: 'POST',
        headers: {
          // No es necesario establecer 'Content-Type' para FormData, fetch lo hace automáticamente
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
      } else {
        const errorText = await response.text();
        console.error('Error al subir la imagen:', response.status, errorText);
        setUserData(prevData => ({ ...prevData, profilePicture: require('@/assets/images/user.png') })); // Revert to default or previous
      }
    } catch (error) {
      console.error('Error de red al subir la imagen:', error);
      setUserData(prevData => ({ ...prevData, profilePicture: require('@/assets/images/user.png') })); // Revert to default or previous
    } finally {
      setIsLoading(false); // End loading
    }
  };

  
  const handleImagePick = async () => {
    // Solicitar permisos de la biblioteca de medios
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos permiso para acceder a tu galería de imágenes para cambiar la foto de perfil.');
      return;
    }

    // Iniciar la biblioteca de imágenes para seleccionar una imagen
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Permitir solo imágenes
      allowsEditing: true, // Permitir edición básica (recortar, redimensionar)
      aspect: [1, 1], // Forzar una relación de aspecto cuadrada
      quality: 1, // Alta calidad (se comprimirá después)
    });

    // Si se seleccionó una imagen y no se canceló
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImageUri = result.assets[0].uri;

      try {
        // Comprimir la imagen antes de subirla
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          selectedImageUri,
          [], // No se realizan operaciones de redimensionamiento, solo compresión
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // Comprimir al 70% de calidad JPEG
        );

        // Actualizar el estado con la URI de la imagen manipulada
        setUserData({ ...userData, profilePicture: { uri: manipulatedImage.uri } });

        // Llamar a la función para subir la imagen al backend
        if (userData.pkUser) {
          uploadProfileImage(manipulatedImage.uri, userData.pkUser);
        } else {
          Alert.alert('Error', 'No se pudo obtener el ID de usuario para subir la imagen.');
        }
      } catch (error) {
        console.error('Error al manipular la imagen:', error);
        Alert.alert('Error', 'No se pudo procesar la imagen seleccionada.');
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Indicador de carga */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      )}

      {/* Imagen de fondo para la sección del encabezado */}
      <ImageBackground source={require('@/assets/images/roof-repair.jpg')} style={styles.backgroundImage}>
        <View style={styles.profileHeader}>
          <View style={styles.profilePictureContainer}>
            {/* Imagen de perfil del usuario */}
            <Image source={userData.profilePicture} style={styles.profilePicture} />
            {/* Botón para cambiar la foto de perfil, visible solo en modo de edición */}
            {isEditing && (
              <TouchableOpacity
                style={styles.changePictureButton}
                onPress={handleImagePick}
              >
                <Icon name="camera-alt" size={24} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>
          {/* Correo electrónico del usuario y ID de cliente */}
          <Text style={styles.pkUserText}>
            {userData.email}
          </Text>
          <Text style={styles.pkUserText}>
            Client ID: {userData.pkUser}
          </Text>
        </View>
      </ImageBackground>

      {/* Tarjeta principal de detalles del perfil */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.header}>Mi Perfil</Text>
          {/* Botón de edición para alternar el modo de edición */}
          <TouchableOpacity onPress={handleEdit}>
            <Icon name="edit" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Sección de Nombre */}
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

        {/* Sección de Apellido */}
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

        {/* Sección de Teléfono */}
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

        {/* Sección de Dirección */}
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
