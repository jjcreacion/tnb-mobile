import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Card } from '@/components/common';
import { Theme } from '@/constants/Theme';

// Interface for Notification (Necessary for typing)
interface Notification {
  id: number;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

const NotificationDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { notification: notificationJson } = params;

  const notification: Notification | null = useMemo(() => {
    if (notificationJson && typeof notificationJson === 'string') {
      try {
        return JSON.parse(notificationJson);
      } catch (e) {
        console.error("Error parsing notification:", e);
        return null;
      }
    }
    return null;
  }, [notificationJson]);

  if (!notification) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Text style={styles.errorTitle}>Error Loading Detail</Text>
        <Text style={styles.errorSubtitle}>The notification was not found or is invalid.</Text>
      </View>
    );
  }

  const formattedDate = new Date(notification.createdAt).toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const readStatus = notification.isRead ? "Read" : ""; 
  const readColor = notification.isRead ? Theme.colors.success[500] : Theme.colors.primary[500];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Theme.spacing.sm, height: 56 + insets.top }]}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButtonContainer}
          accessibilityRole="button"
          accessibilityLabel="Go back to notification list"
        >
            <Icon 
              name="chevron-back" 
              size={30} 
              color={Theme.colors.text.primary} 
            />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle} numberOfLines={1}>Notification Detail</Text>
        <View style={{ width: 30 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card variant="elevated" padding="lg" style={styles.detailCard}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Icon name="calendar-outline" size={16} color={Theme.colors.text.tertiary} />
              <Text style={styles.metaText}>{formattedDate}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.bodyContainer}>
            <Text style={styles.bodyText}>{notification.body}</Text>
          </View>

        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.base,
    paddingBottom: Theme.spacing.sm,
    backgroundColor: Theme.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.light,
  },
  
  backButtonContainer: { 
    padding: Theme.spacing.xs, 
    marginLeft: -Theme.spacing.xs, 
  },
  
  headerTitle: {
    flex: 1,
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
    textAlign: 'center',
  },

  scrollContent: {
    padding: Theme.spacing.base,
  },
  detailCard: {
    padding: Theme.spacing.lg,
  },

  notificationTitle: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.base,
  },

  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.base,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  metaText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.tertiary,
  },

  divider: {
    height: 1,
    backgroundColor: Theme.colors.border.light,
    marginVertical: Theme.spacing.base,
  },

  bodyContainer: {
    paddingVertical: Theme.spacing.sm,
  },
  bodyText: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.secondary,
    lineHeight: Theme.typography.lineHeight.lg,
  },

  footerContainer: {
    marginTop: Theme.spacing.xl,
    paddingTop: Theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border.light,
    alignItems: 'flex-end',
  },
  idText: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.text.tertiary,
  },

  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.error[500],
    marginBottom: Theme.spacing.sm,
  },
  errorSubtitle: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
  },
});

export default NotificationDetailScreen;