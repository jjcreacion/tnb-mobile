import { useCallback, useEffect, useState } from 'react'
import { Alert } from 'react-native'
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
  const [hasInitialized, setHasInitialized] = useState(false)
  
  // Form data for new address
  const [newAddressForm, setNewAddressForm] = useState<AddressFormData>({
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

  // Form data for editing address
  const [editAddressForm, setEditAddressForm] = useState<AddressFormData>({
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

  // Data for city and state selection
  const [cities, setCities] = useState<City[]>([])
  const [states, setStates] = useState<State[]>([])
  const [filteredCities, setFilteredCities] = useState<City[]>([])
  const [citySearchText, setCitySearchText] = useState('')
  const [stateSearchText, setStateSearchText] = useState('')
  const [countryId, setCountryId] = useState<number>(1)

  const animateToScreen = (screen: ScreenType) => {
    setCurrentScreen(screen)
  }

  const loadCitiesAndStates = useCallback(async () => {
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
    } catch {
      setCountryId(1)
    }
  }, [])

  // Function to update local cities and states cache when new entities are created
  const updateLocalEntities = useCallback((createdEntities: { state?: State; city?: City }) => {
    if (createdEntities.state) {
      setStates(prevStates => {
        const exists = prevStates.find(s => s.pkState === createdEntities.state!.pkState)
        if (!exists) {
          return [...prevStates, createdEntities.state!]
        }
        return prevStates
      })
    }

    if (createdEntities.city) {
      setCities(prevCities => {
        const exists = prevCities.find(c => c.pkCity === createdEntities.city!.pkCity)
        if (!exists) {
          const updatedCities = [...prevCities, createdEntities.city!]
          // Also update filtered cities if we're currently viewing the city screen
          setFilteredCities(prevFiltered => {
            const filteredExists = prevFiltered.find(c => c.pkCity === createdEntities.city!.pkCity)
            if (!filteredExists) {
              return [...prevFiltered, createdEntities.city!]
            }
            return prevFiltered
          })
          return updatedCities
        }
        return prevCities
      })
    }
  }, [])

  const handleCitySelect = (city: City) => {
    const cityState = AddressService.findStateByCity(states, city)
    
    // Determinar si estamos editando basándose en si hay una dirección siendo editada
    if (editingAddress) {
      setEditAddressForm((prev) => {
        const newForm = {
          ...prev,
          city: city.name,
          cityId: city.pkCity,
          state: cityState?.name ?? '',
          stateId: cityState?.pkState ?? null,
        }
        return newForm
      })
      animateToScreen('edit-form')
      
      // Focus zip code field after animation completes
      setTimeout(() => {
        focusCallbacks?.focusEditFormZipCode()
      }, 300)
    } else {
      setNewAddressForm((prev) => {
        const newForm = {
          ...prev,
          city: city.name,
          cityId: city.pkCity,
          state: cityState?.name ?? '',
          stateId: cityState?.pkState ?? null,
        }
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
    const stateCities = AddressService.filterCitiesByState(cities, state.pkState)
    setFilteredCities(stateCities)
    
    // Determinar si estamos editando basándose en si hay una dirección siendo editada
    if (editingAddress) {
      setEditAddressForm((prev) => {
        const newForm = {
          ...prev,
          state: state.name,
          stateId: state.pkState,
          city: '',
          cityId: null,
        }
        return newForm
      })
      animateToScreen('edit-form')
    } else {
      setNewAddressForm((prev) => {
        const newForm = {
          ...prev,
          state: state.name,
          stateId: state.pkState,
          city: '',
          cityId: null,
        }
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

  const resetForm = useCallback(() => {
    // First clear immediately
    const emptyForm = {
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
    }
    
    setNewAddressForm(emptyForm)
    
    // Force a complete reset with setTimeout to ensure iOS TextInput updates
    setTimeout(() => {
      setNewAddressForm({...emptyForm}) // Create new object reference
    }, 50) // Small delay to ensure TextInput state is properly cleared
    
    setFilteredCities(cities)
    setCitySearchText('')
    setStateSearchText('')
  }, [cities])

  const handleSaveAddress = async (onAddressAdded?: (addressId?: number) => void) => {
    if (
      !newAddressForm.address ||
      !newAddressForm.cityId ||
      !newAddressForm.stateId
    ) {
      Alert.alert('Error', 'Please fill in all required fields')
      return
    }

    const result = await AddressService.saveAddress(
      newAddressForm,
      countryId,
      addresses.length === 0
    )

    if (result.success) {
      // Alert.alert('Success', 'Address added successfully')
      // Force reset form with additional delay for iOS
      setTimeout(() => {
        resetForm()
      }, 100)
      animateToScreen('list')
      onAddressAdded?.(result.addressId)
    } else {
      Alert.alert('Error', 'Failed to add address')
    }
  }

  const handleEditAddress = (address: Address) => {
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
    
    setEditAddressForm(initialFormData)
    
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
      cityId: editAddressForm.cityId,
      stateId: editAddressForm.stateId,
    }

    // Remove isPrimary logic since we no longer allow changing it in edit mode
    const result = await AddressService.updateAddress(editingAddress.pkAddress, updateData)

    if (result.success) {
      // Alert.alert('Success', result.message || 'Address updated successfully')
      setEditingAddress(null)
      animateToScreen('list')
      onAddressUpdated?.()
    } else {
      Alert.alert('Error', result.message || 'Failed to update address')
    }
  }

  const handleDeleteAddress = async (address: Address, onAddressDeleted?: () => void | Promise<void>) => {
    const result = await AddressService.deleteAddress(address.pkAddress)

    if (result.success) {
      // Execute callback first to update the parent state and wait for it
      if (onAddressDeleted) {
        await onAddressDeleted()
      }
      // Then show the success message
      Alert.alert('Success', result.message || 'Address deleted successfully')
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

  // Reset to list view when modal opens/closes
  useEffect(() => {
    if (isVisible && !hasInitialized) {
      // Only initialize once when modal opens for the first time
      setCurrentScreen('list')
      loadCitiesAndStates()
      setHasInitialized(true)
      // Reset form when modal opens with extra delay for iOS
      setTimeout(() => {
        resetForm()
      }, 150)
    } else if (!isVisible && hasInitialized) {
      // When modal closes, reset to ensure clean state for next open
      setTimeout(() => {
        setNewAddressForm({
          address: '',
          addressLine2: '',
          city: '',
          cityId: null,
          state: '',
          stateId: null,
          zipCode: '',
        })
        setEditingAddress(null)
        setCurrentScreen('list')
        setHasInitialized(false) // Reset for next open
      }, 100)
    }
  }, [isVisible, hasInitialized, loadCitiesAndStates, resetForm])

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
  }, [currentScreen, cities, newAddressForm, editAddressForm, editingAddress])

  return {
    currentScreen,
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
    updateLocalEntities,
  }
}
