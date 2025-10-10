import { FontAwesome } from '@expo/vector-icons'
import Constants from 'expo-constants'
import React from 'react'
import {
    Alert,
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

const styles = StyleSheet.create({
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
})

export default CampaignModal