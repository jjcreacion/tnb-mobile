import { FontAwesome } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Image, Share, Text, TouchableOpacity, View } from 'react-native';

// Theme System Components
import { MigratedStyles } from '../../constants/MigratedStyles';
import { Theme } from '../../constants/Theme';

const ShareAndEarnScreen = () => {
  const router = useRouter();
  const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;
  const URL_SHARE_AND_EARN = Constants.expoConfig?.extra?.API_BASE_URL || 'https://myapp.com/invite/';

  const [referralReward, setReferralReward] = useState<string>('19');
  const [invitationCode, setInvitationCode] = useState<string>('12345678');

  const inviteLink = `${URL_SHARE_AND_EARN}?code=${invitationCode}`;

  const fetchReferralReward = useCallback(async () => {
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
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchReferralReward();
  }, [API_BASE_URL, fetchReferralReward]);

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

  return (
    <>
      <StatusBar 
        style="light" 
        backgroundColor={Theme.colors.primary[500]}
      />
      <View style={MigratedStyles.shareAndEarnContainer}>
        <TouchableOpacity style={MigratedStyles.shareAndEarnBackButton} onPress={() => router.back()}>
        <FontAwesome name="arrow-left" size={24} color={Theme.colors.text.primary} />
        <Text style={MigratedStyles.shareAndEarnBackButtonText}>Back</Text>
      </TouchableOpacity>

      <View style={MigratedStyles.shareAndEarnContent}>
        <View style={MigratedStyles.shareAndEarnImageContainer}>
          <Image 
            source={imgShare} 
            style={MigratedStyles.shareAndEarnImage}
            resizeMode="cover"
          />
          <TouchableOpacity style={MigratedStyles.shareAndEarnShareImageButton} onPress={onShare}>
            <FontAwesome name="share-alt" size={20} color={Theme.colors.text.inverse} />
          </TouchableOpacity>
        </View>

        <Text style={MigratedStyles.shareAndEarnTitle}>Invite a friend</Text>
        <Text style={MigratedStyles.shareAndEarnSubtitle}>Share your invitation link so your friends can join and get a ${referralReward} service gift.</Text>
        
        <View style={MigratedStyles.shareAndEarnInvitationLinkContainer}>
          <Text style={MigratedStyles.shareAndEarnInvitationLinkText}>Your invitation link:</Text>
          <View style={MigratedStyles.shareAndEarnLinkDisplay}>
            <Text style={MigratedStyles.shareAndEarnLink} numberOfLines={1} ellipsizeMode="middle">
              {inviteLink}
            </Text>
            <TouchableOpacity onPress={copyToClipboard} style={MigratedStyles.shareAndEarnCopyButton}>
              <FontAwesome name="copy" size={18} color={Theme.colors.text.inverse} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={MigratedStyles.shareAndEarnButtonContainer}>
          <TouchableOpacity style={MigratedStyles.shareAndEarnShareButton} onPress={onShare}>
            <FontAwesome name="share-alt" size={24} color={Theme.colors.text.inverse} style={MigratedStyles.shareAndEarnIcon} />
            <Text style={MigratedStyles.shareAndEarnButtonText}>Share link</Text>
          </TouchableOpacity>
        </View>

        <View style={MigratedStyles.shareAndEarnAdditionalInfoContainer}>
          <View style={MigratedStyles.shareAndEarnInfoRow}>
            <FontAwesome name="gift" size={16} color={Theme.colors.neutral[600]} style={MigratedStyles.shareAndEarnInfoIcon} />
            <Text style={MigratedStyles.shareAndEarnAdditionalInfoText}>
              If your friend signs up with your invitation link, you'll receive ${referralReward} in credit.
            </Text>
          </View>
          <View style={MigratedStyles.shareAndEarnInfoRow}>
            <FontAwesome name="user-plus" size={16} color={Theme.colors.neutral[600]} style={MigratedStyles.shareAndEarnInfoIcon} />
            <Text style={MigratedStyles.shareAndEarnAdditionalInfoText}>
              Your friend will also receive ${referralReward} in credit to use toward the purchase of one of our services.
            </Text>
          </View>
        </View>

      </View>
    </View>
    </>
  );
};

export default ShareAndEarnScreen;