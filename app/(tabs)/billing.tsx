import { Button, Card } from '@/components/common';
import { BillingHeader } from '@/components/home';
import { Theme } from '@/constants/Theme';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useCallback } from 'react';
import { FlatList, Platform, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import SideMenu from '../(screens)/SideMenu';

interface Transaction {
  id: string;
  service: string;
  amount: number;
  date: string;
  type: 'payment' | 'refund' | 'pending';
}

const transactions: Transaction[] = [
  { id: '1', service: 'Lawn Mowing Service', amount: 450, date: 'Aug 15, 2025', type: 'payment' },
  { id: '2', service: 'Garden Maintenance', amount: 800, date: 'Aug 10, 2025', type: 'payment' },
  { id: '3', service: 'Tree Trimming', amount: 620, date: 'Aug 01, 2025', type: 'pending' },
];

export default function BillingScreen() {
  const [isMenuVisible, setMenuVisible] = useState(false);

  const handleMenuPress = useCallback(() => {
    setMenuVisible(true);
  }, []);

  const totalBalance = transactions
    .filter(t => t.type === 'payment')
    .reduce((sum, t) => sum + t.amount, 0);

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const getTypeConfig = (type: string) => {
      switch (type) {
        case 'payment':
          return { icon: 'check-circle', color: Theme.colors.success[500] };
        case 'refund':
          return { icon: 'refresh', color: Theme.colors.info[500] };
        case 'pending':
          return { icon: 'schedule', color: Theme.colors.warning[500] };
        default:
          return { icon: 'attach-money', color: Theme.colors.neutral[500] };
      }
    };

    const config = getTypeConfig(item.type);

    return (
      <Card variant="outlined" padding="md" style={styles.transactionCard}>
        <View style={styles.transactionContent}>
          <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
            <Icon name={config.icon} size={24} color={config.color} />
          </View>

          <View style={styles.transactionDetails}>
            <Text style={styles.serviceName}>{item.service}</Text>
            <Text style={styles.transactionDate}>{item.date}</Text>
          </View>

          <View style={styles.amountContainer}>
            <Text style={[styles.amountText, { color: config.color }]}>
              ${item.amount.toFixed(2)}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="receipt-long" size={80} color={Theme.colors.neutral[300]} />
      <Text style={styles.emptyTitle}>No Transactions Yet</Text>
      <Text style={styles.emptyText}>
        Your billing history will appear here once you complete a service.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor={Theme.colors.primary[500]} />
      <BillingHeader onMenuPress={handleMenuPress} />

      {/* Balance Card */}
      <Card variant="elevated" padding="lg" style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Spent</Text>
        <Text style={styles.balanceAmount}>${totalBalance.toFixed(2)}</Text>
        <View style={styles.balanceFooter}>
          <Icon name="trending-up" size={16} color={Theme.colors.success[500]} />
          <Text style={styles.balanceFooterText}>All time</Text>
        </View>
      </Card>

      {/* Transaction History */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Transaction History</Text>
        <Icon name="filter-list" size={20} color={Theme.colors.text.secondary} />
      </View>

      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />

      {/* Payment Method Section */}
      <View style={styles.paymentSection}>
        <Card variant="outlined" padding="md">
          <View style={styles.paymentHeader}>
            <Icon name="credit-card" size={24} color={Theme.colors.primary[500]} />
            <Text style={styles.paymentTitle}>Payment Methods</Text>
          </View>
          <Text style={styles.paymentDescription}>
            Add a payment method for faster checkout
          </Text>
          <Button
            title="Add Payment Method"
            variant="outline"
            size="md"
            icon={<Icon name="add" size={20} color={Theme.colors.primary[500]} />}
            iconPosition="left"
            style={styles.addButton}
          />
        </Card>
      </View>

      <SideMenu
        isVisible={isMenuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
  },

  balanceCard: {
    marginBottom: Theme.spacing.xl,
    backgroundColor: Theme.colors.primary[50],
    borderWidth: 1,
    borderColor: Theme.colors.primary[100],
  },

  balanceLabel: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.xs,
  },

  balanceAmount: {
    fontSize: Theme.typography.fontSize['4xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.primary[600],
    marginBottom: Theme.spacing.sm,
  },

  balanceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },

  balanceFooterText: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.text.tertiary,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.base,
  },

  sectionTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.semiBold,
    color: Theme.colors.text.primary,
  },

  listContent: {
    paddingBottom: Platform.OS === 'ios' ? 220 : 200,
  },

  transactionCard: {
    marginBottom: 12,
  },

  transactionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  transactionDetails: {
    flex: 1,
    marginLeft: 12,
  },

  serviceName: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.text.primary,
    marginBottom: 2,
  },

  transactionDate: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.tertiary,
  },

  amountContainer: {
    alignItems: 'flex-end',
  },

  amountText: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.semiBold,
  },

  paymentSection: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 90 : 70,
    left: Theme.spacing.base,
    right: Theme.spacing.base,
  },

  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Theme.spacing.sm,
  },

  paymentTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.semiBold,
    color: Theme.colors.text.primary,
  },

  paymentDescription: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.base,
  },

  addButton: {
    marginTop: Theme.spacing.sm,
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing['3xl'],
    paddingTop: Theme.spacing['5xl'],
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
