import React, { useCallback } from 'react'
import { Alert, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { RadioButton } from '../ui/RadioButton'
import { addressStyles } from './styles'
import { Address, City, State } from './types'

interface AddressListProps {
  addresses: Address[]
  primaryAddress: Address | null
  onAddressSelect: (address: Address) => void
  onAddNewAddress: () => void
  onEditAddress?: (address: Address) => void
  onDeleteAddress?: (address: Address) => void
  cities?: City[]
  states?: State[]
}

export const AddressList: React.FC<AddressListProps> = ({
  addresses,
  primaryAddress,
  onAddressSelect,
  onAddNewAddress,
  onEditAddress,
  onDeleteAddress,
  cities = [],
  states = [],
}) => {
  const handleAddressSelection = useCallback((address: Address) => {
    onAddressSelect(address)
  }, [onAddressSelect])
  
  const handleDeletePress = (address: Address) => {
    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete this address?\n\n${address.address}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeleteAddress?.(address),
        },
      ]
    )
  }

  const buildFullAddressDescription = (address: Address): string => {
    const parts: string[] = []
    
    // 1. address
    if (address.address) {
      parts.push(address.address.trim())
    }
    
    // 2. addressLine2
    if (address.addressLine2) {
      parts.push(address.addressLine2.trim())
    }
    
    // 3. City (buscar el nombre por ID)
    if (address.city && cities.length > 0) {
      const city = cities.find(c => c.pkCity === address.city)
      if (city) {
        parts.push(city.name.trim())
      }
    }
    
    // 4. State (buscar el nombre por ID)
    if (address.state && states.length > 0) {
      const state = states.find(s => s.pkState === address.state)
      if (state) {
        parts.push(state.internalCode.trim())
      }
    }
    
    // 5. zipCode
    if (address.zipCode) {
      parts.push(address.zipCode.trim())
    }
    
    return parts.join(', ')
  }

  // Only render addresses when we have complete data (or no addresses at all)
  const shouldRenderAddresses = addresses.length === 0 || (cities.length > 0 && states.length > 0)
  
  return (
    <ScrollView 
      style={addressStyles.addressList}
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {shouldRenderAddresses && addresses.length > 0 ? (
        addresses
          .sort((a, b) => {
            // Ordenar de forma descendente (más recientes primero)
            if (a.createdAt && b.createdAt) {
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            }
            // Si no hay createdAt, usar pkAddress como fallback (más altos primero)
            return b.pkAddress - a.pkAddress
          })
          .map((address: Address) => {
            const isSelected = address.pkAddress === primaryAddress?.pkAddress
            
            return (
            <Pressable
              key={address.pkAddress}
              style={({ pressed }) => [
                addressStyles.addressItem,
                isSelected && addressStyles.selectedAddressItem,
                !isSelected && pressed && { opacity: 0.7 },
              ]}
              onPress={() => handleAddressSelection(address)}
            >
              <View style={addressStyles.addressIconContainer}>
                <RadioButton
                  selected={isSelected}
                  size={24}
                  selectedColor="#4CAF50"
                  unselectedColor="#ccc"
                />
              </View>
              <View style={addressStyles.addressTextContainer}>
                <Text style={addressStyles.addressText}>
                  {buildFullAddressDescription(address)}
                </Text>
                {/* {address.isPrimary === 1 && (
                  <Text style={[addressStyles.addressSubText, { color: '#4CAF50', fontWeight: '600' }]}>
                    Primary Address
                  </Text>
                )} */}
              </View>
              <View style={addressStyles.addressActionsContainer}>
                {onEditAddress && (
                  <TouchableOpacity
                    style={addressStyles.actionButton}
                    onPress={() => onEditAddress(address)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Icon name="edit" size={20} color="#007AFF" />
                  </TouchableOpacity>
                )}
                {onDeleteAddress && (
                  <TouchableOpacity
                    style={addressStyles.actionButton}
                    onPress={() => handleDeletePress(address)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Icon name="delete" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                )}
              </View>
            </Pressable>
            )
          })
      ) : shouldRenderAddresses && (
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