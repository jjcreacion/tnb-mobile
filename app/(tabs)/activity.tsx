import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Card, Screen, StatusBadge } from '@/components/common';
import { Theme } from '@/constants/Theme';

interface Service {
  requestId: string;
  serviceDescription: string;
  address: string;
  status: number;
  createdAt: string;
}

const ActivityScreen = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const API_URL = Constants.expoConfig?.extra?.API_BASE_URL;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchServices = useCallback(async (currentUserId: string) => {
    setIsRefreshing(true);
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/service_request/user/${currentUserId}`);

      if (response.status === 200) {
        setServices(response.data);
      } else if (response.status === 404) {
        setServices([]);
      }
    } catch {
      setServices([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [API_URL]);

  useEffect(() => {
    const fetchUserIdAndInitialServices = async () => {
      setLoading(true);
      setIsRefreshing(true);
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          setUserId(storedUserId);
          fetchServices(storedUserId);
        } else {
          setLoading(false);
          setIsRefreshing(false);
        }
      } catch {
        setLoading(false);
        setIsRefreshing(false);
      }
    };

    fetchUserIdAndInitialServices();
  }, [fetchServices]);

  const onRefresh = useCallback(async () => {
    const currentUserId = await AsyncStorage.getItem('userId');
    if (currentUserId) {
      fetchServices(currentUserId);
    }
  }, [fetchServices]);

  const getStatusConfig = (status: number) => {
    switch (status) {
      case 1:
        return { label: 'Finish', variant: 'warning' as const, icon: 'check-circle' };
      case 2:
        return { label: 'Approved', variant: 'success' as const, icon: 'verified' };
      case 3:
        return { label: 'In Progress', variant: 'info' as const, icon: 'pending' };
      case 4:
        return { label: 'Closed', variant: 'neutral' as const, icon: 'cancel' };
      default:
        return { label: 'Pending', variant: 'neutral' as const, icon: 'schedule' };
    }
  };

  const renderServiceCard = ({ item }: { item: Service }) => {
    const statusConfig = getStatusConfig(item.status);
    const date = new Date(item.createdAt);
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <Card variant="elevated" padding="md" style={styles.card}>
        <View style={styles.cardHeader}>
          <StatusBadge
            label={statusConfig.label}
            variant={statusConfig.variant}
            size="sm"
          />
          <View style={styles.dateContainer}>
            <Icon name="schedule" size={14} color={Theme.colors.text.tertiary} />
            <Text style={styles.date}>{formattedDate}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.serviceDescription}
        </Text>

        <View style={styles.addressContainer}>
          <Icon name="location-on" size={16} color={Theme.colors.text.tertiary} />
          <Text style={styles.address} numberOfLines={1}>
            {item.address}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.requestId}>Request #{item.requestId}</Text>
        </View>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="inbox" size={80} color={Theme.colors.neutral[300]} />
      <Text style={styles.emptyTitle}>No Activity Yet</Text>
      <Text style={styles.emptyText}>
        Your service requests will appear here once you start using the app.
      </Text>
    </View>
  );

  return (
    <Screen safeArea edges={['top', 'bottom']}>
      <StatusBar style="light" backgroundColor={Theme.colors.primary[500]} />
      <LinearGradient
        colors={[Theme.colors.primary[500], Theme.colors.primary[600]]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Activity</Text>
        <Text style={styles.headerSubtitle}>Track your service requests</Text>
      </LinearGradient>

      {loading && !isRefreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary[500]} />
          <Text style={styles.loadingText}>Loading activities...</Text>
        </View>
      ) : (
        <FlatList
          data={services}
          renderItem={renderServiceCard}
          keyExtractor={(item) => item.requestId}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={Theme.colors.primary[500]}
              colors={[Theme.colors.primary[500]]}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </Screen>
  );
};

export default ActivityScreen;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: Theme.spacing.xl,
    marginBottom: Theme.spacing.lg,
    marginHorizontal: -Theme.spacing.base,
    marginTop: Platform.OS === 'ios' ? -Theme.spacing.base : 0,
  },

  headerTitle: {
    fontSize: Theme.typography.fontSize['3xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.inverse,
    marginBottom: Theme.spacing.xs,
  },

  headerSubtitle: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.inverse,
    opacity: 0.9,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: Theme.spacing.base,
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.secondary,
  },

  listContent: {
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },

  card: {
    marginBottom: Theme.spacing.base,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },

  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },

  date: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.text.tertiary,
  },

  description: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
    lineHeight: Theme.typography.lineHeight.lg,
  },

  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    marginBottom: Theme.spacing.md,
  },

  address: {
    flex: 1,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
  },

  cardFooter: {
    paddingTop: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border.light,
  },

  requestId: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.text.tertiary,
    fontWeight: Theme.typography.fontWeight.medium,
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing['3xl'],
    paddingTop: Theme.spacing['6xl'],
  },

  emptyTitle: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
    marginTop: Theme.spacing.xl,
    marginBottom: Theme.spacing.sm,
  },

  emptyText: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: Theme.typography.lineHeight.lg,
  },
});
