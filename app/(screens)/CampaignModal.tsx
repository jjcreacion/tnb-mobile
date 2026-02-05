import { MigratedStyles } from '@/constants/MigratedStyles'
import { FontAwesome } from '@expo/vector-icons'
import Constants from 'expo-constants'
import React from 'react'
import {
  Alert,
  Image,
  Linking,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useAppSelector } from '@/store/hooks'

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

  const userId = useAppSelector(state => state.auth.userId);
  const isGuest = userId === 'GUEST_USER';

  const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL
  const fullImageUrl = `${API_BASE_URL}${campaign.imageUrl}`

  const handlePhoneCall = async () => {
    if (!campaign.phone) {
      Alert.alert(
        'Information Not Available',
        'Phone number not provided for this campaign.'
      )
      return
    }

    const phoneUrl = `tel:${campaign.phone}`
    
    try {
      const canOpen = await Linking.canOpenURL(phoneUrl)
      
      if (canOpen) {
        await Linking.openURL(phoneUrl)
      } else {
       /* Alert.alert(
          'Error',
          'Could not open the dialer. Please verify that your device has a phone app available.'
        )*/
      }
    } catch (error) {
      //console.error('Failed to open dialer:', error)
     /* Alert.alert(
        'Error',
        'Could not open the dialer. Please verify that your device has a phone app available.'
      )*/
    }
  }

  const handleWhatsApp = async () => {
    if (!campaign.whatsapp) {
      Alert.alert(
        'Information Not Available',
        'WhatsApp number not provided for this campaign.'
      )
      return
    }

    const whatsappUrl = `whatsapp://send?phone=${campaign.whatsapp}`
    
    try {
      const canOpen = await Linking.canOpenURL(whatsappUrl)
      
      if (canOpen) {
        await Linking.openURL(whatsappUrl)
      } else {
        Alert.alert(
          'WhatsApp Not Available',
          'It seems you don\'t have WhatsApp installed. Please install it to continue.'
        )
      }
    } catch (error) {
      console.error('Failed to open WhatsApp:', error)
      Alert.alert(
        'WhatsApp Not Available',
        'It seems you don\'t have WhatsApp installed. Please install it to continue.'
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
      <View style={MigratedStyles.campaignModalOverlay}>
        <View style={MigratedStyles.campaignModalContent}>
          <TouchableOpacity style={MigratedStyles.campaignModalCloseButton} onPress={onClose}>
            <Icon name="close" size={20} color="#fff" />
          </TouchableOpacity>
          <ScrollView contentContainerStyle={MigratedStyles.campaignModalScrollViewContent}>
            <Image source={{ uri: fullImageUrl }} style={MigratedStyles.campaignModalImage} />
            <Text style={MigratedStyles.campaignModalTitle}>{campaign.title}</Text>
            <Text style={MigratedStyles.campaignModalDescription}>{campaign.description}</Text>

            <View style={MigratedStyles.campaignModalContactContainer}>
              {campaign.phone && (
                <TouchableOpacity
                  style={MigratedStyles.campaignModalContactButton}
                  onPress={handlePhoneCall}
                >
                  <Icon name="phone" size={24} color="#fff" />
                  <Text style={MigratedStyles.campaignModalContactButtonText}>
                    Call: {campaign.phone}
                  </Text>
                </TouchableOpacity>
              )}
              {campaign.whatsapp && (
                <TouchableOpacity
                  style={[MigratedStyles.campaignModalContactButton, MigratedStyles.campaignModalWhatsappButton]}
                  onPress={handleWhatsApp}
                >
                  <FontAwesome name="whatsapp" size={30} color="#fff" />
                  <Text style={MigratedStyles.campaignModalContactButtonText}>
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

export default CampaignModal
