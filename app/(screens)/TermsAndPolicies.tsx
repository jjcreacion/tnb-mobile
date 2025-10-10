import { MigratedStyles } from '@/constants/MigratedStyles';
import { Theme } from '@/constants/Theme';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

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
    router.push(screen as any);
  };

  return (
    <View style={MigratedStyles.termsAndPoliciesContainer}>
      <TouchableOpacity style={MigratedStyles.termsAndPoliciesBackButton} onPress={() => router.back()}>
        <FontAwesome name="arrow-left" size={24} color={Theme.colors.text.primary} />
        <Text style={MigratedStyles.termsAndPoliciesBackButtonText}>Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={MigratedStyles.termsAndPoliciesContent}>
        <Text style={MigratedStyles.termsAndPoliciesTitle}>Terms and Policies</Text>
        {policies.map((policy, index) => (
          <TouchableOpacity key={index} style={MigratedStyles.termsAndPoliciesPolicyItem} onPress={() => navigateToPolicy(policy.screen)}>
            <MaterialIcons name={policy.icon as any} size={24} color={Theme.colors.primary[500]} />
            <Text style={MigratedStyles.termsAndPoliciesPolicyText}>{policy.name}</Text>
            <MaterialIcons name="chevron-right" size={24} color={Theme.colors.text.tertiary} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default TermsAndPoliciesScreen;

