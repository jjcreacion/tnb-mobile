import React from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { addressStyles } from './styles'
import { Address } from './types'

interface AddressListProps {
  addresses: Address[]
  primaryAddress: Address | null
  onAddressSelect: (address: Address) => void
  onAddNewAddress: () => void
}

export const AddressList: React.FC<AddressListProps> = ({
  addresses,
  primaryAddress,
  onAddressSelect,
  onAddNewAddress,
}) => {
  return (
    <ScrollView 
      style={addressStyles.addressList}
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {addresses.length > 0 ? (
        addresses
          .sort((a, b) => b.isPrimary - a.isPrimary)
          .map((address: Address) => (
            <TouchableOpacity
              key={address.pkAddress}
              style={[
                addressStyles.addressItem,
                address.pkAddress === primaryAddress?.pkAddress &&
                  addressStyles.selectedAddressItem,
              ]}
              onPress={() => onAddressSelect(address)}
            >
              <View style={addressStyles.addressIconContainer}>
                <Icon
                  name="home"
                  size={24}
                  color={
                    address.pkAddress === primaryAddress?.pkAddress
                      ? '#4CAF50'
                      : '#666'
                  }
                />
              </View>
              <View style={addressStyles.addressTextContainer}>
                <Text style={addressStyles.addressText}>{address.address}</Text>
                {address.isPrimary === 1 && (
                  <Text style={addressStyles.addressSubText}>
                    Primary Address
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))
      ) : (
        <View style={addressStyles.emptyAddressContainer}>
          <Icon name="location-off" size={48} color="#ccc" />
          <Text style={addressStyles.emptyAddressTitle}>No addresses found</Text>
          <Text style={addressStyles.emptyAddressMessage}>
            You haven't added any property addresses yet. Add your first
            address to get started with our services.
          </Text>
        </View>
      )}

      <TouchableOpacity 
        style={addressStyles.addAddressButton}
        onPress={onAddNewAddress}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon name="add" size={24} color="#007AFF" />
        <Text style={addressStyles.addAddressText}>
          Add a new property address
        </Text>
      </TouchableOpacity>
    </ScrollView>
  )
}
