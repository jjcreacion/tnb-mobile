export interface RegistrationFormData {
  // Personal Information
  firstName: string
  lastName: string
  birthDate: string // YYYY-MM-DD

  // Phone
  countryCode: string // e.g., "+1"
  phoneNumber: string

  // Address
  address: string
  addressLine2?: string
  city: string
  cityId: number | null
  state: string
  stateId: number | null
  zipCode: string
  country: string

  // MapBox coordinates (optional)
  latitude?: number
  longitude?: number
  isMapboxResult?: boolean
}

export interface CountryCodeOption {
  label: string
  value: string
  flag: string
}

export const COUNTRY_CODES: CountryCodeOption[] = [
  { label: 'USA', value: '+1', flag: '🇺🇸' },
  { label: 'El Salvador', value: '+503', flag: '🇸🇻' },
  { label: 'Canada', value: '+1', flag: '🇨🇦' },
]
