import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Card } from '@/components/common';
import { HistoryHeader } from '@/components/home';
import { Theme } from '@/constants/Theme';
import SideMenu from '../(screens)/SideMenu';

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
  const [userId, setUserId] = useState<string | null>(null);
  const API_URL = Constants.expoConfig?.extra?.API_BASE_URL;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMenuVisible, setMenuVisible] = useState(false);
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
        console.log('Datos del usuario cargados:', response.data);
      } else if (response.status === 404) {
        if (response.data && (response.data as any).message && (response.data as any).message.includes('No requests found')) {
          setServices([]);
          console.log('No se encontraron solicitudes para este usuario.');
        } else {
          console.error('Error inesperado al obtener servicios:', response);
        }
      } else {
        console.error('Error al obtener servicios:', response);
      }
    } catch (error) {
      console.error('Network or other error fetching services:', error);
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
        setUserId(storedUserId);
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

  const handleMenuPress = useCallback(() => {
    setMenuVisible(true);
  }, []);

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
    const statusColor = statusObject ? statusObject.color : Theme.colors.text.tertiary;
    const statusName = statusObject ? statusObject.name : 'Unknown';
    return { text: statusName, color: statusColor };
  };

  const getStatusIcon = (statusName: string) => {
    const name = statusName.toLowerCase();
    if (name.includes('approved')) return 'checkmark-done-circle';
    if (name.includes('progress')) return 'hourglass-outline';
    if (name.includes('closed')) return 'close-circle-outline';
    if (name.includes('finish')) return 'checkmark-circle-outline';
    return 'time-outline';
  };

  const renderServiceCard = ({ item: service }: { item: ServiceRequest }) => {
    const statusInfo = getStatusTextAndColor(service.fkRequestStatus);
    const statusIcon = getStatusIcon(statusInfo.text);

    return (
      <TouchableOpacity onPress={() => handleCardPress(service)}>
        <Card variant="elevated" padding="md" style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {service.serviceDescription || 'No Description'}
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={Theme.colors.text.tertiary} />
          </View>

          <View style={styles.addressContainer}>
            <Icon name="location" size={16} color={Theme.colors.text.tertiary} />
            <Text style={styles.addressText} numberOfLines={2}>
              {service.address || 'No Address'}
            </Text>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.statusContainer}>
              <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                <Icon name={statusIcon} size={14} color="#FFFFFF" />
                <Text style={styles.statusBadgeText}>{statusInfo.text}</Text>
              </View>
            </View>
            <View style={styles.dateContainer}>
              <Icon name="calendar-outline" size={14} color={Theme.colors.text.tertiary} />
              <Text style={styles.dateText}>
                {new Date(service.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.requestIdContainer}>
            <Text style={styles.requestIdText}>Request #{service.requestId}</Text>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon name="file-tray-outline" size={64} color={Theme.colors.text.tertiary} />
      </View>
      <Text style={styles.emptyTitle}>No Service History</Text>
      <Text style={styles.emptySubtitle}>Your completed services will appear here</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon name="alert-circle-outline" size={64} color={Theme.colors.error[500]} />
      </View>
      <Text style={styles.emptyTitle}>Unable to Load</Text>
      <Text style={styles.emptySubtitle}>Could not load user information</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor={Theme.colors.primary[500]} />
      <HistoryHeader onMenuPress={handleMenuPress} />

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary[500]} />
          <Text style={styles.loadingText}>Loading your services...</Text>
        </View>
      ) : !userId ? (
        renderErrorState()
      ) : (
        <FlatList
          data={services}
          renderItem={renderServiceCard}
          keyExtractor={(item) => item.requestId.toString()}
          contentContainerStyle={[
            styles.listContent,
            services.length === 0 && styles.listContentEmpty
          ]}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={Theme.colors.primary[500]}
              colors={[Theme.colors.primary[500]]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <SideMenu
        isVisible={isMenuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
  },

  header: {
    paddingTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing.base,
    marginBottom: Theme.spacing.base,
    ...Theme.shadows.md,
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },

  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTextContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
  },

  listContent: {
    paddingHorizontal: Theme.spacing.base,
    paddingBottom: Theme.spacing.xl,
  },

  listContentEmpty: {
    flexGrow: 1,
  },

  card: {
    marginBottom: Theme.spacing.md,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.md,
    gap: Theme.spacing.sm,
  },

  cardHeaderLeft: {
    flex: 1,
  },

  cardTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
    lineHeight: Theme.typography.lineHeight.md,
  },

  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Theme.spacing.xs,
    marginBottom: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    backgroundColor: Theme.colors.background.secondary,
    borderRadius: Theme.borderRadius.md,
  },

  addressText: {
    flex: 1,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
    lineHeight: Theme.typography.lineHeight.md,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Theme.spacing.sm,
    paddingTop: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border.light,
  },

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.full,
  },

  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.bold,
  },

  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },

  dateText: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.text.tertiary,
  },

  requestIdContainer: {
    marginTop: Theme.spacing.sm,
  },

  requestIdText: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.text.tertiary,
    fontWeight: Theme.typography.fontWeight.medium,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },

  loadingText: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.secondary,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing['5xl'],
  },

  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.xl,
  },

  emptyTitle: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },

  emptySubtitle: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
  },
});

export default HistoryScreen;
