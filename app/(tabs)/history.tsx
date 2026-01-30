import { SwipeableTabScreen } from '@/components/common';
import { HistoryHeader } from '@/components/home';
import { Theme } from '@/constants/Theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import SideMenu from '../(screens)/SideMenu';

interface ReadCategoryDto {
  pkCategory: number;
  name: string;
}

interface ReadSubCategoryDto {
  pkSubCategory: number;
  name: string;
}

interface ServiceRequest {
  requestId: number;
  serviceDescription: string;
  fkCategory: ReadCategoryDto;
  fkSubCategory?: ReadSubCategoryDto;
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

interface StatusStyle {
  borderColor: string;
  badgeBackground: string;
  badgeText: string;
  icon: string;
}

const STATUS_STYLES: { [key: string]: StatusStyle } = {
  submitted: {
    borderColor: '#3B82F6',
    badgeBackground: '#EFF6FF',
    badgeText: '#1E40AF',
    icon: 'paper-plane',
  },
  'under review': {
    borderColor: '#F59E0B',
    badgeBackground: '#FFFBEB',
    badgeText: '#B45309',
    icon: 'search',
  },
  approved: {
    borderColor: '#10B981',
    badgeBackground: '#ECFDF5',
    badgeText: '#065F46',
    icon: 'checkmark-done-circle',
  },
  'in progress': {
    borderColor: '#8B5CF6',
    badgeBackground: '#F5F3FF',
    badgeText: '#5B21B6',
    icon: 'construct',
  },
  'on hold': {
    borderColor: '#F97316',
    badgeBackground: '#FFF7ED',
    badgeText: '#C2410C',
    icon: 'pause-circle',
  },
  completed: {
    borderColor: '#06B6D4',
    badgeBackground: '#ECFEFF',
    badgeText: '#155E75',
    icon: 'checkmark-circle',
  },
  rejected: {
    borderColor: '#EF4444',
    badgeBackground: '#FEF2F2',
    badgeText: '#991B1B',
    icon: 'close-circle',
  },
  canceled: {
    borderColor: '#64748B',
    badgeBackground: '#F8FAFC',
    badgeText: '#334155',
    icon: 'ban',
  },
};

const HistoryScreen = () => {
  const insets = useSafeAreaInsets();
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
      } else if (response.status === 404) {
        if (response.data && (response.data as any).message && (response.data as any).message.includes('No requests found')) {
          setServices([]);
        } else {
          console.error('Error inesperado al obtener servicios:', response);
        }
      } else {
        console.error('Error al obtener servicios:', response);
      }
    } catch {
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
    const statusInfo = getStatusInfo(service.fkRequestStatus);
    const statusName = statusList.find(s => s.statusId === (service.fkRequestStatus === null ? 1 : service.fkRequestStatus))?.name || 'Submitted';
    const serviceWithStatus = { ...service, statusInfo: { ...statusInfo, text: statusName } };
    router.push({
      pathname: '/(screens)/ServiceRequestDetail',
      params: { service: JSON.stringify(serviceWithStatus) },
    });
  };

  const getStatusInfo = (fkRequestStatus: number | null): StatusStyle => {
    const statusId = fkRequestStatus === null ? 1: fkRequestStatus;
    const statusObject = statusList.find(status => status.statusId === statusId);
    const statusName = statusObject?.name?.toLowerCase() || 'submitted';
    
    return STATUS_STYLES[statusName] || STATUS_STYLES['submitted'];
  };

  const renderServiceCard = ({ item: service }: { item: ServiceRequest }) => {
    const statusInfo = getStatusInfo(service.fkRequestStatus);
    const statusName = statusList.find(s => s.statusId === (service.fkRequestStatus === null ? 1 : service.fkRequestStatus))?.name || 'Submitted';
    const hasSubCategory = !!service.fkSubCategory;

    return (
      <TouchableOpacity onPress={() => handleCardPress(service)} activeOpacity={0.7}>
        <View style={[styles.card, { borderLeftColor: statusInfo.borderColor }]}>
          
          {/* Top Row: Category/Subcategory (Left) + Request ID (Right) */}
          <View style={styles.topRow}>
            {/* Left: Category → Subcategory */}
            <Text style={styles.categoryText} numberOfLines={1}>
              <Text style={styles.categoryBold}>{service.fkCategory?.name || 'Category'}</Text>
              {hasSubCategory && (
                <>
                  <Text style={styles.categoryText}> → </Text>
                  <Text style={styles.subCategoryItalic}>{service.fkSubCategory?.name}</Text>
                </>
              )}
            </Text>

            {/* Right: Request ID */}
            <Text style={styles.requestIdText}>#{service.requestId}</Text>
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {service.serviceDescription || 'Service Request'}
            </Text>
          </View>

          {/* Address Section */}
          <View style={styles.addressRow}>
            <Icon name="location-outline" size={20} color={statusInfo.borderColor} style={styles.locationIcon} />
            <Text style={styles.addressText} numberOfLines={2}>
              {service.address || 'No address'}
            </Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Bottom Row: Status (Left) + Date (Right) */}
          <View style={styles.bottomRow}>
            {/* Left: Status Badge */}
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.badgeBackground }]}>
              <Icon name={statusInfo.icon} size={16} color={statusInfo.borderColor} />
              <Text style={[styles.statusBadgeText, { color: statusInfo.borderColor }]}>
                {statusName}
              </Text>
            </View>

            {/* Right: Date */}
            <View style={styles.dateSection}>
              <Icon name="calendar-clear-outline" size={16} color={statusInfo.borderColor} />
              <Text style={styles.dateText}>
                {new Date(service.createdAt).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>
        </View>
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
    <SwipeableTabScreen tabName="history">
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
            services.length === 0 && styles.listContentEmpty,
            Platform.OS === 'android' && {
              paddingBottom: 70 + insets.bottom + 20,
            },
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
    </SwipeableTabScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
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
    marginBottom: Theme.spacing.base,
    // borderRadius: Theme.borderRadius.xl,
    borderRadius: 8,

    padding: 20,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  categoryText: {
    flex: 1,
    fontSize: 12,
    fontWeight: Theme.typography.fontWeight.medium,
    color: '#64748B',
    marginRight: Theme.spacing.sm,
  },

  categoryBold: {
    fontWeight: Theme.typography.fontWeight.bold,
    color: '#64748B',
  },

  subCategoryItalic: {
    fontStyle: 'italic',
    color: '#64748B',
  },

  requestIdText: {
    fontSize: 11,
    fontWeight: Theme.typography.fontWeight.medium,
    color: '#64748B',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Theme.borderRadius.full,
  },

  statusBadgeText: {
    fontSize: 13,
    fontWeight: Theme.typography.fontWeight.semiBold,
    textTransform: 'capitalize',
  },

  titleSection: {
    marginBottom: Theme.spacing.base,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: Theme.typography.fontWeight.bold,
    color: '#1F2937',
    lineHeight: 24,
    letterSpacing: -0.3,
  },

  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: 12,
  },

  locationIcon: {
    marginRight: 4,
  },

  addressText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: Theme.typography.lineHeight.base,
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    marginVertical: 12,
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },

  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: Theme.typography.fontWeight.bold,
  },



  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Theme.spacing.sm,
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
