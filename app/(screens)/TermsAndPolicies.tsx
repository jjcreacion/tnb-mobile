import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';

const TermsAndPoliciesScreen = () => {
  const router = useRouter();

  const policies = [
    { name: 'Long grass policy', icon: 'grass', screen: '/(screens)/policies/LongGrassPolicy' },
    { name: '3-Cut Minimum', icon: 'content-cut', screen: '/(screens)/policies/ThreeCutMinimum' },
    { name: 'Trust and safety', icon: 'security', screen: '/(screens)/policies/TrustAndSafety' },
    { name: 'Privacy policy', icon: 'privacy-tip', screen: '/(screens)/policies/PrivacyPolicy' },
    { name: 'Terms of service', icon: 'gavel', screen: '/(screens)/policies/TermsOfService' },
  ];

  const navigateToPolicy = (screen: string) => {
    router.push(screen);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <FontAwesome name="arrow-left" size={24} color="#333" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Terms and Policies</Text>
        {policies.map((policy, index) => (
          <TouchableOpacity key={index} style={styles.policyItem} onPress={() => navigateToPolicy(policy.screen)}>
            <MaterialIcons name={policy.icon as any} size={24} color="#007AFF" />
            <Text style={styles.policyText}>{policy.name}</Text>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
        ))}
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
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  policyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  policyText: {
    flex: 1,
    fontSize: 18,
    marginLeft: 15,
    color: '#333',
  },
});

export default TermsAndPoliciesScreen;

