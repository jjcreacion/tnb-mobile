import React from 'react';
import { StyleSheet, View, Text, TextInput, Image, TouchableOpacity, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

const cardBackgroundColor = 'rgba(255, 255, 255, 0.9)';
const primaryButtonColor = '#007AFF';
const textColorPrimary = '#333';
const textColorLink = '#007AFF';
const inputBackgroundColor = '#f2f2f2';

export default function LoginScreen() {
  return (
   <ImageBackground 
      source={require('@/assets/images/ingenieros.jpeg')} 
      style={styles.backgroundImageLogin}
    >
    <View style={styles.container}>
     <LinearGradient
  colors={['rgba(76, 102, 159, 0.5)', '#ADD8E6', '#FFDAB9']}
  style={styles.backgroundGradient}
  start={{ x: 0.5, y: 0 }}
  end={{ x: 0.5, y: 1 }}
/>
      <Animatable.View animation="fadeIn" duration={1000} style={styles.iconContainer}>
        <Image
        source={require('../../assets/images/icon-tnb.png')}
        style={styles.imageSplash}
        />
      </Animatable.View>
    
      <Animatable.View animation="fadeIn" duration={1000} style={styles.content}>
        <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
          <Text style={[styles.title, { color: textColorPrimary }]}>Sign In</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBackgroundColor }]}
            placeholder="User"
            placeholderTextColor="#888"
          />
          <TextInput
            style={[styles.input, { backgroundColor: inputBackgroundColor }]}
            placeholder="Password"
            placeholderTextColor="#888"
            secureTextEntry
          />
          <TouchableOpacity style={[styles.button, { backgroundColor: primaryButtonColor }]}>
            <Text style={styles.buttonText}>Log In</Text>
          </TouchableOpacity>
          <Text style={[styles.link, { color: textColorLink }]}>Create account</Text>
        </View>
      </Animatable.View>
    </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
   iconContainer: {
    position: 'absolute', 
    top: '12%', 
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageSplash: {
    width: 150, 
    height: 150, 
    margin: 10,
  },
  card: {
    borderRadius: 40,
    padding: 30,
    marginTop: 120,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    backgroundColor: 'transparent', 
    borderColor: 'rgba(255, 255, 255, 0.2)', 
    borderWidth: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  backgroundImageLogin: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  input: {
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
    fontSize: 16,
    width: '100%',
    color: textColorPrimary,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 10,
    fontSize: 14,
  },
});