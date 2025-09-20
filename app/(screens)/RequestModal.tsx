import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Yup from 'yup';

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

const Request: React.FC<ModalProps> = ({ 
  isVisible, 
  onClose, 
  selectedCategory, 
  onServiceCreated,
  primaryAddress,
  cities = [],
  states = []
}) => {
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
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadFailed, setUploadFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]); 
  const [selectedSubCategory, setSelectedSubCategory] = useState<number | null>(null);
  const [showSubCategoryPicker, setShowSubCategoryPicker] = useState(false); 

  const API_URL = Constants.expoConfig?.extra?.API_BASE_URL;
  
  // Función para construir la descripción completa de la dirección (igual que en AddressList)
  const buildFullAddressDescription = (address: Address): string => {
    const parts: string[] = []
    
    // 1. address
    if (address.address) {
      parts.push(address.address.trim())
    }
    
    // 2. addressLine2
    if (address.addressLine2) {
      parts.push(address.addressLine2.trim())
    }
    
    // 3. City (buscar el nombre por ID)
    if (address.city && cities.length > 0) {
      const city = cities.find(c => c.pkCity === address.city)
      if (city) {
        parts.push(city.name.trim())
      }
    }
    
    // 4. State (buscar el nombre por ID)
    if (address.state && states.length > 0) {
      const state = states.find(s => s.pkState === address.state)
      if (state) {
        parts.push(state.internalCode.trim())
      }
    }
    
    // 5. zipCode
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
    const selected = subCategories.find(sub => sub.pkSubCategory === selectedSubCategory);
    return selected ? selected.name : 'Select a subcategory';
  };
  
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!selectedCategory) return;
      setLoading(true);

      try {
        console.log('-------API_URL', API_URL);
        const response = await fetch(`${API_URL}/sub_category/by-category/${selectedCategory.pkCategory}`);
        const data = await response.json();
        console.log('Subcategories received:', data);
        setSubCategories(data);
        // Don't auto-select first subcategory - let user choose
        setSelectedSubCategory(null);
      } catch (error) {
        console.error('Error al obtener subcategorías:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubCategories();
  }, [selectedCategory, API_URL]);

  useEffect(() => {
    const fetchPkUser = async () => {
      try {
        const storedPkUser = await AsyncStorage.getItem('userId');
        if (storedPkUser) {
          setPkUser(storedPkUser);
          console.log('pkUser obtenido de AsyncStorage:', storedPkUser);
        } else {
          console.log('No se encontró userId en AsyncStorage en el componente Request.');
        }
      } catch (error) {
        console.error('Error al obtener userId de AsyncStorage:', error);
      }
    };

    fetchPkUser();
    getLocation();
  }, []);

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

  const handleRemoveImage = (uriToRemove: string) => {
    setImages((prevImages) => prevImages.filter((uri) => uri !== uriToRemove));
  };

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

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (!isVisible) {
      setUploadFailed(false);
      setUploadSuccess(false);
      setLoading(false);
      setImages([]);
      setSubCategories([]); 
      setSelectedSubCategory(null);
      setShowSubCategoryPicker(false);
    }
  }, [isVisible, mapHeight]);

  const validationSchema = Yup.object().shape({
    description: Yup.string().required('Description is required'),
    address: Yup.string().required('Address is required'),
  });

  const uploadImages = async (serviceRequestId: number) => {
    if (images.length === 0) {
      console.log('No hay imágenes para subir.');
      return true;
    }

    setLoading(true);
    setUploadFailed(false);
    setUploadSuccess(false);

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
        const errorData = await response.json();
        console.error('Error al subir las imágenes:', errorData);
        setUploadFailed(true);
        return false;
      }

      console.log('Imágenes subidas con éxito:', await response.json());
      return true;
    } catch (error) {
      console.error('Error de conexión o al procesar la respuesta al subir imágenes:', error);
      setUploadFailed(true);
      return false;
    } finally {
      setLoading(false);
    }
  };


  const handleSave = async (values: { description: string; address: string }) => {
    if (!pkUser) {
      console.error('pkUser no está disponible. Asegúrate de que se haya cargado desde AsyncStorage.');
      setUploadFailed(true);
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
    console.log('Datos de la solicitud de servicio:', serviceRequestData);

    if (!API_URL) {
      console.error('La URL de la API no está configurada.');
      setUploadFailed(true);
      return;
    }

    setLoading(true);
    setUploadFailed(false);
    setUploadSuccess(false);

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
        const errorData = await response.json();
        console.error('Error al guardar los datos:', errorData);
        setLoading(false);
        setUploadFailed(true);
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
          setUploadFailed(true);
          setLoading(false);
          return;
        }
      }

      setLoading(false);
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        onClose();
        if (onServiceCreated) {
          onServiceCreated();
        }
      }, 3000);

    } catch (error) {
      console.error('Error de conexión o al procesar la respuesta:', error);
      setLoading(false);
      setUploadFailed(true);
    }
  };

  const fullImagePath = `${API_URL}${selectedCategory?.imagePath}`;

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <ScrollView 
          ref={scrollViewRef}
          style={styles.modalContent}
          scrollEventThrottle={16}
          onScroll={(event) => {
            // Capturar la posición actual del scroll cuando NO está expandido
            if (!isMapExpanded) {
              const currentY = event.nativeEvent.contentOffset.y;
              setInitialScrollPosition(currentY);
            }
          }}
          onScrollBeginDrag={() => {
            // Colapsar el mapa si el usuario hace scroll mientras está expandido
            if (isMapExpanded && !isMapInteracting) {
              collapseMap();
            }
          }}
        >
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <FontAwesome name="close" size={24} color="black" />
          </TouchableOpacity>

          {selectedCategory && (
            <View style={styles.iconContainer}>
              <Image source={{ uri: fullImagePath }} style={styles.recommendedCardImage} />
              <Text style={styles.titleText}>{selectedCategory.name}</Text>
            </View>
          )}

          {uploadSuccess && (
            <View style={styles.successMessage}>
              <Text style={styles.successText}>Service requested successfully</Text>
            </View>
          )}

          {uploadFailed && (
            <View style={styles.errorMessage}>
              <Text style={styles.errorText}>Error loading data and/or images. Please try again.</Text>
            </View>
          )}

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007bff" />
              <Text style={styles.loadingText}>Cargando...</Text>
            </View>
          )}

          {!uploadSuccess && !loading && !uploadFailed && pkUser && (
            <Formik
              initialValues={{
                service: selectedCategory ? selectedCategory.name : '',
                requirement: '',
                description: '',
                address: getFormattedPrimaryAddress(),
              }}
              validationSchema={validationSchema}
              onSubmit={handleSave}
              enableReinitialize
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View>
                  {subCategories.length > 0 && (
                    <View style={styles.subCategoryContainer}>
                      <Text style={styles.fieldLabel}>Select a subcategory:</Text>
                      
                      {/* Touch area to show picker */}
                      <TouchableOpacity 
                        style={styles.pickerButton}
                        onPress={() => setShowSubCategoryPicker(true)}
                      >
                        <Text style={[
                          styles.pickerButtonText,
                          selectedSubCategory ? {} : styles.placeholderText
                        ]}>
                          {getSelectedSubCategoryName()}
                        </Text>
                        <MaterialIcons 
                          name={Platform.OS === 'android' ? 'arrow-drop-down' : 'arrow-drop-down'} 
                          size={24} 
                          color={Platform.OS === 'android' ? '#757575' : '#666'} 
                        />
                      </TouchableOpacity>

                      {/* Native Picker Modal */}
                      {Platform.OS === 'ios' ? (
                        <Modal
                          visible={showSubCategoryPicker}
                          transparent={true}
                          animationType="slide"
                          onRequestClose={() => setShowSubCategoryPicker(false)}
                        >
                          <View style={styles.pickerModalContainer}>
                            <View style={styles.pickerModalContent}>
                              <View style={styles.pickerHeader}>
                                <TouchableOpacity
                                  onPress={() => setShowSubCategoryPicker(false)}
                                  style={styles.pickerHeaderButton}
                                >
                                  <Text style={styles.pickerHeaderButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <Text style={styles.pickerHeaderTitle}>Select Subcategory</Text>
                                <TouchableOpacity
                                  onPress={() => setShowSubCategoryPicker(false)}
                                  style={styles.pickerHeaderButton}
                                >
                                  <Text style={[styles.pickerHeaderButtonText, styles.pickerDoneButton]}>Done</Text>
                                </TouchableOpacity>
                              </View>
                              <Picker
                                selectedValue={selectedSubCategory}
                                onValueChange={(itemValue) => setSelectedSubCategory(itemValue)}
                                style={styles.iosPicker}
                                itemStyle={styles.iosPickerItem}
                              >
                                {subCategories.map((sub) => (
                                  <Picker.Item
                                    key={sub.pkSubCategory}
                                    label={sub.name}
                                    value={sub.pkSubCategory}
                                  />
                                ))}
                              </Picker>
                            </View>
                          </View>
                        </Modal>
                      ) : (
                        showSubCategoryPicker && (
                          <Modal
                            visible={showSubCategoryPicker}
                            transparent={true}
                            animationType="none"
                            onRequestClose={() => setShowSubCategoryPicker(false)}
                          >
                            <TouchableOpacity 
                              style={styles.androidPickerOverlay}
                              activeOpacity={1}
                              onPress={() => setShowSubCategoryPicker(false)}
                            >
                              <View style={styles.androidSpinnerContainer}>
                                <View style={styles.androidSpinnerHeader}>
                                  <Text style={styles.androidSpinnerTitle}>Select Subcategory</Text>
                                </View>
                                <ScrollView 
                                  style={styles.androidSpinnerScrollView}
                                  showsVerticalScrollIndicator={false}
                                >
                                  {subCategories.map((sub, index) => (
                                    <TouchableOpacity
                                      key={sub.pkSubCategory}
                                      style={[
                                        styles.androidSpinnerItem,
                                        selectedSubCategory === sub.pkSubCategory && styles.androidSpinnerSelectedItem,
                                        index === subCategories.length - 1 && styles.androidSpinnerLastItem
                                      ]}
                                      onPress={() => {
                                        setSelectedSubCategory(sub.pkSubCategory);
                                        setShowSubCategoryPicker(false);
                                      }}
                                      activeOpacity={0.7}
                                    >
                                      <View style={styles.androidSpinnerItemContent}>
                                        <Text style={[
                                          styles.androidSpinnerItemText,
                                          selectedSubCategory === sub.pkSubCategory && styles.androidSpinnerSelectedText
                                        ]}>
                                          {sub.name}
                                        </Text>
                                        {selectedSubCategory === sub.pkSubCategory && (
                                          <View style={styles.androidSpinnerCheckContainer}>
                                            <MaterialIcons name="radio-button-checked" size={20} color="#2196F3" />
                                          </View>
                                        )}
                                        {selectedSubCategory !== sub.pkSubCategory && (
                                          <View style={styles.androidSpinnerCheckContainer}>
                                            <MaterialIcons name="radio-button-unchecked" size={20} color="#BDBDBD" />
                                          </View>
                                        )}
                                      </View>
                                    </TouchableOpacity>
                                  ))}
                                </ScrollView>
                              </View>
                            </TouchableOpacity>
                          </Modal>
                        )
                      )}
                    </View>
                  )}

                  {/* Description Field */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Description</Text>
                    <TextInput
                      style={styles.descriptionInput}
                      placeholder="Describe the service you need (e.g., repair details, specific requirements...)"
                      placeholderTextColor="#999"
                      onChangeText={handleChange('description')}
                      onBlur={handleBlur('description')}
                      value={values.description}
                      multiline
                    />
                    {touched.description && errors.description && (
                      <Text style={styles.errorText}>{errors.description}</Text>
                    )}
                  </View>

                  <TextInput
                    style={[styles.input, styles.readOnlyInput]}
                    placeholder="Address"
                    onChangeText={handleChange('address')}
                    onBlur={handleBlur('address')}
                    value={values.address}
                    editable={false}
                    selectTextOnFocus={false}
                  />
                  {touched.address && errors.address && (
                    <Text style={styles.errorText}>{errors.address}</Text>
                  )}

                  {/* Location on Map */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Location on Map</Text>
                    <Text style={styles.fieldHint}>
                      {isMapExpanded 
                        ? 'Tap on the map to select your service location. The map will minimize after selection.' 
                        : 'Tap the map to expand and select your service location.'}
                    </Text>
                  </View>

                  <Animated.View 
                    ref={mapContainerRef}
                    style={[styles.mapContainer, { height: mapHeight }]}
                  >
                    <MapView
                      style={styles.map}
                      region={region}
                      onRegionChangeComplete={newRegion => setRegion(newRegion)}
                      scrollEnabled={isMapExpanded}
                      zoomEnabled={isMapExpanded}
                      pitchEnabled={isMapExpanded}
                      rotateEnabled={isMapExpanded}
                      onTouchStart={() => {
                        // Si el mapa NO está expandido, marcarlo para expandir
                        if (!isMapExpanded) {
                          // Prevenir que el siguiente onPress seleccione ubicación
                          setShouldPreventNextPress(true);
                          expandMap();
                        } else {
                          // Si ya está expandido, marcar que el usuario está interactuando
                          setIsMapInteracting(true);
                        }
                      }}
                      onTouchEnd={() => {
                        // Usuario terminó de tocar/mover el mapa
                        if (isMapExpanded) {
                          setIsMapInteracting(false);
                        }
                      }}
                      onPress={(event) => {
                        // Si debemos prevenir este press (fue el tap de expansión), ignorarlo
                        if (shouldPreventNextPress) {
                          setShouldPreventNextPress(false);
                          return;
                        }
                        
                        // Solo procesar selección de ubicación cuando el mapa está expandido
                        if (isMapExpanded) {
                          const { latitude: lat, longitude: lng } = event.nativeEvent.coordinate;
                          setLatitude(lat);
                          setLongitude(lng);
                          // Colapsar el mapa después de seleccionar ubicación
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
                        // Si el mapa está expandido, colapsarlo después de obtener ubicación
                        if (isMapExpanded) {
                          setTimeout(() => {
                            collapseMap();
                          }, 300);
                        }
                      }}
                      accessible={true}
                      accessibilityLabel="Use my current location"
                      accessibilityHint="Gets your current GPS location"
                    >
                      <MaterialIcons name="my-location" size={24} color="white" />
                    </TouchableOpacity>
                  </Animated.View>

                  {/* Área para detectar taps fuera del mapa (solo cuando está expandido) */}
                  {isMapExpanded && (
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={() => {
                        collapseMap();
                      }}
                      style={styles.outsideMapTouchArea}
                      accessible={true}
                      accessibilityLabel="Minimize map"
                      accessibilityHint="Tap to minimize the map to its original size"
                    >
                      <Text style={styles.outsideMapText}>Tap here to minimize the map</Text>
                    </TouchableOpacity>
                  )}

                  <View style={styles.imagePreviewContainer}>
                    {images.map((uri) => (
                      <View key={uri} style={styles.imageItem}>
                        <Image source={{ uri }} style={styles.previewImage} />
                        <TouchableOpacity
                          onPress={() => handleRemoveImage(uri)}
                          style={styles.removeButton}
                        >
                          <FontAwesome name="trash" size={20} color="red" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>

                  <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                      style={[styles.customButton, styles.uploadButton]} 
                      onPress={handleImagePicker}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.buttonText, styles.uploadButtonText]} numberOfLines={1}>Upload Images</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.customButton, styles.saveButton]} 
                      onPress={() => handleSubmit()}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.buttonText, styles.saveButtonText]}>Save</Text>
                    </TouchableOpacity>
                  </View>

                </View>
              )}
            </Formik>
          )}
          {!pkUser && !loading && (
            <Text>No se ha podido cargar la información del usuario.</Text>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '90%',
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  recommendedCardImage: {
    width: 100,
    height: 100,
    borderRadius: 30,
    resizeMode: 'cover',
  },
  titleText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    minHeight: 48,
  },
  readOnlyInput: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  readOnlyInput: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    gap: 16,
  },
  // Custom Button Styles
  customButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minHeight: 44,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  uploadButton: {
    backgroundColor: '#f54021',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  uploadButtonText: {
    color: '#FFFFFF',
  },
  saveButtonText: {
    color: '#FFFFFF',
  },
  button: {
    flex: 1,
    marginTop: 10,
    marginHorizontal: 5,
  },
  mapContainer: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 10,
    position: 'relative',
    backgroundColor: '#e0e0e0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  map: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  gpsButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#007bff',
    borderRadius: 20,
    padding: 10,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  imageItem: {
    width: 100,
    height: 100,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
  removeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'white',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  successMessage: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  successText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
  },
  errorMessage: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  // Subcategory picker styles
  subCategoryContainer: {
    marginBottom: 15,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#fff',
    minHeight: 48,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
        borderRadius: 4,
        borderColor: '#BDBDBD',
        backgroundColor: '#FAFAFA',
      },
    }),
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },
  // iOS Picker Modal Styles
  pickerModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: '50%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  pickerHeaderButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  pickerHeaderButtonText: {
    fontSize: 16,
    color: '#007bff',
  },
  pickerDoneButton: {
    fontWeight: '600',
  },
  pickerHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  iosPicker: {
    backgroundColor: '#fff',
  },
  iosPickerItem: {
    fontSize: 18,
    height: 120,
  },
  // Android Picker Modal Styles
  androidPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  // Android Native Spinner Styles
  androidSpinnerContainer: {
    backgroundColor: '#fff',
    borderRadius: 4,
    width: '100%',
    maxHeight: '70%',
    maxWidth: 400,
    ...Platform.select({
      android: {
        elevation: 8,
      },
    }),
  },
  androidSpinnerHeader: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
  },
  androidSpinnerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#212121',
    textAlign: 'left',
  },
  androidSpinnerScrollView: {
    maxHeight: 320,
  },
  androidSpinnerItem: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#fff',
  },
  androidSpinnerSelectedItem: {
    backgroundColor: '#E3F2FD',
  },
  androidSpinnerLastItem: {
    borderBottomWidth: 0,
  },
  androidSpinnerItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  androidSpinnerItemText: {
    fontSize: 16,
    color: '#424242',
    flex: 1,
    lineHeight: 24,
  },
  androidSpinnerSelectedText: {
    color: '#1976D2',
    fontWeight: '500',
  },
  androidSpinnerCheckContainer: {
    marginLeft: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Legacy Android Picker Styles (kept for compatibility)
  androidPickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    maxHeight: '70%',
    ...Platform.select({
      android: {
        elevation: 8,
      },
    }),
  },
  androidPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  androidPickerScrollView: {
    maxHeight: 300,
  },
  androidPickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  androidPickerSelectedItem: {
    backgroundColor: '#f0f8ff',
  },
  androidPickerItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  androidPickerSelectedText: {
    color: '#007bff',
    fontWeight: '600',
  },
  // Keep existing picker styles for backward compatibility
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  pickerLabel: {
    fontSize: 16,
    paddingLeft: 10,
    paddingTop: 5,
    color: '#333',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  // Estilos para el área de tap fuera del mapa
  outsideMapTouchArea: {
    marginTop: 10,
    marginBottom: 10,
    padding: 15,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007bff',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  outsideMapText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Request;