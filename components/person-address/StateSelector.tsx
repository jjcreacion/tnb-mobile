import React from 'react'
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { AddressService } from './AddressService'
import { addressStyles } from './styles'
import { State } from './types'

interface StateSelectorProps {
  states: State[]
  searchText: string
  onSearchTextChange: (text: string) => void
  onStateSelect: (state: State) => void
}

export const StateSelector: React.FC<StateSelectorProps> = ({
  states,
  searchText,
  onSearchTextChange,
  onStateSelect,
}) => {
  const filteredStates = AddressService.filterStatesBySearch(states, searchText)

  return (
    <View style={addressStyles.selectorContainer}>
      <TextInput
        style={addressStyles.searchInput}
        placeholder="Search for a state"
        value={searchText}
        onChangeText={onSearchTextChange}
        autoFocus={false}
      />

      <Text style={addressStyles.selectorSubtitle}>All states</Text>

      <View style={{ flex: 1 }}>
        <FlatList
          data={filteredStates}
          keyExtractor={(item) => item.pkState.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={addressStyles.selectorItem}
              onPress={() => onStateSelect(item)}
              activeOpacity={0.7}
              hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
            >
              <Text style={addressStyles.selectorItemText}>{item.name}</Text>
              <Text style={addressStyles.selectorItemSubText}>
                {item.internalCode}
              </Text>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 20,
          }}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  )
}
