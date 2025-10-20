import { MigratedStyles } from '@/constants/MigratedStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface SideMenuProps {
  isVisible: boolean;
  onClose: () => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ isVisible, onClose }) => {

  const router = useRouter();

  const handleItemPress = (item: string) => {
    console.log(`Navigating to: ${item}`);
    if (item === 'Share and Earn') {
      router.push('/(screens)/ShareAndEarn' as any);
     } else if (item === 'Profile') {
      router.push('/(screens)/profile' as any);
     } else if (item === 'Terms and Policies') {
       router.push('/(screens)/TermsAndPolicies' as any);
     }
    onClose();
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['accessToken', 'userId']);
      onClose();
      router.replace('/login' as any);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={MigratedStyles.sideMenuOverlay}
        activeOpacity={1}
        onPressOut={onClose}
      >
        <View style={MigratedStyles.sideMenuContainer}>
          <View style={MigratedStyles.sideMenuHeader}>
            <Text style={MigratedStyles.sideMenuTitle}>Menu</Text>
            <TouchableOpacity onPress={onClose} style={MigratedStyles.sideMenuCloseButton}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={MigratedStyles.sideMenuItem} onPress={() => handleItemPress('Profile')}>
            <Icon name="account-circle" size={24} color="#333" />
            <Text style={MigratedStyles.sideMenuItemText}>My Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={MigratedStyles.sideMenuItem} onPress={() => handleItemPress('Terms and Policies')}>
            <Icon name="gavel" size={24} color="#333" />
            <Text style={MigratedStyles.sideMenuItemText}>Terms and Policies</Text>
          </TouchableOpacity>
          <TouchableOpacity style={MigratedStyles.sideMenuItem} onPress={() => handleItemPress('Notifications')}>
            <Icon name="notifications" size={24} color="#333" />
            <Text style={MigratedStyles.sideMenuItemText}>Notifications</Text>
          </TouchableOpacity>
          <TouchableOpacity style={MigratedStyles.sideMenuItem} onPress={() => handleItemPress('Share and Earn')}>
            <Icon name="share" size={24} color="#333" />
            <Text style={MigratedStyles.sideMenuItemText}>Share and Earn</Text>
          </TouchableOpacity>
          <View style={MigratedStyles.sideMenuSeparator} />
          <TouchableOpacity style={MigratedStyles.sideMenuItem} onPress={handleLogout}>
            <Icon name="logout" size={24} color="#d9534f" />
            <Text style={[MigratedStyles.sideMenuItemText, { color: '#d9534f' }]}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default SideMenu;