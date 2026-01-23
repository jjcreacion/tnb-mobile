import React, { memo } from 'react'
import { TouchableOpacity, Image, Text } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Theme } from '@/constants/Theme'
import type { Campaign } from '@/types'
import { styles } from './styles'

interface CampaignCardProps {
  campaign: Campaign
  onPress: (campaign: Campaign) => void
  apiBaseUrl: string
}

export const CampaignCard = memo<CampaignCardProps>(
  ({ campaign, onPress, apiBaseUrl }) => {
    const fullImageUrl = `${apiBaseUrl}${campaign.imageUrl}`

    return (
      <TouchableOpacity
        onPress={() => onPress(campaign)}
        style={styles.recommendedCard}
      >
        <Image
          source={{ uri: fullImageUrl }}
          style={styles.recommendedCardImage}
        />
        <LinearGradient
          colors={[Theme.colors.gradientOverlay.light, Theme.colors.gradientOverlay.dark]}
          style={styles.recommendedCardOverlay}
        >
          <Text style={styles.recommendedCardTitle}>{campaign.title}</Text>
          <Text style={styles.recommendedCardDescription}>
            {campaign.description}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    )
  }
)

CampaignCard.displayName = 'CampaignCard'
