import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Card, Screen, StatusBadge } from '@/components/common';
import { Theme } from '@/constants/Theme';

interface ServiceRequest {
  requestId: number;
  serviceDescription: string;
  address: string;
  latitude: string;
  longitude: string;
  fkRequestStatus: number | null;
  createdAt: string;
  updatedAt: string | null;
  fkUser: {
    pkUser: number;
    email: string;
    username: string | null;
    password: string;
    phone: string | null;
    validateEmail: number;
    validatePhone: number;
    status: number;
    img_profile: string;
    roles: string[];
    createdAt: string;
    updatedAt: string;
  };
}

interface Status {
  statusId: number;
  order: number;
  name: string;
  color: string;
}

const HistoryScreen = () => {
  const [services, setServices] = useState<ServiceRequest[]>([]);
  const [statusList, setStatusList] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  const API_URL = Constants.expoConfig?.extra?.API_BASE_URL;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const fetchStatusList = useCallback(async () => {
    try {
      const response = await axios.get<Status[]>(`${API_URL}/status-list`);
      if (response.status === 200) {
        setStatusList(response.data);
      }
    } catch (error) {
      console.error('Error fetching status list:', error);
    }
  }, [API_URL]);

  const fetchServices = useCallback(async (currentUserId: string) => {
    setIsRefreshing(true);
    setLoading(true);
    try {
      const response = await axios.get<ServiceRequest[]>(`${API_URL}/service_request/user/${currentUserId}`);

      if (response.status === 200) {
        setServices(response.data);
      } else if (response.status === 404) {
        setServices([]);
      }
    } catch (error) {
      setServices([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [API_URL]);

  useEffect(() => {
    const initialize = async () => {
      await fetchStatusList();
      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedUserId) {
        fetchServices(storedUserId);
      } else {
        setLoading(false);
        setIsRefreshing(false);
      }
    };

    initialize();
  }, [fetchServices, fetchStatusList]);

  const onRefresh = useCallback(async () => {
    const currentUserId = await AsyncStorage.getItem('userId');
    if (currentUserId) {
      await fetchStatusList();
      fetchServices(currentUserId);
    }
  }, [fetchServices, fetchStatusList]);

  const handleCardPress = (service: ServiceRequest) => {
    const statusInfo = getStatusTextAndColor(service.fkRequestStatus);
    const serviceWithStatus = { ...service, statusInfo };
    router.push({
      pathname: '/(screens)/ServiceRequestDetail',
      params: { service: JSON.stringify(serviceWithStatus) },
    });
  };

  const getStatusTextAndColor = (fkRequestStatus: number | null) => {
    const statusId = fkRequestStatus === null ? 1 : fkRequestStatus;
    const statusObject = statusList.find(status => status.statusId === statusId);
    const statusColor = statusObject ? statusObject.color : 'gray';
    const statusName = statusObject ? statusObject.name : 'Unknown';
    return { text: statusName, color: statusColor };
  };

  const getStatusVariant = (statusName: string) => {
    const name = statusName.toLowerCase();
    if (name.includes('approved') || name.includes('completed')) return 'success' as const;
    if (name.includes('progress')) return 'info' as const;
    if (name.includes('pending')) return 'warning' as const;
    if (name.includes('closed') || name.includes('cancelled')) return 'neutral' as const;
    return 'neutral' as const;
  };

  const renderServiceCard = ({ item }: { item: ServiceRequest }) => {
    const statusInfo = getStatusTextAndColor(item.fkRequestStatus);
    const date = new Date(item.createdAt);
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <Card variant="elevated" padding="md" style={styles.card} onPress={() => handleCardPress(item)}>
        <View style={styles.cardHeader}>
          <StatusBadge
            label={statusInfo.text}
            variant={getStatusVariant(statusInfo.text)}
            size="sm"
          />
          <View style={styles.dateContainer}>
            <Icon name="schedule" size={14} color={Theme.colors.text.tertiary} />
            <Text style={styles.date}>{formattedDate}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.serviceDescription || 'No Description'}
        </Text>

        <View style={styles.addressContainer}>
          <Icon name="location-on" size={16} color={Theme.colors.text.tertiary} />
          <Text style={styles.address} numberOfLines={1}>
            {item.address || 'No Address'}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.requestId}>Request #{item.requestId}</Text>
          <Icon name="chevron-right" size={20} color={Theme.colors.text.tertiary} />
        </View>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="history" size={80} color={Theme.colors.neutral[300]} />
      <Text style={styles.emptyTitle}>No Service History</Text>
      <Text style={styles.emptyText}>
        Your completed and past service requests will appear here.
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
        <Text style={styles.headerTitle}>Services</Text>
        <Text style={styles.headerSubtitle}>View your service history</Text>
      </LinearGradient>

      {loading && !isRefreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary[500]} />
          <Text style={styles.loadingText}>Loading services...</Text>
        </View>
      ) : (
        <FlatList
          data={services}
          renderItem={renderServiceCard}
          keyExtractor={(item) => item.requestId.toString()}
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

export default HistoryScreen;

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
