import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
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

export interface AddressAutocompleteProps {
  value: string
  onChangeText: (text: string) => void
  onAddressSelect: (address: ParsedMapboxAddress, selectedText: string) => void
  onFallbackToManual: () => void
  placeholder?: string
  disabled?: boolean
  style?: any
  addressLine2Ref?: React.RefObject<TextInput | null>
  addressLine2Value?: string
  onScrollEnabledChange?: (enabled: boolean) => void
  returnKeyType?: 'next' | 'done' | 'go'
  onSubmitEditing?: () => void
}

const AddressAutocompleteComponent = forwardRef<TextInput, AddressAutocompleteProps>(({
  value,
  onChangeText,
  onAddressSelect,
  onFallbackToManual,
  placeholder = "Start typing an address...",
  disabled = false,
  style,
  addressLine2Ref,
  addressLine2Value = '',
  onScrollEnabledChange,
  returnKeyType = 'next',
  onSubmitEditing,
}, ref) => {
  const [suggestions, setSuggestions] = useState<AddressAutocompleteSuggestion[]>([])
  const [allSuggestions, setAllSuggestions] = useState<AddressAutocompleteSuggestion[]>([])
  const [displayedCount, setDisplayedCount] = useState(5)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [hasCompletedSelection, setHasCompletedSelection] = useState(false)
  const [selectedValue, setSelectedValue] = useState<string>('')
  const [isSelectionInProgress, setIsSelectionInProgress] = useState(false)
  const [internalValue, setInternalValue] = useState<string>(value)
  const [isInputFocused, setIsInputFocused] = useState(false)

  const textInputRef = useRef<TextInput>(null)
  const isMounted = useRef(true)
  const debounceTimerRef = useRef<number | null>(null)
  const scrollViewRef = useRef<ScrollView>(null)
  const lastQueryRef = useRef<string>('')

  // Expose the TextInput ref to parent components
  useImperativeHandle(ref, () => textInputRef.current as TextInput)

  // Control parent scroll based on input focus and suggestions
  useEffect(() => {
    if (onScrollEnabledChange) {
      const shouldDisableScroll = isInputFocused && showSuggestions && suggestions.length > 0
      onScrollEnabledChange(!shouldDisableScroll)
    }
  }, [isInputFocused, showSuggestions, suggestions.length, onScrollEnabledChange])

  // Cleanup on unmount
  useEffect(() => {
    console.log('[AddressAutocomplete] Component mounted')
    return () => {
      console.log('[AddressAutocomplete] Component unmounting, clearing timer:', debounceTimerRef.current)
      isMounted.current = false
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
      // Re-enable parent scroll on unmount
      if (onScrollEnabledChange) {
        onScrollEnabledChange(true)
      }
    }
  }, [onScrollEnabledChange])

  // Sync external value with internal value
  useEffect(() => {
    console.log('[AddressAutocomplete] value changed:', value, 'internal:', internalValue)
    if (value !== internalValue && !isSelectionInProgress) {
      console.log('[AddressAutocomplete] Syncing external value to internal')
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
      setAllSuggestions([])
      setDisplayedCount(5)
      setShowSuggestions(false)
    }
  }, [internalValue, hasCompletedSelection, selectedValue])

  // Reset suggestions when query changes
  useEffect(() => {
    if (internalValue !== lastQueryRef.current && internalValue.length >= MAPBOX_CONFIG.minChars) {
      lastQueryRef.current = internalValue
      setDisplayedCount(5)
      setAllSuggestions([])
    }
  }, [internalValue])

  // Debounced search function - fetch up to 30 results but show only 5 initially
  const searchAddresses = useCallback(async (query: string) => {
    console.log('[AddressAutocomplete] searchAddresses called with query:', query)

    if (!isMounted.current || query.length < MAPBOX_CONFIG.minChars) {
      console.log('[AddressAutocomplete] Skipping search - mounted:', isMounted.current, 'query length:', query.length, 'minChars:', MAPBOX_CONFIG.minChars)
      setSuggestions([])
      setAllSuggestions([])
      setDisplayedCount(5)
      setIsLoading(false)
      setHasSearched(false)
      return
    }

    // Don't search if we have a completed selection with the same value or selection is in progress
    if ((hasCompletedSelection && query === selectedValue) || isSelectionInProgress) {
      console.log('[AddressAutocomplete] Skipping search - hasCompletedSelection:', hasCompletedSelection, 'isSelectionInProgress:', isSelectionInProgress)
      setIsLoading(false)
      return
    }

    console.log('[AddressAutocomplete] Starting Mapbox search for:', query)

    try {
      setError(null)
      // Request 30 results from API (we'll display 5 at a time)
      const results = await mapboxSearchService.searchAddresses(query, 30)

      console.log('[AddressAutocomplete] Received', results.length, 'results from Mapbox')

      if (isMounted.current) {
        console.log('[AddressAutocomplete] Updating UI with results')
        setAllSuggestions(results)
        setSuggestions(results.slice(0, 5))
        setDisplayedCount(5)
        setShowSuggestions(true)
        setHasSearched(true)
      }
    } catch (err) {
      console.log('[AddressAutocomplete] Error during search:', err)

      if (isMounted.current) {
        const mapboxError = err as MapboxError

        // Handle timeout errors more gracefully
        if (mapboxError.isTimeoutError) {
          console.log('[AddressAutocomplete] Timeout error - clearing error message')
          // For timeout errors, just clear suggestions and allow manual entry
          // Don't show a red error message as timeouts are common
          setError(null)
        } else {
          console.log('[AddressAutocomplete] Showing error:', mapboxError.message)
          // For other errors, show the error message
          setError(mapboxError.message)
        }

        setSuggestions([])
        setAllSuggestions([])
        setDisplayedCount(5)
        setHasSearched(true)
      }
    } finally {
      if (isMounted.current) {
        console.log('[AddressAutocomplete] Search complete, setting loading to false')
        setIsLoading(false)
      }
    }
  }, [hasCompletedSelection, selectedValue, isSelectionInProgress])

  const debouncedSearch = useCallback((query: string) => {
    console.log('[AddressAutocomplete] debouncedSearch called for:', query, '(debounce:', MAPBOX_CONFIG.debounceMs, 'ms)')

    // Clear existing timer
    if (debounceTimerRef.current) {
      console.log('[AddressAutocomplete] Clearing existing debounce timer:', debounceTimerRef.current)
      clearTimeout(debounceTimerRef.current)
    }

    // Set new timer
    const timerId = setTimeout(() => {
      console.log('[AddressAutocomplete] Debounce timer fired, calling searchAddresses')
      searchAddresses(query)
    }, MAPBOX_CONFIG.debounceMs) as unknown as number

    debounceTimerRef.current = timerId
    console.log('[AddressAutocomplete] Created new timer with ID:', timerId)
  }, [searchAddresses])

  // Load more suggestions when scrolling to the end
  const handleLoadMore = useCallback(() => {
    if (displayedCount >= allSuggestions.length || displayedCount >= 30) {
      return // Already showing all or reached max limit
    }

    const nextCount = Math.min(displayedCount + 5, allSuggestions.length, 30)
    setDisplayedCount(nextCount)
    setSuggestions(allSuggestions.slice(0, nextCount))
  }, [displayedCount, allSuggestions])

  // Handle scroll end event
  const handleScroll = useCallback((event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent
    const paddingToBottom = 20
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom

    if (isCloseToBottom) {
      handleLoadMore()
    }
  }, [handleLoadMore])

  // Handle text input changes
  const handleTextChange = (text: string) => {
    console.log('[AddressAutocomplete] handleTextChange called with text:', text)

    // Update internal value immediately for responsive UI
    setInternalValue(text)

    // Notify parent component of the change
    onChangeText(text)

    // Don't process if selection is currently in progress
    if (isSelectionInProgress) {
      console.log('[AddressAutocomplete] Selection in progress, skipping')
      return
    }

    // Reset selection state if text is manually changed after a selection
    // Add small delay on iOS to prevent race condition with external value updates
    if (hasCompletedSelection && text !== selectedValue) {
      console.log('[AddressAutocomplete] Resetting completed selection')
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
      console.log('[AddressAutocomplete] Mapbox not available, falling back to manual input')
      return // Fall back to manual input
    }

    // Don't search if this is the same value as a completed selection
    if (hasCompletedSelection && text === selectedValue) {
      console.log('[AddressAutocomplete] Same as completed selection, hiding suggestions')
      setShowSuggestions(false)
      return
    }

    if (text.length >= MAPBOX_CONFIG.minChars) {
      console.log('[AddressAutocomplete] Text length sufficient, starting search')
      setIsLoading(true)
      setShowSuggestions(true)
      debouncedSearch(text)
    } else {
      console.log('[AddressAutocomplete] Text too short, clearing suggestions')
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
    setIsInputFocused(false)

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
    setIsInputFocused(true)

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
        textContentType="fullStreetAddress"
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
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
          textContentType="fullStreetAddress"
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
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
              ref={scrollViewRef}
              style={addressStyles.suggestionsList}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              bounces={true}
              nestedScrollEnabled={true}
              onScroll={handleScroll}
              scrollEventThrottle={16}
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
              {displayedCount < allSuggestions.length && displayedCount < 30 && (
                <View style={addressStyles.loadingMoreContainer}>
                  <Text style={addressStyles.loadingMoreText}>
                    Showing {displayedCount} of {Math.min(allSuggestions.length, 30)} results
                  </Text>
                </View>
              )}
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
})

AddressAutocompleteComponent.displayName = 'AddressAutocomplete'

export const AddressAutocomplete = AddressAutocompleteComponent
