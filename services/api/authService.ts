import { apiClient } from './apiClient'

// DTOs
export interface CreateUserDTO {
  fkPerson: number
  fkProfile: number // OBLIGATORIO - por ahora siempre usar 1
  email: string
  password: string
  referred_by_code?: string
  roles?: string[] // Opcional - ej: ['client']
  validateEmail?: number
  validatePhone?: number
  status?: number
  img_profile?: string
}

export interface UserResponse {
  pkUser: number
  person: {
    pkPerson: number
    firstName: string
    middleName?: string | null
    lastName: string
    dateOfBirth: string
    status: number
    createdAt: Date
    updatedAt: Date
  }
  email: string
  password: string
  validateEmail: number
  validatePhone: number
  status: number
  roles: string[]
  createdAt: Date
  updatedAt: Date
  referralCode: string | null
  referred_by_code: string | null
  balance: string
  img_profile?: string
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
