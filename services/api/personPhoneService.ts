import { apiClient } from './apiClient'

// DTOs
export interface CreatePersonPhoneDTO {
  fkPerson: number
  countryCode: string // e.g., "+1"
  phoneNumber: string
}

export interface PersonPhoneResponse {
  id: number
  fkPerson: number
  countryCode: string
  phoneNumber: string
}

export const personPhoneService = {
  async createPersonPhone(data: CreatePersonPhoneDTO): Promise<PersonPhoneResponse> {
    return apiClient.post<PersonPhoneResponse>('/person-phone', data)
  },
}
