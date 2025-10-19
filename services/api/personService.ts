import { apiClient } from './apiClient'

// DTOs
export interface CreatePersonDTO {
  firstName: string
  lastName: string
  dateOfBirth: string // YYYY-MM-DD - debe ser "dateOfBirth" según endpoint del backend
}

export interface UpdatePersonDTO {
  pkPerson: number // Cambié de "id" a "pkPerson" según endpoint del backend
  firstName?: string
  lastName?: string
  dateOfBirth?: string // YYYY-MM-DD
  status?: number
}

export interface PersonResponse {
  pkPerson: number // El backend devuelve "pkPerson" no "id"
  firstName: string
  lastName: string
  dateOfBirth: string // El backend devuelve "dateOfBirth" no "birthDate"
  status: number
  createdAt: string
  updatedAt: string
}

export const personService = {
  async createPerson(data: CreatePersonDTO): Promise<PersonResponse> {
    return apiClient.post<PersonResponse>('/person', data)
  },

  async updatePerson(data: UpdatePersonDTO): Promise<PersonResponse> {
    return apiClient.patch<PersonResponse>('/person', data)
  },
}
