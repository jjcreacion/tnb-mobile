import React, { useState, useEffect, useCallback } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Theme } from '../../constants/Theme';
import Constants from 'expo-constants';

interface ReferredUser {
  referredFullName: string;
  rewardAmount: string;
  referredAt: string;
}

interface ReferralListModalProps {
  isVisible: boolean;
  onClose: () => void;
  userId: number; 
  API_BASE_URL: string; 
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

const ReferralListModal: React.FC<ReferralListModalProps> = ({ isVisible, onClose, userId, API_BASE_URL }) => {
  const [referrals, setReferrals] = useState<ReferredUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
 
  const endpoint = `${API_BASE_URL}/user/referred-by/${userId}`;

  const fetchReferrals = useCallback(async () => {
    if (!userId || !isVisible) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        if (response.status === 404 || response.status === 204) {
             setReferrals([]); 
        } else {
             throw new Error(`Error ${response.status}: Failed to fetch referrals.`);
        }
      } else {
        const data = await response.json();
        const dataArray = Array.isArray(data) ? data : (data ? [data] : []);
        setReferrals(dataArray);
      }
    } catch (err: any) {
      console.error("Error fetching referrals:", err);
      setError('Could not load referral list.');
      Alert.alert("Error", "Could not load referral list. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [userId, isVisible]);

  useEffect(() => {
    if (isVisible) {
      fetchReferrals();
    }
  }, [isVisible, fetchReferrals]);

  const renderItem = ({ item }: { item: ReferredUser }) => (
    <View style={modalStyles.listItem}>
      <FontAwesome name="user-circle" size={24} color={Theme.colors.primary[500]} style={modalStyles.icon} />
      <View style={modalStyles.textContainer}>
        <Text style={modalStyles.listName}>{item.referredFullName}</Text>
        <Text style={modalStyles.listDate}>Joined: {formatDate(item.referredAt)}</Text>
      </View>
      <Text style={modalStyles.listReward}>+${parseFloat(item.rewardAmount).toFixed(0)}</Text>
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={modalStyles.centeredView}>
        <View style={modalStyles.modalView}>
          
          <View style={modalStyles.modalHeader}>
            <Text style={modalStyles.modalTitle}>Your Referrals</Text>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
              <FontAwesome name="close" size={24} color={Theme.colors.text.primary} />
            </TouchableOpacity>
          </View>
          
          {isLoading ? (
            <ActivityIndicator size="large" color={Theme.colors.primary[500]} style={modalStyles.loading} />
          ) : error ? (
            <Text style={modalStyles.errorText}>{error}</Text>
          ) : referrals.length === 0 ? (
            <View style={modalStyles.emptyContainer}>
                <FontAwesome name="users" size={48} color={Theme.colors.neutral[300]} />
                <Text style={modalStyles.emptyText}>You haven't referred anyone yet.</Text>
                <Text style={modalStyles.emptyTextSmall}>Share your link and start earning!</Text>
            </View>
          ) : (
            <FlatList
              data={referrals}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              style={modalStyles.list}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: '100%',
        maxHeight: '80%', 
        backgroundColor: Theme.colors.background.primary,
        borderTopLeftRadius: Theme.borderRadius.xl,
        borderTopRightRadius: Theme.borderRadius.xl,
        padding: Theme.spacing.xl,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalHeader: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Theme.spacing.lg,
        paddingBottom: Theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.border.light,
    },
    modalTitle: {
        fontSize: Theme.typography.fontSize['xl'],
        fontWeight: Theme.typography.fontWeight.bold,
        color: Theme.colors.text.primary,
    },
    closeButton: {
        padding: Theme.spacing.xs,
    },
    loading: {
        marginVertical: Theme.spacing['2xl'],
    },
    errorText: {
        color: Theme.colors.danger[500],
        textAlign: 'center',
        marginTop: Theme.spacing.lg,
    },
    list: {
        width: '100%',
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Theme.spacing.base,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.neutral[100],
    },
    icon: {
        marginRight: Theme.spacing.lg,
    },
    textContainer: {
        flex: 1,
    },
    listName: {
        fontSize: Theme.typography.fontSize.base,
        fontWeight: Theme.typography.fontWeight.medium,
        color: Theme.colors.text.primary,
    },
    listDate: {
        fontSize: Theme.typography.fontSize.sm,
        color: Theme.colors.text.secondary,
        marginTop: 2,
    },
    listReward: {
        fontSize: Theme.typography.fontSize.base,
        fontWeight: Theme.typography.fontWeight.bold,
        color: Theme.colors.success[600],
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: Theme.spacing['2xl'],
    },
    emptyText: {
        fontSize: Theme.typography.fontSize.lg,
        fontWeight: Theme.typography.fontWeight.medium,
        color: Theme.colors.neutral[500],
        marginTop: Theme.spacing.lg,
    },
    emptyTextSmall: {
        fontSize: Theme.typography.fontSize.base,
        color: Theme.colors.neutral[400],
        marginTop: Theme.spacing.sm,
    }
});

export default ReferralListModal;