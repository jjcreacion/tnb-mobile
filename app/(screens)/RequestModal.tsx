import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Formik } from 'formik';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Image,
    KeyboardAvoidingView,
    Platform,
    Modal as RNModal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Yup from 'yup';

// Import migrated components
import {
    ActionSheet,
    BottomSheet,
    Button,
    Card,
    ImagePreviewModal,
    Input,
    Loading,
    Typography
} from '@/components/common';
import { Theme } from '@/constants/Theme';

interface Category {
  pkCategory: number;
  name: string;
  description: string;
  imagePath: string;
}

interface SubCategory {
  pkSubCategory: number;
  name: string;
  description: string;
  priceFrom: string;
  priceTo: string;
}

interface Address {
  pkAddress: number;
  address: string;
  addressLine2?: string;
  zipCode?: string;
  isPrimary: number;
  status?: number;
  latitude?: string;
  longitude?: string;
  country?: number;
  state?: number;
  city?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface City {
  pkCity: number;
  name: string;
  fkState: number;
  status: number;
  createdAt: string;
  updatedAt: string;
}

interface State {
  pkState: number;
  name: string;
  fkCountry: number;
  internalCode: string;
  status: number;
  createdAt: string;
  updatedAt: string;  
}

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedCategory: Category | null;
  onServiceCreated?: () => void;
  primaryAddress?: Address | null;
  cities?: City[];
  states?: State[];
}

const RequestMigrated: React.FC<ModalProps> = ({
  isVisible,
  onClose,
  selectedCategory,
  onServiceCreated,
  primaryAddress,
  cities: citiesProp,
  states: statesProp
}) => {
  // Memoize default props to prevent unnecessary re-renders
  const cities = useMemo(() => citiesProp || [], [citiesProp]);
  const states = useMemo(() => statesProp || [], [statesProp]);
  const insets = useSafeAreaInsets();

  // Estados utilizados en el componente
  const [images, setImages] = useState<string[]>([]);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [pkUser, setPkUser] = useState<string | null>(null);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  
  // Estados para subcategorías y carga
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState<number | null>(null);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para modales/bottomsheets
  const [showSubCategorySheet, setShowSubCategorySheet] = useState(false);
  const [showImageSourceSheet, setShowImageSourceSheet] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estados para mapa interactivo
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [isMapInteracting, setIsMapInteracting] = useState(false);
  const [shouldPreventNextPress, setShouldPreventNextPress] = useState(false);
  const [initialScrollPosition, setInitialScrollPosition] = useState(0); // Animation values
  const mapHeight = useRef(new Animated.Value(200)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0.8)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  // Store pending timers for cleanup on unmount
  const pendingTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Clean up all pending timers on unmount
  useEffect(() => {
    return () => {
      pendingTimersRef.current.forEach(timer => clearTimeout(timer));
      pendingTimersRef.current = [];
    };
  }, []);

  const API_URL = Constants.expoConfig?.extra?.API_BASE_URL;

  // Función para expandir el mapa
  const expandMap = () => {
    if (isMapExpanded) return;

    setIsMapExpanded(true);

    Animated.timing(mapHeight, {
      toValue: 450,
      duration: 400,
      useNativeDriver: false,
    }).start(() => {
      const timer = setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
      pendingTimersRef.current.push(timer);
    });
  };

  // Función para contraer el mapa
  const collapseMap = () => {
    if (!isMapExpanded) return;

    setIsMapExpanded(false);
    setIsMapInteracting(false);
    setShouldPreventNextPress(false);

    Animated.timing(mapHeight, {
      toValue: 200,
      duration: 400,
      useNativeDriver: false,
    }).start(() => {
      const timer = setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({
            y: initialScrollPosition,
            animated: true,
          });
        }
      }, 100);
      pendingTimersRef.current.push(timer);
    });
  };

  // Función para construir la descripción completa de la dirección
  const buildFullAddressDescription = (address: Address): string => {
    const parts: string[] = []
    
    if (address.address) {
      parts.push(address.address.trim())
    }
    
    if (address.addressLine2) {
      parts.push(address.addressLine2.trim())
    }
    
    if (address.city && cities.length > 0) {
      const city = cities.find(c => c.pkCity === address.city)
      if (city) {
        parts.push(city.name.trim())
      }
    }
    
    if (address.state && states.length > 0) {
      const state = states.find(s => s.pkState === address.state)
      if (state) {
        parts.push(state.internalCode.trim())
      }
    }
    
    if (address.zipCode) {
      parts.push(address.zipCode.trim())
    }
    
    return parts.join(', ')
  }
  
  // Obtener la dirección completa formateada
  const getFormattedPrimaryAddress = (): string => {
    if (primaryAddress) {
      return buildFullAddressDescription(primaryAddress)
    }
    return 'No primary address selected'
  }

  // Función para obtener el nombre de la subcategoría seleccionada
  const getSelectedSubCategoryName = () => {
    if (!selectedSubCategory || selectedSubCategory === -1) {
      return 'Select a subcategory';
    }
    const selected = subCategories.find(sub => sub.pkSubCategory === selectedSubCategory);
    return selected ? selected.name : 'Select a subcategory';
  };

  // Filtrar subcategorías según búsqueda
  const getFilteredSubCategories = () => {
    if (!searchQuery.trim()) {
      return subCategories;
    }
    return subCategories.filter(sub =>
      sub.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Manejar selección de imágenes (Punto de entrada)
  const handleAddPhotos = () => {
    setShowImageSourceSheet(true);
  };

  // Opción Galería
  const handleGallerySelect = async () => {
    setShowImageSourceSheet(false);
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission Denied', 'We need access to your photo gallery to select images.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const newUris = result.assets.map((asset) => asset.uri);
      // Append new images and open preview
      setImages((prev) => [...prev, ...newUris]);
      setShowImagePreview(true);
    }
  };

  // Opción Cámara
  const handleCameraCapture = async () => {
    setShowImageSourceSheet(false);
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission Denied', 'We need access to your camera to take a photo.');
      return;
    }
    
    try {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newUri = result.assets[0].uri;
        setImages((prev) => [...prev, newUri]);
        setShowImagePreview(true);
      }
    } catch (error: any) {
      console.error('Camera error:', error);
      // Handle simulator or camera not available error
      if (error.message?.includes('Camera not available') || error.message?.includes('simulator')) {
        Alert.alert(
          'Camera Not Available',
          'The camera is not available on this device. Please use "Choose from Gallery" instead.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'Failed to open camera. Please try again.');
      }
    }
  };

  // Add more photos from Preview Modal
  const handleAddMorePhotos = async () => {
    // Directly open gallery for "Add More" flow usually, or ask again.
    // For simplicity and standard UX, "Add More" usually implies Gallery in this context,
    // but let's re-use the sheet logic if we want to allow camera too.
    // However, we can't show the sheet *over* the modal easily without z-index issues or closing the modal.
    // Let's just open Gallery for "Add More" to keep it simple and robust.
    
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const newUris = result.assets.map((asset) => asset.uri);
      setImages((prev) => [...prev, ...newUris]);
    }
  };


  // Remover imagen
  const handleRemoveImage = (uriToRemove: string) => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setImages((prevImages) => prevImages.filter((uri) => uri !== uriToRemove));
          },
        },
      ]
    );
  };

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      console.warn('Ubicación: Permiso denegado. Se usará la ubicación por defecto.');
      setRegion({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
      setLatitude(null);
      setLongitude(null);
      return;
    }
  
    try {
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced, // Propiedad válida
      });
  
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    } catch (error) {
      console.warn('Ubicación: Falló la solicitud de GPS (servicios del dispositivo insatisfactorios). Se usará la ubicación por defecto.');
      setRegion({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
      setLatitude(null);
      setLongitude(null);
    }
  };

  // Subir imágenes
  const uploadImages = async (serviceRequestId: number) => {
    if (images.length === 0) {
      console.log('No hay imágenes para subir.');
      return true;
    }

    const formData = new FormData();
    formData.append('serviceRequestId', serviceRequestId.toString());

    // Comprimir y agregar imágenes al FormData
    console.log('Comprimiendo', images.length, 'imágenes antes de subir...');
    
    for (let index = 0; index < images.length; index++) {
      const imageUri = images[index];
      
      try {
        // Comprimir imagen para reducir tamaño (más agresivo para iOS)
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          imageUri,
          [{ resize: { width: 1280 } }], // Reducido de 1920 a 1280px
          { 
            compress: 0.7, // Reducido de 0.8 a 0.7 (70% de calidad)
            format: ImageManipulator.SaveFormat.JPEG 
          }
        );

        const uriParts = manipulatedImage.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        const fileName = `image_${index}.${fileType}`;

        formData.append('images', {
          uri: manipulatedImage.uri,
          name: fileName,
          type: `image/${fileType}`,
        } as any);
        
        console.log(`Imagen ${index + 1}/${images.length} comprimida:`, fileName, 'URI:', manipulatedImage.uri.substring(0, 50) + '...');
      } catch (compressionError) {
        console.error('Error al comprimir imagen', index, ':', compressionError);
        // Si falla la compresión, usar la imagen original
        const uriParts = imageUri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        const fileName = `image_${index}.${fileType}`;

        formData.append('images', {
          uri: imageUri,
          name: fileName,
          type: `image/${fileType}`,
        } as any);
      }
    }

    console.log('Intentando subir', images.length, 'imágenes para serviceRequestId:', serviceRequestId);
    
    try {
      const response = await fetch(`${API_URL}/service_request/upload-images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        console.error('Error al subir las imágenes - Status:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          console.error('Error data parsed:', errorData);
        } catch (e) {
          console.error('Could not parse error as JSON');
        }
        return false;
      }

      console.log('Imágenes subidas con éxito:', await response.json());
      return true;
    } catch (error) {
      console.error('Error de conexión o al procesar la respuesta al subir imágenes:', error);
      return false;
    }
  };

  // Manejar envío del formulario
  const handleSave = async (values: { description: string; address: string }) => {
    if (!pkUser) {
      setError('User information not available');
      return;
    }

    // Validación de subcategoría (crítica para funcionamiento)
    if (subCategories.length > 0 && !selectedSubCategory) {
      setError('Please select a service type');
      return;
    }

    const serviceRequestData = {
      fkUser: parseInt(pkUser, 10),
      fkCategory: selectedCategory?.pkCategory || 0,
      fkSubCategory: selectedSubCategory, 
      serviceDescription: values.description,
      address: values.address,
      latitude: latitude !== null ? latitude : 0,
      longitude: longitude !== null ? longitude : 0,
    };

    console.log('Datos a enviar:', serviceRequestData);
    console.log('Imágenes seleccionadas:', images);

    setLoadingRequest(true);
    setError(null);
    setSuccess(false);

    let serviceRequestId = null;

    try {
      const response = await fetch(`${API_URL}/service_request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceRequestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error al guardar los datos:', errorData);
        setLoadingRequest(false);
        setError('Failed to create service request. Please try again.');
        return;
      }

      const data = await response.json();
      console.log('Éxito al guardar los datos:', data);
      serviceRequestId = data.requestId;
      console.log("data.requestId " + data.requestId);
      console.log("serviceRequestId " + serviceRequestId);

      if (serviceRequestId && images.length > 0) {
        const imagesUploaded = await uploadImages(serviceRequestId);
        if (!imagesUploaded) {
          setError('Failed to upload images. Please try again.');
          setLoadingRequest(false);
          return;
        }
      }

      setLoadingRequest(false);
      setSuccess(true);
      const timer = setTimeout(() => {
        setSuccess(false);
        // Clear images after closing modal to prevent null URL errors
        setImages([]);
        onClose();
        if (onServiceCreated) {
          onServiceCreated();
        }
      }, 3000);
      pendingTimersRef.current.push(timer);

    } catch (error) {
      console.error('Error de conexión o al procesar la respuesta:', error);
      setLoadingRequest(false);
      setError('Failed to create service request. Please try again.');
    }
  };

  // useEffect para cargar subcategorías
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!selectedCategory) return;
      setLoadingSubCategories(true);

      try {
        const response = await fetch(`${API_URL}/sub_category/by-category/${selectedCategory.pkCategory}`);
        const data = await response.json();
        setSubCategories(data);
        setSelectedSubCategory(null);
      } catch (error) {
        console.error('Error fetching subcategories:', error);
        setError('Failed to load service types');
      } finally {
        setLoadingSubCategories(false);
      }
    };
    fetchSubCategories();
  }, [selectedCategory, API_URL]);

  // useEffect para cargar datos del usuario y ubicación
  useEffect(() => {
    const fetchPkUser = async () => {
      try {
        const storedPkUser = await AsyncStorage.getItem('userId');
        if (storedPkUser) {
          setPkUser(storedPkUser);
        }
      } catch (error) {
        console.error('Error getting userId from AsyncStorage:', error);
      }
    };

    fetchPkUser();
    getLocation();
  }, []);

  // useEffect para resetear estado cuando se cierra el modal
  useEffect(() => {
    if (!isVisible) {
      setError(null);
      setSuccess(false);
      setLoadingRequest(false);
      setImages([]);
      setSubCategories([]); 
      setSelectedSubCategory(null);
      setShowSubCategorySheet(false);
      setIsMapExpanded(false);
      setIsMapInteracting(false);
      setShouldPreventNextPress(false);
      setInitialScrollPosition(0);
      setSearchQuery('');
      setShowImageSourceSheet(false);
      setShowImagePreview(false);
      mapHeight.setValue(200);
      successOpacity.setValue(0);
      successScale.setValue(0.8);
    }
  }, [isVisible, mapHeight, successOpacity, successScale]);

  // Success Animation Effect
  useEffect(() => {
    if (success) {
      Animated.parallel([
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(successScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      successOpacity.setValue(0);
      successScale.setValue(0.8);
    }
  }, [success, successOpacity, successScale]);

  const validationSchema = Yup.object().shape({
    description: Yup.string().required('Description is required'),
    address: Yup.string().required('Address is required'),
  });

  // Mantener toda la lógica existente de useEffect, funciones, etc.
  // ... (copiada desde el archivo original)

  return (
    <RNModal
      visible={isVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, Theme.spacing.base) + Theme.spacing.base,
          }
        ]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color={Theme.colors.text.secondary} />
          </TouchableOpacity>
          <Typography variant="h3" color="primary" style={styles.headerTitle}>
            Request Service
          </Typography>
        </View>

        {!success && !loadingRequest && !error && pkUser ? (
          <Formik
            initialValues={{
              description: '',
              address: getFormattedPrimaryAddress(),
            }}
            validationSchema={validationSchema}
            onSubmit={handleSave}
            enableReinitialize
          >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
            <>
              <ScrollView
                ref={scrollViewRef}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                scrollEventThrottle={16}
                onScroll={(event) => {
                  if (!isMapExpanded) {
                    const currentY = event.nativeEvent.contentOffset.y;
                    setInitialScrollPosition(currentY);
                  }
                }}
                onScrollBeginDrag={() => {
                  if (isMapExpanded && !isMapInteracting) {
                    collapseMap();
                  }
                }}
              >
                <View style={styles.formContainer} pointerEvents="box-none">
                  {/* Service Category Card */}
                  <Card variant="elevated" style={styles.categoryCard}>
                    <View style={styles.categoryContent} pointerEvents="box-none">
                      {selectedCategory?.imagePath && (
                        <Image
                          source={{ uri: `${API_URL}${selectedCategory.imagePath}` }}
                          style={styles.categoryImage}
                        />
                      )}
                      <Typography variant="h4" color="primary" style={styles.categoryTitle} pointerEvents="none">
                        {selectedCategory?.name}
                      </Typography>
                      <Typography variant="body2" color="secondary" style={styles.categoryDescription} pointerEvents="none">
                        {selectedCategory?.description}
                      </Typography>
                    </View>
                  </Card>

                  {/* Service Type Selection */}
                  {subCategories.length > 0 && (
                    <View style={styles.fieldContainer} pointerEvents="box-none">
                      <Typography variant="body1" color="primary" style={styles.fieldLabel} pointerEvents="none">
                        Service Type *
                      </Typography>
                      <TouchableOpacity
                        style={styles.selectorButton}
                        onPress={() => setShowSubCategorySheet(true)}
                      >
                        <Typography
                          variant="body1"
                          color={selectedSubCategory ? "primary" : "tertiary"}
                          pointerEvents="none"
                        >
                          {getSelectedSubCategoryName()}
                        </Typography>
                        <MaterialIcons
                          name="keyboard-arrow-down"
                          size={24}
                          color={Theme.colors.text.tertiary}
                        />
                      </TouchableOpacity>
                      {!selectedSubCategory && (
                        <Typography variant="caption" color="error" style={styles.errorText} pointerEvents="none">
                          Please select a service type
                        </Typography>
                      )}
                    </View>
                  )}

                  {/* Description Input */}
                  <View style={styles.fieldContainer} pointerEvents="box-none">
                    <Typography variant="body1" color="primary" style={styles.fieldLabel} pointerEvents="none">
                      Description *
                    </Typography>
                    <View style={[
                      styles.textAreaContainer,
                      touched.description && errors.description && styles.textAreaError
                    ]}>
                      <TextInput
                        style={styles.textAreaInput}
                        placeholder="Describe the service you need (e.g., repair details, specific requirements...)"
                        placeholderTextColor={Theme.colors.text.tertiary}
                        value={values.description}
                        onChangeText={handleChange('description')}
                        onBlur={handleBlur('description')}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                      />
                    </View>
                    {touched.description && errors.description && (
                      <Typography variant="caption" color="error" style={styles.errorText}>
                        {errors.description}
                      </Typography>
                    )}
                  </View>

                  {/* Location Section */}
                  <Card variant="outlined" style={styles.locationCard}>
                    <Typography variant="h4" color="primary" style={styles.sectionTitle} pointerEvents="none">
                      Service Location
                    </Typography>

                    {/* Service Address Field */}
                    <View style={styles.fieldContainer} pointerEvents="box-none">
                      <Typography variant="body1" color="primary" style={styles.fieldLabel} pointerEvents="none">
                        Service Address
                      </Typography>
                      <Input
                        placeholder="Address"
                        value={values.address}
                        onChangeText={handleChange('address')}
                        onBlur={handleBlur('address')}
                        error={touched.address && errors.address ? errors.address : undefined}
                        leftIcon="location-outline"
                        editable={false}
                        style={styles.readOnlyInput}
                        multiline={true}
                      />
                    </View>


                  </Card>

                  {/* Images Section */}
                  <View style={styles.fieldContainer} pointerEvents="box-none">
                    <Typography variant="body1" color="primary" style={styles.fieldLabel} pointerEvents="none">
                      Photos (Optional)
                    </Typography>
                    <TouchableOpacity
                      style={styles.imageUploadButton}
                      onPress={handleAddPhotos}
                    >
                      <MaterialIcons 
                        name="add-photo-alternate" 
                        size={24} 
                        color={Theme.colors.primary[500]} 
                      />
                      <Typography variant="body2" color="primary">
                        Add Photos
                      </Typography>
                    </TouchableOpacity>

                    {/* Image Preview */}
                    {images.length > 0 && (
                      <View style={styles.imagePreviewContainer}>
                        {images.map((uri, index) => (
                          <View key={index} style={styles.imageItem}>
                            {uri ? (
                              <Image source={{ uri }} style={styles.previewImage} />
                            ) : null}
                              <TouchableOpacity
                                style={styles.removeImageButton}
                                onPress={() => handleRemoveImage(uri)}
                              >
                                <MaterialIcons 
                                  name="close" 
                                  size={16} 
                                  color={Theme.colors.text.secondary} 
                                />
                              </TouchableOpacity>
                            </View>
                          ))}
                          {/* Edit Button in Preview List */}
                          <TouchableOpacity
                            style={styles.editImagesButton}
                            onPress={() => setShowImagePreview(true)}
                          >
                            <MaterialIcons name="edit" size={16} color={Theme.colors.primary[500]} />
                            <Typography variant="caption" color="primary">Edit</Typography>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                </View>
              </ScrollView>

              {/* Fixed Footer Buttons */}
              <View style={[styles.buttonContainer, styles.fixedFooter]}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={onClose}
                  style={styles.cancelButton}
                />
                <Button
                  title="Submit Request"
                  variant="primary"
                  onPress={() => handleSubmit()}
                  loading={loadingRequest}
                  disabled={(subCategories.length > 0 && !selectedSubCategory) || !values.description.trim() || !values.address || loadingRequest}
                  style={styles.submitButton}
                />
              </View>
            </>
          )}
          </Formik>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Typography variant="body2" color="error">
                  {error}
                </Typography>
              </View>
            )}

            {/* Message when user info is not available */}
            {!pkUser && !loadingRequest && (
              <View style={styles.formContainer}>
                <Typography variant="body1" color="secondary">
                  No se ha podido cargar la información del usuario.
                </Typography>
              </View>
            )}
          </ScrollView>
        )}

      {/* Loading Overlay */}
      <Loading
        visible={loadingRequest || loadingSubCategories}
        variant="overlay"
        message={loadingRequest ? "Submitting request..." : "Loading services..."}
      />

      {/* Success Overlay */}
      {success && (
        <Animated.View 
          style={[
            styles.successOverlay,
            {
              opacity: successOpacity,
              transform: [{ scale: successScale }]
            }
          ]}
        >
          <View style={styles.successContent}>
            <View style={styles.successIconContainer}>
              <MaterialIcons name="check" size={48} color="white" />
            </View>
            <Typography variant="h3" style={styles.successTitle}>
              Success!
            </Typography>
            <Typography variant="body1" style={styles.successMessage}>
              Service request submitted successfully
            </Typography>
          </View>
        </Animated.View>
      )}

      {/* Image Source Action Sheet */}
      <ActionSheet
        visible={showImageSourceSheet}
        onClose={() => setShowImageSourceSheet(false)}
        title="Add Photos"
        options={[
          {
            title: 'Take Photo',
            icon: 'camera',
            onPress: handleCameraCapture,
            id: 'camera',
          },
          {
            title: 'Choose from Gallery',
            icon: 'images',
            onPress: handleGallerySelect,
            id: 'gallery',
          },
        ]}
      />

      {/* Image Preview & Edit Modal */}
      <ImagePreviewModal
        visible={showImagePreview}
        images={images}
        onClose={() => {
          // If user closes without confirming, we might want to keep images or revert?
          // Current logic: images are already in state, so closing just hides modal.
          // If we wanted "Cancel" behavior, we'd need a temp state in the modal.
          // For now, "Done" and "Close" both just hide, but "Done" implies satisfaction.
          setShowImagePreview(false);
        }}
        onConfirm={(finalImages) => {
          setImages(finalImages);
          setShowImagePreview(false);
        }}
        onAddMore={handleAddMorePhotos}
      />

      {/* SubCategory Selection Bottom Sheet */}
      <BottomSheet
        visible={showSubCategorySheet}
        onClose={() => {
          setShowSubCategorySheet(false);
          setSearchQuery('');
        }}
        title="Select Service Type"
        size="lg"
      >
        <View style={styles.bottomSheetContent}>
          {/* Search Input */}
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color={Theme.colors.text.tertiary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search subcategories..."
              placeholderTextColor={Theme.colors.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialIcons name="clear" size={20} color={Theme.colors.text.tertiary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Items Count */}
          <Typography variant="caption" color="secondary" style={styles.itemsCount}>
            {getFilteredSubCategories().length} {getFilteredSubCategories().length === 1 ? 'option' : 'options'}
          </Typography>

          {/* SubCategories List */}
          <ScrollView
            style={styles.subCategoryList}
            contentContainerStyle={styles.subCategoryListContent}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
          >
            {getFilteredSubCategories().length > 0 ? (
              getFilteredSubCategories().map((sub, index) => {
                const isSelected = selectedSubCategory === sub.pkSubCategory;
                const isLast = index === getFilteredSubCategories().length - 1;

                return (
                  <TouchableOpacity
                    key={sub.pkSubCategory}
                    style={[
                      styles.subCategoryItem,
                      isSelected && styles.subCategorySelectedItem,
                      isLast && styles.subCategoryLastItem
                    ]}
                    onPress={() => {
                      setSelectedSubCategory(sub.pkSubCategory);
                      setShowSubCategorySheet(false);
                      setSearchQuery('');
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.subCategoryItemContent}>
                      <View style={styles.subCategoryInfo}>
                        <Typography 
                          variant="body1" 
                          color={isSelected ? "primary" : "primary"}
                          style={isSelected && styles.subCategorySelectedText}
                        >
                          {sub.name}
                        </Typography>
                        <Typography variant="caption" color="secondary">
                          ${sub.priceFrom} - ${sub.priceTo}
                        </Typography>
                      </View>
                      {isSelected ? (
                        <MaterialIcons name="radio-button-checked" size={22} color={Theme.colors.primary[500]} />
                      ) : (
                        <MaterialIcons name="radio-button-unchecked" size={22} color={Theme.colors.text.tertiary} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyStateContainer}>
                <MaterialIcons name="search-off" size={48} color={Theme.colors.text.disabled} />
                <Typography variant="body1" color="secondary" style={styles.emptyStateText}>
                  No results found
                </Typography>
                <Typography variant="caption" color="tertiary" style={styles.emptyStateSubtext}>
                  Try a different search term
                </Typography>
              </View>
            )}
          </ScrollView>
        </View>
      </BottomSheet>


      </KeyboardAvoidingView>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.light,
    backgroundColor: Theme.colors.background.primary,
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.secondary,
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: Theme.spacing.base,
  },

  scrollView: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120, // Ensure content is not hidden behind fixed footer
  },

  formContainer: {
    padding: Theme.spacing.lg,
  },

  categoryCard: {
    marginBottom: Theme.spacing.xl,
  },

  categoryContent: {
    alignItems: 'center',
    padding: Theme.spacing.lg,
  },

  categoryImage: {
    width: 80,
    height: 80,
    borderRadius: Theme.borderRadius.xl,
    marginBottom: Theme.spacing.sm,
  },

  categoryTitle: {
    marginBottom: Theme.spacing.xs,
    textAlign: 'center',
  },

  categoryDescription: {
    textAlign: 'center',
    lineHeight: Theme.typography.lineHeight.lg,
  },

  fieldContainer: {
    marginBottom: Theme.spacing.xl,
  },

  fieldLabel: {
    marginBottom: Theme.spacing.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },

  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: Theme.spacing.sm,
    backgroundColor: Theme.colors.background.primary,
    borderWidth: 1,
    borderColor: Theme.colors.border.default,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.sm,
  },

  locationCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },

  sectionTitle: {
    marginBottom: Theme.spacing.lg,
  },

  mapContainer: {
    height: 200,
    borderRadius: Theme.borderRadius.md,
    overflow: 'hidden',
    marginTop: Theme.spacing.lg,
    position: 'relative',
    ...Theme.shadows.md,
  },

  map: {
    flex: 1,
  },

  gpsButton: {
    position: 'absolute',
    bottom: Theme.spacing.sm,
    right: Theme.spacing.sm,
    backgroundColor: Theme.colors.primary[500],
    borderRadius: Theme.borderRadius.full,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.md,
  },

  imageUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.xl,
    backgroundColor: Theme.colors.background.primary,
    borderWidth: 2,
    borderColor: Theme.colors.primary[500],
    borderStyle: 'dashed',
    borderRadius: Theme.borderRadius.md,
    gap: Theme.spacing.sm,
  },

  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Theme.spacing.sm,
    gap: Theme.spacing.sm,
  },

  imageItem: {
    width: 80,
    height: 80,
    borderRadius: Theme.borderRadius.md,
    position: 'relative',
    overflow: 'hidden',
  },

  previewImage: {
    width: '100%',
    height: '100%',
  },

  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.full,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border.default,
    ...Theme.shadows.sm,
  },

  buttonContainer: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },

  fixedFooter: {
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border.light,
    paddingBottom: Platform.OS === 'ios' ? 34 : Theme.spacing.lg, // Handle safe area
    ...Theme.shadows.md, // Add shadow for better separation
  },

  cancelButton: {
    flex: 1,
  },

  submitButton: {
    flex: 2,
  },

  errorText: {
    marginTop: Theme.spacing.xs,
  },

  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  successContent: {
    alignItems: 'center',
    padding: 32,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Theme.colors.success[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: Theme.colors.success[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  successTitle: {
    color: Theme.colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    color: Theme.colors.text.secondary,
    textAlign: 'center',
  },

  errorContainer: {
    position: 'absolute',
    top: Theme.spacing['4xl'],
    left: Theme.spacing.lg,
    right: Theme.spacing.lg,
    backgroundColor: Theme.colors.error[50],
    padding: Theme.spacing.base,
    borderRadius: Theme.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.error[500],
  },

  // Estilos adicionales necesarios
  readOnlyInput: {
    backgroundColor: Theme.colors.background.secondary,
    color: Theme.colors.text.secondary,
  },

  fieldHint: {
    marginTop: Theme.spacing.xs,
    lineHeight: Theme.typography.lineHeight.sm,
    fontStyle: 'italic',
  },

  outsideMapTouchArea: {
    marginTop: Theme.spacing.sm,
    padding: Theme.spacing.sm,
    backgroundColor: Theme.colors.primary[50],
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.primary[500],
    borderStyle: 'dashed',
    alignItems: 'center',
  },

  // Estilos para BottomSheet de subcategorías
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: Theme.spacing.lg,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.secondary,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border.light,
  },

  searchIcon: {
    marginRight: Theme.spacing.sm,
  },

  searchInput: {
    flex: 1,
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.primary,
    paddingVertical: Theme.spacing.xs,
  },

  itemsCount: {
    marginBottom: Theme.spacing.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },

  subCategoryList: {
    flex: 1,
  },

  subCategoryListContent: {
    flexGrow: 1,
    paddingBottom: Theme.spacing.xl,
  },

  subCategoryItem: {
    paddingVertical: Theme.spacing.lg,
    minHeight: 72,
    borderBottomWidth: 0.5,
    borderBottomColor: Theme.colors.border.light,
    backgroundColor: Theme.colors.background.primary,
  },

  subCategorySelectedItem: {
    backgroundColor: Theme.colors.primary[50],
  },

  subCategoryLastItem: {
    borderBottomWidth: 0,
  },

  subCategoryItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  subCategoryInfo: {
    flex: 1,
    marginRight: Theme.spacing.sm,
  },

  subCategorySelectedText: {
    color: Theme.colors.primary[600],
    fontWeight: Theme.typography.fontWeight.semiBold,
  },

  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing['4xl'],
    paddingHorizontal: Theme.spacing.xl,
  },

  emptyStateText: {
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.xs,
    fontWeight: Theme.typography.fontWeight.semiBold,
  },

  emptyStateSubtext: {
    textAlign: 'center',
  },



  // Estilos específicos para TextArea (Description field) usando Theme System
  textAreaContainer: {
    backgroundColor: Theme.colors.background.primary,
    borderWidth: 1,
    borderColor: Theme.colors.border.default,
    borderRadius: Theme.borderRadius.lg,
    minHeight: 100,
    maxHeight: 150,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.sm,
    ...Theme.shadows.sm,
  },

  textAreaInput: {
    flex: 1,
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.primary,
    lineHeight: Theme.typography.lineHeight.lg,
    textAlignVertical: 'top',
    padding: 0, // Remover padding interno para que el container maneje el spacing
  },

  textAreaError: {
    borderColor: Theme.colors.error[500],
    borderWidth: 1.5,
  },

  editImagesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.sm,
    backgroundColor: Theme.colors.primary[50],
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
    borderColor: Theme.colors.primary[200],
    gap: 4,
    alignSelf: 'center',
    marginLeft: Theme.spacing.sm,
  },
});

export default RequestMigrated;