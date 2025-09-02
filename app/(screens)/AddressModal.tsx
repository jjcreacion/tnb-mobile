import React from 'react'
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

interface Address {
  pkAddress: number
  address: string
  isPrimary: number
}

interface AddressModalProps {
  isVisible: boolean
  onClose: () => void
  addresses: Address[]
  onAddressSelect: (address: Address) => void
  primaryAddress: Address | null
  onAddNewAddress: () => void
}

const AddressModal: React.FC<AddressModalProps> = ({
  isVisible,
  onClose,
  addresses,
  onAddressSelect,
  primaryAddress,
  onAddNewAddress,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.addressContainer}>
        <View style={styles.addressHeader}>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.addressTitle}>Select a property address</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView 
          style={styles.addressList}
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
                      styles.addressItem,
                      address.pkAddress === primaryAddress?.pkAddress &&
                        styles.selectedAddressItem,
                    ]}
                    onPress={() => onAddressSelect(address)}
                  >
                    <View style={styles.addressIconContainer}>
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
                    <View style={styles.addressTextContainer}>
                      <Text style={styles.addressText}>{address.address}</Text>
                      {address.isPrimary === 1 && (
                        <Text style={styles.addressSubText}>
                          Primary Address
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))
            ) : (
              <View style={styles.emptyAddressContainer}>
                <Icon name="location-off" size={48} color="#ccc" />
                <Text style={styles.emptyAddressTitle}>No addresses found</Text>
                <Text style={styles.emptyAddressMessage}>
                  You haven't added any property addresses yet. Add your first
                  address to get started with our services.
                </Text>
              </View>
            )}

            <TouchableOpacity 
              style={styles.addAddressButton}
              onPress={onAddNewAddress}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="add" size={24} color="#007AFF" />
              <Text style={styles.addAddressText}>
                Add a new property address
              </Text>
            </TouchableOpacity>
          </ScrollView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  // Full screen container styles (like AddNewAddressModal)
  addressContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: 50,
  },
  addressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  addressList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedAddressItem: {
    backgroundColor: '#f0f8ff',
    borderColor: '#4CAF50',
  },
  addressIconContainer: {
    marginRight: 15,
  },
  addressTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  addressText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  addressSubText: {
    fontSize: 12,
    color: '#666',
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 15,
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  addAddressText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 10,
  },
  emptyAddressContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyAddressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  emptyAddressMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
})

export default AddressModal
