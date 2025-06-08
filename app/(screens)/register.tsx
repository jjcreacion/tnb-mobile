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

  const HOUSTON_LATITUDE = 29.7604;
  const HOUSTON_LONGITUDE = -95.3698;
  const DEFAULT_LATITUDE_DELTA = 0.0922;
  const DEFAULT_LONGITUDE_DELTA = 0.0421;

  const [mapRegion, setMapRegion] = useState({
    latitude: HOUSTON_LATITUDE,
    longitude: HOUSTON_LONGITUDE,
    latitudeDelta: DEFAULT_LATITUDE_DELTA,
    longitudeDelta: DEFAULT_LONGITUDE_DELTA,
  });
  const [markerCoordinate, setMarkerCoordinate] = useState<{ latitude: number; longitude: number } | null>({
    latitude: HOUSTON_LATITUDE,
    longitude: HOUSTON_LONGITUDE,
  });
  const [country, setCountry] = useState('United States');
  const [state, setState] = useState('Texas');
  const [city, setCity] = useState('Houston');

  const mapRef = useRef<MapView>(null);

  const API_URL = Constants.expoConfig?.extra?.API_BASE_URL;

  const countries = [{ label: 'United States', value: 'United States' }, { label: 'Canada', value: 'Canada' }, { label: 'Mexico', value: 'Mexico' }];
  const states = {
    'United States': [{ label: 'Texas', value: 'Texas' }, { label: 'California', value: 'California' }, { label: 'Florida', value: 'Florida' }],
    'Canada': [{ label: 'Ontario', value: 'Ontario' }, { label: 'Quebec', value: 'Quebec' }],
    'Mexico': [{ label: 'Mexico City', value: 'Mexico City' }, { label: 'Jalisco', value: 'Jalisco' }],
  };
  const cities = {
    'Texas': [{ label: 'Houston', value: 'Houston' }, { label: 'Dallas', value: 'Dallas' }],
    'California': [{ label: 'Los Angeles', value: 'Los Angeles' }, { label: 'San Francisco', value: 'San Francisco' }],
    'Ontario': [{ label: 'Toronto', value: 'Toronto' }, { label: 'Ottawa', value: 'Ottawa' }],
  };


  useEffect(() => {
    reverseGeocode(HOUSTON_LATITUDE, HOUSTON_LONGITUDE, null); // Pass null for setFieldValue initially

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission was denied. You can manually enter your address.');
      }
    })();
  }, []);

  const reverseGeocode = async (latitude: number, longitude: number, setFieldValue: ((field: string, value: any, shouldValidate?: boolean) => void) | null) => {
    try {
      const geocodedAddress = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geocodedAddress && geocodedAddress.length > 0) {
        const { country, region, city, street, name } = geocodedAddress[0];
        setCountry(country || '');
        setState(region || '');
        setCity(city || '');

        if (setFieldValue) {
          const fullAddress = [street, name, city, region, country]
            .filter(Boolean)
            .join(', ');
          setFieldValue('address', fullAddress);
        }
      }
    } catch (error) {
      console.error('Error during reverse geocoding:', error);
      setError('Could not get address details for this location. Please enter manually.');
    }
  };

  const SignupSchema = Yup.object().shape({
    first_name: Yup.string().required('First Name is required'),
    last_name: Yup.string().required('Last Name is required'),
    address: Yup.string().required('Address is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: Yup.string().oneOf([Yup.ref('password'), undefined], 'Passwords must match').required('Confirm Password is required'),
  });

  const handleRegister = async (values: any, resetForm: () => void) => {
    setLoading(true);
    setMessage('');
    setError('');

    if (!markerCoordinate || !country || !state || !city) {
      setLoading(false);
      setError('Please select a location on the map or manually enter country, state, and city.');
      return;
    }

    const email = await AsyncStorage.getItem('emailForSignIn');

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

      const personAddressData = {
        fkPerson: fkPerson,
        address: values.address,
        isPrimary: 1,
      /*  latitude: markerCoordinate.latitude,
        longitude: markerCoordinate.longitude,
        country: country,
        state: state,
        city: city,*/
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
    }
  };

  const handleCountryChange = (itemValue: string) => {
    setCountry(itemValue);
    setState(''); 
    setCity('');
  };

  const handleStateChange = (itemValue: string) => {
    setState(itemValue);
    setCity(''); 
  };

  const handleCityChange = (itemValue: string) => {
    setCity(itemValue);
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
      mapRef.current?.animateToRegion(newRegion, 1000);
      await reverseGeocode(location.coords.latitude, location.coords.longitude, setFieldValue);
    } catch (err) {
      setError('Failed to get current GPS location: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

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
                  region={mapRegion}
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
                    selectedValue={country}
                    style={styles.picker} 
                    onValueChange={(itemValue: string) => handleCountryChange(itemValue)}
                  >
                    <Picker.Item label="Select Country" value="" />
                    {countries.map((c) => (
                      <Picker.Item key={c.value} label={c.label} value={c.value} />
                    ))}
                  </Picker>
                </View>
                {errors.address && touched.address ? ( 
                  <Text style={{ color: 'red' }}>{errors.address}</Text>
                ) : null}


                <Text style={styles.label}>State</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={state}
                    style={styles.picker}
                    onValueChange={(itemValue: string) => handleStateChange(itemValue)}
                    enabled={!!country} 
                  >
                    <Picker.Item label="Select State" value="" />
                    {country && states[country as keyof typeof states]?.map((s) => (
                      <Picker.Item key={s.value} label={s.label} value={s.value} />
                    ))}
                  </Picker>
                </View>

                <Text style={styles.label}>City</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={city}
                    style={styles.picker}
                    onValueChange={(itemValue: string) => handleCityChange(itemValue)}
                    enabled={!!state} 
                  >
                    <Picker.Item label="Select City" value="" />
                    {state && cities[state as keyof typeof cities]?.map((c) => (
                      <Picker.Item key={c.value} label={c.label} value={c.value} />
                    ))}
                  </Picker>
                </View>

                <Text style={styles.label}>Password</Text>
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