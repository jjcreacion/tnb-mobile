import React, { memo } from 'react'
import { View, Image, TouchableOpacity, Text } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { styles } from './styles'

const tnbLogo = require('@/assets/images/icon-tnb.png')

interface HomeHeaderProps {
  onMenuPress: () => void
  referralReward: string
  userBalance: number | null
}

export const HomeHeader = memo<HomeHeaderProps>(
  ({ onMenuPress, referralReward, userBalance }) => {
    const router = useRouter()

    return (
      <View style={styles.backgroundTop}>
        <LinearGradient
          colors={['#ea0e08', '#fa2d64']}
          style={styles.linearGradientHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.headerContainer}>
            <View style={styles.leftHeader}>
              <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
                <Icon name="menu" size={30} color="#fff" />
              </TouchableOpacity>
              <Image source={tnbLogo} style={styles.companyLogo} />
            </View>
            <View style={styles.rightHeader}>
              <TouchableOpacity
                style={styles.getMoneyButton}
                onPress={() => router.push('/(screens)/ShareAndEarn')}
              >
                <Text style={styles.getMoneyButtonText}>
                  Get ${referralReward}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.balanceButton}
                onPress={() => router.push('/(tabs)/billing')}
              >
                <Text style={styles.balanceButtonText}>
                  Balance: ${userBalance}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    )
  }
)

HomeHeader.displayName = 'HomeHeader'
