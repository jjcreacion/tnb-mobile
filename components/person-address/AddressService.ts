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

  static async updateAddress(
    pkAddress: number,
    updateData: Partial<AddressFormData & { isPrimary?: number }>
  ): Promise<{ success: boolean; address?: any; message?: string }> {
    try {
      const requestBody: any = { pkAddress }
      
      // Solo incluir campos que se han modificado
      if (updateData.address !== undefined) requestBody.address = updateData.address
      if (updateData.addressLine2 !== undefined) requestBody.addressLine2 = updateData.addressLine2
      if (updateData.zipCode !== undefined) requestBody.zipCode = updateData.zipCode
      if (updateData.isPrimary !== undefined) requestBody.isPrimary = updateData.isPrimary
      if (updateData.cityId !== undefined) requestBody.city = updateData.cityId
      if (updateData.stateId !== undefined) requestBody.state = updateData.stateId

      const response = await fetch(`${API_BASE_URL}/person-address`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        const result = await response.json()
        return {
          success: true,
          address: result.address,
          message: result.message || 'Address updated successfully'
        }
      } else {
        console.error('Error updating address:', response.status)
        return {
          success: false,
          message: 'Failed to update address'
        }
      }
    } catch (error) {
      console.error('Error updating address:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  static async deleteAddress(pkAddress: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/person-address/${pkAddress}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        return {
          success: true,
          message: 'Address deleted successfully'
        }
      } else {
        console.error('Error deleting address:', response.status)
        return {
          success: false,
          message: 'Failed to delete address'
        }
      }
    } catch (error) {
      console.error('Error deleting address:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }
}
