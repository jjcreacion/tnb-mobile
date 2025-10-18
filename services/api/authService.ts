import { apiClient } from './apiClient'

// DTOs
export interface CreateUserDTO {
  fkPerson: number
  email: string
  password: string
}

export interface UserResponse {
  id: number
  fkPerson: number
  email: string
}

export interface CountryResponse {
  pkCountry: number
  name: string
}

export interface StateResponse {
  pkState: number
  name: string
  fkCountry: number
}

export interface CityResponse {
  pkCity: number
  name: string
  fkState: number
}

export const authService = {
  async createUser(data: CreateUserDTO): Promise<UserResponse> {
    return apiClient.post<UserResponse>('/user/create', data)
  },

  async getAllCountries(): Promise<CountryResponse[]> {
    return apiClient.get<CountryResponse[]>('/country/findAll')
  },

  async getAllStates(): Promise<StateResponse[]> {
    return apiClient.get<StateResponse[]>('/state/findAll')
  },

  async getAllCities(): Promise<CityResponse[]> {
    return apiClient.get<CityResponse[]>('/country_city/findAll')
  },
}
