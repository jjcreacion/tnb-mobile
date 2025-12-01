import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Card } from '@/components/common';
import { HistoryHeader } from '@/components/home';
import { Theme } from '@/constants/Theme';
import SideMenu from '../(screens)/SideMenu';

interface Notification {
  id: number;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

const NotificationScreen = () => {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  const API_URL = Constants.expoConfig?.extra?.API_BASE_URL; 

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMenuVisible, setMenuVisible] = useState(false);
  const router = useRouter();

  const fetchNotifications = useCallback(async (currentUserId: string) => {
    setIsRefreshing(true);
    setLoading(true);
    try {
      const ENDPOINT_URL = `${API_URL}/notifications/user/${currentUserId}`; 
      const response = await axios.get<Notification[]>(ENDPOINT_URL);

      if (response.status === 200) {
        const sortedNotifications = response.data.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setNotifications(sortedNotifications);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [API_URL]);

  useEffect(() => {
    const initialize = async () => {
      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedUserId) {
        setUserId(storedUserId);
        const idToFetch = '21'; 
        fetchNotifications(idToFetch);
      } else {
        setLoading(false);
        setIsRefreshing(false);
      }
    };
    initialize();
  }, [fetchNotifications]);

  const onRefresh = useCallback(async () => {
    const currentUserId = await AsyncStorage.getItem('userId');
    if (currentUserId) {
      const idToFetch = '21';
      fetchNotifications(idToFetch);
    }
  }, [fetchNotifications]);

  const handleMenuPress = useCallback(() => {
    setMenuVisible(true);
  }, []);

  const markAsRead = useCallback(async (notificationId: number) => {
    setNotifications(prev => {
      const updatedList = prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      return updatedList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    });

    if (!API_URL) {
        console.error("API_URL is not configured.");
        return;
    }
    
    const readEndpoint = `${API_URL}/notifications/read/${notificationId}`;
   
    try {
        await axios.patch(readEndpoint); 
    } catch (error) {
        console.error(`Error marking notification ${notificationId} as read:`, error);
    }
  }, [API_URL]);


  const handleCardPress = (notification: Notification) => {
    if (!notification.isRead) {
        markAsRead(notification.id);
    }

    router.push({
      pathname: '/(screens)/NotificationDetail',
      params: { notification: JSON.stringify({ ...notification, isRead: true }) },
    });
  };

  const renderNotificationCard = ({ item: notification }: { item: Notification }) => {
    const isRead = notification.isRead;

    const cardBackgroundColor = isRead ? Theme.colors.background.tertiary : Theme.colors.background.primary; 
    const titleTextColor = isRead ? Theme.colors.text.primary : Theme.colors.text.secondary; 
    const dateTextColor = isRead ? Theme.colors.text.secondary : Theme.colors.text.tertiary; 
    const iconColor = isRead ? Theme.colors.primary[500] : Theme.colors.primary[300]; 
    const titleFontWeight = isRead ? Theme.typography.fontWeight.regular : Theme.typography.fontWeight.bold; 
    
    return (
      <TouchableOpacity onPress={() => handleCardPress(notification)}>
        <Card 
          variant="elevated" 
          padding="sm" 
          style={[
            styles.notificationCard, 
            styles.cardShadow, 
            { 
              backgroundColor: cardBackgroundColor, 
            }
          ]}
        >
          <View style={styles.iconContainer}>
            <Icon 
              name={isRead ? "notifications-outline" : "notifications"} 
              size={24} 
              color={iconColor} 
            />
          </View>
          
          <View style={styles.cardContent}>
            <View style={styles.notificationTitleContainer}>
              <Text 
                style={[
                  styles.notificationTitle, 
                  { 
                    fontWeight: titleFontWeight,
                    color: titleTextColor,
                  } 
                ]} 
                numberOfLines={1}
              >
                {notification.title || 'No Title'}
              </Text>
            </View>
            <View style={styles.dateContainerModified}>
              <Text style={[
                styles.dateTextModified,
                { color: dateTextColor }
              ]}>
                {new Date(notification.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };
  
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon name="notifications-off-outline" size={64} color={Theme.colors.text.tertiary} />
      </View>
      <Text style={styles.emptyTitle}>You have no Notifications</Text>
      <Text style={styles.emptySubtitle}>Check back later.</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon name="alert-circle-outline" size={64} color={Theme.colors.error[500]} />
      </View>
      <Text style={styles.emptyTitle}>Unable to Load</Text>
      <Text style={styles.emptySubtitle}>Could not load user data or notifications.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor={Theme.colors.primary[500]} />
      <HistoryHeader onMenuPress={handleMenuPress} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary[500]} />
          <Text style={styles.loadingText}>Loading your notifications...</Text>
        </View>
      ) : !userId ? (
        renderErrorState()
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationCard} 
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[
            styles.listContent,
            notifications.length === 0 && styles.listContentEmpty,
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
  );
};

const styles = StyleSheet.create({
    container: {
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

      cardShadow: Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 }, 
          shadowOpacity: 0.1, 
          shadowRadius: 1, 
        },
        android: {
          elevation: 2, 
        },
      }),
    
      notificationCard: {
        marginBottom: Theme.spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Theme.spacing.base, 
        paddingHorizontal: Theme.spacing.base, 
        borderRadius: Theme.borderRadius.sm, 
      },

      iconContainer: {
        paddingRight: Theme.spacing.base,
        justifyContent: 'center',
        alignItems: 'center',
      },
    
      cardContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
    
      notificationTitleContainer: {
        flex: 2, 
        justifyContent: 'center',
      },
    
      notificationTitle: {
        fontSize: Theme.typography.fontSize.base, 
        lineHeight: Theme.typography.lineHeight.base,
      },
    
      dateContainerModified: {
        flex: 1, 
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
      },
    
      dateTextModified: {
        fontSize: Theme.typography.fontSize.sm,
        textAlign: 'right',
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

export default NotificationScreen;