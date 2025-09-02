import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'
import React, { useEffect, useState } from 'react'
import {
    Alert,
    FlatList,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

interface City {
  pkCity: number
  name: string
  fkState: number
  status: number
  createdAt: string
  updatedAt: string
}

interface State {
  pkState: number
  name: string
  fkCountry: number
  internalCode: string
  status: number
  createdAt: string
  updatedAt: string
}

interface Address {
  pkAddress: number
  address: string
  isPrimary: number
}

interface AddNewAddressModalProps {
  isVisible: boolean
  onClose: () => void
  userAddresses: Address[]
  onAddressAdded: () => void
}

const AddNewAddressModal: React.FC<AddNewAddressModalProps> = ({
  isVisible,
  onClose,
  userAddresses,
  onAddressAdded,
}) => {
  const [currentModalScreen, setCurrentModalScreen] = useState<'form' | 'city' | 'state'>('form')
  const [cities, setCities] = useState<City[]>([])
  const [states, setStates] = useState<State[]>([])
  const [filteredCities, setFilteredCities] = useState<City[]>([])
  const [citySearchText, setCitySearchText] = useState('')
  const [stateSearchText, setStateSearchText] = useState('')
  const [countryId, setCountryId] = useState<number>(1)
  const [modalKey, setModalKey] = useState(0)

  // Form data
  const [newAddressForm, setNewAddressForm] = useState({
    address: '',
    addressLine2: '',
    city: '',
    cityId: null as number | null,
    state: '',
    stateId: null as number | null,
    zipCode: ''
  })

  const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL

  const loadCitiesAndStates = async () => {
    try {
      // Load countries first to get USA ID
      const countriesResponse = await fetch(`${API_BASE_URL}/country/findAll`)
      if (countriesResponse.ok) {
        const countriesData = await countriesResponse.json()
        
        // Find USA or United States (assuming it's in the data)
        const usa = countriesData.find((country: any) => 
          country.name?.toLowerCase().includes('united states') ||
          country.name?.toLowerCase().includes('usa') ||
          country.code === 'US' ||
          country.internalCode === 'US'
        )
        
        if (usa) {
          setCountryId(usa.pkCountry || usa.id || 1)
        } else {
          setCountryId(1)
        }
      } else {
        console.error('Error loading countries:', countriesResponse.status)
        setCountryId(1)
      }

      // Load cities
      const citiesResponse = await fetch(`${API_BASE_URL}/country_city/findAll`)
      if (citiesResponse.ok) {
        const citiesData = await citiesResponse.json()
        setCities(citiesData)
        setFilteredCities(citiesData)
      } else {
        console.error('Error loading cities:', citiesResponse.status)
      }

      // Load states
      const statesResponse = await fetch(`${API_BASE_URL}/state/findAll`)
      if (statesResponse.ok) {
        const statesData = await statesResponse.json()
        setStates(statesData)
      } else {
        console.error('Error loading states:', statesResponse.status)
      }
    } catch (error) {
      console.error('Error al cargar países, ciudades y estados:', error)
      setCountryId(1)
    }
  }

  const handleCitySelect = (city: City) => {
    // Buscar el estado correspondiente por fkState
    const cityState = states.find(state => state.pkState === city.fkState)
    
    setNewAddressForm(prev => ({
      ...prev,
      city: city.name,
      cityId: city.pkCity,
      state: cityState?.name ?? '',
      stateId: cityState?.pkState ?? null
    }))
    setCitySearchText('')
    // Volver al formulario principal
    setCurrentModalScreen('form')
  }

  const handleStateSelect = (state: State) => {
    // Filtrar ciudades por fkState
    const stateCities = cities.filter(city => city.fkState === state.pkState)
    setFilteredCities(stateCities)
    setNewAddressForm(prev => ({
      ...prev,
      state: state.name,
      stateId: state.pkState,
      city: '',
      cityId: null
    }))
    setStateSearchText('')
    // Volver al formulario principal
    setCurrentModalScreen('form')
  }

  const handleCitySearch = (text: string) => {
    setCitySearchText(text)
    let filtered: City[] = []
    
    if (text === '') {
      // Sin texto: listar por estado si existe, sino todas
      filtered = newAddressForm.stateId
        ? cities.filter(city => city.fkState === newAddressForm.stateId)
        : cities
    } else {
      // Con texto: filtrar nombre y estado si aplica
      const searchLower = text.toLowerCase()
      filtered = newAddressForm.stateId
        ? cities.filter(city =>
            city.fkState === newAddressForm.stateId &&
            city.name.toLowerCase().includes(searchLower)
          )
        : cities.filter(city =>
            city.name.toLowerCase().includes(searchLower)
          )
    }
    
    setFilteredCities(filtered)
  }

  const resetNewAddressForm = () => {
    setNewAddressForm({
      address: '',
      addressLine2: '',
      city: '',
      cityId: null,
      state: '',
      stateId: null,
      zipCode: ''
    })
    setFilteredCities(cities)
    setCitySearchText('')
    setStateSearchText('')
    setCurrentModalScreen('form')
    // Force re-render of the modal inputs
    setModalKey(prev => prev + 1)
  }

  const handleSaveNewAddress = async () => {
    if (!newAddressForm.address || !newAddressForm.cityId || !newAddressForm.stateId) {
      Alert.alert('Error', 'Please fill in all required fields')
      return
    }

    try {
      const userId = await AsyncStorage.getItem('userId')
      if (!userId) return

      const userResponse = await fetch(`${API_BASE_URL}/user/findOne/${userId}`)
      if (!userResponse.ok) return

      const userData = await userResponse.json()
      const fkPerson = userData?.person?.pkPerson

      const fullAddress = newAddressForm.addressLine2 
        ? `${newAddressForm.address}, ${newAddressForm.addressLine2}, ${newAddressForm.city}, ${newAddressForm.state} ${newAddressForm.zipCode}`
        : `${newAddressForm.address}, ${newAddressForm.city}, ${newAddressForm.state} ${newAddressForm.zipCode}`

      const response = await fetch(`${API_BASE_URL}/person-address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fkPerson: fkPerson,
          address: fullAddress,
          isPrimary: userAddresses.length === 0 ? 1 : 0,
          latitude: 0,
          longitude: 0,
          country: countryId,
          state: newAddressForm.stateId,
          city: newAddressForm.cityId,
        }),
      })

      if (response.ok) {
        onClose()
        resetNewAddressForm()
        onAddressAdded()
        Alert.alert('Success', 'Address added successfully')
      } else {
        const errorData = await response.text()
        console.error('Error creating address:', errorData)
        Alert.alert('Error', 'Failed to add address')
      }
    } catch (error) {
      console.error('Error creating address:', error)
      Alert.alert('Error', 'An error occurred while adding the address')
    }
  }

  const handleClose = () => {
    onClose()
    setCurrentModalScreen('form')
    resetNewAddressForm()
  }

  useEffect(() => {
    if (isVisible) {
      loadCitiesAndStates()
    }
  }, [isVisible, API_BASE_URL])

  // Effect para inicializar las ciudades filtradas cuando se abre el modal de ciudad
  useEffect(() => {
    if (currentModalScreen === 'city' && cities.length > 0) {
      // Inicializar las ciudades filtradas
      const initialCities = newAddressForm.stateId
        ? cities.filter(city => city.fkState === newAddressForm.stateId)
        : cities
      setFilteredCities(initialCities)
    }
  }, [currentModalScreen, cities.length, newAddressForm.stateId])

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isVisible}
      onRequestClose={handleClose}
    >
      {currentModalScreen === 'form' && (
        <View style={styles.newAddressContainer}>
          <View style={styles.newAddressHeader}>
            <TouchableOpacity
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.newAddressTitle}>Add a new address</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView 
            style={styles.newAddressForm}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.formLabel}>Address</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g 108 Jackson St"
              value={newAddressForm.address}
              onChangeText={(text) => setNewAddressForm(prev => ({ ...prev, address: text }))}
            />

            <TextInput
              style={[styles.formInput, styles.formInputSecondary]}
              placeholder="Apt, suite, unit, building, floor, etc."
              value={newAddressForm.addressLine2}
              onChangeText={(text) => setNewAddressForm(prev => ({ ...prev, addressLine2: text }))}
            />

            <Text style={styles.formLabel}>City</Text>
            <TouchableOpacity
              style={styles.formInput}
              onPress={() => setCurrentModalScreen('city')}
              activeOpacity={0.7}
              hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
            >
              <Text style={[styles.formInputText, !newAddressForm.city && styles.placeholderText]}>
                {newAddressForm.city || 'e.g Jacksonville'}
              </Text>
            </TouchableOpacity>

            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <Text style={styles.formLabel}>State</Text>
                <TouchableOpacity
                  style={styles.formInput}
                  onPress={() => setCurrentModalScreen('state')}
                  activeOpacity={0.7}
                  hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                >
                  <Text style={[styles.formInputText, !newAddressForm.state && styles.placeholderText]}>
                    {newAddressForm.state || 'e.g FL'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formColumn}>
                <Text style={styles.formLabel}>Zip Code</Text>
                <TextInput
                  key={`zipcode-${modalKey}`}
                  style={styles.formInput}
                  placeholder="e.g 12345 or 12345-6789"
                  value={newAddressForm.zipCode}
                  onChangeText={(text) => setNewAddressForm(prev => ({ ...prev, zipCode: text }))}
                  keyboardType="default"
                  maxLength={10}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.saveAddressButton}
              onPress={handleSaveNewAddress}
              activeOpacity={0.7}
            >
              <Text style={styles.saveAddressButtonText}>Save Address</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {currentModalScreen === 'city' && (
        <View style={styles.selectorContainer}>
          <View style={styles.selectorHeader}>
            <TouchableOpacity 
              onPress={() => setCurrentModalScreen('form')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              <Icon name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.selectorTitle}>Search City ({filteredCities.length})</Text>
            <View style={{ width: 24 }} />
          </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search for a city"
              value={citySearchText}
              onChangeText={handleCitySearch}
              autoFocus={Platform.OS === 'android'}
            />

            <Text style={styles.selectorSubtitle}>All cities ({filteredCities.length})</Text>

          <View style={{ flex: 1 }}>
            <FlatList
              data={filteredCities}
              keyExtractor={(item) => `city-${item.pkCity}`}
              renderItem={({ item }) => {
                // Buscar el estado correspondiente
                const cityState = states.find(state => state.pkState === item.fkState)
                return (
                  <TouchableOpacity
                    style={styles.selectorItem}
                    onPress={() => handleCitySelect(item)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                  >
                    <Text style={styles.selectorItemText}>{item.name}</Text>
                    <Text style={styles.selectorItemSubText}>{cityState?.name ?? 'Unknown State'}</Text>
                  </TouchableOpacity>
                )
              }}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={() => (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text>No cities found</Text>
                </View>
              )}
              initialNumToRender={10}
              removeClippedSubviews={false}
              contentContainerStyle={{ 
                flexGrow: 1,
                minHeight: 200,
                paddingBottom: 20
              }}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      )}

      {currentModalScreen === 'state' && (
        <View style={styles.selectorContainer}>
          <View style={styles.selectorHeader}>
            <TouchableOpacity 
              onPress={() => setCurrentModalScreen('form')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              <Icon name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.selectorTitle}>Search State</Text>
            <View style={{ width: 24 }} />
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="Search for a state"
            value={stateSearchText}
            onChangeText={setStateSearchText}
            autoFocus={Platform.OS === 'android'}
          />

          <Text style={styles.selectorSubtitle}>All states</Text>

          <View style={{ flex: 1 }}>
            <FlatList
              data={states.filter(state =>
                state.name.toLowerCase().includes(stateSearchText.toLowerCase())
              )}
              keyExtractor={(item) => item.pkState.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.selectorItem}
                  onPress={() => handleStateSelect(item)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                >
                  <Text style={styles.selectorItemText}>{item.name}</Text>
                  <Text style={styles.selectorItemSubText}>{item.internalCode}</Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ 
                flexGrow: 1,
                paddingBottom: 20
              }}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      )}
    </Modal>
  )
}

const styles = StyleSheet.create({
  // New Address Modal Styles
  newAddressContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  newAddressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: 50,
  },
  newAddressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  newAddressForm: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
  },
  formInputSecondary: {
    marginTop: 10,
  },
  formInputText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  formColumn: {
    flex: 1,
  },
  saveAddressButton: {
    backgroundColor: '#ea0e08',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  saveAddressButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // City/State Selector Modal Styles
  selectorContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  selectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  searchInput: {
    margin: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    fontSize: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  selectorSubtitle: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 20,
    marginBottom: 10,
    fontWeight: '500',
  },
  selectorItem: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        minHeight: 50,
      },
      android: {
        minHeight: 48,
      },
    }),
  },
  selectorItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectorItemSubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
})

export default AddNewAddressModal
