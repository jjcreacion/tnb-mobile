/**
 * Mapbox Search Service
 * Handles Mapbox Search API calls and response parsing
 */

import { MAPBOX_CONFIG, getMapboxToken, isMapboxAvailable } from './config'
import {
    AddressAutocompleteSuggestion,
    MapboxError,
    MapboxFeature,
    MapboxSearchResponse,
    MapboxTelemetry,
    ParsedMapboxAddress
} from './types'

/**
 * Service class for Mapbox Search API integration
 */
export class MapboxSearchService {
  private static instance: MapboxSearchService
  private baseUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places'
  private telemetryData: MapboxTelemetry[] = []

  private constructor() {}

  public static getInstance(): MapboxSearchService {
    if (!MapboxSearchService.instance) {
      MapboxSearchService.instance = new MapboxSearchService()
    }
    return MapboxSearchService.instance
  }

  /**
   * Check if service is available and configured
   */
  public isAvailable(): boolean {
    return isMapboxAvailable()
  }

  /**
   * Search for address suggestions
   */
  public async searchAddresses(query: string): Promise<AddressAutocompleteSuggestion[]> {
    if (!this.isAvailable()) {
      throw new Error('Mapbox service is not available or configured')
    }

    if (query.length < MAPBOX_CONFIG.minChars) {
      return []
    }

    const startTime = Date.now()

    try {
      const token = getMapboxToken()
      if (!token) {
        throw new Error('Mapbox token not found')
      }

      const params = new URLSearchParams({
        access_token: token,
        country: MAPBOX_CONFIG.countryFilter.toLowerCase(),
        types: 'address,poi', // Address and Points of Interest
        limit: MAPBOX_CONFIG.maxResults.toString(),
        autocomplete: 'true',
        language: 'en'
      })

      // Add proximity bias for famous addresses like the White House
      if (query.toLowerCase().includes('pennsylvania') || 
          query.toLowerCase().includes('1600')) {
        // Bias towards Washington DC area (-77.0365, 38.8951)
        params.append('proximity', '-77.0365,38.8951')
      }

      const url = `${this.baseUrl}/${encodeURIComponent(query)}.json?${params}`
      

      
      // Create a timeout promise for React Native compatibility
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Request timed out'))
        }, MAPBOX_CONFIG.timeout)
      })
      
      const fetchPromise = fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise])

      if (!response.ok) {
        const isAuthError = response.status === 401 || response.status === 403
        throw new Error(`Mapbox API error: ${response.status} ${response.statusText}`, {
          cause: { statusCode: response.status, isAuthError }
        })
      }

      const data: MapboxSearchResponse = await response.json()
      const responseTime = Date.now() - startTime

      // Parse results
      const suggestions = this.parseSearchResults(data.features)

      // Sort results by relevance to the query
      const sortedSuggestions = this.prioritizeResults(suggestions, query)

      // Log telemetry
      this.logTelemetry({
        timestamp: Date.now(),
        eventType: 'search',
        query,
        resultCount: sortedSuggestions.length,
        responseTime,
        wasSuccessful: true
      })

      return sortedSuggestions

    } catch (error) {
      const responseTime = Date.now() - startTime
      const mapboxError = this.parseError(error)

      

      // Log error telemetry
      this.logTelemetry({
        timestamp: Date.now(),
        eventType: 'error',
        query,
        responseTime,
        errorMessage: mapboxError.message,
        wasSuccessful: false
      })

      throw mapboxError
    }
  }

  /**
   * Parse Mapbox search results into our format
   */
  private parseSearchResults(features: MapboxFeature[]): AddressAutocompleteSuggestion[] {
    return features
      .map((feature, index) => {
        const parsed = this.parseMapboxFeature(feature)
        if (!parsed.isValid) return null

        return {
          id: `${feature.id}-${index}`,
          displayText: this.formatDisplayText(parsed),
          secondaryText: this.formatSecondaryText(parsed),
          parsedAddress: parsed
        }
      })
      .filter((suggestion): suggestion is AddressAutocompleteSuggestion => suggestion !== null)
  }

  /**
   * Prioritize results based on relevance to query
   */
  private prioritizeResults(suggestions: AddressAutocompleteSuggestion[], query: string): AddressAutocompleteSuggestion[] {
    const queryLower = query.toLowerCase().trim()
    
    // Extract search components
    const houseNumberMatch = queryLower.match(/^(\d+)\s+(.+)/)
    const searchHouseNumber = houseNumberMatch ? houseNumberMatch[1] : ''
    const searchStreet = houseNumberMatch ? houseNumberMatch[2] : queryLower
    
    return suggestions.sort((a, b) => {
      const aStreet = a.parsedAddress.street.toLowerCase()
      const bStreet = b.parsedAddress.street.toLowerCase()
      
      // Priority 1: Exact house number match
      if (searchHouseNumber) {
        const aHouseMatch = a.parsedAddress.houseNumber === searchHouseNumber
        const bHouseMatch = b.parsedAddress.houseNumber === searchHouseNumber
        
        if (aHouseMatch && !bHouseMatch) {
          return -1
        }
        if (!aHouseMatch && bHouseMatch) {
          return 1
        }
      }
      
      // Priority 2: Exact street name match
      if (searchStreet) {
        const aExactStreet = aStreet === searchStreet
        const bExactStreet = bStreet === searchStreet
        
        if (aExactStreet && !bExactStreet) {
          return -1
        }
        if (!aExactStreet && bExactStreet) {
          return 1
        }
        
        // Priority 3: Street starts with search term
        const aStartsWith = aStreet.startsWith(searchStreet)
        const bStartsWith = bStreet.startsWith(searchStreet)
        
        if (aStartsWith && !bStartsWith) {
          return -1
        }
        if (!aStartsWith && bStartsWith) {
          return 1
        }
        
        // Priority 4: String similarity (Levenshtein-like)
        const aDistance = this.calculateStringSimilarity(searchStreet, aStreet)
        const bDistance = this.calculateStringSimilarity(searchStreet, bStreet)
        
        if (aDistance > bDistance) {
          return -1
        }
        if (bDistance > aDistance) {
          return 1
        }
      }
      
      // Priority 5: Keep original Mapbox relevance order
      return 0
    })
  }

  /**
   * Calculate string similarity (simple implementation)
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    // Simple similarity: count matching words
    const words1 = str1.split(' ')
    const words2 = str2.split(' ')
    
    let matches = 0
    for (const word1 of words1) {
      if (words2.some(word2 => word2.includes(word1) || word1.includes(word2))) {
        matches++
      }
    }
    
    return matches / Math.max(words1.length, words2.length)
  }

  /**
   * Parse a single Mapbox feature into our address format
   */
  private parseMapboxFeature(feature: MapboxFeature): ParsedMapboxAddress {
    try {
      const [longitude, latitude] = feature.center
      
      // Extract address components from context
      let city = ''
      let state = ''
      let stateCode = ''
      let zipCode = ''
      let country = ''
      let countryCode = ''

      // Parse from context array
      if (feature.context) {
        for (const context of feature.context) {
          if (context.id.startsWith('postcode')) {
            zipCode = context.text
          } else if (context.id.startsWith('place')) {
            city = context.text
          } else if (context.id.startsWith('region')) {
            state = context.text
            stateCode = context.short_code?.replace('US-', '') || ''
          } else if (context.id.startsWith('country')) {
            country = context.text
            countryCode = context.short_code || ''
          }
        }
      }

      // Handle cases where city might be in place_name but not in context
      if (!city && feature.place_name) {
        const parts = feature.place_name.split(', ')
        if (parts.length >= 2) {
          city = parts[1]
        }
      }

      // Extract street and house number from place_name
      const street = feature.text || ''
      let houseNumber = ''
      
      // Extract house number from place_name (e.g., "363 Beans Road Southeast, ...")
      if (feature.place_name) {
        const addressMatch = feature.place_name.match(/^(\d+)\s+(.+?),/)
        if (addressMatch) {
          houseNumber = addressMatch[1] // "363"
          // street should be feature.text which already contains the street name
        }
      }

      const fullAddress = feature.place_name || ''
      const hasZipCode = zipCode.length > 0
      const isValid = street.length > 0 && city.length > 0 && state.length > 0

      const result = {
        street,
        houseNumber,
        city,
        state,
        stateCode,
        zipCode,
        country,
        countryCode,
        latitude,
        longitude,
        fullAddress,
        isValid,
        hasZipCode,
        raw: feature
      }



      return result
    } catch {
      return {
        street: '',
        city: '',
        state: '',
        stateCode: '',
        country: '',
        countryCode: '',
        latitude: 0,
        longitude: 0,
        fullAddress: feature.place_name || '',
        isValid: false,
        hasZipCode: false,
        raw: feature
      }
    }
  }

  /**
   * Format primary display text for suggestions
   */
  private formatDisplayText(address: ParsedMapboxAddress): string {
    if (address.houseNumber && address.street) {
      return `${address.houseNumber} ${address.street}`
    }
    return address.street || address.fullAddress
  }

  /**
   * Format secondary text for suggestions
   */
  private formatSecondaryText(address: ParsedMapboxAddress): string {
    const parts = []
    
    if (address.city) parts.push(address.city)
    if (address.stateCode) parts.push(address.stateCode)
    if (address.zipCode) parts.push(address.zipCode)
    
    return parts.join(', ')
  }

  /**
   * Parse and categorize errors
   */
  private parseError(error: any): MapboxError {
    let message = 'Unknown error occurred'
    let isNetworkError = false
    let isTimeoutError = false
    let isAuthError = false
    let statusCode: number | undefined

    if (error instanceof Error) {
      message = error.message
      
      if (error.name === 'AbortError' || message.includes('timeout') || message.includes('timed out')) {
        isTimeoutError = true
        message = 'Search is taking longer than expected. Please try again.'
      } else if (message.includes('fetch') || message.includes('network')) {
        isNetworkError = true
        message = 'Network connection issue. Please check your internet.'
      }

      // Check for auth errors from cause
      if (error.cause && typeof error.cause === 'object') {
        const cause = error.cause as any
        statusCode = cause.statusCode
        isAuthError = cause.isAuthError || false
        
        if (isAuthError) {
          message = 'Mapbox authentication failed'
        }
      }
    }

    return {
      message,
      statusCode,
      isNetworkError,
      isTimeoutError,
      isAuthError
    }
  }

  /**
   * Log telemetry data for monitoring
   */
  private logTelemetry(data: MapboxTelemetry): void {
    if (!MAPBOX_CONFIG.enableTelemetry) return

    this.telemetryData.push(data)

    // Keep only last 100 entries to prevent memory bloat
    if (this.telemetryData.length > 100) {
      this.telemetryData = this.telemetryData.slice(-100)
    }

    // In production, you might want to send this to your analytics service
  }

  /**
   * Get telemetry data for debugging/monitoring
   */
  public getTelemetryData(): MapboxTelemetry[] {
    return [...this.telemetryData]
  }

  /**
   * Clear telemetry data
   */
  public clearTelemetryData(): void {
    this.telemetryData = []
  }
}

// Export singleton instance
export const mapboxSearchService = MapboxSearchService.getInstance()
