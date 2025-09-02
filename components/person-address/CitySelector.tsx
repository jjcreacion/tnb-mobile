import React from 'react'
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
}

export const CitySelector: React.FC<CitySelectorProps> = ({
  cities,
  states,
  searchText,
  onSearchTextChange,
  onCitySelect,
}) => {
  return (
    <View style={addressStyles.selectorContainer}>
      <TextInput
        style={addressStyles.searchInput}
        placeholder="Search for a city"
        value={searchText}
        onChangeText={onSearchTextChange}
        autoFocus={Platform.OS === 'android'}
      />

      <Text style={addressStyles.selectorSubtitle}>
        All cities ({cities.length})
      </Text>

      <View style={{ flex: 1 }}>
        <FlatList
          data={cities}
          keyExtractor={(item) => `city-${item.pkCity}`}
          renderItem={({ item }) => {
            const cityState = AddressService.findStateByCity(states, item)
            return (
              <TouchableOpacity
                style={addressStyles.selectorItem}
                onPress={() => onCitySelect(item)}
                activeOpacity={0.7}
                hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
              >
                <Text style={addressStyles.selectorItemText}>{item.name}</Text>
                <Text style={addressStyles.selectorItemSubText}>
                  {cityState?.name ?? 'Unknown State'}
                </Text>
              </TouchableOpacity>
            )
          }}
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
