import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';

const requests = [
  { 
    id: 1, 
    title: 'Permission Request', 
    description: 'Need permission to be absent on Friday.', 
    status: 'Pending', 
    createdAt: '2023-10-26', 
    handleChatPress: () => console.log('Open chat modal for request 1'),
    statusColor: '#FFC107' 
  },
  { 
    id: 2, 
    title: 'Reimbursement Request', 
    description: 'Travel expense reimbursement.', 
    status: 'Approved', 
    createdAt: '2023-10-25', 
    handleChatPress: () => console.log('Open chat modal for request 2'),
    statusColor: '#4CAF50' 
  },
  { 
    id: 3, 
    title: 'Material Request', 
    description: 'Request for office supplies.', 
    status: 'In Progress', 
    createdAt: '2023-10-24', 
    handleChatPress: () => console.log('Open chat modal for request 3'),
    statusColor: '#2196F3'
  },
   {
    id: 4,
    title: 'Technical Support Request',
    description: 'Problem with my computer.',
    status: 'Closed',
    createdAt: '2023-10-23',
    handleChatPress: () => console.log('Open chat modal for request 4'),
    statusColor: '#9E9E9E'
  },
  {
    id: 5,
    title: 'Vacation Request',
    description: 'Request for vacation in december.',
    status: 'Approved',
    createdAt: '2023-10-22',
    handleChatPress: () => console.log('Open chat modal for request 5'),
    statusColor: '#4CAF50'
  },
  {
    id: 6,
    title: 'Hardware Request',
    description: 'Hardware request for new computer.',
    status: 'In Progress',
    createdAt: '2023-10-21',
    handleChatPress: () => console.log('Open chat modal for request 6'),
    statusColor: '#2196F3'
  },
];

const TabTwoScreen = () => {
  const [selectedStatus, setSelectedStatus] = useState('All');

  const renderRequestCard = (request) => (
    <TouchableOpacity key={request.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{request.title}</Text>
        <TouchableOpacity onPress={request.handleChatPress}>
          <Icon name="chat" size={24} color="#007AFF" /> 
        </TouchableOpacity>
      </View>
      <Text style={styles.cardDescription}>{request.description}</Text>
      <View style={styles.cardFooter}>
        <View style={[styles.statusBadge, { backgroundColor: request.statusColor }]}>
          <Text style={styles.statusBadgeText}>{request.status}</Text>
        </View>
        <Text style={styles.cardDate}>Created: {request.createdAt}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>My Requests</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedStatus}
          onValueChange={(itemValue) => setSelectedStatus(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="All" value="All" />
          <Picker.Item label="Pending" value="Pending" />
          <Picker.Item label="Approved" value="Approved" />
          <Picker.Item label="In Progress" value="In Progress" />
          <Picker.Item label="Closed" value="Closed" />
        </Picker>
      </View>
      {requests.map(renderRequestCard)}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 16,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cardDate: {
    fontSize: 14,
    color: 'gray',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 16,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  statusBadgeText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default TabTwoScreen;