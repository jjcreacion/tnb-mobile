import { apiClient } from './apiClient'

// DTOs
export interface CreatePersonPhoneDTO {
  fkPerson: number
  phone: string // El backend espera solo "phone" (ej: "+15551234567")
  isPrimary?: number // Opcional - 0 o 1, default: 0
}

export interface UpdatePersonPhoneDTO {
  pkPhone: number
  fkPerson: number
  phone?: string
  isPrimary?: number
  status?: number
}

export interface PersonPhoneResponse {
  pkPhone: number // El backend devuelve "pkPhone" no "id"
  phone: string
  isPrimary: number
  status: number
  createdAt: Date
  updatedAt: Date
  fkPerson?: number
}

export const personPhoneService = {
  async createPersonPhone(data: CreatePersonPhoneDTO): Promise<PersonPhoneResponse> {
    return apiClient.post<PersonPhoneResponse>('/person-phone', data)
  },

  async updatePersonPhone(data: UpdatePersonPhoneDTO): Promise<PersonPhoneResponse> {
    return apiClient.patch<PersonPhoneResponse>('/person-phone', data)
  },

  async deletePersonPhone(id: number): Promise<void> {
    return apiClient.delete(`/person-phone/${id}`)
  },
}
