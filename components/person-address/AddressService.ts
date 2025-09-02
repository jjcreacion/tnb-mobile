import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'
import { AddressFormData, City, Country, State } from './types'

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL

export class AddressService {
  static async loadCountries(): Promise<Country[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/country/findAll`)
      if (response.ok) {
        return await response.json()
      } else {
        console.error('Error loading countries:', response.status)
        return []
      }
    } catch (error) {
      console.error('Error loading countries:', error)
      return []
    }
  }

  static async loadCities(): Promise<City[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/country_city/findAll`)
      if (response.ok) {
        return await response.json()
      } else {
        console.error('Error loading cities:', response.status)
        return []
      }
    } catch (error) {
      console.error('Error loading cities:', error)
      return []
    }
  }

  static async loadStates(): Promise<State[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/state/findAll`)
      if (response.ok) {
        return await response.json()
      } else {
        console.error('Error loading states:', response.status)
        return []
      }
    } catch (error) {
      console.error('Error loading states:', error)
      return []
    }
  }

  static async saveAddress(
    formData: AddressFormData, 
    countryId: number, 
    isFirstAddress: boolean
  ): Promise<boolean> {
    try {
      const userId = await AsyncStorage.getItem('userId')
      if (!userId) {
        console.error('User ID not found')
        return false
      }

      const userResponse = await fetch(`${API_BASE_URL}/user/findOne/${userId}`)
      if (!userResponse.ok) {
        console.error('Error fetching user data:', userResponse.status)
        return false
      }

      const userData = await userResponse.json()
      const fkPerson = userData?.person?.pkPerson

      if (!fkPerson) {
        console.error('Person ID not found')
        return false
      }

      const response = await fetch(`${API_BASE_URL}/person-address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fkPerson: fkPerson,
          address: formData.address,
          addressLine2: formData.addressLine2,
          zipCode: formData.zipCode,
          isPrimary: isFirstAddress ? 1 : 0,
          latitude: 0,
          longitude: 0,
          country: countryId,
          state: formData.stateId,
          city: formData.cityId,
        }),
      })

      return response.ok
    } catch (error) {
      console.error('Error saving address:', error)
      return false
    }
  }

  static findUSACountry(countries: Country[]): Country | null {
    return countries.find(
      (country) =>
        country.name?.toLowerCase().includes('united states') ||
        country.name?.toLowerCase().includes('usa') ||
        country.code === 'US' ||
        country.internalCode === 'US'
    ) || null
  }

  static filterCitiesByState(cities: City[], stateId: number): City[] {
    return cities.filter((city) => city.fkState === stateId)
  }

  static filterCitiesBySearch(cities: City[], searchText: string): City[] {
    if (!searchText) return cities
    const searchLower = searchText.toLowerCase()
    return cities.filter((city) =>
      city.name.toLowerCase().includes(searchLower)
    )
  }

  static filterStatesBySearch(states: State[], searchText: string): State[] {
    if (!searchText) return states
    const searchLower = searchText.toLowerCase()
    return states.filter((state) =>
      state.name.toLowerCase().includes(searchLower)
    )
  }

  static findStateByCity(states: State[], city: City): State | undefined {
    return states.find((state) => state.pkState === city.fkState)
  }
}
