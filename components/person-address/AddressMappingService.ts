/**
 * Address Mapping Service
 * Maps Mapbox address data to local city/state IDs and validates the results
 */

import type { ParsedMapboxAddress } from './mapbox'
import { isValidUSZipCode } from './mapbox/config'
import type { AddressFormData, City, State } from './types'

export interface AddressMappingResult {
  formData: AddressFormData
  isComplete: boolean
  missingFields: string[]
  warnings: string[]
}

export class AddressMappingService {
  /**
   * Map Mapbox address to local form data
   */
  public static mapToFormData(
    mapboxAddress: ParsedMapboxAddress,
    localCities: City[],
    localStates: State[]
  ): AddressMappingResult {
    const warnings: string[] = []
    const missingFields: string[] = []

    // Find matching state
    const matchingState = this.findMatchingState(mapboxAddress.stateCode, localStates)
    if (!matchingState && mapboxAddress.stateCode) {
      const warning = `State "${mapboxAddress.stateCode}" not found in local database`
      warnings.push(warning)
      console.log(`⚠️ [AddressMapping] ${warning}`)
    } else if (matchingState) {
      console.log(`✅ [AddressMapping] State found: ${mapboxAddress.stateCode} -> ${matchingState.name} (ID: ${matchingState.pkState})`)
    }

    // Find matching city
    const matchingCity = this.findMatchingCity(
      mapboxAddress.city,
      matchingState?.pkState || null,
      localCities
    )
    if (!matchingCity && mapboxAddress.city) {
      const warning = `City "${mapboxAddress.city}" not found in local database`
      warnings.push(warning)
      console.log(`⚠️ [AddressMapping] ${warning}`)
    } else if (matchingCity) {
      console.log(`✅ [AddressMapping] City found: ${mapboxAddress.city} -> ${matchingCity.name} (ID: ${matchingCity.pkCity})`)
    }

    // Validate ZIP code
    if (mapboxAddress.zipCode && !isValidUSZipCode(mapboxAddress.zipCode)) {
      const warning = `ZIP code "${mapboxAddress.zipCode}" format is invalid`
      warnings.push(warning)
      console.log(`⚠️ [AddressMapping] ${warning}`)
    } else if (mapboxAddress.zipCode) {
      console.log(`✅ [AddressMapping] ZIP code valid: ${mapboxAddress.zipCode}`)
    }

    // Build form data
    const formData: AddressFormData = {
      address: this.buildAddressLine(mapboxAddress),
      addressLine2: '', // User can fill this manually
      city: mapboxAddress.city || '',
      cityId: matchingCity?.pkCity || null,
      state: matchingState?.name || mapboxAddress.state || '',
      stateId: matchingState?.pkState || null,
      zipCode: mapboxAddress.zipCode || '',
      latitude: mapboxAddress.latitude,
      longitude: mapboxAddress.longitude,
      isMapboxResult: true
    }

    // Check for missing required fields
    if (!formData.address) missingFields.push('address')
    if (!formData.city) missingFields.push('city')
    if (!formData.state) missingFields.push('state')
    if (!formData.zipCode) missingFields.push('zipCode')

    const isComplete = missingFields.length === 0 && formData.cityId !== null && formData.stateId !== null

    // Debug log the mapping results
    console.log(`🗺️ [AddressMapping] Mapping result:`)
    console.log(`  - Address: "${formData.address}"`)
    console.log(`  - City: "${formData.city}" (ID: ${formData.cityId})`)
    console.log(`  - State: "${formData.state}" (ID: ${formData.stateId})`)
    console.log(`  - ZIP: "${formData.zipCode}"`)
    console.log(`  - Complete: ${isComplete}`)
    console.log(`  - Missing fields: [${missingFields.join(', ')}]`)
    console.log(`  - Warnings: [${warnings.join(', ')}]`)

    return {
      formData,
      isComplete,
      missingFields,
      warnings
    }
  }

  /**
   * Build the main address line from Mapbox data
   */
  private static buildAddressLine(mapboxAddress: ParsedMapboxAddress): string {
    if (mapboxAddress.houseNumber && mapboxAddress.street) {
      return `${mapboxAddress.houseNumber} ${mapboxAddress.street}`
    }
    return mapboxAddress.street || mapboxAddress.fullAddress.split(',')[0] || ''
  }

  /**
   * Find matching state in local database
   */
  private static findMatchingState(stateCode: string, localStates: State[]): State | null {
    if (!stateCode) return null

    const normalizedCode = stateCode.toUpperCase()
    
    // First try exact match on internal code
    let match = localStates.find(state => 
      state.internalCode?.toUpperCase() === normalizedCode
    )

    if (match) return match

    // Then try partial matching on name
    const stateNames: { [key: string]: string } = {
      'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
      'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
      'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
      'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
      'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
      'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
      'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
      'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
      'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
      'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
      'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
      'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
      'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'District of Columbia'
    }

    const fullStateName = stateNames[normalizedCode]
    if (fullStateName) {
      match = localStates.find(state => 
        state.name.toLowerCase() === fullStateName.toLowerCase()
      )
    }

    return match || null
  }

  /**
   * Find matching city in local database
   */
  private static findMatchingCity(
    cityName: string, 
    stateId: number | null, 
    localCities: City[]
  ): City | null {
    if (!cityName) return null

    const normalizedName = cityName.toLowerCase().trim()

    // Filter cities by state if available
    const relevantCities = stateId 
      ? localCities.filter(city => city.fkState === stateId)
      : localCities

    // Try exact match first
    let match = relevantCities.find(city => 
      city.name.toLowerCase() === normalizedName
    )

    if (match) return match

    // Try partial matching (for cases like "New York City" vs "New York")
    match = relevantCities.find(city => {
      const localName = city.name.toLowerCase()
      return localName.includes(normalizedName) || normalizedName.includes(localName)
    })

    return match || null
  }

  /**
   * Validate that the mapped data is consistent
   */
  public static validateMappedData(
    formData: AddressFormData,
    localCities: City[],
    localStates: State[]
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check state consistency
    if (formData.stateId && formData.state) {
      const state = localStates.find(s => s.pkState === formData.stateId)
      if (!state) {
        errors.push('Selected state ID does not exist in database')
      } else if (state.name !== formData.state) {
        errors.push(`State name mismatch: "${formData.state}" vs "${state.name}"`)
      }
    }

    // Check city consistency
    if (formData.cityId && formData.city) {
      const city = localCities.find(c => c.pkCity === formData.cityId)
      if (!city) {
        errors.push('Selected city ID does not exist in database')
      } else if (city.name !== formData.city) {
        errors.push(`City name mismatch: "${formData.city}" vs "${city.name}"`)
      }
      
      // Check city-state relationship
      if (city && formData.stateId && city.fkState !== formData.stateId) {
        errors.push('Selected city does not belong to the selected state')
      }
    }

    // Check ZIP code format
    if (formData.zipCode && !isValidUSZipCode(formData.zipCode)) {
      errors.push('ZIP code format is invalid')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Create a fallback form data when Mapbox fails
   */
  public static createFallbackFormData(userInput: string): AddressFormData {
    return {
      address: userInput,
      addressLine2: '',
      city: '',
      cityId: null,
      state: '',
      stateId: null,
      zipCode: '',
      isMapboxResult: false
    }
  }
}
