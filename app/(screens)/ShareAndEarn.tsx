import { FontAwesome } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react'
import Constants from 'expo-constants'
import { Alert, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const ShareAndEarnScreen = () => {
  const router = useRouter();
  const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL

  const [referralReward, setReferralReward] = useState<string>('15')

  const [referralReward, setReferralReward] = useState<string>('19');
  const [invitationCode, setInvitationCode] = useState<string>('12345678');

  const inviteLink = `${URL_SHARE_AND_EARN}?code=${invitationCode}`;

  const fetchReferralReward = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/app-settings/referral_reward_amount`
      );
      if (response.ok) {
        const data = await response.json();
        const rewardValue = parseFloat(data.value).toFixed(0);
        setReferralReward(rewardValue);
      } else {
        console.error('Error fetching referral reward, using default.');
      }
    } catch (error) {
      console.error('Error fetching referral reward:', error);
    }
  };

  useEffect(() => {
    fetchReferralReward();
  }, [API_BASE_URL]);

  const onShare = async () => {
    try {
      const inviteMessage = `¡Únete a TNB y obtén un servicio de $${referralReward}! Usa mi enlace: ${inviteLink}`;
      const result = await Share.share({
        message: inviteMessage,
        url: inviteLink,
        title: `¡Obtén un servicio de $${referralReward}!`,
      });

      if (result.action === Share.sharedAction) {
        console.log('Contenido compartido exitosamente');
      } else if (result.action === Share.dismissedAction) {
        console.log('El usuario canceló la acción de compartir');
      }
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  const imgShare = require('@/assets/images/share.png')
  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(inviteLink);
    Alert.alert('¡Copied!', 'The invitation link has been copied to your clipboard.');
  };

  const fetchReferralReward = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/app-settings/referral_reward_amount`
      )
      if (response.ok) {
        const data = await response.json()
        const rewardValue = parseFloat(data.value).toFixed(0)
        setReferralReward(rewardValue)
      } else {
        console.error('Error fetching referral reward, using default.')
      }
    } catch (error: any) {
      console.error('Error fetching referral reward:', error)
    }
  }

   useEffect(() => {
    fetchReferralReward()
   }, [API_BASE_URL])


  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <FontAwesome name="arrow-left" size={24} color="#333" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image 
            source={imgShare} 
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity style={styles.shareImageButton} onPress={onShare}>
            <FontAwesome name="share-alt" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Invite a friend</Text>
        <Text style={styles.subtitle}>Share your invitation link so your friends can join and get a ${referralReward} service gift.</Text>
        
        <View style={styles.invitationLinkContainer}>
          <Text style={styles.invitationLinkText}>Your invitation link:</Text>
          <View style={styles.linkDisplay}>
            <Text style={styles.link} numberOfLines={1} ellipsizeMode="middle">
              {inviteLink}
            </Text>
            <TouchableOpacity onPress={copyToClipboard} style={styles.copyButton}>
              <FontAwesome name="copy" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.shareButton} onPress={onShare}>
            <FontAwesome name="share-alt" size={24} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Share link</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.additionalInfoContainer}>
          <View style={styles.infoRow}>
            <FontAwesome name="gift" size={16} color="#555" style={styles.infoIcon} />
            <Text style={styles.additionalInfoText}>
              If your friend signs up with your invitation link, you'll receive ${referralReward} in credit.
            </Text>
          </View>
          <View style={styles.infoRow}>
            <FontAwesome name="user-plus" size={16} color="#555" style={styles.infoIcon} />
            <Text style={styles.additionalInfoText}>
              Your friend will also receive ${referralReward} in credit to use toward the purchase of one of our services.
            </Text>
          </View>
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  infoIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  additionalInfoContainer: {
    padding: 10,
    width: '100%',
    marginTop: 5, 
  },
  additionalInfoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  copyButton: {
    marginLeft: 10,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
  },
  copyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 18,
    marginLeft: 10,
    color: '#333',
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 10,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  shareImageButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 15,
  },
  invitationLinkContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  invitationLinkText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginBottom: 10,
    textAlign: 'center',
  },
  linkDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  link: {
    fontSize: 14,
    color: '#495057',
    flex: 1,
    marginRight: 10,
  },
  copyButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#4a90e2',
  },
  buttonContainer: {
    width: '100%',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  icon: {
    marginRight: 5,
  },
});

export default ShareAndEarnScreen;