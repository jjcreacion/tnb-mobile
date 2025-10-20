import { apiClient } from './apiClient'

// DTOs
export interface CreatePersonAddressDTO {
  fkPerson: number
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface PersonAddressResponse {
  id: number
  fkPerson: number
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  zipCode: string
  country: string
}

export const personAddressService = {
  async createPersonAddress(data: CreatePersonAddressDTO): Promise<PersonAddressResponse> {
    return apiClient.post<PersonAddressResponse>('/person-address', data)
  },
}
