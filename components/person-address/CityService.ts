import Constants from 'expo-constants'

export interface CreateCityRequest {
  name: string      // City name (e.g., "Miami")
  fkState: number   // ID of the state this city belongs to
}

export interface CreateCityResponse {
  pkCity: number
  name: string
  fkState: number
  status: number
  createdAt: string
  updatedAt: string
}

export class CityService {
  private static getApiUrl(): string {
    return Constants.expoConfig?.extra?.API_BASE_URL || process.env.API_BASE_URL || ''
  }

  /**
   * Create a new city in the database
   */
  public static async createCity(cityData: CreateCityRequest): Promise<CreateCityResponse> {
    const apiUrl = this.getApiUrl()
    if (!apiUrl) {
      throw new Error('API URL is not configured')
    }

    try {
      const response = await fetch(`${apiUrl}/country_city`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cityData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(
          errorData?.message ||
          `Failed to create city: ${response.status} ${response.statusText}`
        )
      }

      const createdCity: CreateCityResponse = await response.json()
      return createdCity
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`CityService.createCity failed: ${error.message}`)
      }
      throw new Error('CityService.createCity failed: Unknown error')
    }
  }

  /**
   * Create city data from Mapbox information
   */
  public static createCityData(cityName: string, stateId: number): CreateCityRequest {
    // Normalize city name (capitalize first letters)
    const normalizedName = cityName
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    return {
      name: normalizedName,
      fkState: stateId
    }
  }

  /**
   * Validate city name format
   */
  public static isValidCityName(cityName: string): boolean {
    if (!cityName || typeof cityName !== 'string') {
      return false
    }

    const trimmed = cityName.trim()

    // Must be at least 1 character, max 100
    if (trimmed.length < 1 || trimmed.length > 100) {
      return false
    }

    // Only allow letters, spaces, hyphens, apostrophes, and dots
    const validCityRegex = /^[a-zA-Z\s\-'.]+$/
    return validCityRegex.test(trimmed)
  }
}