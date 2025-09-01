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
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.addressModalOverlay}>
        <View style={styles.addressModalContent}>
          <View style={styles.addressModalHeader}>
            <Text style={styles.addressModalTitle}>
              Select a property address
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.addressCloseButton}
            >
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
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
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  addressModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  addressModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingTop: 20,
    width: '100%',
    maxHeight: '70%',
    marginTop: -100,
  },
  addressModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  addressModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addressCloseButton: {
    padding: 5,
  },
  addressList: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedAddressItem: {
    backgroundColor: '#f8f9fa',
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
    paddingHorizontal: 10,
    marginTop: 10,
    backgroundColor: 'transparent',
    borderRadius: 8,
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
