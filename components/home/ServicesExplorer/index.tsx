import React, { memo, useMemo } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native'
import * as Animatable from 'react-native-animatable'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { Theme } from '@/constants/Theme'
import type { Category } from '@/types'
import { ServiceCard } from './ServiceCard'
import { styles } from './styles'

interface ServicesExplorerProps {
  categories: Category[]
  loading: boolean
  error: string | null
  searchQuery: string
  isSearchVisible: boolean
  onServicePress: (category: Category) => void
  onToggleSearch: () => void
  onSearchChange: (text: string) => void
  apiBaseUrl: string
}

export const ServicesExplorer = memo<ServicesExplorerProps>(
  ({
    categories,
    loading,
    error,
    searchQuery,
    isSearchVisible,
    onServicePress,
    onToggleSearch,
    onSearchChange,
    apiBaseUrl,
  }) => {
    const [isSearchFocused, setIsSearchFocused] = React.useState(false)

    const filteredCategories = useMemo(() => {
      if (!searchQuery) return categories

      const query = searchQuery.toLowerCase()
      return categories.filter(
        (category) =>
          category.name.toLowerCase().includes(query) ||
          category.description.toLowerCase().includes(query)
      )
    }, [categories, searchQuery])

    return (
      <>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Services to explore</Text>
          <TouchableOpacity onPress={onToggleSearch} style={styles.searchIcon}>
            <Icon
              name={isSearchVisible ? 'close' : 'search'}
              size={24}
              color={Theme.colors.primary[800]}
            />
          </TouchableOpacity>
        </View>

        {isSearchVisible && (
          <Animatable.View
            animation="fadeInDown"
            duration={300}
            style={styles.searchContainer}
          >
            <TextInput
              style={[
                styles.searchInput,
                isSearchFocused && styles.searchInputFocused,
              ]}
              placeholder="Search for a service..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={onSearchChange}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              autoFocus={true}
            />
          </Animatable.View>
        )}

        <ScrollView contentContainerStyle={styles.allServicesContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={Theme.colors.primary[500]} />
          ) : error ? (
            <Text style={styles.errorMessage}>{error}</Text>
          ) : filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <ServiceCard
                key={category.pkCategory}
                category={category}
                onPress={onServicePress}
                apiBaseUrl={apiBaseUrl}
              />
            ))
          ) : (
            <Text style={styles.noResultsMessage}>
              No services found matching "{searchQuery}".
            </Text>
          )}
        </ScrollView>
      </>
    )
  }
)

ServicesExplorer.displayName = 'ServicesExplorer'
