import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { FontAwesome } from '@expo/vector-icons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

export default function SupportScreen() {
  const socialLinks = [
    {
      icon: 'tiktok', 
      url: 'https://www.tiktok.com/@the.national.builders?is_from_webapp=1&sender_device=pc',
      IconComponent: FontAwesome5,
    },
    {
      icon: 'instagram',
      url: 'https://www.instagram.com/thenationalbuilders/',
      IconComponent: FontAwesome,
    },
    {
      icon: 'facebook-square',
      url: 'https://www.facebook.com/thenationalbuilder',
      IconComponent: FontAwesome,
    },
    {
      icon: 'globe',
      url: 'https://www.thenationalbuilders.com/portal',
      IconComponent: FontAwesome,
    },
  ];

  const whatsappLink = 'https://api.whatsapp.com/send/?phone=%2B12294445456&text=Hi%2C+I+have+a+question...&type=phone_number&app_absent=0';

  const handleLinkPress = (url) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Icon name="support-agent" size={120} color="#f54021" />
        <Text style={styles.headerText}>Support</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Head Office</Text>
        <Text style={styles.cardText}>
          <Icon name="location-on" size={20} color="#f54021" /> 9101 LBJ Freeway 300, Dallas, TX, United States, Texas
        </Text>
        <Text style={styles.cardText}>
          <Icon name="email" size={20} color="#f54021" /> Info@thenationalbuilders.com
        </Text>
        <Text style={styles.cardText}>
          <Icon name="phone" size={20} color="#f54021" /> (862) 401 2414
        </Text>
      </View>

      <View style={styles.socialContainer}>
        {socialLinks.map((link, index) => (
          <TouchableOpacity
            key={index}
            style={styles.socialIcon}
            onPress={() => handleLinkPress(link.url)}
          >
            <link.IconComponent name={link.icon} size={40} color="#f54021" />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.whatsappButton}
        onPress={() => handleLinkPress(whatsappLink)}
      >
        <FontAwesome name="whatsapp" size={30} color="#fff" />
        <Text style={styles.whatsappText}>Contact us on WhatsApp</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'center',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  socialIcon: {
    padding: 10,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
  },
});