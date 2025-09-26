import Constants from 'expo-constants'

export interface CreateStateRequest {
  fkCountry: number      // Always 1 for USA
  name: string          // Full state name (e.g., "Florida")
  internalCode: string  // State code (e.g., "FL")
}

export interface CreateStateResponse {
  pkState: number
  fkCountry: number
  name: string
  internalCode: string
  status: number
  createdAt: string
  updatedAt: string
}

export class StateService {
  private static getApiUrl(): string {
    return Constants.expoConfig?.extra?.API_BASE_URL || process.env.API_BASE_URL || ''
  }

  /**
   * Create a new state in the database
   */
  public static async createState(stateData: CreateStateRequest): Promise<CreateStateResponse> {
    const apiUrl = this.getApiUrl()
    if (!apiUrl) {
      throw new Error('API URL is not configured')
    }

    try {
      const response = await fetch(`${apiUrl}/state`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stateData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(
          errorData?.message ||
          `Failed to create state: ${response.status} ${response.statusText}`
        )
      }

      const createdState: CreateStateResponse = await response.json()
      return createdState
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`StateService.createState failed: ${error.message}`)
      }
      throw new Error('StateService.createState failed: Unknown error')
    }
  }

  /**
   * Convert state code to full state name
   */
  public static getStateNameFromCode(stateCode: string): string {
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

    return stateNames[stateCode.toUpperCase()] || stateCode
  }

  /**
   * Create state data from Mapbox information
   */
  public static createStateData(stateCode: string, stateName?: string): CreateStateRequest {
    const normalizedCode = stateCode.toUpperCase()
    const fullName = stateName || this.getStateNameFromCode(normalizedCode)

    return {
      fkCountry: 1, // Always 1 for USA
      name: fullName,
      internalCode: normalizedCode
    }
  }
}