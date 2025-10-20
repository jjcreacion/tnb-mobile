import { Theme } from '@/constants/Theme';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ThreeCutMinimumScreen = () => {
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
        <Text style={styles.title}>3-Cut Minimum Policy</Text>
        <Text style={styles.paragraph}>
        To ensure we can provide the highest quality of service and maintain the health of your lawn, we have a '3-Cut Minimum' policy for all new recurring service agreements. This initial commitment allows our teams to establish a consistent cutting schedule, understand the specific needs of your property, and bring your lawn to a baseline level of excellence. This policy helps us manage our schedules efficiently and guarantees you a reliable and professional service from the start. This policy does not apply to one-time services, which are priced separately. We believe this initial period is crucial for demonstrating the value and quality of our ongoing maintenance.
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

export default ThreeCutMinimumScreen;