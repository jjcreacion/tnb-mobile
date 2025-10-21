import React, { memo, useRef, useEffect, useState } from 'react'
import { View, Text, FlatList, ActivityIndicator, Dimensions } from 'react-native'
import type { Campaign } from '@/types'
import { CampaignCard } from './CampaignCard'
import { styles } from './styles'

const { width: screenWidth } = Dimensions.get('window')

interface CampaignCarouselProps {
  campaigns: Campaign[]
  loading: boolean
  error: string | null
  onCampaignPress: (campaign: Campaign) => void
  apiBaseUrl: string
}

export const CampaignCarousel = memo<CampaignCarouselProps>(
  ({ campaigns, loading, error, onCampaignPress, apiBaseUrl }) => {
    const flatListRef = useRef<FlatList<Campaign>>(null)
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
      let interval: ReturnType<typeof setInterval> | null = null

      if (campaigns.length > 0) {
        interval = setInterval(() => {
          setCurrentIndex(prevIndex => {
            const nextIndex = (prevIndex + 1) % campaigns.length
            flatListRef.current?.scrollToIndex({ animated: true, index: nextIndex })
            return nextIndex
          })
        }, 5000)
      }

      return () => {
        if (interval !== null) {
          clearInterval(interval)
        }
      }
    }, [campaigns.length])

    return (
      <>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended for you</Text>
        </View>

        <View style={styles.carouselContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#ea0e08" />
          ) : error ? (
            <Text style={styles.errorMessage}>{error}</Text>
          ) : campaigns.length > 0 ? (
            <FlatList
              ref={flatListRef}
              data={campaigns}
              renderItem={({ item }) => (
                <CampaignCard
                  campaign={item}
                  onPress={onCampaignPress}
                  apiBaseUrl={apiBaseUrl}
                />
              )}
              keyExtractor={(item) => item.campaignsId.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              onScroll={(e) => {
                const contentOffsetX = e.nativeEvent.contentOffset.x
                const newIndex = Math.round(contentOffsetX / screenWidth)
                setCurrentIndex(newIndex)
              }}
              scrollEventThrottle={16}
            />
          ) : (
            <Text style={styles.noCampaignsMessage}>
              No campaigns available at the moment.
            </Text>
          )}
        </View>
      </>
    )
  }
)

CampaignCarousel.displayName = 'CampaignCarousel'
