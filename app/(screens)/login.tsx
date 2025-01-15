import React from 'react';
import { ImageBackground, StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

export default function LoginScreen() {
  return (
    <ImageBackground 
      source={require('@/assets/images/roof-repair.jpg')} 
      style={styles.backgroundImage}
    >
      <LinearGradient
        colors={['rgba(76, 102, 159, 0)', '#ff6a59', '#ff0000']}
        style={styles.gradient}
      >
        <Animatable.View animation="fadeIn" duration={1000} style={styles.iconContainer}>
        <Image
        source={require('../../assets/images/icon-tnb.png')}
        style={styles.image}
        />
        </Animatable.View>
      </LinearGradient>
      <Animatable.View animation="fadeIn" duration={1000} style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.buttonPhone}>
          <FontAwesome name="phone" size={24} color="black" style={styles.iconLeft} />
          <Text style={styles.buttonTextPhone}>Login with phone</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonEmail}>
          <MaterialIcons name="email" size={24} color="white" style={styles.iconLeft} />
          <Text style={styles.buttonTextEmail}>Login with email</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonSignUp}>
          <FontAwesome name="user-plus" size={24} color="white" style={styles.iconLeft} />
          <Text style={styles.buttonTextSignUp}>Sign Up</Text>
        </TouchableOpacity>
      </Animatable.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'absolute', 
    top: '15%', 
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'
  },
  buttonsContainer: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  image: {
    width: 150, 
    height: 150, 
    margin: 10
  },
  buttonPhone: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 5,
    width: '80%',
    justifyContent: 'center',
    position: 'relative',
  },
  buttonEmail: {
    flexDirection: 'row',
    backgroundColor: '#ff0000',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 5,
    width: '80%',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'white',
  },
  buttonSignUp: {
    flexDirection: 'row',
    backgroundColor: '#ff6a59',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 5,
    width: '80%',
    justifyContent: 'center',
    position: 'relative',
  },
  iconLeft: {
    position: 'absolute',
    left: 10,
  },
  buttonTextPhone: {
    fontSize: 18,
    color: 'black',
    marginLeft: 10,
  },
  buttonTextEmail: {
    fontSize: 18,
    color: 'white',
    marginLeft: 10,
  },
  buttonTextSignUp: {
    fontSize: 18,
    color: 'white',
    marginLeft: 10,
  },
});