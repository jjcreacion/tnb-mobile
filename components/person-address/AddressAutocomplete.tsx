/**
 * AddressAutocomplete Component
 * Provides address autocomplete functionality using Mapbox Search API
 */

import debounce from 'lodash.debounce'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import type { AddressAutocompleteSuggestion, MapboxError, ParsedMapboxAddress } from './mapbox'
import { MAPBOX_CONFIG, isMapboxAvailable, mapboxSearchService } from './mapbox'
import { addressStyles } from './styles'

interface AddressAutocompleteProps {
  value: string
  onChangeText: (text: string) => void
  onAddressSelect: (address: ParsedMapboxAddress) => void
  onFallbackToManual: () => void
  placeholder?: string
  disabled?: boolean
  style?: any
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChangeText,
  onAddressSelect,
  onFallbackToManual,
  placeholder = "Start typing an address...",
  disabled = false,
  style
}) => {
  const [suggestions, setSuggestions] = useState<AddressAutocompleteSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const textInputRef = useRef<TextInput>(null)
  const isMounted = useRef(true)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!isMounted.current || query.length < MAPBOX_CONFIG.minChars) {
        setSuggestions([])
        setIsLoading(false)
        setHasSearched(false)
        return
      }

      try {
        setError(null)
        const results = await mapboxSearchService.searchAddresses(query)
        
        if (isMounted.current) {
          setSuggestions(results)
          setShowSuggestions(true)
          setHasSearched(true)
          
          // 🔍 DEBUG: Log how many suggestions are being set for display
          console.log(`🎨 [AddressAutocomplete] Setting ${results.length} suggestions for display`)
        }
      } catch (err) {
        if (isMounted.current) {
          const mapboxError = err as MapboxError
          
          // Handle timeout errors more gracefully
          if (mapboxError.isTimeoutError) {
            // For timeout errors, just clear suggestions and allow manual entry
            // Don't show a red error message as timeouts are common
            setError(null)
            console.log('🕐 [AddressAutocomplete] Search timed out, allowing manual entry')
          } else {
            // For other errors, show the error message
            setError(mapboxError.message)
            console.warn('❌ [AddressAutocomplete] Search failed:', mapboxError.message)
          }
          
          setSuggestions([])
          setHasSearched(true)
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false)
        }
      }
    }, MAPBOX_CONFIG.debounceMs),
    []
  )

  // Handle text input changes
  const handleTextChange = (text: string) => {
    onChangeText(text)
    
    // Debug logging
    if (__DEV__) {
      console.log('🔍 [AddressAutocomplete] Text changed:', text)
      console.log('🔍 [AddressAutocomplete] Mapbox available:', isMapboxAvailable())
      console.log('🔍 [AddressAutocomplete] Config enabled:', MAPBOX_CONFIG.enabled)
    }
    
    if (!isMapboxAvailable()) {
      if (__DEV__) {
        console.log('🔍 [AddressAutocomplete] Mapbox not available, falling back to manual')
      }
      return // Fall back to manual input
    }

    if (text.length >= MAPBOX_CONFIG.minChars) {
      if (__DEV__) {
        console.log('🔍 [AddressAutocomplete] Starting search for:', text)
      }
      setIsLoading(true)
      setShowSuggestions(true)
      debouncedSearch(text)
    } else {
      setIsLoading(false)
      setShowSuggestions(false)
      setSuggestions([])
      setHasSearched(false)
      setError(null)
    }
  }

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: AddressAutocompleteSuggestion) => {
    // Update input value with selected address
    onChangeText(suggestion.displayText)
    
    // Hide suggestions
    setShowSuggestions(false)
    setSuggestions([])
    setHasSearched(false)
    
    // Dismiss keyboard
    Keyboard.dismiss()
    
    // Notify parent component
    onAddressSelect(suggestion.parsedAddress)

    // Log selection telemetry
    mapboxSearchService['logTelemetry']?.({
      timestamp: Date.now(),
      eventType: 'selection',
      selectedSuggestionIndex: suggestions.findIndex(s => s.id === suggestion.id),
      wasSuccessful: true
    })
  }

  // Handle manual entry fallback
  const handleManualEntry = () => {
    setShowSuggestions(false)
    setSuggestions([])
    setError(null)
    setHasSearched(false)
    onFallbackToManual()

    // Log fallback telemetry
    mapboxSearchService['logTelemetry']?.({
      timestamp: Date.now(),
      eventType: 'fallback',
      wasSuccessful: true
    })
  }

  // Hide suggestions when input loses focus
  const handleBlur = () => {
    // Small delay to allow suggestion selection
    setTimeout(() => {
      if (isMounted.current) {
        setShowSuggestions(false)
      }
    }, 150)
  }

  // Show suggestions when input gains focus
  const handleFocus = () => {
    if (suggestions.length > 0 && value.length >= MAPBOX_CONFIG.minChars) {
      setShowSuggestions(true)
    }
  }

  // Render suggestion item
  const renderSuggestion = ({ item }: { item: AddressAutocompleteSuggestion }) => (
    <TouchableOpacity
      style={addressStyles.suggestionItem}
      onPress={() => handleSuggestionSelect(item)}
      activeOpacity={0.7}
    >
      <View style={addressStyles.suggestionContent}>
        <Icon name="location-on" size={20} color="#666" style={addressStyles.suggestionIcon} />
        <View style={addressStyles.suggestionText}>
          <Text style={addressStyles.suggestionPrimary} numberOfLines={1}>
            {item.displayText}
          </Text>
          {item.secondaryText && (
            <Text style={addressStyles.suggestionSecondary} numberOfLines={1}>
              {item.secondaryText}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )

  // Don't render autocomplete if Mapbox is not available
  if (!isMapboxAvailable()) {
    return (
      <TextInput
        ref={textInputRef}
        style={[addressStyles.formInput, style]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        editable={!disabled}
        autoCapitalize="words"
        autoCorrect={false}
        autoComplete="street-address"
      />
    )
  }

  return (
    <View style={addressStyles.autocompleteContainer}>
      {/* Text Input */}
      <View style={addressStyles.autocompleteInputContainer}>
        <TextInput
          ref={textInputRef}
          style={[addressStyles.formInput, style]}
          placeholder={placeholder}
          value={value}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          autoCapitalize="words"
          autoCorrect={false}
          autoComplete="street-address"
        />
        
        {/* Loading indicator */}
        {isLoading && (
          <View style={addressStyles.autocompleteIndicator}>
            <ActivityIndicator size="small" color="#007AFF" />
          </View>
        )}
        
        {/* Manual entry button */}
        {value.length >= MAPBOX_CONFIG.minChars && (hasSearched || error) && (
          <TouchableOpacity
            style={addressStyles.manualEntryButton}
            onPress={handleManualEntry}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="edit" size={20} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Suggestions List */}
      {showSuggestions && (
        <View style={addressStyles.suggestionsContainer}>
          {error ? (
            <View style={addressStyles.errorContainer}>
              <Icon name="error-outline" size={20} color="#FF6B6B" />
              <Text style={addressStyles.errorText}>{error}</Text>
              <TouchableOpacity onPress={handleManualEntry} style={addressStyles.errorRetryButton}>
                <Text style={addressStyles.errorRetryText}>Enter manually</Text>
              </TouchableOpacity>
            </View>
          ) : suggestions.length > 0 ? (
            <FlatList
              data={suggestions}
              keyExtractor={(item) => item.id}
              renderItem={renderSuggestion}
              style={addressStyles.suggestionsList}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
              nestedScrollEnabled={true}
              scrollEnabled={false}
            />
          ) : hasSearched && !isLoading ? (
            <View style={addressStyles.noResultsContainer}>
              <Icon name="search-off" size={20} color="#999" />
              <Text style={addressStyles.noResultsText}>No addresses found</Text>
              <TouchableOpacity onPress={handleManualEntry} style={addressStyles.noResultsButton}>
                <Text style={addressStyles.noResultsButtonText}>Enter manually</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      )}
    </View>
  )
}
