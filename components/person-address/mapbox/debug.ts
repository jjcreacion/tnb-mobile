/**
 * Mapbox Debug Utility
 * Quick verification tool for development
 */

import Constants from 'expo-constants'
import { getMapboxToken, isMapboxAvailable, MAPBOX_CONFIG } from './config'

export const debugMapboxConfig = () => {
  console.log('🔧 [Mapbox Debug] Configuration Check:')
  console.log('  - Config enabled:', MAPBOX_CONFIG.enabled)
  console.log('  - Token from Constants:', Constants.expoConfig?.extra?.MAPBOX_TOKEN ? 'Found' : 'Not found')
  console.log('  - Token from process.env:', process.env.MAPBOX_TOKEN ? 'Found' : 'Not found')
  console.log('  - getMapboxToken():', getMapboxToken() ? 'Valid' : 'Invalid/Missing')
  console.log('  - isMapboxAvailable():', isMapboxAvailable())
  console.log('  - Debounce delay:', MAPBOX_CONFIG.debounceMs + 'ms')
  console.log('  - Min characters:', MAPBOX_CONFIG.minChars)
  console.log('  - Max results:', MAPBOX_CONFIG.maxResults)
  console.log('  - Country filter:', MAPBOX_CONFIG.countryFilter)
  
  // Test API endpoint
  const token = getMapboxToken()
  if (token) {
    console.log('  - API endpoint test URL:')
    console.log(`    https://api.mapbox.com/geocoding/v5/mapbox.places/test.json?access_token=${token.substring(0, 20)}...`)
    
    // Perform a simple connectivity test
    testMapboxConnectivity(token)
  }
}

// Simple connectivity test
const testMapboxConnectivity = async (token: string) => {
  console.log('🔧 [Mapbox Debug] Testing API connectivity...')
  
  try {
    const testUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/New%20York.json?access_token=${token}&limit=1`
    
    const startTime = Date.now()
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    const responseTime = Date.now() - startTime
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ [Mapbox Debug] API connectivity test SUCCESS:', {
        responseTime: responseTime + 'ms',
        status: response.status,
        features: data.features?.length || 0
      })
    } else {
      console.log('❌ [Mapbox Debug] API connectivity test FAILED:', {
        responseTime: responseTime + 'ms',
        status: response.status,
        statusText: response.statusText
      })
    }
  } catch (error) {
    console.log('❌ [Mapbox Debug] API connectivity test ERROR:', {
      error: error instanceof Error ? error.message : error,
      errorType: error instanceof Error ? error.name : 'Unknown'
    })
  }
}

// Auto-run debug info in development
if (__DEV__) {
  // Add a small delay to ensure everything is loaded
  setTimeout(() => {
    debugMapboxConfig()
  }, 1000)
}
