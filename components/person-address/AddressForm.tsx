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
  onEntitiesUpdated?: (createdEntities: { state?: State; city?: City }) => void
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
  onEntitiesUpdated,
}, ref) => {
  const zipCodeRef = useRef<TextInput>(null)
  const addressLine2Ref = useRef<TextInput>(null)
  const scrollViewRef = useRef<ScrollView>(null)
  const [useManualEntry, setUseManualEntry] = useState(false)
  const [mappingWarnings, setMappingWarnings] = useState<string[]>([])
  const [scrollEnabled, setScrollEnabled] = useState(true)

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
  const handleAddressSelect = async (mapboxAddress: ParsedMapboxAddress, selectedText: string) => {
    if (MAPBOX_CONFIG.enabled && !MAPBOX_CONFIG.useLocalDatabaseMapping) {
      // When Mapbox is enabled WITHOUT local DB mapping, use Mapbox data directly
      const directFormData: AddressFormData = {
        address: selectedText, // Use the exact text that was selected from the suggestion
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
      

    } else {
      // When Mapbox is disabled OR local DB mapping is enabled, use local database mapping with auto-creation
      try {
        const mappingResult = await AddressMappingService.mapToFormDataWithAutoCreation(mapboxAddress, cities, states)

        // Update form with mapped data but use the selected text for the address field
        const formDataWithSelectedText = {
          ...mappingResult.formData,
          address: selectedText // Use the exact text that was selected from the suggestion
        }
        onFormDataChange(formDataWithSelectedText)

        // Store warnings for user feedback (should be minimal with auto-creation)
        setMappingWarnings(mappingResult.warnings)

        // Update local cache if new entities were created
        if (mappingResult.createdEntities && onEntitiesUpdated) {
          onEntitiesUpdated(mappingResult.createdEntities)
        }

        // With auto-creation, mapping should be complete most of the time
      } catch (error) {
        console.error('Auto-creation mapping failed:', error)
        // Fallback to original mapping
        const mappingResult = AddressMappingService.mapToFormData(mapboxAddress, cities, states)
        const formDataWithSelectedText = {
          ...mappingResult.formData,
          address: selectedText
        }
        onFormDataChange(formDataWithSelectedText)
        setMappingWarnings(mappingResult.warnings)
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

  // Validation function to check if all required fields are filled
  const isFormValid = () => {
    return (
      formData.address.trim() !== '' &&
      formData.city.trim() !== '' &&
      formData.state.trim() !== '' &&
      formData.zipCode.trim() !== ''
    )
  }

  return (
    <View style={addressStyles.newAddressFormContainer}>
      <ScrollView
        ref={scrollViewRef}
        style={addressStyles.newAddressForm}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
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
          addressLine2Ref={addressLine2Ref}
          addressLine2Value={formData.addressLine2}
          onScrollEnabledChange={setScrollEnabled}
        />
      ) : (
        <TextInput
          style={addressStyles.formInput}
          placeholder="e.g 108 Jackson St"
          value={formData.address}
          onChangeText={handleManualAddressChange}
        />
      )}

      {/* Show mapping warnings if any (should be rare with auto-creation) */}
      {mappingWarnings.length > 0 && (
        <View style={addressStyles.warningContainer}>
          <Text style={addressStyles.warningText}>
            Note: Please verify address details
          </Text>
          {mappingWarnings.map((warning, index) => (
            <Text key={index} style={addressStyles.warningDetailText}>
              • {warning}
            </Text>
          ))}
        </View>
      )}

      <TextInput
        ref={addressLine2Ref}
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
          style={[
            addressStyles.saveAddressButton,
            !isFormValid() && addressStyles.saveAddressButtonDisabled
          ]}
          onPress={isFormValid() ? onSaveAddress : undefined}
          activeOpacity={isFormValid() ? 0.7 : 1}
          disabled={!isFormValid()}
        >
          <Text
            style={[
              addressStyles.saveAddressButtonText,
              !isFormValid() && addressStyles.saveAddressButtonTextDisabled
            ]}
          >
            Save Address
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
})

AddressForm.displayName = 'AddressForm'
