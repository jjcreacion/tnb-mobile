import { useEffect, useRef, useState } from 'react'
import { Alert, Animated } from 'react-native'
import { AddressService } from './AddressService'
import { AddressFormData, City, ScreenType, State } from './types'

export const useAddressModal = (isVisible: boolean, addresses: any[]) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('list')
  const slideAnim = useRef(new Animated.Value(0)).current
  
  // Form data for new address
  const [newAddressForm, setNewAddressForm] = useState<AddressFormData>({
    address: '',
    addressLine2: '',
    city: '',
    cityId: null,
    state: '',
    stateId: null,
    zipCode: '',
  })

  // Data for city and state selection
  const [cities, setCities] = useState<City[]>([])
  const [states, setStates] = useState<State[]>([])
  const [filteredCities, setFilteredCities] = useState<City[]>([])
  const [citySearchText, setCitySearchText] = useState('')
  const [stateSearchText, setStateSearchText] = useState('')
  const [countryId, setCountryId] = useState<number>(1)

  const animateToScreen = (screen: ScreenType) => {
    let animValue = 0
    
    switch (screen) {
      case 'list':
        animValue = 0
        break
      case 'add-form':
        animValue = 1
        break
      case 'city':
      case 'state':
        animValue = 2
        break
    }
    
    setCurrentScreen(screen)
    
    requestAnimationFrame(() => {
      Animated.timing(slideAnim, {
        toValue: animValue,
        duration: 250,
        useNativeDriver: true,
      }).start()
    })
  }

  const loadCitiesAndStates = async () => {
    try {
      // Load countries first to get USA ID
      const countries = await AddressService.loadCountries()
      const usa = AddressService.findUSACountry(countries)
      
      if (usa) {
        setCountryId(usa.pkCountry || 1)
      } else {
        setCountryId(1)
      }

      // Load cities and states
      const [citiesData, statesData] = await Promise.all([
        AddressService.loadCities(),
        AddressService.loadStates()
      ])

      setCities(citiesData)
      setFilteredCities(citiesData)
      setStates(statesData)
    } catch (error) {
      console.error('Error loading cities and states:', error)
      setCountryId(1)
    }
  }

  const handleCitySelect = (city: City) => {
    const cityState = AddressService.findStateByCity(states, city)

    setNewAddressForm((prev) => ({
      ...prev,
      city: city.name,
      cityId: city.pkCity,
      state: cityState?.name ?? '',
      stateId: cityState?.pkState ?? null,
    }))
    setCitySearchText('')
    animateToScreen('add-form')
  }

  const handleStateSelect = (state: State) => {
    const stateCities = AddressService.filterCitiesByState(cities, state.pkState)
    setFilteredCities(stateCities)
    
    setNewAddressForm((prev) => ({
      ...prev,
      state: state.name,
      stateId: state.pkState,
      city: '',
      cityId: null,
    }))
    setStateSearchText('')
    animateToScreen('add-form')
  }

  const handleCitySearch = (text: string) => {
    setCitySearchText(text)
    let filtered: City[] = []

    if (text === '') {
      filtered = newAddressForm.stateId
        ? AddressService.filterCitiesByState(cities, newAddressForm.stateId)
        : cities
    } else {
      filtered = AddressService.filterCitiesBySearch(cities, text)
    }

    setFilteredCities(filtered)
  }

  const handleStateSearch = (text: string) => {
    setStateSearchText(text)
  }

  const resetForm = () => {
    setNewAddressForm({
      address: '',
      addressLine2: '',
      city: '',
      cityId: null,
      state: '',
      stateId: null,
      zipCode: '',
    })
    setFilteredCities(cities)
    setCitySearchText('')
    setStateSearchText('')
  }

  const handleSaveAddress = async (onAddressAdded?: () => void) => {
    if (
      !newAddressForm.address ||
      !newAddressForm.cityId ||
      !newAddressForm.stateId
    ) {
      Alert.alert('Error', 'Please fill in all required fields')
      return
    }

    const success = await AddressService.saveAddress(
      newAddressForm,
      countryId,
      addresses.length === 0
    )

    if (success) {
      Alert.alert('Success', 'Address added successfully')
      resetForm()
      animateToScreen('list')
      onAddressAdded?.()
    } else {
      Alert.alert('Error', 'Failed to add address')
    }
  }

  // Reset to list view when modal opens
  useEffect(() => {
    if (isVisible) {
      setCurrentScreen('list')
      slideAnim.setValue(0)
      loadCitiesAndStates()
    }
  }, [isVisible])

  // Effect to initialize filtered cities when entering city screen
  useEffect(() => {
    if (currentScreen === 'city' && cities.length > 0) {
      const initialCities = newAddressForm.stateId
        ? AddressService.filterCitiesByState(cities, newAddressForm.stateId)
        : cities
      setFilteredCities(initialCities)
      setCitySearchText('')
    } else if (currentScreen === 'state') {
      setStateSearchText('')
    }
  }, [currentScreen, cities.length, newAddressForm.stateId])

  return {
    currentScreen,
    slideAnim,
    newAddressForm,
    setNewAddressForm,
    cities,
    states,
    filteredCities,
    citySearchText,
    stateSearchText,
    animateToScreen,
    handleCitySelect,
    handleStateSelect,
    handleCitySearch,
    handleStateSearch,
    handleSaveAddress,
    resetForm,
  }
}
