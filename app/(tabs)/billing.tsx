import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { FlatList, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Transaction {
  id: string;
  service: string;
  amount: number;
  date: string;
}

const transactions: Transaction[] = [
  { id: '1', service: 'Roofing Repair', amount: 450, date: 'Aug 15, 2025' },
  { id: '2', service: 'Window Installation', amount: 800, date: 'Aug 10, 2025' },
  { id: '3', service: 'Insulation', amount: 620, date: 'Aug 01, 2025' },
];

export default function BillingScreen() {
  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <Icon name="attach-money" size={24} color="#4CAF50" />
      <View style={styles.transactionDetails}>
        <Text style={styles.serviceName}>{item.service}</Text>
        <Text style={styles.transactionDate}>{item.date}</Text>
      </View>
      <Text style={styles.amountText}>${item.amount.toFixed(2)}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
       <View style={styles.backgroundTop}>
            <LinearGradient
            colors={['#ea0e08', '#fa2d64']}
            style={styles.linearGradientHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            >
            <View style={styles.headerContainer}>
                <View style={styles.leftHeader}>
                <Text style={styles.companyName}>Billing</Text>
                </View>
            </View>
        </LinearGradient>
        </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Transaction History</Text>
        <FlatList
          data={transactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item.id}
          style={styles.transactionsList}
          ListEmptyComponent={<Text style={styles.emptyText}>No transactions.</Text>}
        />
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Payment Methods</Text>
        <TouchableOpacity style={styles.addButton}>
          <Icon name="add-circle-outline" size={20} color="#007BFF" />
          <Text style={styles.addButtonText}>Add Payment Method</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    margin: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    color: '#555',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 0,
    marginBottom: 0,
    width: '100%',
    backgroundColor: 'transparent',
  },
  backgroundTop: {
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
  },
  companyName: {
    color: '#fff7f9',
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 8,
  },
   linearGradientHeader: {
      width: '100%',
      paddingTop: 40,
      paddingBottom: 20,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
        },
        android: {
          elevation: 3,
        },
      }),
    },
  transactionsList: {
    marginTop: 10,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  transactionDetails: {
    flex: 1,
    marginLeft: 10,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 14,
    color: '#888',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007BFF',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
});