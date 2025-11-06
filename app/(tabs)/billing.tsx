import { Button, Card } from '@/components/common';
import { BillingHeader } from '@/components/home';
import { Theme } from '@/constants/Theme';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useCallback, useEffect } from 'react';
import { FlatList, Platform, StyleSheet, Text, View, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import SideMenu from '../(screens)/SideMenu';
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchInvoices } from '@/store/slices/invoiceSlice';

export interface Invoice {
  invoice_id: number;
  fk_user: number;
  invoice_amount: number;
  invoice_status: string; 
  public_link: string;
  invoice_number: string;
  invoice_date: string;
  created_at: string;
  updated_at: string;
}  

export default function BillingScreen() {
  const insets = useSafeAreaInsets();
  const [isMenuVisible, setMenuVisible] = useState(false);
  const dispatch = useAppDispatch()
  const { invoices, loading, error } = useAppSelector(state => state.invoice);
    
  const handleMenuPress = useCallback(() => {
    setMenuVisible(true);
  }, []);

   useEffect(() => {
      dispatch(fetchInvoices())
   }, [dispatch])
  
  const totalSpent = invoices
    .filter(i => i.invoice_status.toLowerCase() === 'paid') 
    .reduce((sum, i) => sum + i.invoice_amount, 0);

  const sortedInvoices = [...invoices].sort((a, b) => {
    if (a.invoice_date > b.invoice_date) return -1;
    if (a.invoice_date < b.invoice_date) return 1;
    return 0;
  });

  const handleViewPdf = useCallback((url: string) => {
    if (url) {
      Linking.openURL(url);
    }
  }, []);
  
  const renderInvoice = ({ item }: { item: Invoice }) => {
    
    const getStatusConfig = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid':
                return { 
                    label: 'Paid', 
                    color: Theme.colors.success[600], 
                    bgColor: Theme.colors.success[50], 
                    icon: 'checkmark-circle' 
                };
            case 'pending':
                return { 
                    label: 'Pending', 
                    color: Theme.colors.warning[600], 
                    bgColor: Theme.colors.warning[50],
                    icon: 'time'
                };
            case 'cancelled':
                return { 
                    label: 'Cancelled', 
                    color: Theme.colors.error[600], 
                    bgColor: Theme.colors.error[50],
                    icon: 'close-circle'
                };
            default:
                return { 
                    label: status.charAt(0).toUpperCase() + status.slice(1), 
                    color: Theme.colors.neutral[600], 
                    bgColor: Theme.colors.neutral[50],
                    icon: 'document-text'
                };
        }
    };

    const config = getStatusConfig(item.invoice_status);

    return (
      <Card variant="outlined" padding="sm" style={styles.transactionCard}> 
        <View style={styles.transactionContent}>
          <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
            <Icon name={config.icon} size={24} color={config.color} />
          </View>

          <View style={styles.invoiceDetails}>
            <Text style={styles.invoiceNumber}>
              Invoice: <Text style={styles.invoiceNumberValue}>{item.invoice_number}</Text>
            </Text>
            <Text style={styles.invoiceDate}>{item.invoice_date}</Text>
          </View>

          <View style={styles.amountContainer}>
            <Text style={[styles.amountText, { color: config.color }]}>
              ${item.invoice_amount.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.actionButtonsContainer}>
            <Button
                title="View PDF" 
                variant="outline"
                size="sm"
                icon={<Icon name="open" size={16} color={Theme.colors.primary[500]} />}
                iconPosition="left"
                onPress={() => handleViewPdf(item.public_link)}
                style={styles.actionButton}
            />
            <View style={[styles.statusButton, { backgroundColor: config.bgColor, borderColor: config.color + '50' }]}>
                <Text style={[styles.statusButtonText, { color: config.color }]}>
                    {config.label}
                </Text>
            </View>
        </View>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      {loading ? (
        <Text style={styles.emptyTitle}>Loading Invoices...</Text>
      ) : error ? (
        <Text style={[styles.emptyTitle, { color: Theme.colors.error[500] }]}>Error Loading: {error}</Text>
      ) : (
        <>
          <Icon name="receipt-long" size={80} color={Theme.colors.neutral[300]} />
          <Text style={styles.emptyTitle}>No Invoices Yet</Text>
          <Text style={styles.emptyText}>
            Your billing history will appear here.
          </Text>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor={Theme.colors.primary[500]} />
      <BillingHeader onMenuPress={handleMenuPress} />

      <Card variant="elevated" padding="lg" style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Spent</Text>
        <Text style={styles.balanceAmount}>${totalSpent.toFixed(2)}</Text>
        <View style={styles.balanceFooter}>
          <Icon name="trending-up" size={16} color={Theme.colors.success[500]} />
          <Text style={styles.balanceFooterText}>All-Time</Text>
        </View>
      </Card>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Invoice History</Text>
      </View>

      <FlatList
        data={sortedInvoices}
        renderItem={renderInvoice}
        keyExtractor={(item) => item.invoice_id.toString()}
        contentContainerStyle={[
          styles.listContent,
          Platform.OS === 'android' && {
            paddingBottom: 70 + insets.bottom + 220,
          },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />

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
    backgroundColor: Theme.colors.neutral[50], 
    borderWidth: 1,
    borderColor: Theme.colors.neutral[100], 
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
    marginBottom: Theme.spacing.sm, 
  },
  
  iconContainer: {
    width: 40, 
    height: 40,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  invoiceDetails: {
    flex: 1,
    marginLeft: 12,
  },

  invoiceNumber: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.text.secondary,
    marginBottom: 2,
  },

  invoiceNumberValue: {
    fontWeight: Theme.typography.fontWeight.semiBold,
    color: Theme.colors.text.primary,
  },
  
  invoiceDate: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.tertiary,
  },
  
  amountContainer: {
    alignItems: 'flex-end',
  },
  
  amountText: {
    fontSize: Theme.typography.fontSize.base, 
    fontWeight: Theme.typography.fontWeight.semiBold,
  },
  
  actionButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: Theme.spacing.sm,
      marginTop: Theme.spacing.sm, 
      paddingTop: Theme.spacing.sm, 
      borderTopWidth: 1,
      borderTopColor: Theme.colors.neutral[100],
  },

  actionButton: {
    minWidth: 100, 
  },
  
  statusButton: {
      paddingVertical: Theme.spacing.xs,
      paddingHorizontal: Theme.spacing.base,
      borderRadius: Theme.borderRadius.sm,
      borderWidth: 1,
      minWidth: 100, 
      alignItems: 'center',
      justifyContent: 'center',
  },

  statusButtonText: {
      fontSize: Theme.typography.fontSize.sm,
      fontWeight: Theme.typography.fontWeight.semiBold,
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