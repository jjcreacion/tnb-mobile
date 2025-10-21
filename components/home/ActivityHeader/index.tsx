import React, { memo } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Theme } from '@/constants/Theme';
import { styles } from './styles';

interface ActivityHeaderProps {
  onMenuPress: () => void;
}

export const ActivityHeader = memo<ActivityHeaderProps>(({ onMenuPress }) => {
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
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Activity</Text>
              <Text style={styles.subtitle}>Track your service requests</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
});

ActivityHeader.displayName = 'ActivityHeader';
