import { useEffect, useRef, useState } from 'react'
import { Alert, Animated } from 'react-native'
import { AddressService } from './AddressService'
import { Address, AddressFormData, City, Country, ScreenType, State } from './types'

interface FocusCallbacks {
  focusAddFormZipCode: () => void
  focusEditFormZipCode: () => void
}

export const useAddressModal = (isVisible: boolean, addresses: any[], focusCallbacks?: FocusCallbacks) => {
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
    console.log('=== DEBUG: handleCitySelect ===')
    console.log('Selected city:', city)
    console.log('editingAddress exists:', !!editingAddress)
    
    const cityState = AddressService.findStateByCity(states, city)
    console.log('Found state for city:', cityState)
    
    // Determinar si estamos editando basándose en si hay una dirección siendo editada
    if (editingAddress) {
      console.log('🔄 Updating EDIT form with city data')
      setEditAddressForm((prev) => {
        const newForm = {
          ...prev,
          city: city.name,
          cityId: city.pkCity,
          state: cityState?.internalCode ?? '',
          stateId: cityState?.pkState ?? null,
        }
        console.log('Updated editAddressForm:', newForm)
        return newForm
      })
      animateToScreen('edit-form')
      
      // Focus zip code field after animation completes
      setTimeout(() => {
        focusCallbacks?.focusEditFormZipCode()
      }, 300)
    } else {
      console.log('🆕 Updating NEW form with city data')
      setNewAddressForm((prev) => {
        const newForm = {
          ...prev,
          city: city.name,
          cityId: city.pkCity,
          state: cityState?.internalCode ?? '',
          stateId: cityState?.pkState ?? null,
        }
        console.log('Updated newAddressForm:', newForm)
        return newForm
      })
      animateToScreen('add-form')
      
      // Focus zip code field after animation completes
      setTimeout(() => {
        focusCallbacks?.focusAddFormZipCode()
      }, 300)
    }
    
    setCitySearchText('')
  }

  const handleStateSelect = (state: State) => {
    console.log('=== DEBUG: handleStateSelect ===')
    console.log('Selected state:', state)
    console.log('editingAddress exists:', !!editingAddress)
    
    const stateCities = AddressService.filterCitiesByState(cities, state.pkState)
    setFilteredCities(stateCities)
    console.log('Filtered cities for state:', stateCities.length, 'cities')
    
    // Determinar si estamos editando basándose en si hay una dirección siendo editada
    if (editingAddress) {
      console.log('🔄 Updating EDIT form with state data (clearing city)')
      setEditAddressForm((prev) => {
        const newForm = {
          ...prev,
          state: state.internalCode,
          stateId: state.pkState,
          city: '',
          cityId: null,
        }
        console.log('Updated editAddressForm:', newForm)
        return newForm
      })
      animateToScreen('edit-form')
    } else {
      console.log('🆕 Updating NEW form with state data (clearing city)')
      setNewAddressForm((prev) => {
        const newForm = {
          ...prev,
          state: state.internalCode,
          stateId: state.pkState,
          city: '',
          cityId: null,
        }
        console.log('Updated newAddressForm:', newForm)
        return newForm
      })
      animateToScreen('add-form')
    }
    
    setStateSearchText('')
  }

  const handleCitySearch = (text: string) => {
    setCitySearchText(text)
    let filtered: City[] = []
    
    // Determinar el formulario actual basándose en si hay una dirección siendo editada
    const currentForm = editingAddress ? editAddressForm : newAddressForm

    if (text === '') {
      if (currentForm.stateId) {
        // Si hay un estado seleccionado, mostrar primero las ciudades de ese estado
        // y después las ciudades de los demás estados
        const selectedStateCities = AddressService.filterCitiesByState(cities, currentForm.stateId)
        const otherStateCities = cities.filter(city => city.fkState !== currentForm.stateId)
        filtered = [...selectedStateCities, ...otherStateCities]
      } else {
        // Si no hay estado seleccionado, mostrar todas las ciudades
        filtered = cities
      }
    } else {
      // Cuando hay texto de búsqueda, aplicar filtro de búsqueda
      const searchFiltered = AddressService.filterCitiesBySearch(cities, text)
      
      if (currentForm.stateId) {
        // Si hay un estado seleccionado, ordenar poniendo primero las ciudades de ese estado
        const selectedStateCities = searchFiltered.filter(city => city.fkState === currentForm.stateId)
        const otherStateCities = searchFiltered.filter(city => city.fkState !== currentForm.stateId)
        filtered = [...selectedStateCities, ...otherStateCities]
      } else {
        filtered = searchFiltered
      }
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
    console.log('=== DEBUG: handleEditAddress ===')
    console.log('Address to edit:', address)
    
    setEditingAddress(address)
    
    // Initialize form with basic data, city and state names will be loaded by EditAddressForm
    const initialFormData = {
      address: address.address || '',
      addressLine2: address.addressLine2 || '',
      city: '', // Will be loaded from cities array in EditAddressForm
      cityId: address.city || null,
      state: '', // Will be loaded from states array in EditAddressForm  
      stateId: address.state || null,
      zipCode: address.zipCode || '',
    }
    
    console.log('Initial editAddressForm data:', initialFormData)
    setEditAddressForm(initialFormData)
    
    animateToScreen('edit-form')
  }

  const handleUpdateAddress = async (isPrimaryChanged?: boolean, onAddressUpdated?: () => void) => {
    console.log('=== DEBUG: handleUpdateAddress START ===')
    console.log('editingAddress:', editingAddress)
    console.log('editAddressForm:', editAddressForm)
    
    if (!editingAddress) {
      console.log('❌ No address selected for editing')
      Alert.alert('Error', 'No address selected for editing')
      return
    }

    if (
      !editAddressForm.address ||
      !editAddressForm.cityId ||
      !editAddressForm.stateId
    ) {
      console.log('❌ Missing required fields:')
      console.log('  - address:', editAddressForm.address)
      console.log('  - cityId:', editAddressForm.cityId)
      console.log('  - stateId:', editAddressForm.stateId)
      Alert.alert('Error', 'Please fill in all required fields')
      return
    }

    const updateData: any = {
      address: editAddressForm.address,
      addressLine2: editAddressForm.addressLine2,
      zipCode: editAddressForm.zipCode,
      cityId: editAddressForm.cityId,
      stateId: editAddressForm.stateId,
    }

    // Remove isPrimary logic since we no longer allow changing it in edit mode
    console.log('📤 Final updateData being sent to backend:', updateData)
    console.log('🎯 Address ID (pkAddress):', editingAddress.pkAddress)

    const result = await AddressService.updateAddress(editingAddress.pkAddress, updateData)

    console.log('📥 Backend response:', result)

    if (result.success) {
      console.log('✅ Address updated successfully')
      Alert.alert('Success', result.message || 'Address updated successfully')
      setEditingAddress(null)
      animateToScreen('list')
      onAddressUpdated?.()
    } else {
      console.log('❌ Failed to update address:', result.message)
      Alert.alert('Error', result.message || 'Failed to update address')
    }
    
    console.log('=== DEBUG: handleUpdateAddress END ===')
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
      // Determinar el formulario actual basándose en si hay una dirección siendo editada
      const currentForm = editingAddress ? editAddressForm : newAddressForm
      
      let initialCities: City[] = []
      if (currentForm.stateId) {
        // Si hay un estado seleccionado, mostrar primero las ciudades de ese estado
        // y después las ciudades de los demás estados
        const selectedStateCities = AddressService.filterCitiesByState(cities, currentForm.stateId)
        const otherStateCities = cities.filter(city => city.fkState !== currentForm.stateId)
        initialCities = [...selectedStateCities, ...otherStateCities]
      } else {
        // Si no hay estado seleccionado, mostrar todas las ciudades
        initialCities = cities
      }
      
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
