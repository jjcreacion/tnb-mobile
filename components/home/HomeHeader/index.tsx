import React, { memo } from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Theme } from '@/constants/Theme';
import { styles } from './styles';

const tnbLogo = require('../../../assets/images/icon.png');

interface HomeHeaderProps {
  onMenuPress: () => void;
  referralReward: string | null;
  userBalance: number | null;
}

export const HomeHeader = memo<HomeHeaderProps>(
  ({ onMenuPress, referralReward, userBalance }) => {
    const router = useRouter();

    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[Theme.colors.primary[500], Theme.colors.primary[600]]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.content}>
            <View style={styles.leftSection}>
              <TouchableOpacity
                onPress={onMenuPress}
                style={styles.menuButton}
                activeOpacity={0.7}
              >
                <Icon name="menu" size={28} color={Theme.colors.text.inverse} />
              </TouchableOpacity>
              <Image source={tnbLogo} style={styles.logo} />
            </View>

            <View style={styles.rightSection}>
              <TouchableOpacity
                style={styles.rewardButton}
                onPress={() => router.push('/(screens)/ShareAndEarn')}
                activeOpacity={0.8}
              >
                <Icon
                  name="card-giftcard"
                  size={16}
                  color={Theme.colors.primary[600]}
                />
                <Text style={styles.rewardText}>
                  ${referralReward}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.balanceButton}
                onPress={() => router.push('/(tabs)/billing')}
                activeOpacity={0.8}
              >
                <Icon
                  name="account-balance-wallet"
                  size={16}
                  color={Theme.colors.text.inverse}
                />
                <Text style={styles.balanceText}>
                  ${userBalance || '0'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }
);

HomeHeader.displayName = 'HomeHeader';
