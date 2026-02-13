import { FontAwesome } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Formik } from 'formik'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
import { DateInput, DateInputRef } from '../../components/registration/DateInput'

// Address components (reused from AddressModal)
import { AddressAutocomplete } from '../../components/person-address/AddressAutocomplete'
import { AddressMappingService } from '../../components/person-address/AddressMappingService'
import { CitySelector } from '../../components/person-address/CitySelector'
import type { ParsedMapboxAddress } from '../../components/person-address/mapbox'
import { isMapboxAvailable, MAPBOX_CONFIG } from '../../components/person-address/mapbox'
import { StateSelector } from '../../components/person-address/StateSelector'
import type { City, State } from '../../components/person-address/types'

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
  const [formData, setFormData] = useState<RegistrationFormData>({
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
    country: 'United States'
  })


  // Form field refs for keyboard navigation
  const firstNameRef = useRef<TextInput>(null)
  const lastNameRef = useRef<TextInput>(null)
  const dateInputRef = useRef<DateInputRef>(null)
  const phoneNumberRef = useRef<TextInput>(null)
  const addressRef = useRef<TextInput>(null)
  const addressLine2Ref = useRef<TextInput>(null)
  const zipCodeRef = useRef<TextInput>(null)
  const scrollViewRef = useRef<ScrollView>(null)
  const phoneSectionY = useRef<number>(0)
  const addressSectionY = useRef<number>(0)

  // Focus states for TextInput fields
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [datePickerActive, setDatePickerActive] = useState(false)

  // Address field state
  const [useManualEntry, setUseManualEntry] = useState(false)
  const [mappingWarnings, setMappingWarnings] = useState<string[]>([])

  // Memoize Mapbox availability check to prevent unnecessary re-renders
  const mapboxAvailable = React.useMemo(() => isMapboxAvailable(), [])

  // Memoize empty scroll handler to prevent component remounting
  const handleScrollEnabledChange = useCallback(() => {
    // Empty handler - we don't need scroll control in this form
  }, [])

  // Memoize fallback handler to prevent component remounting
  const handleFallbackToManual = useCallback(() => {
    setUseManualEntry(true)
  }, [])

  // Memoize submit editing handler to prevent component remounting
  const handleAddressSubmitEditing = useCallback(() => {
    focusNextField(addressLine2Ref)
  }, [])

  // Scroll to address section when address field gets focus
  const scrollToAddressSection = useCallback(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: addressSectionY.current, animated: true })
    }, 300)
  }, [])

  // Store setFieldValue in a ref to avoid recreating callbacks
  const setFieldValueRef = useRef<any>(null)
  // Store current form values in a ref to preserve them during screen navigation
  const currentFormValuesRef = useRef<any>(null)
  // Store pending timers for cleanup
  const pendingTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  // Clean up all pending timers on unmount
  useEffect(() => {
    return () => {
      pendingTimersRef.current.forEach(timer => clearTimeout(timer))
      pendingTimersRef.current = []
    }
  }, [])

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

        if (!citiesData || !statesData) {
          throw new Error('Failed to load cities or states')
        }

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
        // Keep existing state - don't show empty state
        setCities([])
        setStates([])
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
  // This will be called from within Formik context with setFieldValue
  const handleAddressSelect = useCallback(
    async (mapboxAddress: ParsedMapboxAddress, selectedText: string, setFieldValue?: any) => {
      console.log('[Register] handleAddressSelect called')

      if (MAPBOX_CONFIG.enabled && !MAPBOX_CONFIG.useLocalDatabaseMapping) {
        const updates = {
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
        }

        // Update Formik if setFieldValue is provided
        if (setFieldValue) {
          Object.entries(updates).forEach(([key, value]) => {
            setFieldValue(key, value)
          })
        }

        // Also update local state
        setFormData((prev: RegistrationFormData) => ({ ...prev, ...updates }))
        setMappingWarnings([])
      } else {
        try {
          const mappingResult = await AddressMappingService.mapToFormDataWithAutoCreation(
            mapboxAddress,
            cities,
            states
          )

          const updates = {
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
          }

          // Update Formik if setFieldValue is provided
          if (setFieldValue) {
            Object.entries(updates).forEach(([key, value]) => {
              setFieldValue(key, value)
            })
          }

          // Also update local state
          setFormData((prev: RegistrationFormData) => ({ ...prev, ...updates }))
          setMappingWarnings(mappingResult.warnings)

          if (mappingResult.createdEntities) {
            updateLocalEntities(mappingResult.createdEntities)
          }
        } catch (error) {
          console.error('Auto-creation mapping failed:', error)
        }
      }
    },
    [cities, states, updateLocalEntities]
  )

  // Memoize address change handler
  const handleAddressChange = useCallback((text: string) => {
    if (setFieldValueRef.current) {
      setFieldValueRef.current('address', text)
      setFieldValueRef.current('latitude', undefined)
      setFieldValueRef.current('longitude', undefined)
      setFieldValueRef.current('isMapboxResult', false)
    }
  }, [])

  // Memoize address select handler
  const handleAddressSelectMemoized = useCallback(
    (mapboxAddress: ParsedMapboxAddress, selectedText: string) => {
      handleAddressSelect(mapboxAddress, selectedText, setFieldValueRef.current)
    },
    [handleAddressSelect]
  )

  const handleCitySelect = (city: City) => {
    const cityState = states.find((s) => s.pkState === city.fkState)

    // Preserve current form values and update city/state
    const updatedFormData = {
      ...currentFormValuesRef.current,
      city: city.name,
      cityId: city.pkCity,
      state: cityState?.name ?? '',
      stateId: cityState?.pkState ?? null,
    }

    setFormData(updatedFormData)
    setCurrentScreen('form')
    setCitySearchText('')

    const timer = setTimeout(() => {
      zipCodeRef.current?.focus()
    }, 300)
    pendingTimersRef.current.push(timer)
  }

  const handleStateSelect = (state: State) => {
    const stateCities = cities.filter((c) => c.fkState === state.pkState)
    setFilteredCities(stateCities)

    // Preserve current form values and update state (clear city since state changed)
    const updatedFormData = {
      ...currentFormValuesRef.current,
      state: state.name,
      stateId: state.pkState,
      city: '',
      cityId: null,
    }

    setFormData(updatedFormData)
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

  // Form submission handler with validation
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

  // Keyboard navigation helper - focus on next field
  const focusNextField = (nextRef: React.RefObject<TextInput | null>) => {
    const timer = setTimeout(() => {
      nextRef.current?.focus()
    }, 100)
    pendingTimersRef.current.push(timer)
  }

  // Handle back button with confirmation alert
  const handleBackPress = () => {
    Alert.alert(
      'Discard Changes?',
      'If you continue, all changes will be lost and you will start over.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            router.replace('/(screens)/login')
          },
        },
      ],
      { cancelable: true }
    )
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
              onPress={handleBackPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
              style={styles.backButton}
            >
              <FontAwesome name="arrow-left" size={20} color={Theme.colors.neutral[900]} />
            </TouchableOpacity>
            <Typography variant="h4" color="primary" style={styles.headerTitle}>
              Tell Us About You
            </Typography>
            <View style={styles.headerRightSpacer} />
          </View>

          <Formik
            initialValues={formData}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              setFieldValue,
            }) => {
              // Store setFieldValue in ref for memoized callbacks
              setFieldValueRef.current = setFieldValue
              // Store current form values to preserve them during screen navigation
              currentFormValuesRef.current = values

              return (
                <ScrollView
                  ref={scrollViewRef}
                  contentContainerStyle={styles.scrollContent}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={!datePickerActive}
                >
                  <View style={styles.formContainer} pointerEvents="box-none">
                    {/* Personal Information Section */}
                    <Text style={styles.sectionTitle} pointerEvents="none">Personal Information</Text>

                    <Input
                      ref={firstNameRef}
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
                      returnKeyType="next"
                      onSubmitEditing={() => focusNextField(lastNameRef)}
                      blurOnSubmit={false}
                      autoCapitalize="words"
                      textContentType="givenName"
                      autoComplete="name-given"
                    />

                    <Input
                      ref={lastNameRef}
                      label="Last Name"
                      value={values.lastName}
                      onChangeText={handleChange('lastName')}
                      onBlur={handleBlur('lastName')}
                      error={
                        touched.lastName && errors.lastName ? String(errors.lastName) : undefined
                      }
                      required
                      returnKeyType="next"
                      onSubmitEditing={() => {
                        lastNameRef.current?.blur()
                        dateInputRef.current?.open()
                      }}
                      blurOnSubmit={false}
                      autoCapitalize="words"
                      textContentType="familyName"
                      autoComplete="name-family"
                    />

                    <DateInput
                      ref={dateInputRef}
                      label="Date of Birth"
                      value={values.birthDate}
                      onChange={(date) => setFieldValue('birthDate', date)}
                      error={
                        touched.birthDate && errors.birthDate
                          ? String(errors.birthDate)
                          : undefined
                      }
                      required
                      onPickerToggle={setDatePickerActive}
                      onDismiss={() => {
                        focusNextField(phoneNumberRef)
                        setTimeout(() => {
                          scrollViewRef.current?.scrollTo({ y: phoneSectionY.current, animated: true })
                        }, 150)
                      }}
                    />

                    {/* Phone Section */}
                    <Text
                      style={styles.sectionTitle}
                      pointerEvents="none"
                      onLayout={(e) => { phoneSectionY.current = e.nativeEvent.layout.y }}
                    >
                      Phone Number
                    </Text>

                    <Text style={styles.sectionLabel} pointerEvents="none">
                      Phone <Text style={styles.requiredAsterisk}>*</Text>
                    </Text>
                    <View style={styles.phoneContainer}>
                      <CountryCodeSelector
                        selectedCode={values.countryCode}
                        onSelect={(code) => setFieldValue('countryCode', code)}
                      />
                      <TextInput
                        ref={phoneNumberRef}
                        style={[
                          styles.formInput,
                          styles.phoneInput,
                          focusedField === 'phoneNumber' && !errors.phoneNumber && styles.formInputFocused,
                          errors.phoneNumber && touched.phoneNumber && styles.formInputError,
                        ]}
                        placeholder="Phone number"
                        value={values.phoneNumber}
                        onChangeText={handleChange('phoneNumber')}
                        onFocus={() => setFocusedField('phoneNumber')}
                        onBlur={(e) => {
                          setFocusedField(null)
                          handleBlur('phoneNumber')(e)
                        }}
                        keyboardType="phone-pad"
                        placeholderTextColor={Theme.colors.neutral[400]}
                        returnKeyType="next"
                        onSubmitEditing={() => {
                          if (mapboxAvailable && !useManualEntry) {
                            addressRef.current?.focus()
                          }
                        }}
                        textContentType="telephoneNumber"
                        autoComplete="tel"
                      />
                    </View>
                    {errors.phoneNumber && touched.phoneNumber && (
                      <Text style={styles.errorText} pointerEvents="none">{String(errors.phoneNumber)}</Text>
                    )}

                    {/* Address Section */}
                    <Text
                      style={styles.sectionTitle}
                      pointerEvents="none"
                      onLayout={(e) => { addressSectionY.current = e.nativeEvent.layout.y }}
                    >
                      Address Information
                    </Text>

                    <Text style={styles.sectionLabel} pointerEvents="none">
                      Address <Text style={styles.requiredAsterisk}>*</Text>
                    </Text>

                    {mapboxAvailable && !useManualEntry ? (
                      <AddressAutocomplete
                        key="address-autocomplete-register"
                        ref={addressRef}
                        value={values.address}
                        onChangeText={handleAddressChange}
                        onAddressSelect={handleAddressSelectMemoized}
                        onFallbackToManual={handleFallbackToManual}
                        placeholder="e.g 108 Jackson St"
                        style={styles.formInput}
                        addressLine2Ref={addressLine2Ref}
                        addressLine2Value={values.addressLine2 || ''}
                        onScrollEnabledChange={handleScrollEnabledChange}
                        returnKeyType="next"
                        onSubmitEditing={handleAddressSubmitEditing}
                        onFocus={scrollToAddressSection}
                        onAddressLine2Focus={scrollToAddressSection}
                      />
                    ) : (
                      <TextInput
                        ref={addressRef}
                        style={[
                          styles.formInput,
                          focusedField === 'address' && !errors.address && styles.formInputFocused,
                          errors.address && touched.address && styles.formInputError,
                        ]}
                        placeholder="e.g 108 Jackson St"
                        value={values.address}
                        onChangeText={handleChange('address')}
                        onFocus={() => {
                          setFocusedField('address')
                          scrollToAddressSection()
                        }}
                        onBlur={(e) => {
                          setFocusedField(null)
                          handleBlur('address')(e)
                        }}
                        placeholderTextColor={Theme.colors.neutral[400]}
                        returnKeyType="next"
                        onSubmitEditing={() => focusNextField(addressLine2Ref)}
                        autoCapitalize="words"
                        textContentType="fullStreetAddress"
                        autoComplete="street-address"
                      />
                    )}
                    {errors.address && touched.address && (
                      <Text style={styles.errorText} pointerEvents="none">{String(errors.address)}</Text>
                    )}

                    {mappingWarnings.length > 0 && (
                      <View style={styles.warningContainer} pointerEvents="none">
                        <Text style={styles.warningText}>Note: Please verify address details</Text>
                      </View>
                    )}

                    <Text style={styles.sectionLabel} pointerEvents="none">Address Line 2 (Optional)</Text>
                    <TextInput
                      ref={addressLine2Ref}
                      style={[
                        styles.formInput,
                        focusedField === 'addressLine2' && styles.formInputFocused,
                      ]}
                      placeholder="Apt, suite, unit, building, floor, PO BOX, etc."
                      value={values.addressLine2}
                      onChangeText={handleChange('addressLine2')}
                      onFocus={() => setFocusedField('addressLine2')}
                      onBlur={() => setFocusedField(null)}
                      placeholderTextColor={Theme.colors.neutral[400]}
                      returnKeyType="next"
                      onSubmitEditing={() => focusNextField(zipCodeRef)}
                      autoCapitalize="words"
                      textContentType="streetAddressLine2"
                      autoComplete="address-line2"
                    />

                    <View style={styles.formRow} pointerEvents="box-none">
                      <View style={styles.formColumn} pointerEvents="box-none">
                        <Text style={styles.sectionLabel} pointerEvents="none">
                          State <Text style={styles.requiredAsterisk}>*</Text>
                        </Text>
                        <Pressable
                          style={({ pressed }) => [
                            styles.formInput,
                            pressed && styles.formInputPressed,
                          ]}
                          onPress={() => {
                            // Save current form values before navigating
                            setFormData(values)
                            setCurrentScreen('state')
                          }}
                        >
                          <Text
                            style={[styles.formInputText, !values.state && styles.placeholderText]}
                            pointerEvents="none"
                          >
                            {values.state || 'e.g FL'}
                          </Text>
                        </Pressable>
                        {errors.state && touched.state && (
                          <Text style={styles.errorText} pointerEvents="none">{String(errors.state)}</Text>
                        )}
                      </View>

                      <View style={styles.formColumn} pointerEvents="box-none">
                        <Text style={styles.sectionLabel} pointerEvents="none">
                          City <Text style={styles.requiredAsterisk}>*</Text>
                        </Text>
                        <Pressable
                          style={({ pressed }) => [
                            styles.formInput,
                            pressed && styles.formInputPressed,
                          ]}
                          onPress={() => {
                            // Save current form values before navigating
                            setFormData(values)
                            setCurrentScreen('city')
                          }}
                        >
                          <Text
                            style={[styles.formInputText, !values.city && styles.placeholderText]}
                            pointerEvents="none"
                          >
                            {values.city || 'e.g Jacksonville'}
                          </Text>
                        </Pressable>
                        {errors.city && touched.city && (
                          <Text style={styles.errorText} pointerEvents="none">{String(errors.city)}</Text>
                        )}
                      </View>
                    </View>

                    <Text style={styles.sectionLabel} pointerEvents="none">
                      Zip Code <Text style={styles.requiredAsterisk}>*</Text>
                    </Text>
                    <TextInput
                      ref={zipCodeRef}
                      style={[
                        styles.formInput,
                        focusedField === 'zipCode' && !errors.zipCode && styles.formInputFocused,
                        errors.zipCode && touched.zipCode && styles.formInputError,
                      ]}
                      placeholder="e.g 12345"
                      value={values.zipCode}
                      onChangeText={handleChange('zipCode')}
                      onFocus={() => setFocusedField('zipCode')}
                      onBlur={(e) => {
                        setFocusedField(null)
                        handleBlur('zipCode')(e)
                      }}
                      placeholderTextColor={Theme.colors.neutral[400]}
                      keyboardType="default"
                      maxLength={10}
                      returnKeyType="go"
                      onSubmitEditing={() => handleSubmit()}
                      textContentType="postalCode"
                      autoComplete="postal-code"
                    />
                    {errors.zipCode && touched.zipCode && (
                      <Text style={styles.errorText} pointerEvents="none">{String(errors.zipCode)}</Text>
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
              )
            }}
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
  backButton: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  headerRightSpacer: {
    width: 20,
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
  requiredAsterisk: {
    color: Theme.colors.error[500],
    marginLeft: 2,
  },
  formInput: {
    borderWidth: 1,
    borderColor: Theme.colors.border.default, // Softer, more professional (#E5E7EB)
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Theme.colors.neutral[900],
    backgroundColor: Theme.colors.background.primary,
    marginBottom: 16,
  },
  formInputFocused: {
    borderColor: Theme.colors.border.focus, // Dark gray on focus
    borderWidth: 1.5,
  },
  formInputError: {
    borderColor: Theme.colors.border.error, // Red on error
    borderWidth: 1.5,
  },
  formInputPressed: {
    opacity: 0.7,
    backgroundColor: Theme.colors.neutral[50],
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
