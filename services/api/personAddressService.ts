import { apiClient } from './apiClient'

// DTOs
export interface CreatePersonAddressDTO {
  fkPerson: number
  address: string // Cambié de "addressLine1" a "address"
  addressLine2?: string
  zipCode?: string
  isPrimary?: number // Opcional - 0 o 1, default: 0
  latitude?: number
  longitude?: number
  country?: number // ID del país (opcional - por ahora solo hay USA con id: 1)
  state?: number // ID del estado (opcional)
  city?: number // ID de la ciudad (opcional)
}

export interface UpdatePersonAddressDTO {
  pkAddress: number
  address?: string
  addressLine2?: string
  zipCode?: string
  isPrimary?: number
  status?: number
  latitude?: number
  longitude?: number
  country?: number
  state?: number
  city?: number
}

export interface PersonAddressResponse {
  pkAddress: number // El backend devuelve "pkAddress" no "id"
  address: string // "address" no "addressLine1"
  addressLine2?: string
  zipCode?: string
  isPrimary: number
  status: number
  latitude?: number
  longitude?: number
  country?: number
  state?: number
  city?: number
  createdAt: Date
  updatedAt: Date
  fkPerson?: number
}

export const personAddressService = {
  async createPersonAddress(data: CreatePersonAddressDTO): Promise<PersonAddressResponse> {
    return apiClient.post<PersonAddressResponse>('/person-address', data)
  },

  async updatePersonAddress(data: UpdatePersonAddressDTO): Promise<PersonAddressResponse> {
    return apiClient.patch<PersonAddressResponse>('/person-address', data)
  },

  async deletePersonAddress(id: number): Promise<void> {
    return apiClient.delete(`/person-address/${id}`)
  },
}
