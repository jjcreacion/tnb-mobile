import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';


// Definición de tipos para los datos de las APIs
interface ServiceRequest {
  requestId: number;
  serviceDescription: string;
  address: string;
  latitude: string;
  longitude: string;
  fkRequestStatus: number | null;
  createdAt: string;
  updatedAt: string | null;
  fkUser: {
    pkUser: number;
    email: string;
    username: string | null;
    password: string;
    phone: string | null;
    validateEmail: number;
    validatePhone: number;
    status: number;
    img_profile: string;
    roles: string[];
    createdAt: string;
    updatedAt: string;
  };
}

interface Status {
  statusId: number;
  order: number;
  name: string;
  color: string;
}

const HistoryScreen = () => {
  const [services, setServices] = useState<ServiceRequest[]>([]);
  const [statusList, setStatusList] = useState<Status[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const API_URL = Constants.expoConfig?.extra?.API_BASE_URL;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  // Función para obtener la lista de estados de la API
  const fetchStatusList = useCallback(async () => {
    try {
      const response = await axios.get<Status[]>(`${API_URL}/status-list`);
      if (response.status === 200) {
        setStatusList(response.data);
      }
    } catch (error) {
      console.error('Error fetching status list:', error);
    }
  }, []);

  // Función para obtener las solicitudes de servicio del usuario
  const fetchServices = useCallback(async (currentUserId: string) => {
    setIsRefreshing(true);
    setLoading(true);
    try {
      const response = await axios.get<ServiceRequest[]>(`${API_URL}/service_request/user/${currentUserId}`);

      if (response.status === 200) {
        setServices(response.data);
        console.log('Datos del usuario cargados:', response.data);
      } else if (response.status === 404) {
        if (response.data && (response.data as any).message && (response.data as any).message.includes('No requests found')) {
          setServices([]);
          console.log('No se encontraron solicitudes para este usuario.');
        } else {
          console.error('Error inesperado al obtener servicios:', response);
        }
      } else {
        console.error('Error al obtener servicios:', response);
      }
    } catch (error) {
      console.error('Network or other error fetching services:', error);
      setServices([]); // Establecer a un array vacío en caso de error
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [API_URL]);

  useEffect(() => {
    const initialize = async () => {
      await fetchStatusList();
      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedUserId) {
        setUserId(storedUserId);
        fetchServices(storedUserId);
      } else {
        setLoading(false);
        setIsRefreshing(false);
      }
    };

    initialize();
  }, [fetchServices, fetchStatusList]);

  const onRefresh = useCallback(async () => {
    const currentUserId = await AsyncStorage.getItem('userId');
    if (currentUserId) {
      await fetchStatusList();
      fetchServices(currentUserId);
    }
  }, [fetchServices, fetchStatusList]);

  const handleCardPress = (service: ServiceRequest) => {
    const statusInfo = getStatusTextAndColor(service.fkRequestStatus);
    const serviceWithStatus = { ...service, statusInfo };
    router.push({
      pathname: '/(screens)/ServiceRequestDetail',
      params: { service: JSON.stringify(serviceWithStatus) },
    });
  };

  const getStatusTextAndColor = (fkRequestStatus: number | null) => {
    const statusId = fkRequestStatus === null ? 1 : fkRequestStatus;
    const statusObject = statusList.find(status => status.statusId === statusId);
  
    const statusColor = statusObject ? statusObject.color : 'gray'; 
    const statusName = statusObject ? statusObject.name : 'Unknown';
  
    return { text: statusName, color: statusColor };
  };

  const renderServiceCard = (service: ServiceRequest) => {
    const statusInfo = getStatusTextAndColor(service.fkRequestStatus);

    return (
      <TouchableOpacity key={service.requestId} style={styles.card} onPress={() => handleCardPress(service)}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{service.serviceDescription || 'No Description'}</Text>
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
    : services.filter(service => getStatusTextAndColor(service.fkRequestStatus).text === selectedStatus);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.backgroundTop}>
        <LinearGradient
          colors={['#ea0e08', '#fa2d64']}
          style={styles.linearGradientHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.headerContainer}>
            <View style={styles.leftHeader}>
              <Text style={styles.companyName}>Service History</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : userId ? (
        filteredServices.length > 0 ? (
          filteredServices.map(renderServiceCard)
        ) : (
          <View style={styles.noServicesContainer}>
            <Icon name="sentiment-dissatisfied" size={60} color="#666" />
            <Text style={styles.noServicesText}>No activity</Text>
          </View>
        )
      ) : (
        <View style={styles.noServicesContainer}>
          <Icon name="error-outline" size={60} color="#666" />
          <Text style={styles.noServicesText}>Could not load user information.</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundTop: {
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
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
  companyName: {
    color: '#fff7f9',
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 16,
    marginBottom: 8,
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
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cardDate: {
    fontSize: 14,
    color: 'gray',
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
  noServicesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    width: '100%',
    backgroundColor: 'transparent',
  },
  noServicesText: {
    marginTop: 15,
    fontSize: 25,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
  },
});

export default HistoryScreen;