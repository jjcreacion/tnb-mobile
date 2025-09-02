import React from 'react'
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { addressStyles } from './styles'
import { AddressFormData, ScreenType } from './types'

interface AddressFormProps {
  formData: AddressFormData
  onFormDataChange: React.Dispatch<React.SetStateAction<AddressFormData>>
  onNavigateToScreen: (screen: ScreenType) => void
  onSaveAddress: () => void
}

export const AddressForm: React.FC<AddressFormProps> = ({
  formData,
  onFormDataChange,
  onNavigateToScreen,
  onSaveAddress,
}) => {
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
        onChangeText={(text) =>
          onFormDataChange((prev) => ({ ...prev, address: text }))
        }
      />

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
}
