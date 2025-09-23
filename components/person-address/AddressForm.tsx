import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { AddressAutocomplete } from './AddressAutocomplete'
import { AddressMappingService } from './AddressMappingService'
import type { ParsedMapboxAddress } from './mapbox'
import { isMapboxAvailable, MAPBOX_CONFIG } from './mapbox'
import { addressStyles } from './styles'
import { AddressFormData, City, ScreenType, State } from './types'

interface AddressFormProps {
  formData: AddressFormData
  onFormDataChange: React.Dispatch<React.SetStateAction<AddressFormData>>
  onNavigateToScreen: (screen: ScreenType) => void
  onSaveAddress: () => void
  cities?: City[]
  states?: State[]
}

export interface AddressFormRef {
  focusZipCode: () => void
}

export const AddressForm = forwardRef<AddressFormRef, AddressFormProps>(({
  formData,
  onFormDataChange,
  onNavigateToScreen,
  onSaveAddress,
  cities = [],
  states = [],
}, ref) => {
  const zipCodeRef = useRef<TextInput>(null)
  const [useManualEntry, setUseManualEntry] = useState(false)
  const [mappingWarnings, setMappingWarnings] = useState<string[]>([])

  useImperativeHandle(ref, () => ({
    focusZipCode: () => {
      zipCodeRef.current?.focus()
    }
  }), [])

  // Force TextInput to clear on iOS when form data is reset
  useEffect(() => {
    if (Platform.OS === 'ios' && formData.zipCode === '' && zipCodeRef.current) {
      // Force the TextInput to clear its internal state
      zipCodeRef.current.setNativeProps({ text: '' })
    }
  }, [formData.zipCode])

  // Handle Mapbox address selection
  const handleAddressSelect = (mapboxAddress: ParsedMapboxAddress) => {
    if (MAPBOX_CONFIG.enabled && !MAPBOX_CONFIG.useLocalDatabaseMapping) {
      // When Mapbox is enabled WITHOUT local DB mapping, use Mapbox data directly
      const directFormData: AddressFormData = {
        address: mapboxAddress.houseNumber && mapboxAddress.street 
          ? `${mapboxAddress.houseNumber} ${mapboxAddress.street}`
          : mapboxAddress.street || mapboxAddress.fullAddress,
        addressLine2: '',
        city: mapboxAddress.city || '',
        cityId: null, // Don't map to local DB when useLocalDatabaseMapping is false
        state: mapboxAddress.stateCode || mapboxAddress.state || '', // Use state code (abbreviation) first
        stateId: null, // Don't map to local DB when useLocalDatabaseMapping is false
        zipCode: mapboxAddress.zipCode || '',
        latitude: mapboxAddress.latitude,
        longitude: mapboxAddress.longitude,
        isMapboxResult: true
      }
      
      // Update form with Mapbox data directly
      onFormDataChange(directFormData)
      
      // Clear any existing warnings since we're not doing local mapping
      setMappingWarnings([])
      
      console.log('✅ [AddressForm] Using Mapbox data directly (no local mapping):', {
        ...directFormData,
        debug: {
          originalState: mapboxAddress.state,
          usedStateCode: mapboxAddress.stateCode,
          finalState: directFormData.state
        }
      })
    } else {
      // When Mapbox is disabled OR local DB mapping is enabled, use local database mapping
      const mappingResult = AddressMappingService.mapToFormData(mapboxAddress, cities, states)
      
      // Update form with mapped data
      onFormDataChange(mappingResult.formData)
      
      // Store warnings for user feedback
      setMappingWarnings(mappingResult.warnings)
      
      // 🔍 DEBUG: Log mapping warnings for debugging
      if (mappingResult.warnings.length > 0) {
        console.log('🚨 [AddressForm] MAPPING WARNINGS:', mappingResult.warnings)
      }
      
      // If mapping is incomplete, provide feedback but don't force manual mode
      if (!mappingResult.isComplete) {
        console.warn('Incomplete address mapping:', mappingResult.missingFields)
      }
    }
  }

  // Handle fallback to manual entry
  const handleFallbackToManual = () => {
    setUseManualEntry(true)
    setMappingWarnings([])
    // Keep current address text but clear Mapbox-specific data
    onFormDataChange(prev => ({
      ...prev,
      latitude: undefined,
      longitude: undefined,
      isMapboxResult: false
    }))
  }

  // Handle manual address text changes
  const handleManualAddressChange = (text: string) => {
    onFormDataChange(prev => ({ 
      ...prev, 
      address: text,
      latitude: undefined,
      longitude: undefined,
      isMapboxResult: false
    }))
  }

  // Reset to autocomplete when address is cleared
  useEffect(() => {
    if (formData.address === '' && useManualEntry) {
      setUseManualEntry(false)
      setMappingWarnings([])
    }
  }, [formData.address, useManualEntry])

  return (
    <ScrollView
      style={addressStyles.newAddressForm}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={addressStyles.formLabel}>Address</Text>
      
      {/* Address Input - Use autocomplete if available and not in manual mode */}
      {isMapboxAvailable() && !useManualEntry ? (
        <AddressAutocomplete
          value={formData.address}
          onChangeText={handleManualAddressChange}
          onAddressSelect={handleAddressSelect}
          onFallbackToManual={handleFallbackToManual}
          placeholder="e.g 108 Jackson St"
          style={addressStyles.formInput}
        />
      ) : (
        <TextInput
          style={addressStyles.formInput}
          placeholder="e.g 108 Jackson St"
          value={formData.address}
          onChangeText={handleManualAddressChange}
        />
      )}

      {/* Show mapping warnings if any */}
      {mappingWarnings.length > 0 && (
        <View style={addressStyles.warningContainer}>
          <Text style={addressStyles.warningText}>
            Note: Some address details need verification
          </Text>
          {__DEV__ && (
            <Text style={[addressStyles.warningText, { fontSize: 12, fontStyle: 'italic' }]}>
              Debug: {mappingWarnings.join('; ')}
            </Text>
          )}
        </View>
      )}

      <TextInput
        style={[addressStyles.formInput, addressStyles.formInputSecondary]}
        placeholder="Apt, suite, unit, building, floor, etc."
        value={formData.addressLine2}
        onChangeText={(text) =>
          onFormDataChange((prev) => ({ ...prev, addressLine2: text }))
        }
      />

      <Text style={addressStyles.formLabel}>City</Text>
      <TouchableOpacity
        style={addressStyles.formInput}
        onPress={() => onNavigateToScreen('city')}
        activeOpacity={0.7}
        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
      >
        <Text
          style={[
            addressStyles.formInputText,
            !formData.city && addressStyles.placeholderText,
          ]}
        >
          {formData.city || 'e.g Jacksonville'}
        </Text>
      </TouchableOpacity>

      <View style={addressStyles.formRow}>
        <View style={addressStyles.formColumn}>
          <Text style={addressStyles.formLabel}>State</Text>
          <TouchableOpacity
            style={addressStyles.formInput}
            onPress={() => onNavigateToScreen('state')}
            activeOpacity={0.7}
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          >
            <Text
              style={[
                addressStyles.formInputText,
                !formData.state && addressStyles.placeholderText,
              ]}
            >
              {formData.state || 'e.g FL'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={addressStyles.formColumn}>
          <Text style={addressStyles.formLabel}>Zip Code</Text>
          <TextInput
            key={Platform.OS === 'ios' ? `zipCode-reset-${formData.address === '' && formData.zipCode === ''}` : undefined}
            ref={zipCodeRef}
            style={addressStyles.formInput}
            placeholder="e.g 12345"
            value={formData.zipCode}
            onChangeText={(text) =>
              onFormDataChange((prev) => ({ ...prev, zipCode: text }))
            }
            keyboardType="default"
            maxLength={10}
          />
        </View>
      </View>

      <TouchableOpacity
        style={addressStyles.saveAddressButton}
        onPress={onSaveAddress}
        activeOpacity={0.7}
      >
        <Text style={addressStyles.saveAddressButtonText}>Save Address</Text>
      </TouchableOpacity>
    </ScrollView>
  )
})
