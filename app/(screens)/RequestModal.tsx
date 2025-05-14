import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Button,
  Image,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import * as ImagePicker from 'expo-image-picker';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import Constants from 'expo-constants';

interface Service {
  codigo: number;
  title: string;
  icon: string;
  color: string;
}

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedService: Service | null;
}

const Request: React.FC<ModalProps> = ({ isVisible, onClose, selectedService }) => {
  const [images, setImages] = useState<string[]>([]);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadFailed, setUploadFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const API_URL = Constants.expoConfig?.extra?.API_BASE_URL;

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

  const validationSchema = Yup.object().shape({
    description: Yup.string().required('Description is required'),
    address: Yup.string().required('Address is required'),
  });

  const handleSave = async (values: { description: string; address: string }) => {
    const serviceRequestData = {
      fkUser: 6, 
      serviceType: selectedService?.codigo || 0,
      serviceDescription: values.description,
      address: values.address,
      latitude: latitude !== null ? latitude : 0,
      longitude: longitude !== null ? longitude : 0,
    };
    console.log('Datos a enviar:', serviceRequestData);
    console.log('Imágenes seleccionadas:', images);

    if (!API_URL) {
      console.error('La URL de la API no está configurada.');
      return;
    }

    setLoading(true);
    setUploadFailed(false);
    setUploadSuccess(false); 

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
      setLoading(false);
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        onClose(); 
      }, 3000);

    } catch (error) {
      console.error('Error de conexión o al procesar la respuesta:', error);
      setLoading(false);
      setUploadFailed(true);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <ScrollView style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <FontAwesome name="close" size={24} color="black" />
          </TouchableOpacity>

          {selectedService && (
            <View style={styles.iconContainer}>
              <MaterialIcons name={selectedService.icon} size={80} color={selectedService.color} />
              <Text style={styles.titleText}>{selectedService.title}</Text>
            </View>
          )}

          {uploadSuccess && (
            <View style={styles.successMessage}>
              <Text style={styles.successText}>Datos cargados con éxito!</Text>
            </View>
          )}

          {uploadFailed && (
            <View style={styles.errorMessage}>
              <Text style={styles.errorText}>Error al cargar los datos. Inténtalo de nuevo.</Text>
            </View>
          )}

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007bff" />
              <Text style={styles.loadingText}>Cargando...</Text>
            </View>
          )}

          {!uploadSuccess && !loading && !uploadFailed && (
            <Formik
              initialValues={{
                service: selectedService ? selectedService.title : '',
                requirement: '',
                description: '',
                address: '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleSave}
              enableReinitialize
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View>

                  <TextInput
                    style={styles.descriptionInput}
                    placeholder="Description"
                    onChangeText={handleChange('description')}
                    onBlur={handleBlur('description')}
                    value={values.description}
                    multiline
                  />
                  {touched.description && errors.description && (
                    <Text style={styles.errorText}>{errors.description}</Text>
                  )}

                  <TextInput
                    style={styles.input}
                    placeholder="Address"
                    onChangeText={handleChange('address')}
                    onBlur={handleBlur('address')}
                    value={values.address}
                  />
                  {touched.address && errors.address && (
                    <Text style={styles.errorText}>{errors.address}</Text>
                  )}

                  <View style={styles.mapContainer}>
                    <MapView
                      style={styles.map}
                      region={region}
                      onRegionChangeComplete={newRegion => setRegion(newRegion)}
                      onPress={(event) => {
                        setLatitude(event.nativeEvent.coordinate.latitude);
                        setLongitude(event.nativeEvent.coordinate.longitude);
                      }}
                    >
                      {latitude && longitude && (
                        <Marker
                          coordinate={{ latitude, longitude }}
                          title="Ubicación Seleccionada"
                        />
                      )}
                    </MapView>
                    <TouchableOpacity style={styles.gpsButton} onPress={getLocation}>
                      <MaterialIcons name="my-location" size={24} color="white" />
                    </TouchableOpacity>
                  </View>

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
                    <View style={styles.button} >
                      <Button title="Upload Images" color="#f54021" onPress={handleImagePicker} />
                    </View>
                    <View style={styles.button}>
                      <Button title="Save" onPress={handleSubmit} />
                    </View>
                  </View>

                </View>
              )}
            </Formik>
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
  titleText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    flex: 1,
    marginTop: 10,
    marginHorizontal: 5,
  },
  mapContainer: {
    height: 200,
    width: '100%',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
    position: 'relative',
  },
  map: {
    flex: 1,
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
  }
});

export default Request;
