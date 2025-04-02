import React, { useState } from 'react';
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

export default function ProfileScreen() {
  const [userData, setUserData] = useState({
    profilePicture: require('@/assets/images/user.png'),
    username: 'UsuarioEjemplo',
    email: 'usuario@ejemplo.com',
    phone: '123-456-7890',
    firstName: 'Nombre',
    middleName: 'Segundo',
    lastName: 'Apellido',
    birthdate: '01/01/1990',
    address: 'Calle Principal #123',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

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
        </View>
      </ImageBackground>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.header}>My Profile</Text>
          <TouchableOpacity onPress={handleEdit}>
            <Icon name="edit" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {Object.entries(userData).map(([key, value]) => {
          if (key === 'profilePicture') return null;

          return (
            <View key={key} style={styles.detailRow}>
              <Text style={styles.cardTitle}>{key}:</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.detailInput, focusedInput === key && styles.focusedInput]}
                  value={value}
                  onChangeText={(text) => handleChange(key, text)}
                  onFocus={() => setFocusedInput(key)}
                  onBlur={() => setFocusedInput(null)}
                />
              ) : (
                <Text style={styles.cardDescription}>{value}</Text>
              )}
            </View>
          );
        })}
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
    marginBottom: 8,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 16,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  focusedInput: {
    borderBottomColor: 'blue',
    color: 'red',
  },
});