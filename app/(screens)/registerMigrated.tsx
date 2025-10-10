import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { Formik } from 'formik';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { WebView } from 'react-native-webview';
import * as Yup from 'yup';

// Theme and modern components
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Loading } from '../../components/common/Loading';
import { Screen } from '../../components/common/Screen';
import { Typography } from '../../components/common/Typography';
import { Theme } from '../../constants/Theme';

// Legacy styles for complex components that need gradual migration
import styles from '../styles';
import RegisterComplete from './registerComplete';

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL || 'http://216.246.113.71:8080';
const RECOVERY_URL = `${API_BASE_URL}/referrals/get-referral-code`; 

interface RegisterProps {
  isVisible: boolean;
  onClose: () => void;
  IsVerify: () => void;
}

const RegisterMigrated: React.FC<RegisterProps> = ({ isVisible, onClose, IsVerify }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showComplete, setshowComplete] = useState(false);
  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [loadingReferralCode, setLoadingReferralCode] = useState(true); 
  const DEFAULT_LATITUDE_DELTA = 0.0922;
  const DEFAULT_LONGITUDE_DELTA = 0.0421;

  const [mapRegion, setMapRegion] = useState<{ latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number } | null>(null);
  const [markerCoordinate, setMarkerCoordinate] = useState<{ latitude: number; longitude: number } | null>(null);

  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);

  const [dynamicCountries, setDynamicCountries] = useState<{ label: string; value: number }[]>([]);
  const [dynamicStates, setDynamicStates] = useState<{ [countryName: string]: { label: string; value: number }[] }>({});
  const [dynamicCities, setDynamicCities] = useState<{ [stateName: string]: { label: string; value: number }[] }>({});

  const [countryIdToNameMap, setCountryIdToNameMap] = useState<{ [key: number]: string }>({});
  const [stateIdToNameMap, setStateIdToNameMap] = useState<{ [key: number]: string }>({});

  const mapRef = useRef<MapView>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const API_URL = Constants.expoConfig?.extra?.API_BASE_URL || 'http://216.246.113.71:8080';

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission was denied. You can manually enter your address or use "Use My Current GPS Location" button.');
      }
    })();
  }, []);

  const handleWebViewMessage = (event: any) => {
    const data: string = event.nativeEvent.data;
    
    if (data.startsWith('referralCode:')) {
      const code = data.split(':')[1];
      
      setLoadingReferralCode(false); 
      console.log("Codigo de referido: "+referralCode);
      if (code && code !== 'NOT_FOUND') {
        setReferralCode(code);
        console.log('✅ Código de referido recuperado:', code);
      } else {
        console.log('❌ No se encontró un código pendiente.');
        setReferralCode(null);
      }
    }
  };

  // Timeout for referral code loading to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loadingReferralCode) {
        console.log('⏰ Referral code loading timeout, proceeding without code');
        setLoadingReferralCode(false);
        setReferralCode(null);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeout);
  }, [loadingReferralCode]);

  // Load only countries initially - states and cities will load on demand
  useEffect(() => {
    const fetchCountries = async () => {
      setLoading(true);
      try {
        const countriesResponse = await fetch(`${API_URL}/country/findAll`);
        if (!countriesResponse.ok) throw new Error('Failed to fetch countries');
        const rawCountries = await countriesResponse.json();

        console.log('Raw countries response:', rawCountries);

        const countries = rawCountries.map((country: any) => ({
          label: country.name,
          value: country.id
        }));

        const countryIdMap: { [key: number]: string } = {};
        rawCountries.forEach((country: any) => {
          countryIdMap[country.id] = country.name;
        });

        setDynamicCountries(countries);
        setCountryIdToNameMap(countryIdMap);
      } catch (error) {
        console.error('Error fetching countries:', error);
        setError('Failed to load countries');
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, [API_URL]);

  // Load states when country is selected
  const loadStatesForCountry = useCallback(async (countryId: number) => {
    try {
      const countryName = countryIdToNameMap[countryId];
      if (!countryName || dynamicStates[countryName]) return; // Already loaded

      const statesResponse = await fetch(`${API_URL}/state/findAll?countryId=${countryId}`);
      if (statesResponse.ok) {
        const rawStates = await statesResponse.json();
        console.log(`Loading states for ${countryName}:`, rawStates);

        const states = rawStates.map((state: any) => ({
          label: state.name,
          value: state.id
        }));

        const newStateIdMap = { ...stateIdToNameMap };
        rawStates.forEach((state: any) => {
          newStateIdMap[state.id] = state.name;
        });

        setDynamicStates(prev => ({ ...prev, [countryName]: states }));
        setStateIdToNameMap(newStateIdMap);
      }
    } catch (error) {
      console.error('Error loading states:', error);
    }
  }, [API_URL, countryIdToNameMap, dynamicStates, stateIdToNameMap]);

  // Load cities when state is selected
  const loadCitiesForState = useCallback(async (stateId: number) => {
    try {
      const stateName = stateIdToNameMap[stateId];
      if (!stateName || dynamicCities[stateName]) return; // Already loaded

      const citiesResponse = await fetch(`${API_URL}/city/findAll?stateId=${stateId}`);
      if (citiesResponse.ok) {
        const rawCities = await citiesResponse.json();
        console.log(`Loading cities for ${stateName}:`, rawCities);

        const cities = rawCities.map((city: any) => ({
          label: city.name,
          value: city.id
        }));

        setDynamicCities(prev => ({ ...prev, [stateName]: cities }));
      }
    } catch (error) {
      console.error('Error loading cities:', error);
    }
  }, [API_URL, stateIdToNameMap, dynamicCities]);

  const validationSchema = Yup.object().shape({
    first_name: Yup.string().required('First Name is required'),
    last_name: Yup.string().required('Last Name is required'),
    address: Yup.string().required('Address is required'),
    password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
    confirmPassword: Yup.string().oneOf([Yup.ref('password'), undefined], 'Passwords must match').required('Confirm Password is required'),
  });

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const region = {
        latitude,
        longitude,
        latitudeDelta: DEFAULT_LATITUDE_DELTA,
        longitudeDelta: DEFAULT_LONGITUDE_DELTA,
      };

      setMapRegion(region);
      setMarkerCoordinate({ latitude, longitude });

      if (mapRef.current) {
        mapRef.current.animateToRegion(region, 1000);
      }
    } catch (error) {
      setError('Failed to get current location');
      console.error(error);
    }
  };

  const handleRegionChange = (region: any) => {
    setMapRegion(region);
    setMarkerCoordinate({ latitude: region.latitude, longitude: region.longitude });
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Get email from AsyncStorage like in the original
      const email = await AsyncStorage.getItem('emailForSignIn');
      if (!email) {
        setLoading(false);
        setError('User email not found. Please log in again.');
        return;
      }

      // Construct the user object based on the form values
      const user = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: email,
        address: values.address,
        country_id: selectedCountryId,
        state_id: selectedStateId,
        city_id: selectedCityId,
        latitude: markerCoordinate?.latitude || null,
        longitude: markerCoordinate?.longitude || null,
        password: values.password,
        referral_code: referralCode || null,
      };

      console.log('User data being sent:', user);

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      const data = await response.json();
      console.log('Registration response:', data);

      if (response.ok) {
        setMessage('Registration successful!');
        setshowComplete(true);
        
        // Store user data for later use
        await AsyncStorage.setItem('pendingUser', JSON.stringify(user));
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const debounceAddressSearch = useCallback((address: string, setFieldValue: any) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      if (address.length > 3) {
        try {
          const geocodeResult = await Location.geocodeAsync(address);
          if (geocodeResult.length > 0) {
            const { latitude, longitude } = geocodeResult[0];
            const region = {
              latitude,
              longitude,
              latitudeDelta: DEFAULT_LATITUDE_DELTA,
              longitudeDelta: DEFAULT_LONGITUDE_DELTA,
            };

            setMapRegion(region);
            setMarkerCoordinate({ latitude, longitude });

            if (mapRef.current) {
              mapRef.current.animateToRegion(region, 1000);
            }
          }
        } catch (error) {
          console.error('Geocoding error:', error);
        }
      }
    }, 1000);
  }, []);

  // Show loading indicator while referral code is being fetched
  if (loadingReferralCode) {
    return <Loading variant="overlay" message="Loading registration form..." />;
  }

  return (
    <Screen>
      <WebView
        source={{ uri: RECOVERY_URL }}
        style={localStyles.hiddenWebView} 
        onMessage={handleWebViewMessage}
        onError={(error) => {
          console.log('❌ WebView error:', error);
          setLoadingReferralCode(false);
          setReferralCode(null);
        }}
        onLoadEnd={() => {
          console.log('📱 WebView loaded successfully');
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
      
      {!showComplete ? (
        <Formik
          initialValues={{
            first_name: '',
            last_name: '',
            address: '',
            password: '',
            confirmPassword: '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isValid, setFieldValue }) => (
            <ScrollView contentContainerStyle={migratedStyles.scrollContent}>
              <Typography 
                variant="h3" 
                color="primary" 
                style={migratedStyles.title}
              >
                New User Registration
              </Typography>
              
              <View style={migratedStyles.formContainer}>
                <Input
                  label="First Name"
                  value={values.first_name}
                  onChangeText={handleChange('first_name')}
                  onBlur={handleBlur('first_name')}
                  error={touched.first_name && errors.first_name ? errors.first_name : undefined}
                  required
                />

                <Input
                  label="Last Name"
                  value={values.last_name}
                  onChangeText={handleChange('last_name')}
                  onBlur={handleBlur('last_name')}
                  error={touched.last_name && errors.last_name ? errors.last_name : undefined}
                  required
                />

                <Input
                  label="Addressss"
                  value={values.address}
                  onChangeText={(text) => {
                    handleChange('address')(text);
                    debounceAddressSearch(text, setFieldValue);
                  }}
                  onBlur={handleBlur('address')}
                  error={touched.address && errors.address ? errors.address : undefined}
                  required
                  multiline
                />

                <Typography variant="body1" color="primary" style={migratedStyles.sectionLabel}>
                  Location on Map
                </Typography>
                {mapRegion && (
                  <MapView
                    ref={mapRef}
                    style={styles.mapStyle}
                    region={mapRegion}
                    onRegionChangeComplete={handleRegionChange}
                  >
                    {markerCoordinate && (
                      <Marker
                        coordinate={markerCoordinate}
                        title="Your Location"
                        description="Drag to adjust location"
                        draggable
                        onDragEnd={(e) => setMarkerCoordinate(e.nativeEvent.coordinate)}
                      />
                    )}
                  </MapView>
                )}

                <Button
                  variant="outline"
                  size="md"
                  onPress={getCurrentLocation}
                  style={migratedStyles.gpsButton}
                  icon={<FontAwesome name="location-arrow" size={18} color={Theme.colors.primary[500]} />}
                  iconPosition="left"
                  title="Use My Current GPS Location"
                />

                <Typography variant="body1" color="primary" style={migratedStyles.sectionLabel}>
                  Country
                </Typography>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedCountryId}
                    style={styles.picker}
                    onValueChange={(itemValue) => {
                      setSelectedCountryId(itemValue);
                      setSelectedStateId(null);
                      setSelectedCityId(null);
                      // Load states for selected country
                      if (itemValue) {
                        loadStatesForCountry(itemValue);
                      }
                    }}
                  >
                    <Picker.Item label="Select Country" value={null} />
                    {dynamicCountries.map((country) => (
                      <Picker.Item key={country.value} label={country.label} value={country.value} />
                    ))}
                  </Picker>
                </View>

                <Typography variant="body1" color="primary" style={migratedStyles.sectionLabel}>
                  State
                </Typography>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedStateId}
                    style={styles.picker}
                    onValueChange={(itemValue) => {
                      setSelectedStateId(itemValue);
                      setSelectedCityId(null);
                      // Load cities for selected state
                      if (itemValue) {
                        loadCitiesForState(itemValue);
                      }
                    }}
                    enabled={!!selectedCountryId}
                  >
                    <Picker.Item label="Select State" value={null} />
                    {selectedCountryId && dynamicStates[countryIdToNameMap[selectedCountryId]]?.map((state) => (
                      <Picker.Item key={state.value} label={state.label} value={state.value} />
                    ))}
                  </Picker>
                </View>

                <Typography variant="body1" color="primary" style={migratedStyles.sectionLabel}>
                  City
                </Typography>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedCityId}
                    style={styles.picker}
                    onValueChange={setSelectedCityId}
                    enabled={!!selectedStateId}
                  >
                    <Picker.Item label="Select City" value={null} />
                    {selectedStateId && dynamicCities[stateIdToNameMap[selectedStateId]]?.map((city) => (
                      <Picker.Item key={city.value} label={city.label} value={city.value} />
                    ))}
                  </Picker>
                </View>



                <Input
                  label="Password"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  error={touched.password && errors.password ? errors.password : undefined}
                  secureTextEntry={!showPassword}
                  rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
                  onRightIconPress={() => setShowPassword(!showPassword)}
                  required
                  leftIcon="lock-closed-outline"
                />

                <Input
                  label="Confirm Password"
                  value={values.confirmPassword}
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  error={touched.confirmPassword && errors.confirmPassword ? errors.confirmPassword : undefined}
                  secureTextEntry={!showConfirmPassword}
                  rightIcon={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  required
                  leftIcon="lock-closed-outline"
                />

                {loading && <Loading variant="inline" message="Creating your account..." />}
                
                {message && (
                  <Typography variant="body2" color="success" style={migratedStyles.successMessage}>
                    {message}
                  </Typography>
                )}
                
                {error && (
                  <Typography variant="body2" color="error" style={migratedStyles.errorMessage}>
                    {error}
                  </Typography>
                )}

                <Button
                  title="Register"
                  variant="primary"
                  size="lg"
                  onPress={() => {
                    if (isValid) {
                      handleSubmit();
                    } else {
                      setError('Please complete all required fields correctly.');
                    }
                  }}
                  disabled={loading}
                  style={migratedStyles.registerButton}
                  fullWidth
                />
              </View>
            </ScrollView>
          )}
        </Formik>
      ) : (
        <RegisterComplete isVisible={isVisible} onClose={onClose} IsVerify={IsVerify} />
      )}
    </Screen>
  );
};

const localStyles = StyleSheet.create({
  hiddenWebView: { 
    height: 1, 
    width: 1, 
    position: 'absolute',
    top: -100, 
    left: -100,
  },
});

const migratedStyles = {
  scrollContent: {
    paddingBottom: Theme.spacing.xl,
  },
  title: {
    textAlign: 'center' as const,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  formContainer: {
    paddingHorizontal: Theme.spacing.base,
    gap: Theme.spacing.md,
  },
  sectionLabel: {
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.xs,
    fontWeight: '600' as const,
  },
  gpsButton: {
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  successMessage: {
    textAlign: 'center' as const,
    marginVertical: Theme.spacing.sm,
  },
  errorMessage: {
    textAlign: 'center' as const,
    marginVertical: Theme.spacing.sm,
  },
  registerButton: {
    marginTop: Theme.spacing.lg,
  },
};

export default RegisterMigrated;