import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

const PrivacyPolicyScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <FontAwesome name="arrow-left" size={24} color="#333" />
        <Text style={styles.backButtonText}>Atrás</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.paragraph}>
          We are committed to protecting your privacy. This policy outlines how we collect, use, and safeguard your personal information. We collect data you provide, such as your name, address, and contact details, to facilitate service requests and payments. We also collect location data to connect you with local providers and track service progress. Your information is used solely for the purpose of providing and improving our services. We do not sell your personal data to third parties. We employ industry-standard security measures, including encryption and access controls, to protect your information from unauthorized access. By using our app, you consent to the data practices described in this policy.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 18,
    marginLeft: 10,
    color: '#333',
  },
  content: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    marginBottom: 15,
    textAlign: 'justify',
  }
});

export default PrivacyPolicyScreen;