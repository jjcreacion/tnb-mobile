// styles.ts

/*
const lightTheme = {
  textColor: '#000000',
  // Otros colores de tema claro...
};

const darkTheme = {
  textColor: '#ffffff',
  // Otros colores de tema oscuro...
};

const currentTheme = lightTheme; // O darkTheme, dependiendo del estado del tema

const styles = StyleSheet.create({
  textH2: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    color: currentTheme.textColor, // Usar color del tema actual
  },
  // Otros estilos...
});
*/

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  containerSplash: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    position: 'relative'
  },
  containerTermsofServices: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center', 
  },
  modalContainer: { 
    flex: 1, 
    backgroundColor: '#ffffff', 
    padding: 20, 
  },
  gradientSplash: {
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0
  },
  gradientLogin: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImageLogin: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  abstractShape1: {
    position: 'absolute', 
    top: '20%', 
    right: '30%', 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: 'rgba(255,255,255,0.2)'
  },
  abstractShape2: {
    position: 'absolute', 
    bottom: '10%', 
    left: '40%', 
    width: 150, 
    height: 150, 
    borderRadius: 75, 
    backgroundColor: 'rgba(255,255,255,0.2)'
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
  imageSplash: {
    width: 150, 
    height: 150, 
    margin: 10
  },
  textH1: {
    fontSize: 24, 
    color: '#fff', 
    fontWeight: '600', 
    marginTop: 10
  },
  textH2: {
    fontSize: 20, 
    color: '#fff', 
    fontWeight: '600', 
    marginTop: 10
  },
  textH2Black: {
    fontSize: 20, 
    color: '#191919', 
    fontWeight: '600', 
    marginTop: 10
  },
  textH3: {
    fontSize: 12, 
    color: '#fff', 
    fontWeight: '600', 
    marginTop: 10
  },
  textH3Black: {
    fontSize: 12, 
    color: '#191919', 
    fontWeight: '600', 
    marginTop: 10
  },
  textH3Blue: {
    fontSize: 16, 
    color: '#0d47fc', 
    fontWeight: '600', 
    marginTop: 10
  },
  TermsofServices: {
    fontSize: 16, 
    color: '#0d47fc', 
    fontWeight: '600', 
    marginTop: 10,
    textAlign: 'center',
  },
  textH2Blue: {
    fontSize: 20, 
    color: '#0d47fc', 
    fontWeight: '600', 
    marginTop: 10
  },
  textH4: {
    fontSize: 10, 
    color: '#fff', 
    fontWeight: '600', 
    marginTop: 10
  },
  underlineText: { 
    textDecorationLine: 'underline', 
  },
  textH1Red: {
    fontSize: 26, 
    color: '#ff0000', 
    fontWeight: '600', 
    marginTop: 10
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
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    width: '100%',
    paddingHorizontal: 10,
    borderRadius: 5, 
  },
  buttonContainer: { 
    position: 'absolute',
    bottom: 20,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  button: { 
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonLeft: {
    backgroundColor: 'gray',
  },
  buttonRight: {
    backgroundColor: 'red',
  },
  buttonText: { 
    color: 'white',
    fontWeight: 'bold',
  },
});

export default styles;
