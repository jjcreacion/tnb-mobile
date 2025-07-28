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
  Linking, 
  ActivityIndicator,
  Alert, 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import RequestModal from '../(screens)/RequestModal'; 
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

interface Service {
  codigo: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  image?: any;
}

interface Campaign {
  campaignsId: number;
  title: string;
  description: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  phone?: string; 
  whatsapp?: string; 
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

interface ServiceItemProps {
  service: Service;
  onServicePress: (service: Service) => void;
}

interface CampaignItemProps {
  campaign: Campaign;
  onCampaignPress: (campaign: Campaign) => void;
  API_BASE_URL: string;
}

const CampaignItem: React.FC<CampaignItemProps> = ({ campaign, onCampaignPress, API_BASE_URL }) => {
  const fullImageUrl = `${API_BASE_URL}${campaign.imageUrl}`;
  return (
    <TouchableOpacity onPress={() => onCampaignPress(campaign)} style={styles.recommendedCard}>
      <Image source={{ uri: fullImageUrl }} style={styles.recommendedCardImage} />
      <LinearGradient
        colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.7)']}
        style={styles.recommendedCardOverlay}
      >
        <Text style={styles.recommendedCardTitle}>{campaign.title}</Text>
        <Text style={styles.recommendedCardDescription}>{campaign.description}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const ServiceItem: React.FC<ServiceItemProps> = ({ service, onServicePress }) => {
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


interface CampaignModalProps {
  isVisible: boolean;
  onClose: () => void;
  campaign: Campaign | null;
}

const CampaignModal: React.FC<CampaignModalProps> = ({ isVisible, onClose, campaign }) => {
  if (!campaign) {
    return null;
  }

  const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;
  const fullImageUrl = `${API_BASE_URL}${campaign.imageUrl}`;

  const handlePhoneCall = () => {
    if (campaign.phone) {
      Linking.openURL(`tel:${campaign.phone}`).catch(err => console.error('Failed to open dialer:', err));
    } else {
      Alert.alert('Información no disponible', 'Número de teléfono no proporcionado para esta campaña.');
    }
  };

  const handleWhatsApp = () => {
    if (campaign.whatsapp) {
      Linking.openURL(`whatsapp://send?phone=${campaign.whatsapp}`).catch(err => {
        console.error('Failed to open WhatsApp:', err);
        Alert.alert('Error', 'No se pudo abrir WhatsApp. Asegúrate de tenerlo instalado.');
      });
    } else {
      Alert.alert('Información no disponible', 'Número de WhatsApp no proporcionado para esta campaña.');
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
           <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={20} color="#fff" /> 
          </TouchableOpacity>
          <ScrollView contentContainerStyle={styles.modalScrollViewContent}>
            <Image source={{ uri: fullImageUrl }} style={styles.modalImage} />
            <Text style={styles.modalTitle}>{campaign.title}</Text>
            <Text style={styles.modalDescription}>{campaign.description}</Text>

            <View style={styles.contactContainer}>
              {campaign.phone && (
                <TouchableOpacity style={styles.contactButton} onPress={handlePhoneCall}>
                  <Icon name="phone" size={24} color="#fff" />
                  <Text style={styles.contactButtonText}>Llamar: {campaign.phone}</Text>
                </TouchableOpacity>
              )}
              {campaign.whatsapp && (
                <TouchableOpacity style={[styles.contactButton, styles.whatsappButton]} onPress={handleWhatsApp}>
                  <FontAwesome name="whatsapp" size={30} color="#fff" />
                  <Text style={styles.contactButtonText}>WhatsApp: {campaign.whatsapp}</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};


const HomeScreen: React.FC = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [isRequestModalVisible, setRequestModalVisible] = useState(false); // For service request modal
  const [selectedServiceData, setSelectedServiceData] = useState<Service | null>(null); // For service data
  const [isCampaignModalVisible, setCampaignModalVisible] = useState(false); // For campaign modal
  const [selectedCampaignData, setSelectedCampaignData] = useState<Campaign | null>(null); // For campaign data
  const [userName, setUserName] = useState<string>('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [errorCampaigns, setErrorCampaigns] = useState<string | null>(null);

  const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;
  const CAMPAIGNS_ENDPOINT = '/mobile-campaigns/active';

  const flatListRef = useRef<FlatList<Campaign>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          const response = await fetch(`${API_BASE_URL}/user/findOne/${userId}`);
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
  }, [API_BASE_URL]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoadingCampaigns(true);
        const response = await fetch(`${API_BASE_URL}${CAMPAIGNS_ENDPOINT}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Campaign[] = await response.json();
        const campaignsWithContact = data.map(camp => ({
          ...camp,
          phone: '(862)4012414',
          whatsapp: '+1(229)4445456', 
        }));
        setCampaigns(campaignsWithContact);
      } catch (error: any) {
        console.error('Error fetching campaigns:', error);
        setErrorCampaigns(error.message || 'Failed to load campaigns.');
      } finally {
        setLoadingCampaigns(false);
      }
    };

    if (API_BASE_URL) {
      fetchCampaigns();
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    if (campaigns.length > 0) {
      const interval = setInterval(() => {
        const nextIndex = (currentIndex + 1) % campaigns.length;
        setCurrentIndex(nextIndex);
        flatListRef.current?.scrollToIndex({ animated: true, index: nextIndex });
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [currentIndex, campaigns]);

  const handleServicePress = (service: Service) => {
    setSelectedServiceData(service);
    setRequestModalVisible(true);
  };

  const handleCloseServiceModal = () => {
    setRequestModalVisible(false);
    setSelectedServiceData(null);
  };

  const handleCampaignPress = async (campaign: Campaign) => {

    const userIdString = await AsyncStorage.getItem('userId');

    if (userIdString === null) {
      console.error('Error: ID de usuario no encontrado en AsyncStorage.');
      return;
    }

    const userId = parseInt(userIdString, 10);

    try {
      const expressInterestEndpoint = `${API_BASE_URL}/mobile-campaigns/${campaign.campaignsId}/express-interest`;
      const response = await fetch(expressInterestEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        console.log(`Interest expressed for campaign ${campaign.campaignsId} by user ${userId}`);
      } else {
        const errorData = await response.json();
        console.error('Error expressing interest:', errorData);
      }
    } catch (error) {
      console.error('Network error expressing interest:', error);
      Alert.alert('Error', 'Could not connect to the server. Please check your internet connection.');
    }
    
    setSelectedCampaignData(campaign);
    setCampaignModalVisible(true);

  };

  const handleCloseCampaignModal = () => {
    setCampaignModalVisible(false);
    setSelectedCampaignData(null);
  };


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
        {loadingCampaigns ? (
          <ActivityIndicator size="large" color="#ea0e08" style={styles.loadingIndicator} />
        ) : errorCampaigns ? (
          <Text style={styles.errorMessage}>{errorCampaigns}</Text>
        ) : campaigns.length > 0 ? (
          <FlatList
            ref={flatListRef}
            data={campaigns}
            renderItem={({ item }) => (
              <CampaignItem campaign={item} onCampaignPress={handleCampaignPress} API_BASE_URL={API_BASE_URL || ''} />
            )}
            keyExtractor={(item) => item.campaignsId.toString()}
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
        ) : (
          <Text style={styles.noCampaignsMessage}>No campaigns available at the moment.</Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>Services to explore</Text>

      <ScrollView contentContainerStyle={styles.allServicesContainer}>
        {SERVICES.map((service) => (
          <ServiceItem key={service.codigo} service={service} onServicePress={handleServicePress} />
        ))}
      </ScrollView>

      <RequestModal
        isVisible={isRequestModalVisible}
        onClose={handleCloseServiceModal}
        selectedService={selectedServiceData}
      />

      <CampaignModal
        isVisible={isCampaignModalVisible}
        onClose={handleCloseCampaignModal}
        campaign={selectedCampaignData}
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
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  loadingIndicator: {
    paddingVertical: 20,
  },
  errorMessage: {
    color: 'red',
    textAlign: 'center',
    padding: 20,
  },
  noCampaignsMessage: {
    color: '#666',
    textAlign: 'center',
    padding: 20,
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
  
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalScrollViewContent: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    width: 30,
    height: 30, 
    borderRadius: 15, 
    backgroundColor: '#000', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
    resizeMode: 'cover',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  contactContainer: {
    width: '100%',
    marginTop: 10,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#03a9f4', 
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    justifyContent: 'center',
  },
  whatsappButton: {
    backgroundColor: '#25D366', 
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default HomeScreen;