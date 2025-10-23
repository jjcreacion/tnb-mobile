import React, { useState } from 'react'
import { FlatList, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { AddressService } from './AddressService'
import { addressStyles } from './styles'
import { City, State } from './types'

interface CitySelectorProps {
  cities: City[]
  states: State[]
  searchText: string
  onSearchTextChange: (text: string) => void
  onCitySelect: (city: City) => void
  selectedStateId?: number | null
}

export const CitySelector: React.FC<CitySelectorProps> = ({
  cities,
  states,
  searchText,
  onSearchTextChange,
  onCitySelect,
  selectedStateId,
}) => {
  const [isFocused, setIsFocused] = useState(false)
  // Separar ciudades por estado seleccionado vs otros estados para mostrar conteo
  const selectedStateCities = selectedStateId ? cities.filter(city => city.fkState === selectedStateId) : []
  const otherStateCities = selectedStateId ? cities.filter(city => city.fkState !== selectedStateId) : cities
  
  const renderCityItem = ({ item }: { item: City }) => {
    const cityState = AddressService.findStateByCity(states, item)
    const isFromSelectedState = selectedStateId && item.fkState === selectedStateId
    
    return (
      <TouchableOpacity
        style={[
          addressStyles.selectorItem,
          isFromSelectedState ? { backgroundColor: '#f8f9fa' } : {}
        ]}
        onPress={() => onCitySelect(item)}
        activeOpacity={0.7}
        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
      >
        <Text style={[
          addressStyles.selectorItemText,
          isFromSelectedState ? { fontWeight: '600' as const } : {}
        ]}>
          {item.name}
        </Text>
        <Text style={[
          addressStyles.selectorItemSubText,
          isFromSelectedState ? { color: '#4CAF50', fontWeight: '500' as const } : {}
        ]}>
          {cityState?.name ?? 'Unknown State'}
          {isFromSelectedState ? '' : ''}
        </Text>
      </TouchableOpacity>
    )
  }

  // Determinar el título del selector
  const getSelectorTitle = () => {
    if (selectedStateId && selectedStateCities.length > 0) {
      const selectedState = states.find(s => s.pkState === selectedStateId)
      return `${selectedState?.name || 'Selected Statex'} (${selectedStateCities.length}) + Other Cities (${otherStateCities.length})`
    }
    return `All cities (${cities.length})`
  }
  return (
    <View style={addressStyles.selectorContainer}>
      <TextInput
        style={[
          addressStyles.searchInput,
          isFocused && addressStyles.searchInputFocused,
        ]}
        placeholder="Search for a city"
        value={searchText}
        onChangeText={onSearchTextChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoFocus={Platform.OS === 'android'}
      />

      <Text style={addressStyles.selectorSubtitle}>
        {getSelectorTitle()}
      </Text>

      <View style={{ flex: 1 }}>
        <FlatList
          data={cities}
          keyExtractor={(item) => `city-${item.pkCity}`}
          renderItem={renderCityItem}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={() => (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text>No cities found</Text>
            </View>
          )}
          initialNumToRender={20}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={false}
          contentContainerStyle={{
            flexGrow: 1,
            minHeight: 200,
            paddingBottom: 20,
          }}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  )
}
