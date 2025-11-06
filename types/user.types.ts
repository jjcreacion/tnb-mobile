export interface User {
  userId: number
  email?: string
  phone?: string
  balance: number
  person?: Person
  createdAt?: string
  updatedAt?: string
  referralCode: string | null
}

export interface Person {
  pkPerson: number
  firstName: string
  lastName: string
  addresses?: Address[]
}

export interface Address {
  pkAddress: number
  address: string
  addressLine2?: string
  zipCode?: string
  isPrimary: number
  status?: number
  latitude?: string
  longitude?: string
  country?: number
  state?: number
  city?: number
  createdAt?: string
  updatedAt?: string
}
