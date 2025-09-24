import React, { useRef, useState } from 'react'
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { AddressForm, AddressFormRef } from './AddressForm'
import { AddressList } from './AddressList'
import { CitySelector } from './CitySelector'
import { EditAddressForm, EditAddressFormRef } from './EditAddressForm'


import { StateSelector } from './StateSelector'
import { addressStyles } from './styles'
import { AddressModalProps } from './types'
import { useAddressModal } from './useAddressModal'

const AddressModal: React.FC<AddressModalProps> = ({
  isVisible,
  onClose,
  addresses,
  onAddressSelect,
  primaryAddress,
  onAddNewAddress,
  onAddressAdded,
}) => {
  const addFormRef = useRef<AddressFormRef>(null)
  const editFormRef = useRef<EditAddressFormRef>(null)
  const [recentlyAddedId, setRecentlyAddedId] = useState<number | undefined>()
  const [searchText, setSearchText] = useState('')


  const {
    currentScreen,
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
  } = useAddressModal(isVisible, addresses, {
    focusAddFormZipCode: () => addFormRef.current?.focusZipCode(),
    focusEditFormZipCode: () => editFormRef.current?.focusZipCode(),
  })

  const handleAddNewAddress = () => {
    animateToScreen('add-form')
  }

  // Wrapper para manejar el guardado con animación
  const handleSaveAddressWithAnimation = async () => {
    await new Promise<void>((resolve) => {
      handleSaveAddress((addressId?: number) => {
        onAddressAdded?.(); // Trigger the address list refresh first
        
        // If we got the new address ID, animate it directly
        if (addressId) {
          setTimeout(() => {
            setRecentlyAddedId(addressId);
            setTimeout(() => setRecentlyAddedId(undefined), 2500);
          }, 200); // Short delay to ensure the list is refreshed
        }
        
        resolve();
      });
    });
  };

  // Wrapper para manejar la actualización con animación
  const handleUpdateAddressWithAnimation = async (isPrimaryChanged?: boolean) => {
    if (editingAddress) {
      const addressId = editingAddress.pkAddress;
      
      await new Promise<void>((resolve) => {
        handleUpdateAddress(isPrimaryChanged, () => {
          onAddressAdded?.(); // Trigger the address list refresh first
          
          // Animate the updated address
          setRecentlyAddedId(addressId);
          setTimeout(() => setRecentlyAddedId(undefined), 2500);
          
          resolve();
        });
      });
    }
  };

  const handleClose = () => {
    if (currentScreen === 'add-form' || currentScreen === 'edit-form' || currentScreen === 'city' || currentScreen === 'state') {
      if (currentScreen === 'city' || currentScreen === 'state') {
        const targetScreen = editingAddress ? 'edit-form' : 'add-form'
        animateToScreen(targetScreen)
      } else {
        animateToScreen('list')
      }
    } else {
      // Limpiar el texto de búsqueda al cerrar el modal
      setSearchText('')
      onClose()
    }
  }

  const getTitle = () => {
    switch (currentScreen) {
      case 'list':
        return 'Select Service Address'
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
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>

            <View style={{ width: 24 }} />
          </View>
        </View>

        {/* Search Bar - Solo mostrar en la pantalla de lista */}
        {currentScreen === 'list' && (
          <View style={addressStyles.searchContainer}>
            <View style={addressStyles.searchInputContainer}>
              <Icon name="search" size={20} color="#999" style={addressStyles.searchIcon} />
              <TextInput
                style={addressStyles.addressSearchInput}
                placeholder="Search addresses..."
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchText.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchText('')}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon name="clear" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        {/* Content with conditional rendering for better ScrollView support */}
        <View style={addressStyles.contentContainer}>
          {currentScreen === 'list' && (
            <AddressList
              addresses={addresses}
              primaryAddress={primaryAddress}
              onAddressSelect={onAddressSelect}
              onAddNewAddress={handleAddNewAddress}
              onEditAddress={(address) => handleEditAddress(address)}
              onDeleteAddress={(address) => {
                handleDeleteAddress(address, async () => {
                  // Force immediate refresh of the parent list
                  await onAddressAdded?.();
                });
              }}
              cities={cities}
              states={states}
              recentlyAddedId={recentlyAddedId}
              searchText={searchText}
            />
          )}
          
          {currentScreen === 'add-form' && (
            <AddressForm
              ref={addFormRef}
              formData={newAddressForm}
              onFormDataChange={setNewAddressForm}
              onNavigateToScreen={animateToScreen}
              onSaveAddress={handleSaveAddressWithAnimation}
              cities={cities}
              states={states}
            />
          )}
          
          {currentScreen === 'edit-form' && editingAddress && (
            <EditAddressForm
              ref={editFormRef}
              address={editingAddress}
              countries={countries}
              cities={cities}
              states={states}
              formData={editAddressForm}
              onFormDataChange={setEditAddressForm}
              onNavigateToScreen={animateToScreen}
              onUpdateAddress={handleUpdateAddressWithAnimation}
              onCancel={handleCancelEdit}
            />
          )}
          
          {currentScreen === 'city' && (
            <CitySelector
              cities={filteredCities}
              states={states}
              searchText={citySearchText}
              onSearchTextChange={handleCitySearch}
              onCitySelect={handleCitySelect}
              selectedStateId={editingAddress ? editAddressForm.stateId : newAddressForm.stateId}
            />
          )}

          {currentScreen === 'state' && (
            <StateSelector
              states={states}
              searchText={stateSearchText}
              onSearchTextChange={handleStateSearch}
              onStateSelect={handleStateSelect}
            />
          )}
        </View>
      </View>


    </Modal>
  )
}

export default AddressModal
