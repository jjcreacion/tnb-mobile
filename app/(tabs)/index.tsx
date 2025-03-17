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
    <Text style={styles.cardDescription}>{description}</Text>
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
            placeholder="Buscar servicios..."
            placeholderTextColor="gray"
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity style={styles.searchButton}>
            <Text style={styles.searchButtonText}>Buscar</Text>
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
          imageSource={require('@/assets/images/commercial.jpg')} 
        />
        <ServiceCard
          title="Pre-Construction"
          description=" "
          imageSource={require('@/assets/images/commercial.jpg')} 
        />
        <ServiceCard
          title="Special Projects"
          description=" "
          imageSource={require('@/assets/images/commercial.jpg')}
        />
        <ServiceCard
          title="Site Management"
          description=" "
          imageSource={require('@/assets/images/commercial.jpg')} // Agrega la imagen
        />
        <ServiceCard
          title="Infrastructure Construction"
          description=" "
          imageSource={require('@/assets/images/commercial.jpg')} // Agrega la imagen
        />
        <ServiceCard
          title="Civil Engineering"
          description=" "
          imageSource={require('@/assets/images/commercial.jpg')} // Agrega la imagen
        />
        <ServiceCard
          title="Landscape Construction"
          description=" "
          imageSource={require('@/assets/images/commercial.jpg')} // Agrega la imagen
        />
        
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, 
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
    marginTop: 60,
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
    borderRadius: 8,
    overflow: 'hidden', 
    marginBottom: 16,
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 16,
  },
});

export default HomeScreen;