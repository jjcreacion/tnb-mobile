import { apiClient } from './apiClient'

// DTOs
export interface CreatePersonDTO {
  firstName: string
  lastName: string
  birthDate: string // YYYY-MM-DD
}

export interface UpdatePersonDTO {
  id: number
  firstName: string
  lastName: string
  birthDate: string // YYYY-MM-DD
}

export interface PersonResponse {
  id: number
  firstName: string
  lastName: string
  birthDate: string
}

export const personService = {
  async createPerson(data: CreatePersonDTO): Promise<PersonResponse> {
    return apiClient.post<PersonResponse>('/person', data)
  },

  async updatePerson(data: UpdatePersonDTO): Promise<PersonResponse> {
    return apiClient.patch<PersonResponse>('/person', data)
  },
}
