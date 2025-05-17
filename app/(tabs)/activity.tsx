import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TabTwoScreen = ({ navigation }) => { // Asegúrate de recibir la prop navigation si la estás usando para navegar
  const [services, setServices] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const API_URL = Constants.expoConfig?.extra?.API_BASE_URL;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchServices = useCallback(async (currentUserId) => {
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
    } catch (error) {
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [API_URL, setServices, setLoading, setIsRefreshing]);

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
      } catch (error) {
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
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.header}>Activity</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : userId ? (
        filteredServices.length > 0 ? (
          filteredServices.map(renderServiceCard)
        ) : (
          <Text>No services found.</Text>
        )
      ) : (
        <Text>No se ha podido cargar la información del usuario.</Text>
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