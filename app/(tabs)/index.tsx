import { FontAwesome } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import RequestModal from '../(screens)/RequestModal'
import SideMenu from '../(screens)/SideMenu'

const { width: screenWidth } = Dimensions.get('window')

interface Category {
  pkCategory: number
  name: string
  description: string
  imagePath: string
}

interface Campaign {
  campaignsId: number
  title: string
  description: string
  imageUrl: string
  startDate: string
  endDate: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  phone?: string
  whatsapp?: string
}

interface Address {
  pkAddress: number
  address: string
  isPrimary: number
  createdAt: string
  updatedAt: string
}

const tnbLogo = require('@/assets/images/icon-tnb.png')

interface ServiceItemProps {
  category: Category
  onServicePress: (category: Category) => void
  API_BASE_URL: string
}

const ServiceItem: React.FC<ServiceItemProps> = ({
  category,
  onServicePress,
  API_BASE_URL,
}) => {
  const fullImagePath = `${API_BASE_URL}${category.imagePath}`
  return (
    <TouchableOpacity
      onPress={() => onServicePress(category)}
      style={styles.serviceItem}
    >
      {category.imagePath && (
        <Image
          source={{ uri: fullImagePath }}
          style={styles.serviceItemImage}
        />
      )}
      <View style={styles.serviceItemContent}>
        <View>
          <Text style={styles.serviceTitle}>{category.name}</Text>
          <Text style={styles.serviceDescription}>{category.description}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

interface CampaignItemProps {
  campaign: Campaign
  onCampaignPress: (campaign: Campaign) => void
  API_BASE_URL: string
}

const CampaignItem: React.FC<CampaignItemProps> = ({
  campaign,
  onCampaignPress,
  API_BASE_URL,
}) => {
  const fullImageUrl = `${API_BASE_URL}${campaign.imageUrl}`
  return (
    <TouchableOpacity
      onPress={() => onCampaignPress(campaign)}
      style={styles.recommendedCard}
    >
      <Image
        source={{ uri: fullImageUrl }}
        style={styles.recommendedCardImage}
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.7)']}
        style={styles.recommendedCardOverlay}
      >
        <Text style={styles.recommendedCardTitle}>{campaign.title}</Text>
        <Text style={styles.recommendedCardDescription}>
          {campaign.description}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  )
}

interface CampaignModalProps {
  isVisible: boolean
  onClose: () => void
  campaign: Campaign | null
}

const CampaignModal: React.FC<CampaignModalProps> = ({
  isVisible,
  onClose,
  campaign,
}) => {
  if (!campaign) {
    return null
  }

  const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL
  const fullImageUrl = `${API_BASE_URL}${campaign.imageUrl}`

  const handlePhoneCall = () => {
    if (campaign.phone) {
      Linking.openURL(`tel:${campaign.phone}`).catch((err) =>
        console.error('Failed to open dialer:', err)
      )
    } else {
      Alert.alert(
        'Información no disponible',
        'Número de teléfono no proporcionado para esta campaña.'
      )
    }
  }

  const handleWhatsApp = () => {
    if (campaign.whatsapp) {
      Linking.openURL(`whatsapp://send?phone=${campaign.whatsapp}`).catch(
        (err) => {
          console.error('Failed to open WhatsApp:', err)
          Alert.alert(
            'Error',
            'No se pudo abrir WhatsApp. Asegúrate de tenerlo instalado.'
          )
        }
      )
    } else {
      Alert.alert(
        'Información no disponible',
        'Número de WhatsApp no proporcionado para esta campaña.'
      )
    }
  }

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
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={handlePhoneCall}
                >
                  <Icon name="phone" size={24} color="#fff" />
                  <Text style={styles.contactButtonText}>
                    Call: {campaign.phone}
                  </Text>
                </TouchableOpacity>
              )}
              {campaign.whatsapp && (
                <TouchableOpacity
                  style={[styles.contactButton, styles.whatsappButton]}
                  onPress={handleWhatsApp}
                >
                  <FontAwesome name="whatsapp" size={30} color="#fff" />
                  <Text style={styles.contactButtonText}>
                    WhatsApp: {campaign.whatsapp}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

interface AddressModalProps {
  isVisible: boolean
  onClose: () => void
  addresses: Address[]
  onAddressSelect: (address: Address) => void
  primaryAddress: Address | null
}

const AddressModal: React.FC<AddressModalProps> = ({
  isVisible,
  onClose,
  addresses,
  onAddressSelect,
  primaryAddress,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.addressModalOverlay}>
        <View style={styles.addressModalContent}>
          <View style={styles.addressModalHeader}>
            <Text style={styles.addressModalTitle}>
              Select a property address
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.addressCloseButton}
            >
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.addressList}>
            {addresses.length > 0 ? (
              addresses
                .sort((a, b) => b.isPrimary - a.isPrimary)
                .map((address: Address) => (
                  <TouchableOpacity
                    key={address.pkAddress}
                    style={[
                      styles.addressItem,
                      address.pkAddress === primaryAddress?.pkAddress &&
                        styles.selectedAddressItem,
                    ]}
                    onPress={() => onAddressSelect(address)}
                  >
                    <View style={styles.addressIconContainer}>
                      <Icon
                        name="home"
                        size={24}
                        color={
                          address.pkAddress === primaryAddress?.pkAddress
                            ? '#4CAF50'
                            : '#666'
                        }
                      />
                    </View>
                    <View style={styles.addressTextContainer}>
                      <Text style={styles.addressText}>{address.address}</Text>
                      {address.isPrimary === 1 && (
                        <Text style={styles.addressSubText}>
                          Primary Address
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))
            ) : (
              <View style={styles.emptyAddressContainer}>
                <Icon name="location-off" size={48} color="#ccc" />
                <Text style={styles.emptyAddressTitle}>No addresses found</Text>
                <Text style={styles.emptyAddressMessage}>
                  You haven't added any property addresses yet. Add your first
                  address to get started with our services.
                </Text>
              </View>
            )}

            <TouchableOpacity style={styles.addAddressButton}>
              <Icon name="add" size={24} color="#007AFF" />
              <Text style={styles.addAddressText}>
                Add a new property address
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const HomeScreen: React.FC = () => {
  const [searchText, setSearchText] = useState<string>('')
  const [isRequestModalVisible, setRequestModalVisible] = useState(false)
  const [selectedServiceData, setSelectedServiceData] =
    useState<Category | null>(null)
  const [isCampaignModalVisible, setCampaignModalVisible] = useState(false)
  const [selectedCampaignData, setSelectedCampaignData] =
    useState<Campaign | null>(null)
  const [userName, setUserName] = useState<string>('')
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCampaigns, setLoadingCampaigns] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [errorCampaigns, setErrorCampaigns] = useState<string | null>(null)
  const [errorCategories, setErrorCategories] = useState<string | null>(null)
  const [isMenuVisible, setMenuVisible] = useState(false)

  // Address related states
  const [primaryAddress, setPrimaryAddress] = useState<Address | null>(null)
  const [userAddresses, setUserAddresses] = useState<Address[]>([])
  const [isAddressModalVisible, setAddressModalVisible] = useState(false)
  const [loadingAddresses, setLoadingAddresses] = useState(false)

  const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL
  const CATEGORIES_ENDPOINT = '/category/findAll'
  const CAMPAIGNS_ENDPOINT = '/mobile-campaigns/active'

  const flatListRef = useRef<FlatList<Campaign>>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const loadUserData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId')
      if (userId) {
        const response = await fetch(`${API_BASE_URL}/user/findOne/${userId}`)
        if (response.ok) {
          const userData = await response.json()
          if (userData?.person?.firstName && userData?.person?.lastName) {
            setUserName(
              `${userData.person.firstName} ${userData.person.lastName}`
            )
          } else if (userData?.person?.firstName) {
            setUserName(userData.person.firstName)
          } else {
            setUserName('User')
          }

          // Load user addresses
          if (
            userData?.person?.addresses &&
            userData.person.addresses.length > 0
          ) {
            setUserAddresses(userData.person.addresses)
            const primary = userData.person.addresses.find(
              (addr: Address) => addr.isPrimary === 1
            )
            setPrimaryAddress(primary || userData.person.addresses[0])
          }
        } else {
          console.error(
            'Error al cargar los datos del usuario:',
            response.status
          )
          setUserName('User')
        }
      } else {
        setUserName('User')
      }
    } catch (error) {
      console.error('Error al cargar los datos del usuario:', error)
      setUserName('User')
    }
  }

  const handleAddressPress = () => {
    setAddressModalVisible(true)
  }

  const handleAddressSelect = async (address: Address) => {
    // Si la dirección seleccionada ya es la primaria, solo cerrar el modal
    if (address.pkAddress === primaryAddress?.pkAddress) {
      setAddressModalVisible(false);
      return;
    }

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.error('Usuario no encontrado');
        return;
      }

      // Obtener los datos del usuario para conseguir fkPerson
      const userResponse = await fetch(`${API_BASE_URL}/user/findOne/${userId}`);
      if (!userResponse.ok) {
        console.error('Error al obtener datos del usuario');
        return;
      }
      
      const userData = await userResponse.json();
      const fkPerson = userData?.person?.pkPerson;
      
      if (!fkPerson) {
        console.error('No se pudo obtener fkPerson del usuario');
        return;
      }

      // Actualizar la dirección anterior como secundaria (si existe una primaria actual)
      if (primaryAddress) {
        const updatePreviousPrimary = await fetch(`${API_BASE_URL}/person-address`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pkAddress: primaryAddress.pkAddress,
            // fkPerson: fkPerson,
            // address: primaryAddress.address,
            isPrimary: 0,
          }),
        });

        if (!updatePreviousPrimary.ok) {
          const errorData = await updatePreviousPrimary.text();
          console.error('Error al actualizar dirección anterior:', updatePreviousPrimary.status, errorData);
          Alert.alert('Error', 'No se pudo actualizar la dirección anterior.');
          return;
        }
      }

      // Actualizar la nueva dirección como primaria
      const updateNewPrimary = await fetch(`${API_BASE_URL}/person-address`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pkAddress: address.pkAddress,
          // fkPerson: fkPerson,
          // address: address.address,
          isPrimary: 1,
        }),
      });

      if (!updateNewPrimary.ok) {
        const errorData = await updateNewPrimary.text();
        console.error('Error al actualizar nueva dirección primaria:', updateNewPrimary.status, errorData);
        Alert.alert('Error', 'No se pudo establecer la nueva dirección primaria.');
        return;
      }

      // Actualizar el estado local
      const updatedAddresses = userAddresses.map(addr => ({
        ...addr,
        isPrimary: addr.pkAddress === address.pkAddress ? 1 : 0,
      }));

      setUserAddresses(updatedAddresses);
      setPrimaryAddress({ ...address, isPrimary: 1 });
      setAddressModalVisible(false);
      
    } catch (error) {
      console.error('Error al actualizar dirección primaria:', error);
      Alert.alert('Error', 'Ocurrió un error al actualizar la dirección. Por favor intenta de nuevo.');
    }
  };

  const handleCloseAddressModal = () => {
    setAddressModalVisible(false)
  }

  useEffect(() => {
    loadUserData()
  }, [API_BASE_URL])

      try {
        setLoadingCampaigns(true)
        const response = await fetch(`${API_BASE_URL}${CAMPAIGNS_ENDPOINT}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: Campaign[] = await response.json()
        const campaignsWithContact = data.map((camp) => ({
          ...camp,
          phone: '(862)4012414',
          whatsapp: '+1(229)4445456',
        }))
        setCampaigns(campaignsWithContact)
      } catch (error: any) {
        console.error('Error fetching campaigns:', error)
        setErrorCampaigns(error.message || 'Failed to load campaigns.')
      } finally {
        setLoadingCampaigns(false)
      }
    }

    const fetchCategories = async () => {
      try {
        setLoadingCategories(true)
        const response = await fetch(`${API_BASE_URL}${CATEGORIES_ENDPOINT}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: Category[] = await response.json()
        setCategories(data)
      } catch (error: any) {
        console.error('Error fetching categories:', error)
        setErrorCategories(error.message || 'Failed to load categories.')
      } finally {
        setLoadingCategories(false)
      }
    }

    if (API_BASE_URL) {
      fetchCampaigns()
      fetchCategories()
    }
  }, [API_BASE_URL])

  useEffect(() => {
    if (campaigns.length > 0) {
      const interval = setInterval(() => {
        const nextIndex = (currentIndex + 1) % campaigns.length
        setCurrentIndex(nextIndex)
        flatListRef.current?.scrollToIndex({ animated: true, index: nextIndex })
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [currentIndex, campaigns])

  const handleServicePress = (category: Category) => {
    setSelectedServiceData(category)
    setRequestModalVisible(true)
  }

  const handleCloseServiceModal = () => {
    setRequestModalVisible(false)
    setSelectedServiceData(null)
  }

  const handleCampaignPress = async (campaign: Campaign) => {
    const userIdString = await AsyncStorage.getItem('userId')

    if (userIdString === null) {
      console.error('Error: ID de usuario no encontrado en AsyncStorage.')
      return
    }

    const userId = parseInt(userIdString, 10)

    try {
      const expressInterestEndpoint = `${API_BASE_URL}/mobile-campaigns/${campaign.campaignsId}/express-interest`
      const response = await fetch(expressInterestEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        console.log(
          `Interest expressed for campaign ${campaign.campaignsId} by user ${userId}`
        )
      } else {
        const errorData = await response.json()
        console.error('Error expressing interest:', errorData)
      }
    } catch (error) {
      console.error('Network error expressing interest:', error)
      Alert.alert(
        'Error',
        'Could not connect to the server. Please check your internet connection.'
      )
    }

    setSelectedCampaignData(campaign)
    setCampaignModalVisible(true)
  }

  const handleCloseCampaignModal = () => {
    setCampaignModalVisible(false)
    setSelectedCampaignData(null)
  }

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
              <TouchableOpacity
                onPress={() => setMenuVisible(true)}
                style={styles.menuButton}
              >
                <Icon name="menu" size={30} color="#fff" />
              </TouchableOpacity>
              <Image source={tnbLogo} style={styles.companyLogo} />
            </View>
            <View style={styles.rightHeader}>
              <Text style={styles.userName}>Hi, {userName} </Text>
              <Icon name="account-circle" size={30} color="#fff7f9" />
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Address Section */}
      <TouchableOpacity
        style={styles.addressSection}
        onPress={handleAddressPress}
      >
        <Icon name="home" size={24} color="#ea0e08" />
        <View style={styles.addressTextSection}>
          <Text style={styles.addressText}>
            {primaryAddress ? primaryAddress.address : 'No address added yet'}
          </Text>
          <Text style={styles.addressSubText}>
            {primaryAddress
              ? 'Tap to change address'
              : 'Tap to add your address'}
          </Text>
        </View>
        <Icon name="keyboard-arrow-down" size={24} color="#666" />
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Recommended for you</Text>

      <View style={styles.recommendedCarouselContainer}>
        {loadingCampaigns ? (
          <ActivityIndicator
            size="large"
            color="#ea0e08"
            style={styles.loadingIndicator}
          />
        ) : errorCampaigns ? (
          <Text style={styles.errorMessage}>{errorCampaigns}</Text>
        ) : campaigns.length > 0 ? (
          <FlatList
            ref={flatListRef}
            data={campaigns}
            renderItem={({ item }) => (
              <CampaignItem
                campaign={item}
                onCampaignPress={handleCampaignPress}
                API_BASE_URL={API_BASE_URL || ''}
              />
            )}
            keyExtractor={(item) => item.campaignsId.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            onScroll={(e) => {
              const contentOffsetX = e.nativeEvent.contentOffset.x
              const newIndex = Math.round(contentOffsetX / screenWidth)
              setCurrentIndex(newIndex)
            }}
            scrollEventThrottle={16}
          />
        ) : (
          <Text style={styles.noCampaignsMessage}>
            No campaigns available at the moment.
          </Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>Services to explore</Text>

      <ScrollView contentContainerStyle={styles.allServicesContainer}>
        {loadingCategories ? (
          <ActivityIndicator
            size="large"
            color="#ea0e08"
            style={styles.loadingIndicator}
          />
        ) : errorCategories ? (
          <Text style={styles.errorMessage}>{errorCategories}</Text>
        ) : categories.length > 0 ? (
          categories.map((category) => (
            <ServiceItem
              key={category.pkCategory}
              category={category}
              onServicePress={handleServicePress}
              API_BASE_URL={API_BASE_URL || ''}
            />
          ))
        ) : (
          <Text style={styles.noCampaignsMessage}>
            No categories available at the moment.
          </Text>
        )}
      </ScrollView>

      <RequestModal
        isVisible={isRequestModalVisible}
        onClose={handleCloseServiceModal}
        selectedCategory={selectedServiceData}
        primaryAddress={primaryAddress}
        cities={cities}
        states={states}
      />

      <CampaignModal
        isVisible={isCampaignModalVisible}
        onClose={handleCloseCampaignModal}
        campaign={selectedCampaignData}
      />

      <SideMenu
        isVisible={isMenuVisible}
        onClose={() => dispatch(setMenuVisible(false))}
      />

      <AddressModal
        isVisible={isAddressModalVisible}
        onClose={handleCloseAddressModal}
        addresses={addresses}
        onAddressSelect={handleAddressSelect}
        primaryAddress={primaryAddress}
        onAddNewAddress={() => {}}
        onAddressAdded={handleAddressAdded}
      />

      <AddressModal
        isVisible={isAddressModalVisible}
        onClose={handleCloseAddressModal}
        addresses={userAddresses}
        onAddressSelect={handleAddressSelect}
        primaryAddress={primaryAddress}
      />
    </View>
  )
}

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
  menuButton: {
    marginRight: 10,
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
  // Address section styles
  addressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 15,
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
  addressTextSection: {
    flex: 1,
    marginLeft: 12,
  },
  addressText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  addressSubText: {
    fontSize: 12,
    color: '#666',
  },
  // Address Modal styles
  addressModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  addressModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingTop: 20,
    width: '100%',
    maxHeight: '70%',
    marginTop: -100,
  },
  addressModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  addressModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addressCloseButton: {
    padding: 5,
  },
  addressList: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedAddressItem: {
    backgroundColor: '#f8f9fa',
  },
  addressIconContainer: {
    marginRight: 15,
  },
  addressTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    marginTop: 10,
  },
  addAddressText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 10,
  },
  // Empty address state styles
  emptyAddressContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyAddressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  emptyAddressMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
})

export default HomeScreen
