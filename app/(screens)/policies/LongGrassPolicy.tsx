import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

const LongGrassPolicyScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <FontAwesome name="arrow-left" size={24} color="#333" />
        <Text style={styles.backButtonText}>Atrás</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Long Grass Policy</Text>
        <Text style={styles.paragraph}>
        Our standard pricing for lawn mowing services is based on grass height not exceeding 6 inches. Properties with grass taller than 6 inches require significantly more time, labor, and equipment wear to service properly. Therefore, a 'Long Grass Surcharge' will be applied to any service where the grass height is between 6 and 12 inches. The exact surcharge will be determined by the service provider on-site and communicated to you for approval before work begins. For properties with grass exceeding 12 inches, we may need to schedule a specialized service. We reserve the right to decline service if the property conditions are deemed unsafe or unmanageable.
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

export default LongGrassPolicyScreen;