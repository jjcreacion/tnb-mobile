import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Card, StatusBadge } from '@/components/common';
import { ActivityHeader } from '@/components/home';
import { Theme } from '@/constants/Theme';
import SideMenu from '../(screens)/SideMenu';

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
  const [isMenuVisible, setMenuVisible] = useState(false);

  const fetchServices = useCallback(async (currentUserId: string) => {
    setIsRefreshing(true);
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/service_request/user/${currentUserId}`);

      if (response.status === 200) {
        setServices(response.data);
        console.log('Datos del usuario cargados:', response.data);
      } else if (response.status === 404) {
        if (response.data && response.data.message && response.data.message.includes('No requests found')) {
          setServices([]);
          console.log('No se encontraron solicitudes para este usuario.');
        } else {
          console.error('Error inesperado al obtener servicios:', response);
        }
      } else {
        console.error('Error al obtener servicios:', response);
      }
    } catch {
      // Handle network or other errors silently for now, as per original logic
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

  const handleMenuPress = useCallback(() => {
    setMenuVisible(true);
  }, []);

  const getStatusConfig = (status: number) => {
    switch (status) {
      case 1:
        return { text: 'Finish', variant: 'warning' as const };
      case 2:
        return { text: 'Approved', variant: 'success' as const };
      case 3:
        return { text: 'In Progress', variant: 'info' as const };
      case 4:
        return { text: 'Closed', variant: 'neutral' as const };
      default:
        return { text: 'Pending', variant: 'warning' as const };
    }
  };

  const renderServiceCard = ({ item: service }: { item: Service }) => {
    const statusConfig = getStatusConfig(service.status);

    return (
      <Card variant="elevated" padding="md" style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {service.serviceDescription || 'No Description'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => console.log(`Open chat modal for request ${service.requestId}`)}
          >
            <Icon name="chatbubble-ellipses" size={22} color={Theme.colors.primary[500]} />
          </TouchableOpacity>
        </View>

        <View style={styles.addressContainer}>
          <Icon name="location" size={16} color={Theme.colors.text.tertiary} />
          <Text style={styles.addressText} numberOfLines={2}>
            {service.address || 'No Address'}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <StatusBadge label={statusConfig.text} variant={statusConfig.variant} />
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
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon name="notifications-off-outline" size={64} color={Theme.colors.text.tertiary} />
      </View>
      <Text style={styles.emptyTitle}>No Activity Yet</Text>
      <Text style={styles.emptySubtitle}>Your service requests will appear here</Text>
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
      <ActivityHeader onMenuPress={handleMenuPress} />

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary[500]} />
          <Text style={styles.loadingText}>Loading your activity...</Text>
        </View>
      ) : !userId ? (
        renderErrorState()
      ) : (
        <FlatList
          data={services}
          renderItem={renderServiceCard}
          keyExtractor={(item) => item.requestId}
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

  chatButton: {
    width: 36,
    height: 36,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
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

export default ActivityScreen;
