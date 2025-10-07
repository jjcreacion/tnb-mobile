import React, { memo } from 'react'
import { TouchableOpacity, View, Image, Text } from 'react-native'
import type { Category } from '@/types'
import { styles } from './styles'

interface ServiceCardProps {
  category: Category
  onPress: (category: Category) => void
  apiBaseUrl: string
}

export const ServiceCard = memo<ServiceCardProps>(
  ({ category, onPress, apiBaseUrl }) => {
    const fullImagePath = `${apiBaseUrl}${category.imagePath}`

    return (
      <TouchableOpacity
        onPress={() => onPress(category)}
        style={styles.serviceItem}
      >
        {category.imagePath && (
          <Image
            source={{ uri: fullImagePath }}
            style={styles.serviceItemImage}
          />
        )}
        <View style={styles.serviceItemContent}>
          <View>
            <Text style={styles.serviceTitle}>{category.name}</Text>
            <Text style={styles.serviceDescription}>{category.description}</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }
)

ServiceCard.displayName = 'ServiceCard'
