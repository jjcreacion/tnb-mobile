import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import RequestModal from '../(screens)/RequestModal';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth } = Dimensions.get('window');

interface Service {
  codigo: number;
  title: string;
  description: string; 
  icon: string;
  color: string;
  image?: any;
}

const tnbLogo = require('@/assets/images/icon-tnb.png');

const SERVICES: Service[] = [
  { codigo: 1, title: 'Insurance Claim', description: 'Expert assistance with property damage claims.', icon: 'gavel', color: '#f44336', image: require('@/assets/images/insurance-claim.jpeg') },
  { codigo: 2, title: 'Roofing', description: 'Professional installation and repair for all roof types.', icon: 'roofing', color: '#795548', image: require('@/assets/images/roofing.jpeg') },
  { codigo: 3, title: 'HVAC', description: 'Heating, ventilation, and air conditioning services.', icon: 'ac-unit', color: '#03a9f4', image: require('@/assets/images/hvac.jpeg') },
  { codigo: 4, title: 'Gutters', description: 'Gutter repair, cleaning, and new installations.', icon: 'format-align-left', color: '#607d8b', image: require('@/assets/images/gutters.jpg') },
  { codigo: 5, title: 'Windows', description: 'Window replacement and repair for better insulation.', icon: 'window', color: '#4caf50', image: require('@/assets/images/windows.jpeg') },
  { codigo: 6, title: 'Insolation', description: 'Improve energy efficiency with proper insulation.', icon: 'layers', color: '#ff9800', image: require('@/assets/images/Insolation.jpeg') },
  { codigo: 7, title: 'Solar Panel', description: 'Harness solar energy for your home or business.', icon: 'solar-power', color: '#f44336', image: require('@/assets/images/solar-panel.jpeg') },
  { codigo: 8, title: 'Electric Service', description: 'Safe and reliable electrical installations and repairs.', icon: 'electrical-services', color: '#9c27b0', image: require('@/assets/images/electric-service.jpeg') },
  { codigo: 9, title: 'Water Treatment', description: 'Solutions for clean and healthy water in your home.', icon: 'opacity', color: '#2196f3', image: require('@/assets/images/water-treatment.jpeg') },
  { codigo: 10, title: 'Tax Services', description: 'Professional tax preparation and financial advice.', icon: 'attach-money', color: '#8bc34a', image: require('@/assets/images/taxservices.jpeg') },
  { codigo: 11, title: 'Other', description: 'Custom services to meet your specific needs.', icon: 'question-mark', color: '#9e9e9e', image: require('@/assets/images/other.jpeg') },
];

const RECOMMENDED_SERVICES: Service[] = [
  SERVICES[1],
  SERVICES[9],
  SERVICES[6],
];

interface ServiceItemProps {
  service: Service;
  onServicePress: (service: Service) => void;
  isRecommendedCard?: boolean;
}

const ServiceItem: React.FC<ServiceItemProps> = ({ service, onServicePress, isRecommendedCard = false }) => {
  if (isRecommendedCard) {
    return (
      <TouchableOpacity onPress={() => onServicePress(service)} style={styles.recommendedCard}>
        <Image source={service.image} style={styles.recommendedCardImage} />
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.7)']}
          style={styles.recommendedCardOverlay}
        >
          <Text style={styles.recommendedCardTitle}>{service.title}</Text>
          <Text style={styles.recommendedCardDescription}>{service.description}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={() => onServicePress(service)} style={styles.serviceItem}>
      {service.image && <Image source={service.image} style={styles.serviceItemImage} />}
      <View style={styles.serviceItemContent}>
        <View>
          <Text style={styles.serviceTitle}>{service.title}</Text>
          <Text style={styles.serviceDescription}>{service.description}</Text> 
        </View>
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

  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

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
              setUserName('User');
            }
          } else {
            console.error('Error al cargar los datos del usuario:', response.status);
            setUserName('User');
          }
        } else {
          setUserName('User');
        }
      } catch (error) {
        console.error('Error al cargar los datos del usuario:', error);
        setUserName('User');
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % RECOMMENDED_SERVICES.length;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ animated: true, index: nextIndex });
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex]);

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
          colors={['#ea0e08', '#fa2d64']}
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
              <Icon name="account-circle" size={30} color="#fff7f9" />
            </View>
          </View>
        </LinearGradient>

      </View>

      <Text style={styles.sectionTitle}>Recommended for you</Text>

      <View style={styles.recommendedCarouselContainer}>
        <FlatList
          ref={flatListRef}
          data={RECOMMENDED_SERVICES}
          renderItem={({ item }) => (
            <ServiceItem service={item} onServicePress={handleServicePress} isRecommendedCard={true} />
          )}
          keyExtractor={(item) => item.codigo.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          onScroll={e => {
            const contentOffsetX = e.nativeEvent.contentOffset.x;
            const newIndex = Math.round(contentOffsetX / screenWidth);
            setCurrentIndex(newIndex);
          }}
          scrollEventThrottle={16}
        />
      </View>

      <Text style={styles.sectionTitle}>Services to explore</Text>

      <ScrollView contentContainerStyle={styles.allServicesContainer}>
        {SERVICES.map((service) => (
          <ServiceItem key={service.codigo} service={service} onServicePress={handleServicePress} />
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
    color: '#fff7f9',
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  userName: {
    color: '#fff7f9',
    fontSize: 17,
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7c1310',
    marginLeft: 20,
    marginTop: 5,
    marginBottom: 15,
  },
  recommendedCarouselContainer: {
    height: 200,
    marginBottom: 5,
  },
  recommendedCard: {
    width: screenWidth - 40,
    height: 180,
    borderRadius: 15,
    overflow: 'hidden',
    marginHorizontal: 20,
    justifyContent: 'flex-end',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  recommendedCardImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  recommendedCardOverlay: {
    padding: 15,
    justifyContent: 'flex-end',
    flex: 1,
  },
  recommendedCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 5,
  },
  recommendedCardDescription: { 
    fontSize: 13,
    color: '#E0E0E0',
    marginTop: 2,
  },
  allServicesContainer: {
    flexDirection: 'column',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  serviceItem: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  serviceItemImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 5,
    resizeMode: 'cover',
  },
  serviceItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  shield: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceTitle: {
    fontSize: 16,
    marginLeft: 15,
    fontWeight: '500',
    color: '#333',
  },
  serviceDescription: { 
    fontSize: 12,
    marginLeft: 15,
    color: '#666',
  },
  companyLogo: {
    width: 28,
    height: 28,
    marginRight: 5,
  },
});

export default HomeScreen;