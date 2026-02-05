import React, { memo } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Theme } from '@/constants/Theme';
import { styles } from './styles';
import { useAppSelector } from '@/store/hooks';

interface SupportHeaderProps {
  onMenuPress: () => void;
}

export const SupportHeader = memo<SupportHeaderProps>(({ onMenuPress }) => {
 
  const userId = useAppSelector(state => state.auth.userId);
  const isGuest = userId === 'GUEST_USER';
 
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
             {!isGuest && (
       
            <TouchableOpacity
              onPress={onMenuPress}
              style={styles.menuButton}
              activeOpacity={0.7}
            >
              <Icon name="menu" size={28} color={Theme.colors.text.inverse} />
            </TouchableOpacity>
             )}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Support</Text>
              <Text style={styles.subtitle}>We're here to help you</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
});

SupportHeader.displayName = 'SupportHeader';
