/**
 * Mapbox Integration Module
 * Exports all Mapbox-related functionality
 */

export * from './config'
export * from './service'
export * from './types'

// Auto-import debug in development
if (__DEV__) {
  import('./debug')
}

// Re-export commonly used items for convenience
export { mapboxSearchService } from './service'

export type {
    AddressAutocompleteSuggestion, MapboxError, MapboxTelemetry, ParsedMapboxAddress
} from './types'

