import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

export default function ProfileScreen() {
  const [userData, setUserData] = useState({
    profilePicture: require('@/assets/images/user.png'),
    username: '',
    email: '',
    phone: '',
    firstName: '',
    middleName: '',
    lastName: '',
    birthdate: '',
    address: '',
    pkUser: null,
    createdAt: null, 
  });
  const [isEditing, setIsEditing] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const API_URL = Constants.expoConfig?.extra?.API_BASE_URL || 'http://localhost:12099';

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          const response = await fetch(`${API_URL}/user/findOne/${userId}`);
          if (response.ok) {
            const userDataFromApi = await response.json();

          
           const rawPkUser = userDataFromApi.pkUser;
            const formattedPkUser = rawPkUser
              ? String(rawPkUser).padStart(6, '0')
              : null;

          
            let formattedCreatedAt = null;
            if (userDataFromApi.createdAt) {
              const date = new Date(userDataFromApi.createdAt);
              formattedCreatedAt = date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });
            }

            setUserData({
              ...userData,
              username: userDataFromApi.username || '',
              email: userDataFromApi.email || '',
              phone: userDataFromApi.phone || '',
              firstName: userDataFromApi.person?.firstName || '',
              middleName: userDataFromApi.person?.middleName || '',
              lastName: userDataFromApi.person?.lastName || '',
              address: userDataFromApi.person?.addresses?.[0]?.address || '',
              pkUser: formattedPkUser,
              createdAt: formattedCreatedAt, 
            });
          } else {
            console.error('Error al cargar los datos del usuario:', response.status);
          }
        }
      } catch (error) {
        console.error('Error al cargar los datos del usuario:', error);
      }
    };

    loadUserData();
  }, []);

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (name, value) => {
    setUserData({ ...userData, [name]: value });
  };

  return (
    <ScrollView style={styles.container}>
      <ImageBackground source={require('@/assets/images/roof-repair.jpg')} style={styles.backgroundImage}>
        <View style={styles.profileHeader}>
          <View style={styles.profilePictureContainer}>
            <Image source={userData.profilePicture} style={styles.profilePicture} />
          </View>
          {userData.pkUser && (
            <Text style={styles.pkUserText}>
              Client ID: {userData.pkUser}
            </Text>
          )}
        </View>
      </ImageBackground>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.header}>My Profile</Text>
          <TouchableOpacity onPress={handleEdit}>
            <Icon name="edit" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Email</Text>
          {isEditing ? (
            <TextInput
              style={[styles.detailInput, focusedInput === 'email' && styles.focusedInput]}
              value={userData.email}
              onChangeText={(text) => handleChange('email', text)}
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput(null)}
            />
          ) : (
            <Text style={styles.sectionValue}>{userData.email || 'N/A'}</Text>
          )}
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Phone</Text>
          {isEditing ? (
            <TextInput
              style={[styles.detailInput, focusedInput === 'phone' && styles.focusedInput]}
              value={userData.phone}
              onChangeText={(text) => handleChange('phone', text)}
              onFocus={() => setFocusedInput('phone')}
              onBlur={() => setFocusedInput(null)}
            />
          ) : (
            <Text style={styles.sectionValue}>{userData.phone || 'N/A'}</Text>
          )}
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>First Name</Text>
          {isEditing ? (
            <TextInput
              style={[styles.detailInput, focusedInput === 'firstName' && styles.focusedInput]}
              value={userData.firstName}
              onChangeText={(text) => handleChange('firstName', text)}
              onFocus={() => setFocusedInput('firstName')}
              onBlur={() => setFocusedInput(null)}
            />
          ) : (
            <Text style={styles.sectionValue}>{userData.firstName || 'N/A'}</Text>
          )}
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Last Name</Text>
          {isEditing ? (
            <TextInput
              style={[styles.detailInput, focusedInput === 'lastName' && styles.focusedInput]}
              value={userData.lastName}
              onChangeText={(text) => handleChange('lastName', text)}
              onFocus={() => setFocusedInput('lastName')}
              onBlur={() => setFocusedInput(null)}
            />
          ) : (
            <Text style={styles.sectionValue}>{userData.lastName || 'N/A'}</Text>
          )}
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Address</Text>
          {isEditing ? (
            <TextInput
              style={[styles.detailInput, focusedInput === 'address' && styles.focusedInput]}
              value={userData.address}
              onChangeText={(text) => handleChange('address', text)}
              onFocus={() => setFocusedInput('address')}
              onBlur={() => setFocusedInput(null)}
            />
          ) : (
            <Text style={styles.sectionValue}>{userData.address || 'N/A'}</Text>
          )}
        </View>

        
        
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
  },
  backgroundImage: {
    height: 150,
    justifyContent: 'flex-end',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'visible',
    position: 'relative',
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
  profileHeader: {
    alignItems: 'center',
    position: 'absolute',
    bottom: -50,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 1,
  },
  profilePictureContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: 'gray',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
    position: 'relative',
    zIndex: 2,
  },
  profilePicture: {
    width: '100%',
    height: '100%',
  },
  pkUserText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    width: '100%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    marginTop: 70,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  detailSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  sectionValue: {
    fontSize: 16,
    color: '#555',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 5,
    fontSize: 16,
    marginLeft: 10,
  },
  focusedInput: {
    borderBottomColor: 'blue',
    color: 'black',
  },
});