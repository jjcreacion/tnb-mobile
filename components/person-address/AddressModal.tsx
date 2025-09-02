import React from 'react'
import { Animated, Dimensions, Modal, Text, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { AddressForm } from './AddressForm'
import { AddressList } from './AddressList'
import { CitySelector } from './CitySelector'
import { EditAddressForm } from './EditAddressForm'
import { StateSelector } from './StateSelector'
import { addressStyles } from './styles'
import { AddressModalProps } from './types'
import { useAddressModal } from './useAddressModal'

const { width: screenWidth } = Dimensions.get('window')

const AddressModal: React.FC<AddressModalProps> = ({
  isVisible,
  onClose,
  addresses,
  onAddressSelect,
  primaryAddress,
  onAddNewAddress,
  onAddressAdded,
}) => {
  const {
    currentScreen,
    slideAnim,
    newAddressForm,
    setNewAddressForm,
    editAddressForm,
    setEditAddressForm,
    editingAddress,
    countries,
    cities,
    states,
    filteredCities,
    citySearchText,
    stateSearchText,
    animateToScreen,
    handleCitySelect,
    handleStateSelect,
    handleCitySearch,
    handleStateSearch,
    handleSaveAddress,
    handleEditAddress,
    handleUpdateAddress,
    handleDeleteAddress,
    handleCancelEdit,
  } = useAddressModal(isVisible, addresses)

  const handleAddNewAddress = () => {
    onAddNewAddress()
    animateToScreen('add-form')
  }

  const handleClose = () => {
    if (currentScreen === 'add-form' || currentScreen === 'edit-form' || currentScreen === 'city' || currentScreen === 'state') {
      if (currentScreen === 'city' || currentScreen === 'state') {
        const targetScreen = editingAddress ? 'edit-form' : 'add-form'
        animateToScreen(targetScreen)
      } else {
        animateToScreen('list')
      }
    } else {
      onClose()
    }
  }

  const getTitle = () => {
    switch (currentScreen) {
      case 'list':
        return 'Select a property address'
      case 'add-form':
        return 'Add a new address'
      case 'edit-form':
        return 'Edit address'
      case 'city':
        return `Search City (${filteredCities.length})`
      case 'state':
        return 'Search State'
      default:
        return ''
    }
  }

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isVisible}
      onRequestClose={handleClose}
    >
      <View style={addressStyles.addressContainer}>
        {/* Header */}
        <View style={addressStyles.addressHeader}>
          <TouchableOpacity
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Icon 
              name={currentScreen === 'list' ? "close" : "arrow-back"} 
              size={24} 
              color="#333" 
            />
          </TouchableOpacity>
          <Text style={addressStyles.addressTitle}>
            {getTitle()}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Content with absolutely positioned screens */}
        <View style={addressStyles.contentContainer}>
          {/* Address List Screen */}
          <Animated.View
            style={[
              addressStyles.absoluteScreen,
              {
                transform: [{
                  translateX: slideAnim.interpolate({
                    inputRange: [0, 1, 2],
                    outputRange: [0, -screenWidth, -screenWidth],
                    extrapolate: 'clamp',
                  })
                }]
              }
            ]}
          >
            <AddressList
              addresses={addresses}
              primaryAddress={primaryAddress}
              onAddressSelect={onAddressSelect}
              onAddNewAddress={handleAddNewAddress}
              onEditAddress={(address) => handleEditAddress(address)}
              onDeleteAddress={(address) => handleDeleteAddress(address, onAddressAdded)}
            />
          </Animated.View>
          
          {/* Add New Address Form Screen */}
          <Animated.View
            style={[
              addressStyles.absoluteScreen,
              {
                transform: [{
                  translateX: slideAnim.interpolate({
                    inputRange: [0, 1, 2],
                    outputRange: [screenWidth, 0, -screenWidth],
                    extrapolate: 'clamp',
                  })
                }]
              }
            ]}
          >
            <AddressForm
              formData={newAddressForm}
              onFormDataChange={setNewAddressForm}
              onNavigateToScreen={animateToScreen}
              onSaveAddress={() => handleSaveAddress(onAddressAdded)}
            />
          </Animated.View>
          
          {/* Edit Address Form Screen */}
          <Animated.View
            style={[
              addressStyles.absoluteScreen,
              {
                transform: [{
                  translateX: slideAnim.interpolate({
                    inputRange: [0, 1, 2],
                    outputRange: [screenWidth, 0, -screenWidth],
                    extrapolate: 'clamp',
                  })
                }]
              }
            ]}
            pointerEvents={currentScreen === 'edit-form' ? 'auto' : 'none'}
          >
            {editingAddress && (
              <EditAddressForm
                address={editingAddress}
                countries={countries}
                cities={cities}
                states={states}
                formData={editAddressForm}
                onFormDataChange={setEditAddressForm}
                onNavigateToScreen={animateToScreen}
                onUpdateAddress={(isPrimaryChanged) => handleUpdateAddress(isPrimaryChanged, onAddressAdded)}
                onCancel={handleCancelEdit}
              />
            )}
          </Animated.View>
          
          {/* City Selection Screen */}
          <Animated.View
            style={[
              addressStyles.absoluteScreen,
              {
                opacity: currentScreen === 'city' ? 1 : 0,
                transform: [{
                  translateX: slideAnim.interpolate({
                    inputRange: [0, 1, 2],
                    outputRange: [screenWidth, screenWidth, 0],
                    extrapolate: 'clamp',
                  })
                }]
              }
            ]}
            pointerEvents={currentScreen === 'city' ? 'auto' : 'none'}
          >
            <CitySelector
              cities={filteredCities}
              states={states}
              searchText={citySearchText}
              onSearchTextChange={handleCitySearch}
              onCitySelect={handleCitySelect}
            />
          </Animated.View>

          {/* State Selection Screen */}
          <Animated.View
            style={[
              addressStyles.absoluteScreen,
              {
                opacity: currentScreen === 'state' ? 1 : 0,
                transform: [{
                  translateX: slideAnim.interpolate({
                    inputRange: [0, 1, 2],
                    outputRange: [screenWidth, screenWidth, 0],
                    extrapolate: 'clamp',
                  })
                }]
              }
            ]}
            pointerEvents={currentScreen === 'state' ? 'auto' : 'none'}
          >
            <StateSelector
              states={states}
              searchText={stateSearchText}
              onSearchTextChange={handleStateSearch}
              onStateSelect={handleStateSelect}
            />
          </Animated.View>
        </View>
      </View>
    </Modal>
  )
}

export default AddressModal
