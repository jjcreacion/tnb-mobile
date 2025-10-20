import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Formik } from 'formik';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Image,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Yup from 'yup';

// Import migrated components
import {
    ActionSheet,
    BottomSheet,
    Button,
    Card,
    Input,
    Loading,
    Modal,
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
  cities = [],
  states = []
}) => {
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
  const [showImageActionSheet, setShowImageActionSheet] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estados para mapa interactivo
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [isMapInteracting, setIsMapInteracting] = useState(false);
  const [shouldPreventNextPress, setShouldPreventNextPress] = useState(false);
  const [initialScrollPosition, setInitialScrollPosition] = useState(0);
  const mapHeight = useRef(new Animated.Value(200)).current;
  const scrollViewRef = useRef<ScrollView>(null);

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
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
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
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({
            y: initialScrollPosition,
            animated: true,
          });
        }
      }, 100);
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

  // Manejar selección de imágenes
  const handleImagePicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      setImages((prevImages) => [...prevImages, ...result.assets.map((asset) => asset.uri)]);
    }
  };

  // Manejar tomar foto con cámara
  const handleCameraCapture = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      setImages((prevImages) => [...prevImages, ...result.assets.map((asset) => asset.uri)]);
    }
  };

  // Remover imagen
  const handleRemoveImage = (uriToRemove: string) => {
    setImages((prevImages) => prevImages.filter((uri) => uri !== uriToRemove));
  };

  // Obtener ubicación
  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setLatitude(location.coords.latitude);
    setLongitude(location.coords.longitude);
    setRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });
  };

  // Subir imágenes
  const uploadImages = async (serviceRequestId: number) => {
    if (images.length === 0) {
      return true;
    }

    const formData = new FormData();
    formData.append('serviceRequestId', serviceRequestId.toString());

    images.forEach((imageUri, index) => {
      const uriParts = imageUri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      const fileName = `image_${index}.${fileType}`;

      formData.append('images', {
        uri: imageUri,
        name: fileName,
        type: `image/${fileType}`,
      } as any);
    });

    try {
      const response = await fetch(`${API_URL}/service_request/upload-images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload images');
      }

      return true;
    } catch (error) {
      console.error('Error uploading images:', error);
      setError('Failed to upload images');
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
    if (!selectedSubCategory) {
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

    setLoadingRequest(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`${API_URL}/service_request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceRequestData),
      });

      if (!response.ok) {
        throw new Error('Failed to create service request');
      }

      const data = await response.json();
      const serviceRequestId = data.requestId;

      if (serviceRequestId && images.length > 0) {
        const imagesUploaded = await uploadImages(serviceRequestId);
        if (!imagesUploaded) {
          return;
        }
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onServiceCreated) {
          onServiceCreated();
        }
      }, 3000);

    } catch (error) {
      console.error('Error creating service request:', error);
      setError('Failed to create service request. Please try again.');
    } finally {
      setLoadingRequest(false);
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
      setShowImageActionSheet(false);
      setIsMapExpanded(false);
      setIsMapInteracting(false);
      setShouldPreventNextPress(false);
      setInitialScrollPosition(0);
      setSearchQuery('');
      mapHeight.setValue(200);
    }
  }, [isVisible, mapHeight]);

  const validationSchema = Yup.object().shape({
    description: Yup.string().required('Description is required'),
    address: Yup.string().required('Address is required'),
  });

  // Mantener toda la lógica existente de useEffect, funciones, etc.
  // ... (copiada desde el archivo original)

  return (
    <Modal
      visible={isVisible}
      onClose={onClose}
      size="full"
      position="center"
      showCloseButton={false}
      dismissOnBackdrop={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <MaterialIcons name="close" size={24} color={Theme.colors.text.secondary} />
        </TouchableOpacity>
        <Typography variant="h3" color="primary" style={styles.headerTitle}>
          Request Service
        </Typography>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
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
        {/* Success Message */}
        {success && (
          <View style={styles.successContainer}>
            <Typography variant="body1" color="success" style={styles.successText}>
              Service requested successfully!
            </Typography>
          </View>
        )}

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          </View>
        )}

        {/* Main Form - Only show when conditions are met */}
        {!success && !loadingRequest && !error && pkUser && (
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
            <View style={styles.formContainer}>
              {/* Service Category Card */}
              <Card variant="elevated" style={styles.categoryCard}>
                <View style={styles.categoryContent}>
                  <Image
                    source={{ uri: `${API_URL}${selectedCategory?.imagePath}` }}
                    style={styles.categoryImage}
                  />
                  <Typography variant="h4" color="primary" style={styles.categoryTitle}>
                    {selectedCategory?.name}
                  </Typography>
                  <Typography variant="body2" color="secondary" style={styles.categoryDescription}>
                    {selectedCategory?.description}
                  </Typography>
                </View>
              </Card>

              {/* Service Type Selection */}
              {subCategories.length > 0 && (
                <View style={styles.fieldContainer}>
                  <Typography variant="body1" color="primary" style={styles.fieldLabel}>
                    Service Type *
                  </Typography>
                  <TouchableOpacity
                    style={styles.selectorButton}
                    onPress={() => setShowSubCategorySheet(true)}
                  >
                    <Typography 
                      variant="body1" 
                      color={selectedSubCategory ? "primary" : "tertiary"}
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
                    <Typography variant="caption" color="error" style={styles.errorText}>
                      Please select a service type
                    </Typography>
                  )}
                </View>
              )}

              {/* Description Input */}
              <View style={styles.fieldContainer}>
                <Typography variant="body1" color="primary" style={styles.fieldLabel}>
                  Description
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
                <Typography variant="h4" color="primary" style={styles.sectionTitle}>
                  Service Location
                </Typography>

                {/* Service Address Field */}
                <View style={styles.fieldContainer}>
                  <Typography variant="body1" color="primary" style={styles.fieldLabel}>
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
                  />
                </View>

                {/* Location on Map */}
                <View style={styles.fieldContainer}>
                  <Typography variant="body1" color="primary" style={styles.fieldLabel}>
                    Location on Map
                  </Typography>
                  <Typography variant="caption" color="secondary" style={styles.fieldHint}>
                    {isMapExpanded 
                      ? 'Tap on the map to select your service location. The map will minimize after selection.' 
                      : 'Tap the map to expand and select your service location.'}
                  </Typography>
                </View>

                {/* Map View */}
                <Animated.View style={[styles.mapContainer, { height: mapHeight }]}>
                  <MapView
                    style={styles.map}
                    region={region}
                    onRegionChangeComplete={setRegion}
                    scrollEnabled={isMapExpanded}
                    zoomEnabled={isMapExpanded}
                    pitchEnabled={isMapExpanded}
                    rotateEnabled={isMapExpanded}
                    onTouchStart={() => {
                      if (!isMapExpanded) {
                        setShouldPreventNextPress(true);
                        expandMap();
                      } else {
                        setIsMapInteracting(true);
                      }
                    }}
                    onTouchEnd={() => {
                      if (isMapExpanded) {
                        setIsMapInteracting(false);
                      }
                    }}
                    onPress={(event) => {
                      if (shouldPreventNextPress) {
                        setShouldPreventNextPress(false);
                        return;
                      }
                      
                      if (isMapExpanded) {
                        const { latitude: lat, longitude: lng } = event.nativeEvent.coordinate;
                        setLatitude(lat);
                        setLongitude(lng);
                        setTimeout(() => {
                          collapseMap();
                        }, 300);
                      }
                    }}
                  >
                    {latitude && longitude && (
                      <Marker
                        coordinate={{ latitude, longitude }}
                        title="Selected Location"
                        description="Your service location"
                      />
                    )}
                  </MapView>
                  
                  <TouchableOpacity 
                    style={styles.gpsButton}
                    onPress={() => {
                      getLocation();
                      if (isMapExpanded) {
                        setTimeout(() => {
                          collapseMap();
                        }, 300);
                      }
                    }}
                  >
                    <MaterialIcons 
                      name="my-location" 
                      size={20} 
                      color={Theme.colors.text.inverse} 
                    />
                  </TouchableOpacity>
                </Animated.View>

                {/* Area para tap fuera del mapa */}
                {isMapExpanded && (
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={collapseMap}
                    style={styles.outsideMapTouchArea}
                  >
                    <Typography variant="body2" color="primary">
                      Tap here to minimize the map
                    </Typography>
                  </TouchableOpacity>
                )}
              </Card>

              {/* Images Section */}
              <View style={styles.fieldContainer}>
                <Typography variant="body1" color="primary" style={styles.fieldLabel}>
                  Photos (Optional)
                </Typography>
                <TouchableOpacity
                  style={styles.imageUploadButton}
                  onPress={() => setShowImageActionSheet(true)}
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
                        <Image source={{ uri }} style={styles.previewImage} />
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
                  </View>
                )}
              </View>

              {/* Submit Buttons */}
              <View style={styles.buttonContainer}>
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
                  disabled={!selectedSubCategory || loadingRequest}
                  style={styles.submitButton}
                />
              </View>
            </View>
          )}
          </Formik>
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

      {/* Loading Overlay */}
      <Loading
        visible={loadingRequest || loadingSubCategories}
        variant="overlay"
        message={loadingRequest ? "Submitting request..." : "Loading services..."}
      />

      {/* Success/Error Messages */}
      {success && (
        <View style={styles.successContainer}>
          <Typography variant="body1" color="success">
            Service request submitted successfully!
          </Typography>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        </View>
      )}

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
          <ScrollView style={styles.subCategoryList} showsVerticalScrollIndicator={true}>
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

      {/* Action Sheet for Images */}
      <ActionSheet
        visible={showImageActionSheet}
        onClose={() => setShowImageActionSheet(false)}
        title="Add Photo"
        options={[
          {
            id: 'camera',
            title: 'Take Photo',
            icon: 'camera-outline',
            onPress: () => {
              setShowImageActionSheet(false);
              handleCameraCapture();
            },
          },
          {
            id: 'gallery',
            title: 'Choose from Gallery',
            icon: 'images-outline',
            onPress: () => {
              setShowImageActionSheet(false);
              handleImagePicker();
            },
          },
        ]}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.base,
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
    marginBottom: Theme.spacing.md,
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
    paddingVertical: Theme.spacing.md,
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
    bottom: Theme.spacing.md,
    right: Theme.spacing.md,
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
    marginTop: Theme.spacing.md,
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
    gap: Theme.spacing.md,
    marginTop: Theme.spacing['2xl'],
    marginBottom: Theme.spacing.lg,
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

  successContainer: {
    position: 'absolute',
    top: Theme.spacing['4xl'],
    left: Theme.spacing.lg,
    right: Theme.spacing.lg,
    backgroundColor: Theme.colors.success[50],
    padding: Theme.spacing.base,
    borderRadius: Theme.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.success[500],
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
    marginTop: Theme.spacing.md,
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.primary[50],
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.primary[500],
    borderStyle: 'dashed',
    alignItems: 'center',
  },

  // Estilos para BottomSheet de subcategorías
  bottomSheetContent: {
    padding: Theme.spacing.lg,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.secondary,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
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
    maxHeight: 320,
  },

  subCategoryItem: {
    paddingHorizontal: Theme.spacing.lg,
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
    marginRight: Theme.spacing.md,
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

  // Estilos para mensajes de éxito
  successText: {
    fontWeight: Theme.typography.fontWeight.semiBold,
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
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
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
});

export default RequestMigrated;