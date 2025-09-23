# Mapbox Address Autocomplete Integration

This module provides address autocomplete functionality using the Mapbox Search API for the TNB mobile app.

## Features

- **Address Autocomplete**: Real-time address suggestions as you type
- **Intelligent Fallback**: Falls back to manual entry when Mapbox is unavailable or fails
- **Coordinate Storage**: Automatically stores latitude/longitude for geocoded addresses
- **Smart Mapping**: Maps Mapbox results to local city/state database IDs
- **Debug Panel**: Development tool for monitoring API usage and performance
- **Configurable**: Toggle-based system for easy enable/disable

## Configuration

### Environment Setup

1. Add your Mapbox token to `.env`:
```bash
MAPBOX_TOKEN=pk.your_mapbox_token_here
```

2. Configure Mapbox settings in `mapbox/config.ts`:
```typescript
export const MAPBOX_CONFIG: MapboxConfig = {
  enabled: true,           // Global toggle for Mapbox autocomplete
  debounceMs: 400,        // Debounce delay for API calls
  minChars: 3,            // Minimum characters to trigger search
  maxResults: 5,          // Maximum results to show
  countryFilter: "US",    // Country restriction
  fallbackToManual: true, // Fall back to manual entry on errors
  enableTelemetry: true,  // Enable usage/error tracking
  timeout: 8000,          // API timeout in milliseconds
}
```

## Usage

### Basic Integration

The autocomplete is automatically integrated into `AddressForm` and `EditAddressForm` components:

```tsx
import { AddressForm } from './components/person-address'

// The component automatically detects if Mapbox is available
// and shows autocomplete or falls back to manual entry
<AddressForm
  formData={formData}
  onFormDataChange={setFormData}
  onNavigateToScreen={navigateToScreen}
  onSaveAddress={saveAddress}
  cities={cities}
  states={states}
/>
```

### Standalone Autocomplete Component

You can also use the autocomplete component independently:

```tsx
import { AddressAutocomplete } from './components/person-address'

<AddressAutocomplete
  value={address}
  onChangeText={setAddress}
  onAddressSelect={(parsedAddress) => {
    // Handle the selected address
    console.log('Selected:', parsedAddress)
  }}
  onFallbackToManual={() => {
    // Handle fallback to manual entry
    console.log('Falling back to manual entry')
  }}
  placeholder="Start typing an address..."
/>
```

## API Response Mapping

### Mapbox to Local Database

The system automatically maps Mapbox response data to your local database:

1. **State Mapping**: Maps Mapbox state codes (e.g., "FL") to local state IDs
2. **City Mapping**: Maps Mapbox city names to local city IDs within the correct state
3. **Coordinate Storage**: Stores latitude/longitude for future use
4. **Validation**: Validates ZIP code format and address completeness

### Address Form Data Structure

```typescript
interface AddressFormData {
  address: string           // Street address
  addressLine2: string      // Apt, suite, etc.
  city: string             // City name
  cityId: number | null    // Local database city ID
  state: string            // State name or code
  stateId: number | null   // Local database state ID
  zipCode: string          // ZIP code
  latitude?: number        // Geocoded latitude (from Mapbox)
  longitude?: number       // Geocoded longitude (from Mapbox)
  isMapboxResult?: boolean // Flag indicating if address came from Mapbox
}
```

## Error Handling & Fallbacks

### Automatic Fallbacks

1. **Service Unavailable**: If Mapbox token is missing or invalid
2. **Network Errors**: Timeout, no internet connection
3. **API Errors**: Rate limits, authentication failures
4. **No Results**: When no addresses match the search query

### Manual Override

Users can always override autocomplete suggestions:
- Click the edit icon to switch to manual entry
- Clear the address field to reset to autocomplete mode
- "Enter manually" buttons in error states

## Development Tools

### Debug Panel

In development mode (`__DEV__ === true`), a debug button appears in the AddressModal header:

- **Configuration Status**: Shows if Mapbox is properly configured
- **Live Statistics**: Search counts, errors, response times
- **Telemetry Log**: Real-time log of all API interactions
- **Performance Metrics**: Average response times and success rates

### Telemetry Events

The system tracks the following events:
- `search`: API search requests
- `selection`: User selects a suggestion
- `error`: API errors or failures
- `fallback`: User switches to manual entry

## Performance Considerations

### Optimization Features

1. **Debouncing**: 400ms delay prevents excessive API calls
2. **Minimum Characters**: Only searches after 3+ characters
3. **Result Limiting**: Maximum 5 results to keep UI fast
4. **Request Cancellation**: Cancels previous requests when new ones start
5. **Error Caching**: Prevents retry storms on persistent errors

### API Usage Monitoring

- Telemetry data helps monitor API usage patterns
- Debug panel shows real-time performance metrics
- Failed requests are logged with detailed error information

## Testing

### Toggle Testing

Test both autocomplete and manual modes:

```typescript
// Disable Mapbox for testing manual mode
MAPBOX_CONFIG.enabled = false

// Enable for testing autocomplete
MAPBOX_CONFIG.enabled = true
```

### Mock Responses

For testing without API calls, you can mock the service:

```typescript
// In tests, replace the real service
jest.mock('./mapbox/service', () => ({
  mapboxSearchService: {
    searchAddresses: jest.fn().mockResolvedValue([])
  }
}))
```

## Security Notes

- Mapbox token is stored in environment variables
- Token is never logged in telemetry data
- API calls use HTTPS only
- No sensitive user data is sent to Mapbox

## Troubleshooting

### Common Issues

1. **No Suggestions Appearing**
   - Check if `MAPBOX_TOKEN` is set in `.env`
   - Verify `MAPBOX_CONFIG.enabled` is `true`
   - Check network connectivity

2. **Wrong City/State IDs**
   - Verify local database has matching city/state names
   - Check `AddressMappingService` logic for your data structure

3. **Performance Issues**
   - Increase `debounceMs` if too many requests
   - Decrease `maxResults` for faster rendering
   - Check `timeout` setting for slow connections

### Debug Mode

Enable debug panel in development to see:
- Real-time API requests and responses
- Mapping success/failure rates
- Performance metrics and error details

### Support

For issues with this integration, check:
1. Debug panel logs (development mode)
2. Network tab in development tools
3. Console errors and warnings
4. Mapbox API documentation for reference
