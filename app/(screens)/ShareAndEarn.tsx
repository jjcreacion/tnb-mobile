import { Theme } from '@/constants/Theme';
import { useAppSelector } from '@/store/hooks'; // Manteniendo solo useAppSelector, useAppDispatch no se usa
import { FontAwesome } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Image, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ReferralListModal from '../../components/referral/ReferralListModal';

const ShareAndEarnScreen = () => {
  
  const router = useRouter();
  // Usamos el API_BASE_URL dinámico para el endpoint de configuración.
  const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

  // Inicialización con valores seguros/vacíos
  const [referralReward, setReferralReward] = useState<string>('0'); 
  const [shareBaseUrl, setShareBaseUrl] = useState<string>('');
  const [isReferralModalVisible, setReferralModalVisible] = useState(false);

  const { userData } = useAppSelector((state) => state.user);
  const invitationCode = userData?.referralCode;
  
  // 1. IMPLEMENTACIÓN DE FETCH PARA MONTO DE RECOMPENSA
  const fetchReferralReward = useCallback(async () => {
    if (!API_BASE_URL) return;

    try {
      const endpoint = `${API_BASE_URL}/app-settings/referral_reward_amount`;
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Failed to fetch referral reward amount.');
      }
      const data = await response.json();
      // Asumiendo que 'value' contiene el monto como string (ej: "15.00")
      setReferralReward(data.value || '0');
    } catch (error) {
      console.error('Error fetching referral reward:', error);
      setReferralReward('0'); // Fallback
    }
  }, [API_BASE_URL]);

  // 2. IMPLEMENTACIÓN DE FETCH PARA URL BASE
  const fetchShareBaseUrl = useCallback(async () => {
    if (!API_BASE_URL) return;

    try {
      const endpoint = `${API_BASE_URL}/app-settings/url_share_and_earn`;
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Failed to fetch share base URL.');
      }
      const data = await response.json();
      // Asumiendo que 'value' contiene la URL base (ej: "http://example.com/referrals/")
      setShareBaseUrl(data.value || '');
    } catch (error) {
      console.error('Error fetching share base URL:', error);
      setShareBaseUrl(''); // Fallback
    }
  }, [API_BASE_URL]);


  // 3. useEffect para llamar a las funciones de fetch al cargar
   useEffect(() => {
    fetchReferralReward();
    fetchShareBaseUrl();
  }, [API_BASE_URL, fetchReferralReward, fetchShareBaseUrl]);

  // La URL completa de invitación se crea con la base obtenida y el código del usuario.
  const inviteLink = `${shareBaseUrl}${invitationCode}`;

  // Mensaje de invitación en inglés (Opción 1)
  const getShareMessage = () => {
    return `Home Service Simplified! 🧹

TNB is a new digital service platform developed to connect you instantly with reliable, top-rated domestic services (cleaning, repairs, maintenance, etc.).

Join the future of home care!

🔗 Sign up using this link: ${inviteLink}

🤝 Use my invitation code: ${invitationCode}

Start simplifying your life and get your first service gift today!`;
  };


  const onShare = async () => { 
    const message = getShareMessage(); // Usamos la nueva función para obtener el mensaje
    try {
      const result = await Share.share({
        message: message,
        url: inviteLink,
        title: 'Invite a Friend to [App Name]!',
      });
      if (result.action === Share.sharedAction) {
        // Compartido exitosamente
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };
  
  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(inviteLink);
    Alert.alert('Copied!', 'The invitation link has been copied to your clipboard.');
  };

  const imgShare = require('@/assets/images/share.png')

  const userId = useAppSelector(state => state.auth.userId);
  const isGuest = userId === 'GUEST_USER';
  
  return (
    <>
      <StatusBar 
        style="light" 
        backgroundColor={Theme.colors.primary[500]} 
      />
      <View style={styles.fullContainer}> 
        
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={24} color={Theme.colors.text.inverse} /> 
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <ScrollView style={styles.scrollContent} contentContainerStyle={styles.content}>
          <View style={styles.imageContainer}>
            <Image 
              source={imgShare} 
              style={styles.image}
              resizeMode="cover"
            />
            {!isGuest && (
                <TouchableOpacity style={styles.shareImageButton} onPress={onShare}>
                  <FontAwesome name="share-alt" size={20} color={Theme.colors.text.inverse} />
                </TouchableOpacity>
              )}
          </View>

          <Text style={styles.title}>Invite a friend</Text>
          <Text style={styles.subtitle}>Share your invitation link so your friends can join and get a ${referralReward} service gift.</Text>
          
          {isGuest ? (
              <View style={[styles.invitationLinkContainer, { backgroundColor: '#F3F4F6', borderStyle: 'dashed', borderWidth: 1, borderColor: '#9CA3AF' }]}>
                <Text style={[styles.invitationLinkText, { textAlign: 'center', color: '#4B5563', paddingVertical: 10 }]}>
                  Only registered users can get an invitation link.
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.invitationLinkContainer}>
                  <Text style={styles.invitationLinkText}>Your invitation link:</Text>
                  <View style={styles.linkDisplay}>
                    <Text style={styles.link} numberOfLines={1} ellipsizeMode="middle">
                      {inviteLink || 'Loading link...'}
                    </Text>
                    <TouchableOpacity onPress={copyToClipboard} style={styles.copyButton}>
                      <FontAwesome name="copy" size={18} color={Theme.colors.text.inverse} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.shareButton} onPress={onShare}>
                    <FontAwesome name="share-alt" size={24} color={Theme.colors.text.inverse} style={styles.icon} />
                    <Text style={styles.buttonText}>Share link</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
            
            <TouchableOpacity 
                style={styles.viewReferralsButton} 
                onPress={() => setReferralModalVisible(true)}
            >
                <FontAwesome name="list-alt" size={20} color={Theme.colors.primary[500]} style={styles.viewReferralsIcon} />
                <Text style={styles.viewReferralsText}>View My Referrals</Text>
                <FontAwesome name="chevron-right" size={16} color={Theme.colors.text.secondary} />
            </TouchableOpacity>
            <View style={styles.separator} />

          <View style={styles.additionalInfoContainer}>
            <View style={styles.infoRow}>
              <FontAwesome name="gift" size={16} color={Theme.colors.primary[500]} style={styles.infoIcon} />
              <Text style={styles.additionalInfoText}>
                If your friend signs up with your invitation link, you'll receive ${referralReward} in credit.
              </Text>
            </View>
            <View style={styles.infoRow}>
              <FontAwesome name="user-plus" size={16} color={Theme.colors.primary[500]} style={styles.infoIcon} />
              <Text style={styles.additionalInfoText}>
                Your friend will also receive ${referralReward} in credit to use toward the purchase of one of our services.
              </Text>
            </View>
          </View>

        </ScrollView>
      </View>

     <ReferralListModal
                isVisible={isReferralModalVisible}
                onClose={() => setReferralModalVisible(false)}
                API_BASE_URL={API_BASE_URL || ''}
              />
      </>
  );
};

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary, 
  },
  scrollContent: {
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: Theme.spacing.lg,
    backgroundColor: Theme.colors.primary[500],
    paddingTop: 40, 
  },
  backButtonText: {
    marginLeft: Theme.spacing.sm,
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.text.inverse,
  },
  content: {
    padding: Theme.spacing.base, 
    alignItems: 'center',
    paddingBottom: Theme.spacing.xl, 
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    marginBottom: Theme.spacing.lg, 
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
    ...Theme.shadows.md,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  shareImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 10,
    borderRadius: Theme.borderRadius.full,
    zIndex: 10,
  },
  title: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xs, 
    paddingHorizontal: Theme.spacing.base,
  },
  invitationLinkContainer: {
    width: '100%',
    marginTop: Theme.spacing.lg, 
    marginBottom: Theme.spacing.base, 
    alignItems: 'flex-start',
  },
  invitationLinkText: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  linkDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.neutral[100],
    borderRadius: Theme.borderRadius.md,
    paddingVertical: Theme.spacing.base,
    paddingHorizontal: Theme.spacing.lg,
    width: '100%',
    borderWidth: 1,
    borderColor: Theme.colors.border.light,
    ...Theme.shadows.sm,
  },
  link: {
    flex: 1,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.tertiary,
    marginRight: Theme.spacing.base,
  },
  copyButton: {
    backgroundColor: Theme.colors.primary[500],
    padding: 8,
    borderRadius: Theme.borderRadius.sm,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: Theme.spacing.sm, 
  },
  shareButton: {
    backgroundColor: Theme.colors.primary[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.xl,
    ...Theme.shadows.md,
  },
  icon: {
    marginRight: Theme.spacing.sm,
  },
  buttonText: {
    color: Theme.colors.text.inverse,
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  viewReferralsButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm, 
  },
  viewReferralsText: {
    flex: 1,
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.text.primary,
    marginLeft: Theme.spacing.base,
  },
  viewReferralsIcon: {
    color: Theme.colors.primary[500],
  },
  separator: {
    height: 1,
    width: '100%',
    backgroundColor: Theme.colors.border.light,
    marginBottom: Theme.spacing.sm, 
  },
  additionalInfoContainer: {
    width: '100%',
    padding: Theme.spacing.base, 
    backgroundColor: Theme.colors.background.primary, 
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border.light,
    ...Theme.shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.xs, 
  },
  infoIcon: {
    marginRight: Theme.spacing.sm,
    marginTop: 2, 
    color: Theme.colors.primary[500], 
  },
  additionalInfoText: {
    flex: 1,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
    lineHeight: Theme.typography.lineHeight.lg,
  },
});

export default ShareAndEarnScreen;