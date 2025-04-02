import React, { useState, useEffect } from 'react';
import { View, Text, ImageBackground, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, Platform, Image  } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import RequestModal from '../(screens)/RequestModal';

interface ServiceCardProps {
  title: string;
  description: string;
  imageSource: any;
}

const tnbLogo = require('@/assets/images/icon-tnb.png');

const ServiceItem = ({ icon, title, color }) => {
  const [isModalVisible, setModalVisible] = useState(false);

  return (
    <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.serviceItem}>
      <LinearGradient
        colors={['#f5f5f5', '#fafafa']}
        style={styles.shield}
      >
        <Icon name={icon} size={60} color={color} />
        <Text style={styles.serviceTitle}>{title}</Text>
      </LinearGradient>
      <RequestModal isVisible={isModalVisible} onClose={() => setModalVisible(false)} title={title} />
    </TouchableOpacity>
  );
};

const HomeScreen: React.FC = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isRequestModalVisible, setRequestModalVisible] = useState(false); 
 
  const services = [
    { icon: 'business', title: 'Commercial Construction', color: '#ff4081' },
    { icon: 'home', title: 'Residential Construction', color: '#8c9eff' },
    { icon: 'build', title: 'Pre-Construction', color: '#ea80fc' },
    { icon: 'engineering', title: 'Special Projects', color: '#90caf9' },
    { icon: 'location-city', title: 'Site Management', color: '#81c784' },
    { icon: 'foundation', title: 'Infrastructure Construction', color: '#ff6f00' },
    { icon: 'architecture', title: 'Civil Engineering', color: '#607d8b' },
    { icon: 'park', title: 'Landscape Construction', color: '#ff4081' },
  ];

  const images = [
    require('@/assets/images/roof-repair.jpg'),
    require('@/assets/images/commercial.jpg'),
    require('@/assets/images/residential.jpg'),
    require('@/assets/images/preconstruction.jpg'),
    require('@/assets/images/specialprojects.jpg'),
    require('@/assets/images/sitemanagement.jpg'),
    require('@/assets/images/infrastructureConstruction.jpg'),
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval); 
  }, [images.length]);

  return (
    <View style={styles.container}>
    <ImageBackground source={images[currentImageIndex]} style={styles.backgroundImage}>
        <View style={styles.headerContainer}>
        <View style={styles.leftHeader}>
          <Image source={tnbLogo} style={styles.companyLogo} />
          <Text style={styles.companyName}>TNB</Text>
        </View>
        <View style={styles.rightHeader}>
          <Text style={styles.userName}>Hi, Johann </Text>
          <Icon name="account-circle" size={30} color="white" />
        </View>
       
        </View>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="gray"
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity>
            <Icon name="search" size={30} color="#f54021" />
          </TouchableOpacity>
        </View>
      </ImageBackground>

      <ScrollView contentContainerStyle={styles.servicesContainer}>
        <Text style={styles.serviceQuestion}>What service do you need?</Text>
        {services.map((service, index) => (
          <ServiceItem key={index} {...service} />
        ))}
      </ScrollView>

      <RequestModal isVisible={isRequestModalVisible} onClose={() => setRequestModalVisible(false)} /> 

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
 backgroundImage: {
    height: 200,
    justifyContent: 'flex-start',
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30, 
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: 'gray',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 16,
  },
   serviceItem: {
    width: '45%',
    alignItems: 'center',
    marginBottom: 10,
  },
  shield: {
    width: 130, 
    height: 130, 
    borderRadius: 2, 
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3, 
    borderColor: 'rgba(230, 230, 230, 0.3)', 
   },
  companyLogo: {
    width: 30, 
    height: 30,
    marginRight: 5,
  }, 
  serviceTitle: {
    fontSize: 13,
    marginTop: 5,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  serviceQuestion: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 1,
    marginBottom: 15,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 40,
    textAlign: 'center',
    color: 'white',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    paddingHorizontal: 10,
    margin: 20,
    marginTop: 30,
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
    backgroundColor: '#f54021',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
  },
  cardDescription: {
    fontSize: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 30,
    marginBottom: 15,
    width: '100%',
    backgroundColor: 'rgba(10, 0, 0, 0.5)',  
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  userName: {
    color: 'white',
    fontSize: 16,
    marginLeft: 5,
  },
});

export default HomeScreen;