import { FontAwesome } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Formik } from 'formik'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Yup from 'yup'

// Components
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { Loading } from '../../components/common/Loading'
import { Typography } from '../../components/common/Typography'
import { CountryCodeSelector } from '../../components/registration/CountryCodeSelector'
import { DateInput } from '../../components/registration/DateInput'

// Address components (reused from AddressModal)
import { AddressAutocomplete } from '../../components/person-address/AddressAutocomplete'
import { AddressMappingService } from '../../components/person-address/AddressMappingService'
import { CitySelector } from '../../components/person-address/CitySelector'
import { StateSelector } from '../../components/person-address/StateSelector'
import type { City, State } from '../../components/person-address/types'
import type { ParsedMapboxAddress } from '../../components/person-address/mapbox'
import { isMapboxAvailable, MAPBOX_CONFIG } from '../../components/person-address/mapbox'

// Services
import { authService } from '../../services/api/authService'

// Hooks
import { useRegistration } from '../../hooks/useRegistration'

// Theme
import { Theme } from '../../constants/Theme'
import type { RegistrationFormData } from '../../types/registration'

// Validation Schema
const validationSchema = Yup.object().shape({
  firstName: Yup.string().required('First Name is required').min(2, 'Too short'),
  lastName: Yup.string().required('Last Name is required').min(2, 'Too short'),
  birthDate: Yup.string().required('Date of Birth is required'),
  phoneNumber: Yup.string()
    .required('Phone number is required')
    .min(10, 'Phone number must be at least 10 digits'),
  address: Yup.string().required('Address is required'),
  city: Yup.string().required('City is required'),
  state: Yup.string().required('State is required'),
  zipCode: Yup.string().required('Zip Code is required'),
})

// Main Register Component
const Register: React.FC = () => {
  const router = useRouter()
  const { loading, registerUser } = useRegistration()

  const [cities, setCities] = useState<City[]>([])
  const [states, setStates] = useState<State[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // Screen navigation
  const [currentScreen, setCurrentScreen] = useState<'form' | 'city' | 'state'>('form')
  const [filteredCities, setFilteredCities] = useState<City[]>([])
  const [citySearchText, setCitySearchText] = useState('')
  const [stateSearchText, setStateSearchText] = useState('')

  // Form state (shared across screens)
  const [formData, setFormData] = useState<any>({
    firstName: '',
    lastName: '',
    birthDate: '',
    countryCode: '+1',
    phoneNumber: '',
    address: '',
    addressLine2: '',
    city: '',
    cityId: null,
    state: '',
    stateId: null,
    zipCode: '',
    latitude: undefined,
    longitude: undefined,
    isMapboxResult: false,
  })


  // Address field refs
  const zipCodeRef = useRef<TextInput>(null)
  const addressLine2Ref = useRef<TextInput>(null)
  const [useManualEntry, setUseManualEntry] = useState(false)
  const [mappingWarnings, setMappingWarnings] = useState<string[]>([])

  // Configure StatusBar
  useEffect(() => {
    StatusBar.setBarStyle('dark-content')
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#FFFFFF')
      StatusBar.setTranslucent(false)
    }
  }, [])

  // Load cities and states
  useEffect(() => {
    const loadData = async () => {
      try {
        const [citiesData, statesData] = await Promise.all([
          authService.getAllCities(),
          authService.getAllStates(),
        ])

        const mappedCities = citiesData.map((c) => ({
          pkCity: c.pkCity,
          name: c.name,
          fkState: c.fkState,
          status: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }))

        const mappedStates = statesData.map((s) => ({
          pkState: s.pkState,
          name: s.name,
          fkCountry: s.fkCountry,
          internalCode: '',
          status: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }))

        setCities(mappedCities)
        setStates(mappedStates)
        setFilteredCities(mappedCities)
      } catch (error) {
        console.error('Error loading cities and states:', error)
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [])

  const updateLocalEntities = useCallback(
    (createdEntities: { state?: State; city?: City }) => {
      if (createdEntities.state) {
        setStates((prev) => {
          const exists = prev.find((s) => s.pkState === createdEntities.state!.pkState)
          if (!exists) {
            return [...prev, createdEntities.state!]
          }
          return prev
        })
      }

      if (createdEntities.city) {
        setCities((prev) => {
          const exists = prev.find((c) => c.pkCity === createdEntities.city!.pkCity)
          if (!exists) {
            return [...prev, createdEntities.city!]
          }
          return prev
        })
      }
    },
    []
  )

  // Handle Mapbox address selection
  const handleAddressSelect = async (mapboxAddress: ParsedMapboxAddress, selectedText: string) => {
    if (MAPBOX_CONFIG.enabled && !MAPBOX_CONFIG.useLocalDatabaseMapping) {
      setFormData({
        ...formData,
        address: selectedText,
        addressLine2: '',
        city: mapboxAddress.city || '',
        cityId: null,
        state: mapboxAddress.stateCode || mapboxAddress.state || '',
        stateId: null,
        zipCode: mapboxAddress.zipCode || '',
        latitude: mapboxAddress.latitude,
        longitude: mapboxAddress.longitude,
        isMapboxResult: true,
      })
      setMappingWarnings([])
    } else {
      try {
        const mappingResult = await AddressMappingService.mapToFormDataWithAutoCreation(
          mapboxAddress,
          cities,
          states
        )

        setFormData({
          ...formData,
          address: selectedText,
          addressLine2: '',
          city: mappingResult.formData.city,
          cityId: mappingResult.formData.cityId,
          state: mappingResult.formData.state,
          stateId: mappingResult.formData.stateId,
          zipCode: mappingResult.formData.zipCode,
          latitude: mappingResult.formData.latitude,
          longitude: mappingResult.formData.longitude,
          isMapboxResult: true,
        })

        setMappingWarnings(mappingResult.warnings)

        if (mappingResult.createdEntities) {
          updateLocalEntities(mappingResult.createdEntities)
        }
      } catch (error) {
        console.error('Auto-creation mapping failed:', error)
      }
    }
  }

  const handleCitySelect = (city: City) => {
    const cityState = states.find((s) => s.pkState === city.fkState)

    setFormData({
      ...formData,
      city: city.name,
      cityId: city.pkCity,
      state: cityState?.name ?? '',
      stateId: cityState?.pkState ?? null,
    })
    setCurrentScreen('form')
    setCitySearchText('')

    setTimeout(() => {
      zipCodeRef.current?.focus()
    }, 300)
  }

  const handleStateSelect = (state: State) => {
    const stateCities = cities.filter((c) => c.fkState === state.pkState)
    setFilteredCities(stateCities)

    setFormData({
      ...formData,
      state: state.name,
      stateId: state.pkState,
      city: '',
      cityId: null,
    })
    setCurrentScreen('form')
    setStateSearchText('')
  }

  const handleCitySearch = (text: string) => {
    setCitySearchText(text)
    if (text === '') {
      setFilteredCities(cities)
    } else {
      const filtered = cities.filter((city) =>
        city.name.toLowerCase().includes(text.toLowerCase())
      )
      setFilteredCities(filtered)
    }
  }

  const handleSubmit = async (values: any) => {
    const registrationData: RegistrationFormData = {
      firstName: values.firstName,
      lastName: values.lastName,
      birthDate: values.birthDate,
      countryCode: values.countryCode,
      phoneNumber: values.phoneNumber,
      address: values.address,
      addressLine2: values.addressLine2,
      city: values.city,
      cityId: values.cityId,
      state: values.state,
      stateId: values.stateId,
      zipCode: values.zipCode,
      country: 'United States',
      latitude: values.latitude,
      longitude: values.longitude,
      isMapboxResult: values.isMapboxResult,
    }

    const result = await registerUser(registrationData)

    if (result.success) {
      router.replace('/(screens)/registerComplete')
    }
  }

  if (loadingData) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <Loading variant="overlay" message="Loading..." />
      </SafeAreaView>
    )
  }

  // Render City Selector Screen
  if (currentScreen === 'city') {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => setCurrentScreen('form')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              <FontAwesome name="arrow-left" size={20} color={Theme.colors.neutral[900]} />
            </TouchableOpacity>
            <Typography variant="h4" color="primary" style={styles.headerTitle}>
              Select City
            </Typography>
            <View style={{ width: 20 }} />
          </View>
          <CitySelector
            cities={filteredCities}
            states={states}
            searchText={citySearchText}
            onSearchTextChange={handleCitySearch}
            onCitySelect={handleCitySelect}
            selectedStateId={formData.stateId}
          />
        </SafeAreaView>
      </>
    )
  }

  // Render State Selector Screen
  if (currentScreen === 'state') {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => setCurrentScreen('form')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              <FontAwesome name="arrow-left" size={20} color={Theme.colors.neutral[900]} />
            </TouchableOpacity>
            <Typography variant="h4" color="primary" style={styles.headerTitle}>
              Select State
            </Typography>
            <View style={{ width: 20 }} />
          </View>
          <StateSelector
            states={states}
            searchText={stateSearchText}
            onSearchTextChange={setStateSearchText}
            onStateSelect={handleStateSelect}
          />
        </SafeAreaView>
      </>
    )
  }

  // Render Main Form Screen
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              <FontAwesome name="arrow-left" size={20} color={Theme.colors.neutral[900]} />
            </TouchableOpacity>
            <Typography variant="h4" color="primary" style={styles.headerTitle}>
              Create Your Account
            </Typography>
            <View style={{ width: 20 }} />
          </View>

          <Formik
            initialValues={formData}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              setFieldValue,
            }) => (
                <ScrollView
                  contentContainerStyle={styles.scrollContent}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.formContainer}>
                    {/* Personal Information Section */}
                    <Text style={styles.sectionTitle}>Personal Information</Text>

                    <Input
                      label="First Name"
                      value={values.firstName}
                      onChangeText={handleChange('firstName')}
                      onBlur={handleBlur('firstName')}
                      error={
                        touched.firstName && errors.firstName
                          ? String(errors.firstName)
                          : undefined
                      }
                      required
                    />

                    <Input
                      label="Last Name"
                      value={values.lastName}
                      onChangeText={handleChange('lastName')}
                      onBlur={handleBlur('lastName')}
                      error={
                        touched.lastName && errors.lastName ? String(errors.lastName) : undefined
                      }
                      required
                    />

                    <DateInput
                      label="Date of Birth"
                      value={values.birthDate}
                      onChange={(date) => setFieldValue('birthDate', date)}
                      error={
                        touched.birthDate && errors.birthDate
                          ? String(errors.birthDate)
                          : undefined
                      }
                      required
                    />

                    {/* Phone Section */}
                    <Text style={styles.sectionTitle}>Phone Number</Text>

                    <Text style={styles.sectionLabel}>Phone *</Text>
                    <View style={styles.phoneContainer}>
                      <CountryCodeSelector
                        selectedCode={values.countryCode}
                        onSelect={(code) => setFieldValue('countryCode', code)}
                      />
                      <TextInput
                        style={[styles.formInput, styles.phoneInput]}
                        placeholder="Phone number"
                        value={values.phoneNumber}
                        onChangeText={handleChange('phoneNumber')}
                        onBlur={handleBlur('phoneNumber')}
                        keyboardType="phone-pad"
                        placeholderTextColor={Theme.colors.neutral[400]}
                      />
                    </View>
                    {errors.phoneNumber && touched.phoneNumber && (
                      <Text style={styles.errorText}>{String(errors.phoneNumber)}</Text>
                    )}

                    {/* Address Section */}
                    <Text style={styles.sectionTitle}>Address Information</Text>

                    <Text style={styles.sectionLabel}>Address *</Text>

                    {isMapboxAvailable() && !useManualEntry ? (
                      <AddressAutocomplete
                        value={values.address}
                        onChangeText={(text) => {
                          setFieldValue('address', text)
                          setFieldValue('latitude', undefined)
                          setFieldValue('longitude', undefined)
                          setFieldValue('isMapboxResult', false)
                        }}
                        onAddressSelect={handleAddressSelect}
                        onFallbackToManual={() => setUseManualEntry(true)}
                        placeholder="e.g 108 Jackson St"
                        style={styles.formInput}
                        addressLine2Ref={addressLine2Ref}
                        addressLine2Value={values.addressLine2 || ''}
                        onScrollEnabledChange={() => {}}
                      />
                    ) : (
                      <TextInput
                        style={styles.formInput}
                        placeholder="e.g 108 Jackson St"
                        value={values.address}
                        onChangeText={handleChange('address')}
                        placeholderTextColor={Theme.colors.neutral[400]}
                      />
                    )}
                    {errors.address && touched.address && (
                      <Text style={styles.errorText}>{String(errors.address)}</Text>
                    )}

                    {mappingWarnings.length > 0 && (
                      <View style={styles.warningContainer}>
                        <Text style={styles.warningText}>Note: Please verify address details</Text>
                      </View>
                    )}

                    <Text style={styles.sectionLabel}>Address Line 2 (Optional)</Text>
                    <TextInput
                      ref={addressLine2Ref}
                      style={styles.formInput}
                      placeholder="Apt, suite, unit, building, floor, etc."
                      value={values.addressLine2}
                      onChangeText={handleChange('addressLine2')}
                      placeholderTextColor={Theme.colors.neutral[400]}
                    />

                    <View style={styles.formRow}>
                      <View style={styles.formColumn}>
                        <Text style={styles.sectionLabel}>State *</Text>
                        <TouchableOpacity
                          style={styles.formInput}
                          onPress={() => setCurrentScreen('state')}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[styles.formInputText, !values.state && styles.placeholderText]}
                          >
                            {values.state || 'e.g FL'}
                          </Text>
                        </TouchableOpacity>
                        {errors.state && touched.state && (
                          <Text style={styles.errorText}>{String(errors.state)}</Text>
                        )}
                      </View>

                      <View style={styles.formColumn}>
                        <Text style={styles.sectionLabel}>City *</Text>
                        <TouchableOpacity
                          style={styles.formInput}
                          onPress={() => setCurrentScreen('city')}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[styles.formInputText, !values.city && styles.placeholderText]}
                          >
                            {values.city || 'e.g Jacksonville'}
                          </Text>
                        </TouchableOpacity>
                        {errors.city && touched.city && (
                          <Text style={styles.errorText}>{String(errors.city)}</Text>
                        )}
                      </View>
                    </View>

                    <Text style={styles.sectionLabel}>Zip Code *</Text>
                    <TextInput
                      ref={zipCodeRef}
                      style={styles.formInput}
                      placeholder="e.g 12345"
                      value={values.zipCode}
                      onChangeText={handleChange('zipCode')}
                      placeholderTextColor={Theme.colors.neutral[400]}
                      keyboardType="default"
                      maxLength={10}
                    />
                    {errors.zipCode && touched.zipCode && (
                      <Text style={styles.errorText}>{String(errors.zipCode)}</Text>
                    )}

                    {loading && (
                      <Loading variant="inline" message="Creating your account..." />
                    )}

                    <Button
                      title="Create Account"
                      variant="primary"
                      size="lg"
                      onPress={() => handleSubmit()}
                      disabled={loading}
                      style={styles.submitButton}
                      fullWidth
                    />
                  </View>
                </ScrollView>
            )}
          </Formik>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[200],
    backgroundColor: Theme.colors.background.primary,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.neutral[900],
    marginBottom: 16,
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.neutral[700],
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: Theme.colors.neutral[300],
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Theme.colors.neutral[900],
    backgroundColor: Theme.colors.background.primary,
    marginBottom: 16,
  },
  formInputText: {
    fontSize: 16,
    color: Theme.colors.neutral[900],
  },
  placeholderText: {
    color: Theme.colors.neutral[400],
  },
  phoneContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  phoneInput: {
    flex: 1,
    marginBottom: 0,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formColumn: {
    flex: 1,
  },
  errorText: {
    fontSize: 12,
    color: Theme.colors.error[500],
    marginTop: -12,
    marginBottom: 8,
  },
  warningContainer: {
    backgroundColor: Theme.colors.warning[50],
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 14,
    color: Theme.colors.warning[700],
  },
  submitButton: {
    marginTop: 24,
  },
})

export default Register
