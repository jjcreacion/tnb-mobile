import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import Constants from 'expo-constants';

const TabTwoScreen = () => {
  const [services, setServices] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(true);  
  const userId = 6;
  const API_URL = Constants.expoConfig?.extra?.API_BASE_URL;

  useEffect(() => {
    const fetchUserServices = async () => {
      setLoading(true); 
      try {
        const response = await axios.get(`${API_URL}/service_request/user/${userId}`);
        setServices(response.data);
        console.log(response.data); 
      } catch (error) {
        console.error('Error fetching user services:', error);
     } finally {
        setLoading(false); 
      }
    };

    fetchUserServices();
  }, [userId, API_URL]);

  const getStatusTextAndColor = (status) => {
    switch (status) {
      case 1:
        return { text: 'Finish', color: '#FFC107' };
      case 2:
        return { text: 'Approved', color: '#4CAF50' };
      case 3:
        return { text: 'In Progress', color: '#2196F3' };
      case 4:
        return { text: 'Closed', color: '#9E9E9E' };
      default:
        return { text: 'Pending', color: 'gray' };
    }
  };

  const renderServiceCard = (service) => {
    const statusInfo = getStatusTextAndColor(service.status);

    return (
      <TouchableOpacity key={service.requestId} style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{service.serviceDescription || 'No Description'}</Text>
          <TouchableOpacity onPress={() => console.log(`Open chat modal for request ${service.requestId}`)}>
            <Icon name="chat" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.cardDescription}>{service.address || 'No Address'}</Text>
        <View style={styles.cardFooter}>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
            <Text style={styles.statusBadgeText}>{statusInfo.text}</Text>
          </View>
          <Text style={styles.cardDate}>Created: {new Date(service.createdAt).toLocaleDateString()}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const filteredServices = selectedStatus === 'All'
    ? services
    : services.filter(service => getStatusTextAndColor(service.status).text === selectedStatus);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Activity</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : filteredServices.length > 0 ? (
        filteredServices.map(renderServiceCard)
      ) : (
        <Text>No services found.</Text>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: 'gray',
  },
});

export default TabTwoScreen;