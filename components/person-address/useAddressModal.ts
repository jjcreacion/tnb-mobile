import { useEffect, useRef, useState } from 'react'
import { Alert, Animated } from 'react-native'
import { AddressService } from './AddressService'
import { Address, AddressFormData, City, Country, ScreenType, State } from './types'

export const useAddressModal = (isVisible: boolean, addresses: any[]) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('list')
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [countries, setCountries] = useState<Country[]>([])
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

  // Form data for editing address
  const [editAddressForm, setEditAddressForm] = useState<AddressFormData>({
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
      case 'edit-form':
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
      const countriesData = await AddressService.loadCountries()
      setCountries(countriesData)
      const usa = AddressService.findUSACountry(countriesData)
      
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
    
    if (currentScreen === 'edit-form' && editingAddress) {
      setEditAddressForm((prev) => ({
        ...prev,
        city: city.name,
        cityId: city.pkCity,
        state: cityState?.name ?? '',
        stateId: cityState?.pkState ?? null,
      }))
      animateToScreen('edit-form')
    } else {
      setNewAddressForm((prev) => ({
        ...prev,
        city: city.name,
        cityId: city.pkCity,
        state: cityState?.name ?? '',
        stateId: cityState?.pkState ?? null,
      }))
      animateToScreen('add-form')
    }
    
    setCitySearchText('')
  }

  const handleStateSelect = (state: State) => {
    const stateCities = AddressService.filterCitiesByState(cities, state.pkState)
    setFilteredCities(stateCities)
    
    if (currentScreen === 'edit-form' && editingAddress) {
      setEditAddressForm((prev) => ({
        ...prev,
        state: state.name,
        stateId: state.pkState,
        city: '',
        cityId: null,
      }))
      animateToScreen('edit-form')
    } else {
      setNewAddressForm((prev) => ({
        ...prev,
        state: state.name,
        stateId: state.pkState,
        city: '',
        cityId: null,
      }))
      animateToScreen('add-form')
    }
    
    setStateSearchText('')
  }

  const handleCitySearch = (text: string) => {
    setCitySearchText(text)
    let filtered: City[] = []
    
    const currentForm = currentScreen === 'edit-form' ? editAddressForm : newAddressForm

    if (text === '') {
      filtered = currentForm.stateId
        ? AddressService.filterCitiesByState(cities, currentForm.stateId)
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

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address)
    setEditAddressForm({
      address: address.address || '',
      addressLine2: address.addressLine2 || '',
      city: '',
      cityId: address.city || null,
      state: '',
      stateId: address.state || null,
      zipCode: address.zipCode || '',
    })
    animateToScreen('edit-form')
  }

  const handleUpdateAddress = async (isPrimaryChanged?: boolean, onAddressUpdated?: () => void) => {
    if (!editingAddress) {
      Alert.alert('Error', 'No address selected for editing')
      return
    }

    if (
      !editAddressForm.address ||
      !editAddressForm.cityId ||
      !editAddressForm.stateId
    ) {
      Alert.alert('Error', 'Please fill in all required fields')
      return
    }

    const updateData: any = {
      address: editAddressForm.address,
      addressLine2: editAddressForm.addressLine2,
      zipCode: editAddressForm.zipCode,
      city: editAddressForm.cityId,
      state: editAddressForm.stateId,
    }

    if (isPrimaryChanged) {
      updateData.isPrimary = editingAddress.isPrimary === 1 ? 0 : 1
    }

    const result = await AddressService.updateAddress(editingAddress.pkAddress, updateData)

    if (result.success) {
      Alert.alert('Success', result.message || 'Address updated successfully')
      setEditingAddress(null)
      animateToScreen('list')
      onAddressUpdated?.()
    } else {
      Alert.alert('Error', result.message || 'Failed to update address')
    }
  }

  const handleDeleteAddress = async (address: Address, onAddressDeleted?: () => void) => {
    const result = await AddressService.deleteAddress(address.pkAddress)

    if (result.success) {
      Alert.alert('Success', result.message || 'Address deleted successfully')
      onAddressDeleted?.()
    } else {
      Alert.alert('Error', result.message || 'Failed to delete address')
    }
  }

  const handleCancelEdit = () => {
    setEditingAddress(null)
    setEditAddressForm({
      address: '',
      addressLine2: '',
      city: '',
      cityId: null,
      state: '',
      stateId: null,
      zipCode: '',
    })
    animateToScreen('list')
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
      const currentForm = editingAddress ? editAddressForm : newAddressForm
      const initialCities = currentForm.stateId
        ? AddressService.filterCitiesByState(cities, currentForm.stateId)
        : cities
      setFilteredCities(initialCities)
      setCitySearchText('')
    } else if (currentScreen === 'state') {
      setStateSearchText('')
    }
  }, [currentScreen, cities.length, newAddressForm.stateId, editAddressForm.stateId, editingAddress])

  return {
    currentScreen,
    slideAnim,
    newAddressForm,
    setNewAddressForm,
    editAddressForm,
    setEditAddressForm,
    editingAddress,
    countries,
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
    handleEditAddress,
    handleUpdateAddress,
    handleDeleteAddress,
    handleCancelEdit,
    resetForm,
  }
}
