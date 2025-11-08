import { FontAwesome } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Image, Share, Text, TouchableOpacity, View, StyleSheet, ScrollView } from 'react-native'; 
import { loadUserData } from '@/store/slices/userSlice'
import ReferralListModal from '../../components/referral/ReferralListModal';
import { Theme } from '../../constants/Theme';

const ShareAndEarnScreen = () => {
  
  const router = useRouter();
  const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;
  const [referralReward, setReferralReward] = useState<string>('19');
  const [isReferralModalVisible, setReferralModalVisible] = useState(false);
  const { userData } = useAppSelector((state) => state.user)
  const invitationCode = userData?.referralCode
  const userId = userData?.userId || 0; 
  const fetchReferralReward = useCallback(async () => { /* ... */ }, [API_BASE_URL]);
  const [shareBaseUrl, setShareBaseUrl] = useState<string>(API_BASE_URL);
  const fetchShareBaseUrl = useCallback(async () => { /* ... */ }, [API_BASE_URL]);

   useEffect(() => {
    fetchReferralReward();
    fetchShareBaseUrl();
  }, [API_BASE_URL, fetchReferralReward, fetchShareBaseUrl]);

  const inviteLink = `${shareBaseUrl}${invitationCode}`;

  const onShare = async () => { /* ... */ };
  const imgShare = require('@/assets/images/share.png')
  const copyToClipboard = async () => { /* ... */ };

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
            <TouchableOpacity style={styles.shareImageButton} onPress={onShare}>
              <FontAwesome name="share-alt" size={20} color={Theme.colors.text.inverse} />
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
            
            <TouchableOpacity 
                style={styles.viewReferralsButton} 
                onPress={() => setReferralModalVisible(true)}
            >
                <FontAwesome name="list-alt" size={20} color={Theme.colors.text.primary} style={styles.viewReferralsIcon} />
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
                userId={userId}
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
    paddingVertical: Theme.spacing.xl, 
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
    padding: Theme.spacing.xl,
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    marginBottom: Theme.spacing.xl,
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
    marginBottom: Theme.spacing['2xl'],
    paddingHorizontal: Theme.spacing.base,
  },
  invitationLinkContainer: {
    width: '100%',
    marginBottom: Theme.spacing['2xl'],
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
    marginBottom: Theme.spacing.lg, 
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
    paddingVertical: Theme.spacing.base,
    paddingHorizontal: Theme.spacing.sm,
    marginBottom: Theme.spacing.lg,
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
    marginBottom: Theme.spacing.xl,
  },
  additionalInfoContainer: {
    width: '100%',
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.background.primary, 
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border.light,
    ...Theme.shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.base,
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