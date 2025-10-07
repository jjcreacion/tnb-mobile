import React, { memo } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import type { Address } from '@/types'
import { styles } from './styles'

interface AddressSelectorProps {
  primaryAddress: Address | null
  addressCount: number
  onPress: () => void
}

export const AddressSelector = memo<AddressSelectorProps>(
  ({ primaryAddress, addressCount, onPress }) => {
    const getAddressText = () => {
      if (primaryAddress) {
        return primaryAddress.address
      }
      if (addressCount > 0) {
        return 'Select your primary address'
      }
      return 'No address added yet'
    }

    const getSubText = () => {
      if (primaryAddress) {
        return 'Tap to change address'
      }
      if (addressCount > 0) {
        return `${addressCount} address${addressCount > 1 ? 'es' : ''} available`
      }
      return 'Tap to add your address'
    }

    return (
      <>
        <View style={styles.addressSectionHeader}>
          <Text style={styles.sectionTitle}>Service Address</Text>
        </View>
        <TouchableOpacity style={styles.addressSection} onPress={onPress}>
          <Icon name="home" size={24} color="#ea0e08" />
          <View style={styles.addressTextSection}>
            <Text style={styles.addressText}>{getAddressText()}</Text>
            <Text style={styles.addressSubText}>{getSubText()}</Text>
          </View>
          <Icon name="keyboard-arrow-down" size={24} color="#666" />
        </TouchableOpacity>
      </>
    )
  }
)

AddressSelector.displayName = 'AddressSelector'
