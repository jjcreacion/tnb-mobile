/**
 * Mapbox Configuration
 * Handles Mapbox feature toggles and settings
 */

import Constants from 'expo-constants'

export interface MapboxConfig {
  enabled: boolean
  debounceMs: number
  minChars: number
  maxResults: number
  countryFilter: string
  fallbackToManual: boolean
  enableTelemetry: boolean
  timeout: number
  useLocalDatabaseMapping: boolean // Whether to map Mapbox results to local DB
}

export const MAPBOX_CONFIG: MapboxConfig = {
  enabled: true, // Global toggle for Mapbox autocomplete;;; true=enable Mapbox, false=input address manually
  debounceMs: 600, // Debounce delay for API calls (increased to reduce API calls)
  minChars: 3, // Minimum characters to trigger search
  maxResults: 5, // Maximum results to show (increased for better options)
  countryFilter: "US", // Country restriction
  fallbackToManual: true, // Fall back to manual entry on errors
  enableTelemetry: true, // Enable usage/error tracking
  timeout: 12000, // API timeout in milliseconds (increased from 8000 to handle slower connections)
  useLocalDatabaseMapping: false, // When true, maps Mapbox results to local DB (causes verification warnings)
}

/**
 * Environment variables and token management
 */
export const getMapboxToken = (): string | null => {
  // Get token from expo config (app.json extra field)
  const token = Constants.expoConfig?.extra?.MAPBOX_TOKEN || process.env.MAPBOX_TOKEN
  return token || null
}

/**
 * Check if Mapbox is available and properly configured
 */
export const isMapboxAvailable = (): boolean => {
  return MAPBOX_CONFIG.enabled && getMapboxToken() !== null
}

/**
 * Validate US ZIP code format
 */
export const isValidUSZipCode = (zipCode: string): boolean => {
  // Matches 5-digit ZIP or 5+4 format
  const zipRegex = /^\d{5}(-\d{4})?$/
  return zipRegex.test(zipCode)
}

/**
 * Validate US state code
 */
export const US_STATE_CODES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC' // District of Columbia
]

export const isValidUSStateCode = (stateCode: string): boolean => {
  return US_STATE_CODES.includes(stateCode.toUpperCase())
}
