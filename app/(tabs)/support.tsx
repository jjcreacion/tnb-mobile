import { Card } from '@/components/common';
import { SupportHeader } from '@/components/home';
import { Theme } from '@/constants/Theme';
import { FontAwesome } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useCallback } from 'react';
import {
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Icon from 'react-native-vector-icons/Ionicons';
import { SwipeableTabScreen } from '@/components/common';
import SideMenu from '../(screens)/SideMenu';

interface SocialLink {
  icon: string;
  url: string;
  IconComponent: any;
  label: string;
}

interface ContactInfo {
  icon: string;
  text: string;
  type: 'location' | 'email' | 'phone';
}

export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  const [isMenuVisible, setMenuVisible] = useState(false);

  const handleMenuPress = useCallback(() => {
    setMenuVisible(true);
  }, []);

  const socialLinks: SocialLink[] = [
    {
      icon: 'tiktok',
      url: 'https://www.tiktok.com/@the.national.builders?is_from_webapp=1&sender_device=pc',
      IconComponent: FontAwesome5,
      label: 'TikTok',
    },
    {
      icon: 'instagram',
      url: 'https://www.instagram.com/thenationalbuilders/',
      IconComponent: FontAwesome,
      label: 'Instagram',
    },
    {
      icon: 'facebook-square',
      url: 'https://www.facebook.com/thenationalbuilder',
      IconComponent: FontAwesome,
      label: 'Facebook',
    },
    {
      icon: 'globe',
      url: 'https://www.thenationalbuilders.com',
      IconComponent: FontAwesome,
      label: 'Website',
    },
  ];

  const contactInfo: ContactInfo[] = [
    {
      icon: 'location',
      text: '9101 LBJ Freeway 300, Dallas, TX, United States, Texas',
      type: 'location',
    },
    {
      icon: 'mail',
      text: 'Info@thenationalbuilders.com',
      type: 'email',
    },
    {
      icon: 'call',
      text: '(862) 277 0131',
      type: 'phone',
    },
  ];

  const whatsappLink = 'https://api.whatsapp.com/send/?phone=%2B12294445456&text=Hi%2C+I+have+a+question...&type=phone_number&app_absent=0';

  const handleLinkPress = (url: string) => {
    Linking.openURL(url);
  };

  const handleContactPress = (type: string, value: string) => {
    if (type === 'email') {
      Linking.openURL(`mailto:${value}`);
    } else if (type === 'phone') {
      Linking.openURL(`tel:${value.replace(/[^0-9]/g, '')}`);
    }
  };

  return (
    <SwipeableTabScreen tabName="support">
      <View style={styles.container}>
        <StatusBar style="light" backgroundColor={Theme.colors.primary[500]} />
        <SupportHeader onMenuPress={handleMenuPress} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          Platform.OS === 'android' && {
            paddingBottom: 70 + insets.bottom + 20,
          },
        ]}
      >

      <View style={styles.content}>
        {/* Head Office Card */}
        <Card variant="elevated" padding="lg" style={styles.officeCard}>
          <View style={styles.cardHeader}>
            <Icon name="business" size={32} color={Theme.colors.primary[500]} />
            <Text style={styles.cardTitle}>Head Office</Text>
          </View>

          {contactInfo.map((info, index) => (
            <TouchableOpacity
              key={index}
              style={styles.contactItem}
              onPress={() => info.type !== 'location' && handleContactPress(info.type, info.text)}
              disabled={info.type === 'location'}
            >
              <View style={styles.contactIconContainer}>
                <Icon name={info.icon} size={20} color={Theme.colors.primary[500]} />
              </View>
              <Text style={styles.contactText}>{info.text}</Text>
            </TouchableOpacity>
          ))}
        </Card>

        {/* Social Media Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connect With Us</Text>
          <Card variant="elevated" padding="lg">
            <View style={styles.socialContainer}>
              {socialLinks.map((link, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.socialButton}
                  onPress={() => handleLinkPress(link.url)}
                >
                  <View style={styles.socialIconContainer}>
                    <link.IconComponent name={link.icon} size={28} color={Theme.colors.primary[500]} />
                  </View>
                  <Text style={styles.socialLabel}>{link.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </View>

        {/* WhatsApp Button */}
        <TouchableOpacity
          style={styles.whatsappButton}
          onPress={() => handleLinkPress(whatsappLink)}
        >
          <View style={styles.whatsappIconContainer}>
            <FontAwesome name="whatsapp" size={28} color="#FFFFFF" />
          </View>
          <View style={styles.whatsappTextContainer}>
            <Text style={styles.whatsappTitle}>Contact us on WhatsApp</Text>
            <Text style={styles.whatsappSubtitle}>Get instant support</Text>
          </View>
          <Icon name="chevron-forward" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Help Section */}
        <Card variant="outlined" padding="lg" style={styles.helpCard}>
          <View style={styles.helpContent}>
            <Icon name="help-circle" size={48} color={Theme.colors.primary[500]} />
            <Text style={styles.helpTitle}>Need Help?</Text>
            <Text style={styles.helpText}>
              Our support team is available 24/7 to assist you with any questions or concerns.
            </Text>
          </View>
        </Card>
        </View>
        </ScrollView>

        <SideMenu
          isVisible={isMenuVisible}
          onClose={() => setMenuVisible(false)}
        />
      </View>
    </SwipeableTabScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: Theme.spacing['2xl'],
  },

  content: {
    paddingHorizontal: Theme.spacing.base,
    paddingBottom: Theme.spacing['2xl'],
  },

  officeCard: {
    marginBottom: Theme.spacing.xl,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Theme.spacing.lg,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.light,
  },

  cardTitle: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
  },

  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.light,
  },

  contactIconContainer: {
    width: 36,
    height: 36,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },

  contactText: {
    flex: 1,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
    lineHeight: Theme.typography.lineHeight.base,
  },

  section: {
    marginBottom: Theme.spacing.xl,
  },

  sectionTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
    marginBottom: 12,
  },

  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: Theme.spacing.sm,
  },

  socialButton: {
    alignItems: 'center',
    flex: 1,
    gap: Theme.spacing.sm,
  },

  socialIconContainer: {
    width: 56,
    height: 56,
    borderRadius: Theme.borderRadius.xl,
    backgroundColor: Theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadows.sm,
  },

  socialLabel: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
  },

  whatsappButton: {
    backgroundColor: '#25D366',
    paddingVertical: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.base,
    borderRadius: Theme.borderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Theme.spacing.xl,
    ...Theme.shadows.md,
  },

  whatsappIconContainer: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  whatsappTextContainer: {
    flex: 1,
  },

  whatsappTitle: {
    color: '#FFFFFF',
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: 2,
  },

  whatsappSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: Theme.typography.fontSize.sm,
  },

  helpCard: {
    backgroundColor: Theme.colors.primary[50],
    borderColor: Theme.colors.primary[200],
  },

  helpContent: {
    alignItems: 'center',
    gap: 12,
  },

  helpTitle: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.primary[700],
  },

  helpText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: Theme.typography.lineHeight.lg,
  },
});
