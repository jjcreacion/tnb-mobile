import React, { useEffect, useState } from 'react'
import { ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native'
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

export const EditAddressForm: React.FC<EditAddressFormProps> = ({
  address,
  countries,
  cities,
  states,
  formData: externalFormData,
  onFormDataChange,
  onNavigateToScreen,
  onUpdateAddress,
  onCancel,
}) => {
  const [formData, setFormData] = useState<AddressFormData>(externalFormData)
  const [isPrimary, setIsPrimary] = useState(address.isPrimary === 1)

  // Sync with external form data changes (from city/state selectors)
  useEffect(() => {
    setFormData(externalFormData)
  }, [externalFormData])

  useEffect(() => {
    // Inicializar datos del formulario con la información de la dirección
    if (address.city && cities.length > 0) {
      const cityData = cities.find(c => c.pkCity === address.city)
      if (cityData) {
        setFormData(prev => ({
          ...prev,
          city: cityData.name,
          cityId: cityData.pkCity
        }))
      }
    }

    if (address.state && states.length > 0) {
      const stateData = states.find(s => s.pkState === address.state)
      if (stateData) {
        setFormData(prev => ({
          ...prev,
          state: stateData.name,
          stateId: stateData.pkState
        }))
      }
    }
  }, [address, cities, states])

  useEffect(() => {
    onFormDataChange(formData)
  }, [formData, onFormDataChange])

  const handleUpdate = () => {
    const isPrimaryChanged = isPrimary !== (address.isPrimary === 1)
    onUpdateAddress(isPrimaryChanged)
  }

  const handleFormChange = (field: keyof AddressFormData, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <ScrollView
      style={addressStyles.newAddressForm}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={addressStyles.formLabel}>Address</Text>
      <TextInput
        style={addressStyles.formInput}
        placeholder="e.g 108 Jackson St"
        value={formData.address}
        onChangeText={(text) => handleFormChange('address', text)}
      />

      <TextInput
        style={[addressStyles.formInput, addressStyles.formInputSecondary]}
        placeholder="Apt, suite, unit, building, floor, etc."
        value={formData.addressLine2}
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
            style={addressStyles.formInput}
            placeholder="e.g 12345"
            value={formData.zipCode}
            onChangeText={(text) => handleFormChange('zipCode', text)}
            keyboardType="default"
            maxLength={10}
          />
        </View>
      </View>

      <View style={addressStyles.primarySwitchContainer}>
        <Text style={addressStyles.formLabel}>Primary Address</Text>
        <Switch
          value={isPrimary}
          onValueChange={setIsPrimary}
          trackColor={{ false: '#e0e0e0', true: '#4CAF50' }}
          thumbColor={isPrimary ? '#fff' : '#fff'}
          ios_backgroundColor="#e0e0e0"
        />
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
  )
}
