import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Formik } from 'formik';
import * as Yup from 'yup';
import styles from '../styles';
import RegisterComplete from './registerComplete';
import Constants from 'expo-constants';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';

interface RegisterProps {
  isVisible: boolean;
  onClose: () => void;
  IsVerify: () => void;
}

const Register: React.FC<RegisterProps> = ({ isVisible, onClose, IsVerify }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showComplete, setshowComplete] = useState(false);

  const DEFAULT_LATITUDE_DELTA = 0.0922;
  const DEFAULT_LONGITUDE_DELTA = 0.0421;

  const [mapRegion, setMapRegion] = useState<{ latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number } | null>(null);
  const [markerCoordinate, setMarkerCoordinate] = useState<{ latitude: number; longitude: number } | null>(null);

  // Estados para almacenar los IDs numéricos seleccionados
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);

  // Estados para los datos dinámicos del backend
  const [dynamicCountries, setDynamicCountries] = useState<{ label: string; value: number }[]>([]);
  // Usamos el nombre del país como clave para los estados
  const [dynamicStates, setDynamicStates] = useState<{ [countryName: string]: { label: string; value: number }[] }>({});
  // Usamos el nombre del estado como clave para las ciudades
  const [dynamicCities, setDynamicCities] = useState<{ [stateName: string]: { label: string; value: number }[] }>({});

  // Mapas para la conversión de ID a nombre y viceversa (útil para la geocodificación inversa y el acceso a los objetos anidados)
  const [countryIdToNameMap, setCountryIdToNameMap] = useState<{ [key: number]: string }>({});
  const [stateIdToNameMap, setStateIdToNameMap] = useState<{ [key: number]: string }>({});
  const [countryNameToIdMap, setCountryNameToIdMap] = useState<{ [key: string]: number }>({}); // Para buscar el ID por nombre de país
  const [stateNameToIdMap, setStateNameToIdMap] = useState<{ [key: string]: number }>({}); // Para buscar el ID por nombre de estado


  const mapRef = useRef<MapView>(null);

  const API_URL = Constants.expoConfig?.extra?.API_BASE_URL || 'http://216.246.113.71:8080'; // Fallback URL

  // No necesitamos estos arreglos estáticos ya que los cargaremos dinámicamente
  // const countries = [{ label: 'United States', value: 'United States' }, { label: 'Canada', value: 'Canada' }, { label: 'Mexico', value: 'Mexico' }];
  // const states = { /* ... */ };
  // const cities = { /* ... */ };

  // Este mapa se usará si reverseGeocode devuelve un nombre de país en español
  const countryDisplayNameToEnglishNameMap: { [key: string]: string } = {
    'Estados Unidos': 'United States',
    'Canadá': 'Canada',
    'México': 'Mexico',
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission was denied. You can manually enter your address or use "Use My Current GPS Location" button.');
      }
    })();
  }, []);

  // --- Carga dinámica de datos al montar el componente ---
  useEffect(() => {
    const fetchLocationData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Countries
        const countriesResponse = await fetch(`${API_URL}/country/findAll`);
        if (!countriesResponse.ok) throw new Error('Failed to fetch countries');
        const rawCountries = await countriesResponse.json();

        const newCountries = rawCountries.map((c: any) => ({
          label: c.name,
          value: c.pkCountry,
        }));
        setDynamicCountries(newCountries);

        const newCountryIdToNameMap: { [key: number]: string } = {};
        const newCountryNameToIdMap: { [key: string]: number } = {};
        rawCountries.forEach((c: any) => {
          newCountryIdToNameMap[c.pkCountry] = c.name;
          newCountryNameToIdMap[c.name] = c.pkCountry;
        });
        setCountryIdToNameMap(newCountryIdToNameMap);
        setCountryNameToIdMap(newCountryNameToIdMap);

        // 2. Fetch States
        const statesResponse = await fetch(`${API_URL}/state/findAll`);
        if (!statesResponse.ok) throw new Error('Failed to fetch states');
        const rawStates = await statesResponse.json();

        const newStates: { [countryName: string]: { label: string; value: number }[] } = {};
        const newStateIdToNameMap: { [key: number]: string } = {};
        const newStateNameToIdMap: { [key: string]: number } = {};

        rawStates.forEach((s: any) => {
          const countryName = newCountryIdToNameMap[s.fkCountry];
          if (countryName) {
            if (!newStates[countryName]) {
              newStates[countryName] = [];
            }
            newStates[countryName].push({
              label: s.name,
              value: s.pkState,
            });
            newStateIdToNameMap[s.pkState] = s.name;
            newStateNameToIdMap[s.name] = s.pkState;
          }
        });
        setDynamicStates(newStates);
        setStateIdToNameMap(newStateIdToNameMap);
        setStateNameToIdMap(newStateNameToIdMap);

        // 3. Fetch Cities
        const citiesResponse = await fetch(`${API_URL}/country_city/findAll`);
        if (!citiesResponse.ok) throw new Error('Failed to fetch cities');
        const rawCities = await citiesResponse.json();

        const newCities: { [stateName: string]: { label: string; value: number }[] } = {};
        rawCities.forEach((c: any) => {
          const stateName = newStateIdToNameMap[c.fkState];
          if (stateName) {
            if (!newCities[stateName]) {
              newCities[stateName] = [];
            }
            newCities[stateName].push({
              label: c.name,
              value: c.pkCity,
            });
          }
        });
        setDynamicCities(newCities);

      } catch (err: any) {
        setError('Failed to load location data: ' + err.message);
        console.error('Error fetching location data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationData();
  }, [API_URL]); // Vuelve a cargar si la URL de la API cambia

  const reverseGeocode = async (latitude: number, longitude: number, setFieldValue: ((field: string, value: any, shouldValidate?: boolean) => void) | null) => {
    setLoading(true); // Mostrar indicador de carga durante el geocoding
    setError('');
    try {
      const geocodedAddress = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geocodedAddress && geocodedAddress.length > 0) {
        const { country, region, city, street, name } = geocodedAddress[0];

        // Mapear el nombre del país si es necesario (ej. "Estados Unidos" a "United States")
        const englishCountryName = countryDisplayNameToEnglishNameMap[country || ''] || country;

        // Buscar los IDs numéricos basados en los nombres obtenidos
        const countryId = countryNameToIdMap[englishCountryName || ''] || null;
        const stateId = stateNameToIdMap[region || ''] || null;
        // Para la ciudad, necesitamos buscarla dentro de las ciudades del estado específico
        let cityId = null;
        if (region && dynamicCities[region]) {
          const foundCity = dynamicCities[region].find(c => c.label === city);
          if (foundCity) {
            cityId = foundCity.value;
          }
        }

        setSelectedCountryId(countryId);
        setSelectedStateId(stateId);
        setSelectedCityId(cityId);

        console.log("Valores obtenidos del GPS (Nombres):", englishCountryName, region, city);
        console.log("Valores internos de los Picker (IDs):", countryId, stateId, cityId);

        if (setFieldValue) {
          const fullAddress = [street, name, city, region, englishCountryName]
            .filter(Boolean)
            .join(', ');
          setFieldValue('address', fullAddress);
        }
      }
      console.log("Coordinates passed to reverseGeocode:", latitude, longitude); // <-- Nuevo log
   
    } catch (error) {
      console.error('Error during reverse geocoding:', error);
      setError('Could not get address details for this location. Please enter manually.');
    } finally {
      setLoading(false); // Ocultar indicador de carga
    }
  };

  const SignupSchema = Yup.object().shape({
    first_name: Yup.string().required('First Name is required'),
    last_name: Yup.string().required('Last Name is required'),
    address: Yup.string().required('Address is required'),
    password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
    confirmPassword: Yup.string().oneOf([Yup.ref('password'), undefined], 'Passwords must match').required('Confirm Password is required'),
  });

  const handleRegister = async (values: any, resetForm: () => void) => {
    setLoading(true);
    setMessage('');
    setError('');

    // Validar que se hayan seleccionado país, estado y ciudad (por ID)
    if (!markerCoordinate && (!selectedCountryId || !selectedStateId || !selectedCityId)) {
      setLoading(false);
      setError('Please select a location on the map or manually select country, state, and city.');
      return;
    }

    const email = await AsyncStorage.getItem('emailForSignIn');
    if (!email) {
      setLoading(false);
      setError('User email not found. Please log in again.');
      return;
    }

    const personData = {
      firstName: values.first_name,
      middleName: '',
      lastName: values.last_name,
      status: 1,
    };

    console.log('Creating person:', JSON.stringify(personData));

    try {
      const personResponse = await fetch(`${API_URL}/person`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personData),
      });

      if (!personResponse.ok) {
        const errorDetails = await personResponse.json();
        throw new Error(`Error creating person: ${personResponse.status} - ${errorDetails?.message || personResponse.statusText || 'Unknown error'}`);
      }

      const personResult = await personResponse.json();
      const fkPerson = personResult.pkPerson;
      console.log('Person created, ID:', fkPerson);

      const contactData = {
        fkPerson: fkPerson,
        entry: 1,
        isCommercial: 0,
      };

      console.log('Creating contact:', JSON.stringify(contactData));
      const contactResponse = await fetch(`${API_URL}/Contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });

      if (!contactResponse.ok) {
        const errorDetails = await contactResponse.json();
        throw new Error(`Error creating contact: ${contactResponse.status} - ${errorDetails?.message || contactResponse.statusText || 'Unknown error'}`);
      }

      const contactResult = await contactResponse.json();
      console.log('Contact created:', contactResult);

      const personEmailData = {
        email: email,
        isPrimary: 1,
        fkPerson: fkPerson,
      };

      console.log('Creating person email:', JSON.stringify(personEmailData));
      const personEmailResponse = await fetch(`${API_URL}/person-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personEmailData),
      });

      if (!personEmailResponse.ok) {
        const errorDetails = await personEmailResponse.json();
        throw new Error(`Error creating person email: ${personEmailResponse.status} - ${errorDetails?.message || personEmailResponse.statusText || 'Unknown error'}`);
      }

      const personEmailResult = await personEmailResponse.json();
      console.log('Person email created:', personEmailResult);
      console.log('Value of markerCoordinate before sending:', markerCoordinate); // <-- Nuevo log
      console.log('Latitude to send:', markerCoordinate ? markerCoordinate.latitude : 0); // <-- Nuevo log
      console.log('Longitude to send:', markerCoordinate ? markerCoordinate.longitude : 0); // <-- Nuevo log
  
      // Aquí es donde usas los IDs numéricos seleccionados
      const personAddressData = {
        fkPerson: fkPerson,
        address: values.address,
        isPrimary: 1,
        latitude: markerCoordinate ? markerCoordinate.latitude : 0,
        longitude: markerCoordinate ? markerCoordinate.longitude : 0,
        country: selectedCountryId !== null ? selectedCountryId : 0,
        state: selectedStateId !== null ? selectedStateId : 0,
        city: selectedCityId !== null ? selectedCityId : 0,
      };

      console.log('Creating person address:', JSON.stringify(personAddressData));
      const personAddressResponse = await fetch(`${API_URL}/person-address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personAddressData),
      });

      if (!personAddressResponse.ok) {
        const errorDetails = await personAddressResponse.json();
        throw new Error(`Error creating person address: ${personAddressResponse.status} - ${errorDetails?.message || personAddressResponse.statusText || 'Unknown error'}`);
      }

      const personAddressResult = await personAddressResponse.json();
      console.log('Person address created:', personAddressResult);

      const userData = {
        fkPerson: fkPerson,
        email: email,
        password: values.password,
      };

      console.log('Creating user:', JSON.stringify(userData));
      const userResponse = await fetch(`${API_URL}/user/createWithEmail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!userResponse.ok) {
        const errorDetails = await userResponse.json();
        throw new Error(`Error creating user: ${userResponse.status} - ${errorDetails?.message || userResponse.statusText || 'Unknown error'}`);
      }

      const userResult = await userResponse.json();
      console.log('User created:', userResult);

      setshowComplete(true);
      setLoading(false);
      setMessage('Registration successful!');
      resetForm();

    } catch (err: any) {
      setLoading(false);
      setError('Registration error: ' + (err.message || 'Unknown error'));
      console.error('Registration full error:', err);
    }
  };

  const handleCountryChange = (itemValue: number | null) => {
    setSelectedCountryId(itemValue);
    setSelectedStateId(null);
    setSelectedCityId(null);
    setMapRegion(null);
  };

  const handleStateChange = (itemValue: number | null) => {
    setSelectedStateId(itemValue);
    setSelectedCityId(null);
    setMapRegion(null);
  };

  const handleCityChange = (itemValue: number | null) => {
    setSelectedCityId(itemValue);
    setMapRegion(null);
  };

  const getCurrentLocation = async (setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) => {
    setLoading(true);
    setError('');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission was denied. Cannot get GPS location.');
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: DEFAULT_LATITUDE_DELTA,
        longitudeDelta: DEFAULT_LONGITUDE_DELTA,
      };
      setMapRegion(newRegion);
      setMarkerCoordinate({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      console.log('GPS Location set to markerCoordinate:', location.coords.latitude, location.coords.longitude); // <-- Nuevo log
    
      mapRef.current?.animateToRegion(newRegion, 1000);
      await reverseGeocode(location.coords.latitude, location.coords.longitude, setFieldValue);
      
    } catch (err) {
      setError('Failed to get current GPS location: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Obtener el nombre del país y estado seleccionados para acceder a los objetos anidados
  const currentCountryName = selectedCountryId !== null ? countryIdToNameMap[selectedCountryId] : '';
  const currentStateName = selectedStateId !== null ? stateIdToNameMap[selectedStateId] : '';


  return (
    <View style={styles.container}>
      {!showComplete ? (
        <Formik
          initialValues={{ first_name: '', last_name: '', address: '', password: '', confirmPassword: '' }}
          validationSchema={SignupSchema}
          onSubmit={(values, { resetForm }) => {
            handleRegister(values, resetForm);
          }}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isValid, setFieldValue }) => (
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <Text style={[{ textAlign: 'center', marginTop: 10 }, styles.bannerText]}>New User Registration</Text>
              <View style={styles.formContainer}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  style={[styles.input, focusedInput === 'first_name' && { borderColor: 'blue', borderWidth: 2 }]}
                  onChangeText={handleChange('first_name')}
                  onBlur={handleBlur('first_name')}
                  onFocus={() => setFocusedInput('first_name')}
                  value={values.first_name}
                />
                {errors.first_name && touched.first_name ? (
                  <Text style={{ color: 'red' }}>{errors.first_name}</Text>
                ) : null}

                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={[styles.input, focusedInput === 'last_name' && { borderColor: 'blue', borderWidth: 2 }]}
                  onChangeText={handleChange('last_name')}
                  onBlur={handleBlur('last_name')}
                  onFocus={() => setFocusedInput('last_name')}
                  value={values.last_name}
                />
                {errors.last_name && touched.last_name ? (
                  <Text style={{ color: 'red' }}>{errors.last_name}</Text>
                ) : null}

                <Text style={styles.label}>Address</Text>
                <TextInput
                  style={[styles.input, focusedInput === 'address' && { borderColor: 'blue', borderWidth: 2 }]}
                  onChangeText={handleChange('address')}
                  onBlur={handleBlur('address')}
                  onFocus={() => setFocusedInput('address')}
                  value={values.address}
                />
                {errors.address && touched.address ? (
                  <Text style={{ color: 'red' }}>{errors.address}</Text>
                ) : null}

                <Text style={styles.label}>Location on Map</Text>
                <MapView
                  ref={mapRef}
                  style={styles.mapStyle}
                  initialRegion={mapRegion === null ? {
                    latitude: 37.0902,
                    longitude: -95.7129,
                    latitudeDelta: 50,
                    longitudeDelta: 50,
                  } : undefined}
                  region={mapRegion || undefined}
                  onRegionChangeComplete={setMapRegion}
                  showsUserLocation={true}
                  onPress={async (e) => {
                    const { latitude, longitude } = e.nativeEvent.coordinate;
                    setMarkerCoordinate({ latitude, longitude });
                    await reverseGeocode(latitude, longitude, setFieldValue);
                  }}
                >
                  {markerCoordinate && <Marker coordinate={markerCoordinate} />}
                </MapView>

                <TouchableOpacity
                  style={styles.buttonGPS}
                  onPress={() => getCurrentLocation(setFieldValue)}
                >
                  <Text style={styles.buttonTextGPS}>Use My Current GPS Location</Text>
                </TouchableOpacity>

                <Text style={styles.label}>Country</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedCountryId}
                    style={styles.picker}
                    onValueChange={(itemValue: number | null) => handleCountryChange(itemValue)}
                  >
                    <Picker.Item label="Select Country" value={null} />
                    {dynamicCountries.map((c) => (
                      <Picker.Item key={c.value} label={c.label} value={c.value} />
                    ))}
                  </Picker>
                </View>


                <Text style={styles.label}>State</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedStateId}
                    style={styles.picker}
                    onValueChange={(itemValue: number | null) => handleStateChange(itemValue)}
                    enabled={!!selectedCountryId}
                  >
                    <Picker.Item label="Select State" value={null} />
                    {selectedCountryId !== null && dynamicStates[currentCountryName]?.map((s) => (
                      <Picker.Item key={s.value} label={s.label} value={s.value} />
                    ))}
                  </Picker>
                </View>

                <Text style={styles.label}>City</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedCityId}
                    style={styles.picker}
                    onValueChange={(itemValue: number | null) => handleCityChange(itemValue)}
                    enabled={!!selectedStateId}
                  >
                    <Picker.Item label="Select City" value={null} />
                    {selectedStateId !== null && dynamicCities[currentStateName]?.map((c) => (
                      <Picker.Item key={c.value} label={c.label} value={c.value} />
                    ))}
                  </Picker>
                </View>

                <Text style={styles.label}>Create Password</Text>
                <TextInput
                  style={[styles.input, focusedInput === 'password' && { borderColor: 'blue', borderWidth: 2 }]}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  onFocus={() => setFocusedInput('password')}
                  value={values.password}
                  secureTextEntry
                />
                {errors.password && touched.password ? (
                  <Text style={{ color: 'red' }}>{errors.password}</Text>
                ) : null}

                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={[styles.input, focusedInput === 'confirmPassword' && { borderColor: 'blue', borderWidth: 2 }]}
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  onFocus={() => setFocusedInput('confirmPassword')}
                  value={values.confirmPassword}
                  secureTextEntry
                />
                {errors.confirmPassword && touched.confirmPassword ? (
                  <Text style={{ color: 'red' }}>{errors.confirmPassword}</Text>
                ) : null}

                {loading && <ActivityIndicator size="large" color="#0000ff" />}
                {message && <Text style={{ color: 'green' }}>{message}</Text>}
                {error && <Text style={{ color: 'red' }}>{error}</Text>}

                <TouchableOpacity
                  style={styles.buttonRegister}
                  onPress={() => {
                    if (isValid) {
                      handleSubmit();
                    } else {
                      setError('Please complete all required fields correctly.');
                    }
                  }}
                >
                  <Text style={styles.buttonTextRegister}>Register</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </Formik>
      ) : (
        <RegisterComplete isVisible={isVisible} onClose={onClose} IsVerify={IsVerify} />
      )}
    </View>
  );
};

export default Register;