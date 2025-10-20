import { Theme } from '@/constants/Theme';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TrustAndSafetyScreen = () => {
  const router = useRouter();

  return (
    <>
      <StatusBar 
        style="light" 
        backgroundColor={Theme.colors.primary[500]}
      />
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <FontAwesome name="arrow-left" size={24} color="#333" />
        <Text style={styles.backButtonText}>Atrás</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Trust and Safety</Text>
        <Text style={styles.paragraph}>
        Your trust and safety are the cornerstones of our platform. We are committed to creating a secure environment for both customers and service providers. All providers on our platform undergo a thorough vetting process, including identity verification and background checks. We maintain a comprehensive insurance policy to cover any unforeseen incidents during a service. We enforce a strict Code of Conduct that promotes respect, professionalism, and clear communication. Our in-app rating and review system allows the community to share feedback, ensuring accountability and high standards. If you ever have a concern, our dedicated support team is available to investigate and take appropriate action promptly.
        </Text>
      </ScrollView>
    </View>
    </>
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

export default TrustAndSafetyScreen;