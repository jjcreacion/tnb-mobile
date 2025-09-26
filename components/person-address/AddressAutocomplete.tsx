import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  ScrollView,
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
  onAddressSelect: (address: ParsedMapboxAddress, selectedText: string) => void
  onFallbackToManual: () => void
  placeholder?: string
  disabled?: boolean
  style?: any
  addressLine2Ref?: React.RefObject<TextInput | null>
  addressLine2Value?: string
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChangeText,
  onAddressSelect,
  onFallbackToManual,
  placeholder = "Start typing an address...",
  disabled = false,
  style,
  addressLine2Ref,
  addressLine2Value = '',
}) => {
  const [suggestions, setSuggestions] = useState<AddressAutocompleteSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [hasCompletedSelection, setHasCompletedSelection] = useState(false)
  const [selectedValue, setSelectedValue] = useState<string>('')
  const [isSelectionInProgress, setIsSelectionInProgress] = useState(false)
  const [internalValue, setInternalValue] = useState<string>(value)

  const textInputRef = useRef<TextInput>(null)
  const isMounted = useRef(true)
  const debounceTimerRef = useRef<number | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
    }
  }, [])

  // Sync external value with internal value
  useEffect(() => {
    if (value !== internalValue && !isSelectionInProgress) {
      setInternalValue(value)
    }
  }, [value, internalValue, isSelectionInProgress])

  // Reset selection state when value is cleared externally
  useEffect(() => {
    if (internalValue === '' && (hasCompletedSelection || selectedValue !== '')) {
      setHasCompletedSelection(false)
      setSelectedValue('')
      setIsSelectionInProgress(false)
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [internalValue, hasCompletedSelection, selectedValue])

  // Debounced search function
  const searchAddresses = useCallback(async (query: string) => {
    if (!isMounted.current || query.length < MAPBOX_CONFIG.minChars) {
      setSuggestions([])
      setIsLoading(false)
      setHasSearched(false)
      return
    }

    // Don't search if we have a completed selection with the same value or selection is in progress
    if ((hasCompletedSelection && query === selectedValue) || isSelectionInProgress) {
      setIsLoading(false)
      return
    }

    try {
      setError(null)
      const results = await mapboxSearchService.searchAddresses(query)
      
      if (isMounted.current) {
        setSuggestions(results)
        setShowSuggestions(true)
        setHasSearched(true)
      }
    } catch (err) {
      if (isMounted.current) {
        const mapboxError = err as MapboxError
        
        // Handle timeout errors more gracefully
        if (mapboxError.isTimeoutError) {
          // For timeout errors, just clear suggestions and allow manual entry
          // Don't show a red error message as timeouts are common
          setError(null)
        } else {
          // For other errors, show the error message
          setError(mapboxError.message)
        }
        
        setSuggestions([])
        setHasSearched(true)
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false)
      }
    }
  // }, [hasCompletedSelection, selectedValue, isSelectionInProgress])
  }, [hasCompletedSelection, selectedValue, isSelectionInProgress])

  const debouncedSearch = useCallback((query: string) => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      searchAddresses(query)
    }, MAPBOX_CONFIG.debounceMs)
  }, [searchAddresses])

  // Handle text input changes
  const handleTextChange = (text: string) => {
    // Update internal value immediately for responsive UI
    setInternalValue(text)

    // Notify parent component of the change
    onChangeText(text)

    // Don't process if selection is currently in progress
    if (isSelectionInProgress) {
      return
    }

    // Reset selection state if text is manually changed after a selection
    // Add small delay on iOS to prevent race condition with external value updates
    if (hasCompletedSelection && text !== selectedValue) {
      if (Platform.OS === 'ios') {
        setTimeout(() => {
          if (internalValue !== selectedValue) {
            setHasCompletedSelection(false)
            setSelectedValue('')
          }
        }, 50)
      } else {
        setHasCompletedSelection(false)
        setSelectedValue('')
      }
    }

    if (!isMapboxAvailable()) {
      return // Fall back to manual input
    }

    // Don't search if this is the same value as a completed selection
    if (hasCompletedSelection && text === selectedValue) {
      setShowSuggestions(false)
      return
    }

    if (text.length >= MAPBOX_CONFIG.minChars) {
      setIsLoading(true)
      setShowSuggestions(true)
      debouncedSearch(text)
    } else {
      setIsLoading(false)
      setShowSuggestions(false)
      setSuggestions([])
      setHasSearched(false)
      setError(null)
      setHasCompletedSelection(false)
      setSelectedValue('')
      setIsSelectionInProgress(false)
    }
  }

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: AddressAutocompleteSuggestion) => {
    const selectedText = suggestion.displayText

    // Immediately mark selection in progress to prevent race conditions
    setIsSelectionInProgress(true)

    // Cancel any pending debounced search immediately
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }

    // Hide suggestions and clear search state immediately
    setShowSuggestions(false)
    setSuggestions([])
    setHasSearched(false)
    setIsLoading(false)
    setError(null)

    // Mark selection as completed and set selected value
    setHasCompletedSelection(true)
    setSelectedValue(selectedText)

    // Update internal value immediately to show in input
    setInternalValue(selectedText)

    // Force TextInput update on iOS using setNativeProps
    if (Platform.OS === 'ios' && textInputRef.current) {
      textInputRef.current.setNativeProps({ text: selectedText })
    }

    // Dismiss keyboard
    Keyboard.dismiss()

    // Notify parent component with both the parsed address and the selected text
    onAddressSelect(suggestion.parsedAddress, selectedText)

    // Clear selection in progress flag after a short delay to allow state settling
    // Use longer delay on iOS to prevent race conditions with state updates
    const selectionDelay = Platform.OS === 'ios' ? 200 : 100
    setTimeout(() => {
      setIsSelectionInProgress(false)
    }, selectionDelay)

    // Log selection telemetry
    mapboxSearchService['logTelemetry']?.({
      timestamp: Date.now(),
      eventType: 'selection',
      selectedSuggestionIndex: suggestions.findIndex(s => s.id === suggestion.id),
      wasSuccessful: true
    })

    // Focus Address Line 2 if ref provided and position cursor at end of existing text
    if (addressLine2Ref && addressLine2Ref.current) {
      setTimeout(() => {
        const addressLine2Input = addressLine2Ref.current
        if (addressLine2Input) {
          addressLine2Input.focus()

          // Position cursor at the end of existing text
          if (addressLine2Value.length > 0) {
            // Use setSelection to position cursor at end of text
            addressLine2Input.setSelection(addressLine2Value.length, addressLine2Value.length)
          }
        }
      }, 300)
    }
  }

  // Handle manual entry fallback
  const handleManualEntry = () => {
    setShowSuggestions(false)
    setSuggestions([])
    setError(null)
    setHasSearched(false)
    setHasCompletedSelection(false)
    setSelectedValue('')
    setIsSelectionInProgress(false)
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
    // Don't hide suggestions if selection is in progress
    if (isSelectionInProgress) {
      return
    }

    // Small delay to allow suggestion selection
    setTimeout(() => {
      if (isMounted.current && !isSelectionInProgress) {
        setShowSuggestions(false)
      }
    }, 200) // Increased delay slightly for better UX
  }

  // Show suggestions when input gains focus
  const handleFocus = () => {
    // Don't show suggestions if selection is in progress
    if (isSelectionInProgress) {
      return
    }

    // Don't show suggestions if we have a completed selection with the same value
    if (hasCompletedSelection && internalValue === selectedValue) {
      return
    }

    // Only show existing suggestions if we have them and haven't completed a selection
    if (suggestions.length > 0 && internalValue.length >= MAPBOX_CONFIG.minChars && !hasCompletedSelection && !isSelectionInProgress) {
      setShowSuggestions(true)
    }
  }

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
          style={[addressStyles.formInput, { flex: 1 }, style]}
          placeholder={placeholder}
          value={internalValue}
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
        {internalValue.length >= MAPBOX_CONFIG.minChars && (hasSearched || error) && (
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
            <ScrollView
              style={addressStyles.suggestionsList}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              bounces={true}
              nestedScrollEnabled={true}
            >
              {suggestions.map((item) => (
                <TouchableOpacity
                  key={item.id}
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
              ))}
            </ScrollView>
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
