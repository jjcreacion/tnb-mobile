import React, { useState } from 'react';
import { View, Text, ImageBackground, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';

interface ServiceCardProps {
  title: string;
  description: string;
  imageSource: any;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ title, description, imageSource }) => (
  <ImageBackground source={imageSource} style={styles.card}>
    <View style={styles.textContainer}>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
  </ImageBackground>
);

const HomeScreen: React.FC = () => {
  const [searchText, setSearchText] = useState<string>('');

  return (
    <View style={styles.container}>
      <ImageBackground source={require('@/assets/images/roof-repair.jpg')} style={styles.backgroundImage}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search services..."
            placeholderTextColor="gray"
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity style={styles.searchButton}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>

      <ScrollView contentContainerStyle={styles.servicesContainer}>
        <ServiceCard
          title="Commercial Construction"
          description=" "
          imageSource={require('@/assets/images/commercial.jpg')}
        />
        <ServiceCard
          title="Residential Construction"
          description=" "
          imageSource={require('@/assets/images/residential.jpg')}
        />
        <ServiceCard
          title="Pre-Construction"
          description=" "
          imageSource={require('@/assets/images/preconstruction.jpg')}
        />
        <ServiceCard
          title="Special Projects"
          description=" "
          imageSource={require('@/assets/images/specialprojects.jpg')}
        />
        <ServiceCard
          title="Site Management"
          description=" "
          imageSource={require('@/assets/images/sitemanagement.jpg')}
        />
        <ServiceCard
          title="Infrastructure Construction"
          description=" "
          imageSource={require('@/assets/images/infrastructureConstruction.jpg')}
        />
        <ServiceCard
          title="Civil Engineering"
          description=" "
          imageSource={require('@/assets/images/civilengineering.jpg')}
        />
        <ServiceCard
          title="Landscape Construction"
          description=" "
          imageSource={require('@/assets/images/landscape.jpg')}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  backgroundImage: {
    height: 170,
    justifyContent: 'flex-start',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    paddingHorizontal: 10,
    margin: 16,
    marginTop: 80,
  },
  textContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    color: 'black',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
  },
  servicesContainer: {
    padding: 16,
  },
  card: {
    height: 150,
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    aspectRatio: 16/9,
    borderWidth: 8, 
    borderColor: 'rgba(128, 128, 128, 0.2)',
    borderStyle: 'solid', 
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: 'white'
  },
  cardDescription: {
    fontSize: 16,
  },
});

export default HomeScreen;