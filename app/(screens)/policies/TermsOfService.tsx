import { Theme } from '@/constants/Theme';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TermsOfServiceScreen = () => {
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
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.paragraph}>
          Welcome to TNB! These Terms of Service ('Terms') govern your use of our mobile application and services. By creating an account or using our platform, you agree to these Terms. You are responsible for providing accurate information and for the activity that occurs on your account. Our platform is a marketplace that connects users seeking home services with independent providers. While we facilitate these connections, we are not responsible for the performance of the providers or the outcome of the services. Payments are processed through our secure third-party payment gateway. We reserve the right to modify these Terms at any time and to suspend or terminate accounts that violate our policies. Your continued use of the service after any changes constitutes your acceptance of the new Terms.
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

export default TermsOfServiceScreen;