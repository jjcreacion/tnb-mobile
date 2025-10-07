import { apiClient } from './apiClient'
import type { City, State, Country } from '@/types'

export const addressService = {
  async getCities(): Promise<City[]> {
    return apiClient.get<City[]>('/country_city/findAll')
  },

  async getStates(): Promise<State[]> {
    return apiClient.get<State[]>('/state/findAll')
  },

  async getCountries(): Promise<Country[]> {
    return apiClient.get<Country[]>('/country/findAll')
  },

  async updateAddressPrimary(
    pkAddress: number,
    isPrimary: number
  ): Promise<any> {
    return apiClient.patch('/person-address', {
      pkAddress,
      isPrimary,
    })
  },
}
