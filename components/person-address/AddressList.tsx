import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Alert, Animated, Dimensions, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { RadioButton } from '../ui/RadioButton'
import { addressStyles } from './styles'
import { Address, City, State } from './types'

const { height: screenHeight } = Dimensions.get('window')

interface AddressListProps {
  addresses: Address[]
  primaryAddress: Address | null
  onAddressSelect: (address: Address) => void
  onAddNewAddress: () => void
  onEditAddress?: (address: Address) => void
  onDeleteAddress?: (address: Address) => void
  cities?: City[]
  states?: State[]
  recentlyAddedId?: number // ID del elemento recién agregado/actualizado
  searchText?: string // Texto de búsqueda
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
  recentlyAddedId,
  searchText = '',
}) => {
  const animatedValues = useRef<Map<number, Animated.Value>>(new Map())
  const [shouldFloatButton, setShouldFloatButton] = useState(false)
  const scrollViewRef = useRef<ScrollView>(null)
  const contentRef = useRef<View>(null)
  
  const handleAddressSelection = useCallback((address: Address) => {
    onAddressSelect(address)
  }, [onAddressSelect])

  // Efecto para animar el elemento recién agregado/actualizado
  useEffect(() => {
    if (recentlyAddedId) {
      // Crear o obtener el valor animado para este ID
      let animValue = animatedValues.current.get(recentlyAddedId)
      if (!animValue) {
        animValue = new Animated.Value(1) // Empezar con borde oscuro
        animatedValues.current.set(recentlyAddedId, animValue)
      }
      
      // Iniciar la animación: de borde oscuro (1) a borde normal (0)
      Animated.timing(animValue, {
        toValue: 0,
        duration: 2000, // 2 segundos para una transición suave
        useNativeDriver: false, // No podemos usar native driver para borderColor
      }).start(() => {
        // Limpiar el valor animado después de la animación
        animatedValues.current.delete(recentlyAddedId)
      })
    }
  }, [recentlyAddedId])

  // Efecto para limpiar las animaciones cuando no hay direcciones
  useEffect(() => {
    if (addresses.length === 0) {
      // Limpiar todas las animaciones cuando la lista se vacía
      animatedValues.current.clear()
    }
  }, [addresses.length])

  // Función para obtener el valor animado de un elemento
  const getAnimatedValue = (addressId: number) => {
    return animatedValues.current.get(addressId)
  }
  
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

  // Función para resaltar el texto que coincide con la búsqueda
  const renderHighlightedText = (text: string, searchText: string) => {
    if (!searchText.trim()) {
      return <Text style={addressStyles.addressText}>{text}</Text>
    }

    const escapedSearchText = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escapedSearchText})`, 'gi')
    const parts = text.split(regex)

    return (
      <Text style={addressStyles.addressText}>
        {parts.map((part, index) => {
          const isHighlight = part.toLowerCase() === searchText.toLowerCase()
          return (
            <Text
              key={index}
              style={isHighlight ? { fontWeight: 'bold', color: '#007AFF' } : {}}
            >
              {part}
            </Text>
          )
        })}
      </Text>
    )
  }

  // Función para filtrar direcciones basado en el texto de búsqueda
  const getFilteredAndSortedAddresses = () => {
    let filteredAddresses = addresses

    // Filtrar si hay texto de búsqueda
    if (searchText.trim()) {
      filteredAddresses = addresses.filter(address => {
        const fullDescription = buildFullAddressDescription(address).toLowerCase()
        return fullDescription.includes(searchText.toLowerCase())
      })
    }

    // Ordenar: primero las que coinciden con la búsqueda (si hay búsqueda), 
    // luego por fecha de creación
    return filteredAddresses.sort((a, b) => {
      if (searchText.trim()) {
        const aDescription = buildFullAddressDescription(a).toLowerCase()
        const bDescription = buildFullAddressDescription(b).toLowerCase()
        const searchLower = searchText.toLowerCase()
        
        // Calcular relevancia de la coincidencia
        const aStartsWith = aDescription.startsWith(searchLower)
        const bStartsWith = bDescription.startsWith(searchLower)
        const aExactMatch = aDescription === searchLower
        const bExactMatch = bDescription === searchLower
        const aWordStart = aDescription.includes(' ' + searchLower) || aDescription.includes(', ' + searchLower)
        const bWordStart = bDescription.includes(' ' + searchLower) || bDescription.includes(', ' + searchLower)
        
        // Prioridad: 1. Coincidencia exacta, 2. Empieza con texto, 3. Empieza palabra, 4. Contiene
        if (aExactMatch && !bExactMatch) return -1
        if (!aExactMatch && bExactMatch) return 1
        if (aStartsWith && !bStartsWith) return -1
        if (!aStartsWith && bStartsWith) return 1
        if (aWordStart && !bWordStart) return -1
        if (!aWordStart && bWordStart) return 1
      }

      // Ordenar de forma descendente por fecha (más recientes primero)
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      // Si no hay createdAt, usar pkAddress como fallback
      return b.pkAddress - a.pkAddress
    })
  }

  // Only render addresses when we have complete data (or no addresses at all)
  const shouldRenderAddresses = addresses.length === 0 || (cities.length > 0 && states.length > 0)
  const filteredAddresses = getFilteredAndSortedAddresses()

  // Efecto para determinar si el contenido es más largo que la pantalla disponible
  useEffect(() => {
    if (filteredAddresses.length > 4) { // Si hay más de 4 direcciones, probablemente necesite scroll
      setShouldFloatButton(true)
    } else {
      setShouldFloatButton(false)
    }
  }, [filteredAddresses.length])
  
  return (
    <View style={{ flex: 1 }}>
      <ScrollView 
        ref={scrollViewRef}
        style={addressStyles.addressList}
        contentContainerStyle={{ 
          paddingBottom: shouldFloatButton ? 120 : 20, // Más espacio si el botón flota
          flexGrow: 1 
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View ref={contentRef}>
      {shouldRenderAddresses && filteredAddresses.length > 0 ? (
        filteredAddresses.map((address: Address) => {
            const isSelected = address.pkAddress === primaryAddress?.pkAddress
            const animValue = getAnimatedValue(address.pkAddress)
            const isRecentlyAdded = address.pkAddress === recentlyAddedId
            const fullDescription = buildFullAddressDescription(address)
            
            // Estilo animado para el borde
            const animatedStyle = animValue ? {
              borderColor: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['#e0e0e0', '#4CAF50'] // De gris normal a verde destacado
              }),
              borderWidth: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 2] // De grosor normal a más grueso
              }),
              backgroundColor: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['#fff', '#f0f8f0'] // De blanco a verde muy claro
              })
            } : {}
            
            return (
            <Animated.View
              key={address.pkAddress}
              style={[
                addressStyles.addressItem,
                isSelected && addressStyles.selectedAddressItem,
                animatedStyle, // Aplicar estilo animado si existe
              ]}
            >
              <Pressable
                style={({ pressed }) => [
                  { flex: 1, flexDirection: 'row', alignItems: 'center' },
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
                {renderHighlightedText(fullDescription, searchText)}
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
            </Animated.View>
            )
          })
      ) : shouldRenderAddresses && addresses.length > 0 && filteredAddresses.length === 0 ? (
        // Mostrar mensaje cuando hay direcciones pero ninguna coincide con la búsqueda
        <View style={addressStyles.emptyAddressContainer}>
          <Icon name="search-off" size={48} color="#ccc" />
          <Text style={addressStyles.emptyAddressTitle}>No matches found</Text>
          <Text style={addressStyles.emptyAddressMessage}>
            No addresses match your search "{searchText}". Try different keywords or clear the search.
          </Text>
        </View>
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

      {/* Botón dentro del scroll si no debe flotar */}
      {!shouldFloatButton && (
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
      )}
        </View>
      </ScrollView>

      {/* Botón flotante cuando debe flotar */}
      {shouldFloatButton && (
        <View style={addressStyles.floatingButtonContainer}>
          <TouchableOpacity 
            style={[addressStyles.addAddressButton, addressStyles.floatingAddButton]}
            onPress={onAddNewAddress}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="add" size={24} color="#007AFF" />
            <Text style={addressStyles.addAddressText}>
              Add a new property address
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}