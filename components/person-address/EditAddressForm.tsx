import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { AddressAutocomplete } from './AddressAutocomplete'
import { AddressMappingService } from './AddressMappingService'
import type { ParsedMapboxAddress } from './mapbox'
import { isMapboxAvailable, MAPBOX_CONFIG } from './mapbox'
import { addressStyles } from './styles'
import { Address, AddressFormData, City, Country, ScreenType, State } from './types'

interface EditAddressFormProps {
  address: Address
  countries: Country[]
  cities: City[]
  states: State[]
  formData: AddressFormData
  onFormDataChange: React.Dispatch<React.SetStateAction<AddressFormData>>
  onNavigateToScreen: (screen: ScreenType) => void
  onUpdateAddress: (isPrimaryChanged?: boolean) => void
  onCancel: () => void
}

export interface EditAddressFormRef {
  focusZipCode: () => void
}

export const EditAddressForm = forwardRef<EditAddressFormRef, EditAddressFormProps>(({
  address,
  countries,
  cities,
  states,
  formData: externalFormData,
  onFormDataChange,
  onNavigateToScreen,
  onUpdateAddress,
  onCancel,
}, ref) => {
  const hasInitialized = useRef(false)
  const zipCodeRef = useRef<TextInput>(null)
  const [useManualEntry, setUseManualEntry] = useState(false)
  const [mappingWarnings, setMappingWarnings] = useState<string[]>([])

  useImperativeHandle(ref, () => ({
    focusZipCode: () => {
      zipCodeRef.current?.focus()
    }
  }), [])

  // Initialize form data with address data when component mounts or address changes
  useEffect(() => {
    // Reset initialization flag when address changes
    if (address.pkAddress) {
      hasInitialized.current = false
    }
  }, [address.pkAddress])

  useEffect(() => {
    if (!hasInitialized.current && cities.length > 0 && states.length > 0 && address.pkAddress) {
      let initialData = {
        address: address.address || '',
        addressLine2: address.addressLine2 || '',
        city: '',
        cityId: address.city || null,
        state: '',
        stateId: address.state || null,
        zipCode: address.zipCode || '',
        latitude: address.latitude ? parseFloat(address.latitude) : undefined,
        longitude: address.longitude ? parseFloat(address.longitude) : undefined,
        isMapboxResult: false, // Existing addresses are not from Mapbox
      }

      // Find city name if cityId exists
      if (address.city && cities.length > 0) {
        const cityData = cities.find(c => c.pkCity === address.city)
        if (cityData) {
          initialData.city = cityData.name
        }
      }

      // Find state name if stateId exists
      if (address.state && states.length > 0) {
        const stateData = states.find(s => s.pkState === address.state)
        if (stateData) {
          initialData.state = stateData.internalCode
        }
      }

      onFormDataChange(initialData)
      hasInitialized.current = true
    }
  }, [address, cities, states, onFormDataChange])

  const handleUpdate = () => {
    // No longer checking for primary changes since we removed the primary switch
    onUpdateAddress(false)
  }

  const handleFormChange = (field: keyof AddressFormData, value: string | number | null) => {
    onFormDataChange(prev => {
      const updated = { ...prev, [field]: value }
      return updated
    })
  }

  // Handle Mapbox address selection
  const handleAddressSelect = (mapboxAddress: ParsedMapboxAddress) => {
    if (MAPBOX_CONFIG.enabled && !MAPBOX_CONFIG.useLocalDatabaseMapping) {
      // When Mapbox is enabled WITHOUT local DB mapping, use Mapbox data directly
      const directFormData: AddressFormData = {
        address: mapboxAddress.houseNumber && mapboxAddress.street 
          ? `${mapboxAddress.houseNumber} ${mapboxAddress.street}`
          : mapboxAddress.street || mapboxAddress.fullAddress,
        addressLine2: externalFormData.addressLine2, // Keep existing addressLine2
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
      // When Mapbox is disabled OR local DB mapping is enabled, use local database mapping
      const mappingResult = AddressMappingService.mapToFormData(mapboxAddress, cities, states)
      
      // Update form with mapped data
      onFormDataChange(mappingResult.formData)
      
      // Store warnings for user feedback
      setMappingWarnings(mappingResult.warnings)
      
      // If mapping is incomplete, provide feedback but don't force manual mode
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
    handleFormChange('address', text)
    // Clear Mapbox-specific data when manually editing
    onFormDataChange(prev => ({
      ...prev,
      latitude: undefined,
      longitude: undefined,
      isMapboxResult: false
    }))
  }

  // Reset to autocomplete when address is cleared
  useEffect(() => {
    if (externalFormData.address === '' && useManualEntry) {
      setUseManualEntry(false)
      setMappingWarnings([])
    }
  }, [externalFormData.address, useManualEntry])

  return (
    <View style={addressStyles.newAddressFormContainer}>
      <ScrollView
        style={addressStyles.newAddressForm}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      <Text style={addressStyles.formLabel}>Address</Text>
      
      {/* Address Input - Use autocomplete if available and not in manual mode */}
      {isMapboxAvailable() && !useManualEntry ? (
        <AddressAutocomplete
          value={externalFormData.address}
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
          value={externalFormData.address}
          onChangeText={handleManualAddressChange}
        />
      )}

      {/* Show mapping warnings if any */}
      {mappingWarnings.length > 0 && (
        <View style={addressStyles.warningContainer}>
          <Text style={addressStyles.warningText}>
            Note: Some address details need verification
          </Text>

        </View>
      )}

      <TextInput
        style={[addressStyles.formInput, addressStyles.formInputSecondary]}
        placeholder="Apt, suite, unit, building, floor, etc."
        value={externalFormData.addressLine2}
        onChangeText={(text) => handleFormChange('addressLine2', text)}
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
            !externalFormData.city && addressStyles.placeholderText,
          ]}
        >
          {externalFormData.city || 'e.g Jacksonville'}
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
                !externalFormData.state && addressStyles.placeholderText,
              ]}
            >
              {externalFormData.state || 'e.g FL'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={addressStyles.formColumn}>
          <Text style={addressStyles.formLabel}>Zip Code</Text>
          <TextInput
            ref={zipCodeRef}
            style={addressStyles.formInput}
            placeholder="e.g 12345"
            value={externalFormData.zipCode}
            onChangeText={(text) => handleFormChange('zipCode', text)}
            keyboardType="default"
            maxLength={10}
          />
        </View>
      </View>

      <View style={addressStyles.formButtonsContainer}>
        <TouchableOpacity
          style={[addressStyles.saveAddressButton, addressStyles.cancelButton]}
          onPress={onCancel}
          activeOpacity={0.7}
        >
          <Text style={[addressStyles.saveAddressButtonText, addressStyles.cancelButtonText]}>
            Cancel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[addressStyles.saveAddressButton, addressStyles.updateButton]}
          onPress={handleUpdate}
          activeOpacity={0.7}
        >
          <Text style={addressStyles.saveAddressButtonText}>Update Address</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </View>
  )
})

EditAddressForm.displayName = 'EditAddressForm'
