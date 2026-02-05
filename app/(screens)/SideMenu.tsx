import { Theme } from '@/constants/Theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  StatusBar as RNStatusBar,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppSelector } from '@/store/hooks';


interface SideMenuProps {
  isVisible: boolean;
  onClose: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  action?: () => void;
  color?: string;
  badge?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MENU_WIDTH = SCREEN_WIDTH * 0.62;

const SideMenu: React.FC<SideMenuProps> = ({ isVisible, onClose }) => {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(-MENU_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  // Store pending timers for cleanup on unmount
  const pendingTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  
  const userId = useAppSelector((state) => state.auth.userId);
  const isGuest = userId === 'GUEST_USER';

  // Get user data from Redux
  const { userName, userData } = useAppSelector((state) => state.user);
  const userEmail = isGuest ? "Guest Mode" : (userData?.email || 'user@mail.com');

  // Clean up all pending timers on unmount
  useEffect(() => {
    return () => {
      pendingTimersRef.current.forEach(timer => clearTimeout(timer));
      pendingTimersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 10,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -MENU_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, slideAnim, fadeAnim]);

  const handleItemPress = (item: MenuItem) => {
    if (isGuest && (item.id === 'profile' || item.id === 'notifications')) {
      onClose();
      setTimeout(() => {
        Alert.alert(
          "Access Restricted",
          "Please sign in to access this feature.",
          [
            { text: "Later", style: "cancel" },
            { text: "Sign In", onPress: () => router.replace('/login') }
          ]
        );
      }, 300);
      return;
    }

    onClose(); 
    const timer = setTimeout(() => {
      if (item.action) {
        item.action();
      } else if (item.route) {
        router.push(item.route as any); 
      }
    }, 300); 
    
    pendingTimersRef.current.push(timer); 
  };


  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['accessToken', 'userId']);
      onClose();
      const timer = setTimeout(() => {
        router.replace('/login' as any);
      }, 300);
      pendingTimersRef.current.push(timer);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const menuItems: MenuItem[] = [
    {
      id: 'profile',
      label: 'My Profile',
      icon: 'person',
      route: '/(screens)/profile',
      color: Theme.colors.primary[500],
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: 'notifications',
      route: '/(screens)/Notifications',
      color: Theme.colors.info[500],
    },
    {
      id: 'share',
      label: 'Share & Earn',
      icon: 'card-giftcard',
      route: '/(screens)/ShareAndEarn',
      color: Theme.colors.success[500],
    },
    {
      id: 'terms',
      label: 'Terms & Policies',
      icon: 'description',
      route: '/(screens)/TermsAndPolicies',
      color: Theme.colors.neutral[600],
    },
  ];

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Backdrop con blur effect */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: fadeAnim,
            }
          ]}
        >
          <TouchableOpacity
            style={styles.backdropTouchable}
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>

        {/* Menu Panel */}
        <Animated.View
          style={[
            styles.menuPanel,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {/* Header con gradient */}
          <LinearGradient
            colors={[Theme.colors.primary[500], Theme.colors.primary[700]]}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="close" size={24} color={Theme.colors.text.inverse} />
            </TouchableOpacity>

            {/* User Avatar & Info */}
            <View style={styles.userSection}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={[Theme.colors.whiteOverlay.medium, Theme.colors.whiteOverlay.light]}
                  style={styles.avatarGradient}
                >
                  <Icon name="person" size={32} color={Theme.colors.text.inverse} />
                </LinearGradient>
                <View style={styles.statusIndicator} />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{userName}</Text>
                <Text style={styles.userEmail} numberOfLines={1}>{userEmail}</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Menu Items */}
          <View style={styles.menuContent}>
            <View style={styles.menuSection}>
              <Text style={styles.sectionTitle}>MENU</Text>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  onPress={() => handleItemPress(item)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
                    <Icon name={item.icon} size={18} color={item.color} />
                  </View>
                  <Text style={styles.menuItemText}>{item.label}</Text>
                  {item.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                  <Icon
                    name="chevron-right"
                    size={16}
                    color={Theme.colors.text.tertiary}
                    style={styles.chevron}
                  />
                </TouchableOpacity>
              ))}
            </View>


            {/* Logout Button */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[Theme.colors.error[500], Theme.colors.error[600]]}
                style={styles.logoutGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Icon name={isGuest ? "login" : "logout"} size={18} color={Theme.colors.text.inverse} />
                <Text style={styles.logoutText}>{isGuest ? "Sign In / Register" : "Log Out"}</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Version */}
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Theme.colors.overlay.dark,
  },

  backdropTouchable: {
    flex: 1,
  },

  menuPanel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: MENU_WIDTH,
    backgroundColor: Theme.colors.surface.primary,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 16,
      },
    }),
  },

  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : (RNStatusBar.currentHeight || 0) + 20,
    paddingBottom: Theme.spacing.base,
    paddingHorizontal: Theme.spacing.base,
  },

  closeButton: {
    alignSelf: 'flex-end',
    width: 32,
    height: 32,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.whiteOverlay.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.sm,
  },

  userSection: {
    marginBottom: Theme.spacing.base,
    alignItems: 'center',
  },

  avatarContainer: {
    position: 'relative',
    marginBottom: Theme.spacing.sm,
  },

  avatarGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Theme.colors.whiteOverlay.medium,
  },

  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Theme.colors.success[500],
    borderWidth: 2,
    borderColor: Theme.colors.primary[500],
  },

  userInfo: {
    gap: 2,
    alignItems: 'center',
  },

  userName: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.inverse,
  },

  userEmail: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.whiteOverlay.veryStrong,
  },

  menuContent: {
    flex: 1,
    paddingTop: Theme.spacing.sm,
  },

  menuSection: {
    marginBottom: Theme.spacing.base,
  },

  sectionTitle: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.tertiary,
    letterSpacing: 0.5,
    marginLeft: Theme.spacing.base,
    marginBottom: Theme.spacing.xs,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: Theme.spacing.base,
    gap: 10,
  },

  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuItemText: {
    flex: 1,
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.text.primary,
  },

  badge: {
    backgroundColor: Theme.colors.error[500],
    borderRadius: Theme.borderRadius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },

  badgeText: {
    fontSize: 10,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.inverse,
  },

  chevron: {
    opacity: 0.4,
  },

  logoutButton: {
    marginHorizontal: Theme.spacing.base,
    marginTop: 'auto',
    marginBottom: Theme.spacing.base,
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
    ...Theme.shadows.sm,
  },

  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },

  logoutText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.inverse,
  },

  versionText: {
    fontSize: 10,
    color: Theme.colors.text.tertiary,
    textAlign: 'center',
    marginBottom: Platform.OS === 'ios' ? Theme.spacing.base : Theme.spacing.sm,
  },
});

export default SideMenu;
