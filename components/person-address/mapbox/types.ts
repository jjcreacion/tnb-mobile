/**
 * Mapbox API Types
 * Type definitions for Mapbox Search API responses and internal models
 */

/**
 * Mapbox Search API Feature Response
 */
export interface MapboxFeature {
  id: string
  type: 'Feature'
  place_type: string[]
  relevance: number
  properties: {
    address?: string
    category?: string
    landmark?: boolean
    maki?: string
    wikidata?: string
    short_code?: string
    mapbox_id?: string
  }
  text: string
  place_name: string
  center: [number, number] // [longitude, latitude]
  geometry: {
    type: 'Point'
    coordinates: [number, number] // [longitude, latitude]
  }
  context?: MapboxContext[]
}

/**
 * Mapbox Context (hierarchical place information)
 */
export interface MapboxContext {
  id: string
  mapbox_id?: string
  text: string
  wikidata?: string
  short_code?: string
}

/**
 * Mapbox Search API Response
 */
export interface MapboxSearchResponse {
  type: 'FeatureCollection'
  query: string[]
  features: MapboxFeature[]
  attribution: string
}

/**
 * Parsed address from Mapbox response
 */
export interface ParsedMapboxAddress {
  // Street information
  street: string // Main street address
  houseNumber?: string // House/building number
  
  // Location hierarchy
  city: string
  state: string
  stateCode: string // 2-letter state code
  zipCode?: string
  country: string
  countryCode: string
  
  // Coordinates
  latitude: number
  longitude: number
  
  // Full formatted address
  fullAddress: string
  
  // Validation flags
  isValid: boolean
  hasZipCode: boolean
  
  // Raw Mapbox data for debugging
  raw?: MapboxFeature
}

/**
 * Address autocomplete suggestion for UI
 */
export interface AddressAutocompleteSuggestion {
  id: string
  displayText: string // What to show in the dropdown
  secondaryText: string // Additional context (e.g., state, zip) - now required
  parsedAddress: ParsedMapboxAddress
}

/**
 * Mapbox API Error
 */
export interface MapboxError {
  message: string
  code?: string
  statusCode?: number
  isNetworkError: boolean
  isTimeoutError: boolean
  isAuthError: boolean
}

/**
 * Telemetry data for monitoring
 */
export interface MapboxTelemetry {
  timestamp: number
  eventType: 'search' | 'selection' | 'error' | 'fallback'
  query?: string
  resultCount?: number
  responseTime?: number
  errorMessage?: string
  selectedSuggestionIndex?: number
  wasSuccessful: boolean
}
