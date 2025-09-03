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

export interface City {
  pkCity: number
  name: string
  fkState: number
  status: number
  createdAt: string
  updatedAt: string
}

export interface State {
  pkState: number
  name: string
  fkCountry: number
  internalCode: string
  status: number
  createdAt: string
  updatedAt: string
}

export interface Country {
  pkCountry: number
  name: string
  code?: string
  internalCode?: string
}

export interface AddressFormData {
  address: string
  addressLine2: string
  city: string
  cityId: number | null
  state: string
  stateId: number | null
  zipCode: string
}

export interface AddressModalProps {
  isVisible: boolean
  onClose: () => void
  addresses: Address[]
  onAddressSelect: (address: Address) => void
  primaryAddress: Address | null
  onAddNewAddress: () => void
  onAddressAdded?: () => void
}

export type ScreenType = 'list' | 'add-form' | 'edit-form' | 'city' | 'state'
