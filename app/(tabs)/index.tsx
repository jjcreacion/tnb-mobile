import React, { useState, useEffect } from 'react';
import { View, Text, ImageBackground, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, Platform, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import RequestModal from '../(screens)/RequestModal';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Service {
  codigo: number;
  title: string;
  icon: string;
  color: string;
}

const tnbLogo = require('@/assets/images/icon-tnb.png');

const SERVICES: Service[] = [
  { codigo: 1 , title: 'Insurance Claim', icon: 'gavel', color: '#f44336' },
  { codigo: 2, title: 'Roofing', icon: 'roofing', color: '#795548' },
  { codigo: 3, title: 'HVAC', icon: 'ac-unit', color: '#03a9f4' },
  { codigo: 4, title: 'Gutters', icon: 'format-align-left', color: '#607d8b' },
  { codigo: 5, title: 'Windows', icon: 'window', color: '#4caf50' },
  { codigo: 6, title: 'Insolation', icon: 'layers', color: '#ff9800' },
  { codigo: 7, title: 'Solar Panel', icon: 'solar-power', color: '#f44336' },
  { codigo: 8, title: 'Electric Service', icon: 'electrical-services', color: '#9c27b0' },
  { codigo: 9, title: 'Water Threatment', icon: 'opacity', color: '#2196f3' },
  { codigo: 10, title: 'Tax Services', icon: 'attach-money', color: '#8bc34a' },
  { codigo: 11, title: 'Other', icon: 'question-mark', color: '#9e9e9e' },
];

interface ServiceItemProps {
  service: Service;
  onServicePress: (service: Service) => void;
}

const ServiceItem: React.FC<ServiceItemProps> = ({ service, onServicePress }) => {
  return (
    <TouchableOpacity onPress={() => onServicePress(service)} style={styles.serviceItem}>
      <View style={styles.shield}>
        <Icon name={service.icon} size={45} color={service.color} />
        <Text style={styles.serviceTitle}>{service.title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const HomeScreen: React.FC = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [isRequestModalVisible, setRequestModalVisible] = useState(false);
  const [selectedServiceData, setSelectedServiceData] = useState<Service | null>(null);
  const [userName, setUserName] = useState<string>(''); 
  const API_URL = Constants.expoConfig?.extra?.API_BASE_URL;

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
         if (userId) {
          const response = await fetch(`${API_URL}/user/findOne/${userId}`);
         if (response.ok) {
            const userData = await response.json();
            if (userData?.person?.firstName && userData?.person?.lastName) {
              setUserName(`${userData.person.firstName} ${userData.person.lastName}`);
            } else if (userData?.person?.firstName) {
              setUserName(userData.person.firstName);
            } else {
              setUserName('Usuario'); 
            }
          } else {
            console.error('Error al cargar los datos del usuario:', response.status);
            setUserName('Usuario'); 
          }
        } else {
          setUserName('Usuario'); 
        }
      } catch (error) {
        console.error('Error al cargar los datos del usuario:', error);
        setUserName('Usuario'); 
      }
    };

    loadUserData();
  }, []);

  const handleServicePress = (service: Service) => {
    setSelectedServiceData(service);
    setRequestModalVisible(true);
  };

  const handleCloseModal = () => {
    setRequestModalVisible(false);
    setSelectedServiceData(null);
  };

  const images = [
    require('@/assets/images/roof-repair.jpg'),
  ];

  return (
    <View style={styles.container}>
      <View style={styles.backgroundTop}>
        <LinearGradient
          colors={['#ADD8E6', '#FFDAB9']}
          style={styles.linearGradientHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.headerContainer}>
            <View style={styles.leftHeader}>
              <Image source={tnbLogo} style={styles.companyLogo} />
              <Text style={styles.companyName}>TNB</Text>
            </View>
            <View style={styles.rightHeader}>
              <Text style={styles.userName}>Hi, {userName} </Text>
              <Icon name="account-circle" size={30} color="#333" />
            </View>
          </View>
        </LinearGradient>
      </View>
      <ImageBackground source={images[0]} style={styles.backgroundImage}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="gray"
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity style={styles.searchIconContainer}>
            <Icon name="search" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </ImageBackground>

      <Text style={styles.serviceQuestion}>What service do you need?</Text>

      <ScrollView contentContainerStyle={styles.servicesContainer}>
        {SERVICES.map((service, index) => (
          <ServiceItem key={index} service={service} onServicePress={handleServicePress} />
        ))}
      </ScrollView>

      <RequestModal
        isVisible={isRequestModalVisible}
        onClose={handleCloseModal}
        selectedService={selectedServiceData}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f4f4f4',
  },
  backgroundTop: {
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ADD8E6',
    borderRadius: 10,
    paddingHorizontal: 0,
    margin: 20,
    marginTop: 30,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    color: '#FFDAB9',
  },
  searchIconContainer: {
    backgroundColor: '#FFDAB9',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    padding: 5,
    marginLeft: 10,
  },
  backgroundImage: {
    height: 120,
    justifyContent: 'flex-start',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 16,
    marginTop: 0,
  },
  serviceItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 15,
  },
  shield: {
    width: 100,
    height: 100,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 5,
    borderColor: 'rgba(35, 168, 235, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  companyLogo: {
    width: 28,
    height: 28,
    marginRight: 5,
  },
  serviceTitle: {
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500',
    color: '#333',
  },
  serviceQuestion: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    color: '#333',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 40,
    textAlign: 'center',
    color: 'white',
  },
  textContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  searchButton: {
    backgroundColor: '#f54021',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginLeft: 10,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
  },
  cardDescription: {
    fontSize: 16,
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
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyName: {
    color: '#333',
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  userName: {
    color: '#333',
    fontSize: 17,
    marginLeft: 8,
  },
});

export default HomeScreen;