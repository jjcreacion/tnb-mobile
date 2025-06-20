

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  containerSplash: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    position: 'relative'
  },
  pickerStyle: {
    height: 50, 
    width: '100%',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: '#fff',
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
    paddingTop: 60
  },
  modalContainer2: { 
    flex: 1, 
    backgroundColor: '#ffffff', 
    padding: 10, 
    paddingTop: 10
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
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  backgroundImageLogin: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  activeTab: {
    borderColor: 'red', // color del tab activo
  },
  inputError: {
    borderColor: 'red', // Borde rojo si hay error
  },
  errorText: {
    color: 'red', // Texto rojo para los mensajes de error
    fontSize: 12,
    marginTop: 5, // Espacio entre el input y el mensaje
  },
  mapStyle: {
    width: '100%',
    height: 200,
    marginTop: 10,
    borderRadius: 8,
    marginBottom: 10, 
  },
  scrollContent: {
    flexGrow: 1,
    padding: 5, 
  },
  buttonGPS: {
    backgroundColor: '#6c757d', 
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonTextGPS: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickerContainer: { 
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    overflow: 'hidden', 
    backgroundColor: '#fff',
    height: 40, 
    justifyContent: 'center', 
  },
  picker: {
    width: '100%',
  },
  buttonDisabled: {
      backgroundColor: 'gray'
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
  imageIndex: {
    width: 200, 
    height: 200, 
    margin: 10
  },
  textIndex: {
    fontSize: 50, 
    fontWeight: 'bold',
    position: 'relative',
  },
  symbolR: {
    fontSize: 20, 
    position: 'absolute',
    top: 10, 
    right: -20, 
  },
  textWelcome: {
    fontSize: 25, 
    color: '#ff0000', 
    fontWeight: '600', 
    marginTop: -10,
    marginBottom: 30
  },
  textH1Red: {
    fontSize: 26, 
    color: '#ff0000', 
    fontWeight: '600', 
    marginTop: 10
  },
  textH1: {
    fontSize: 24, 
    color: '#6090d5', 
    fontWeight: '600', 
    marginTop: 10
  },
  textH2: {
    fontSize: 20, 
    color: '#6090d5', 
    fontWeight: '600', 
    marginTop: 10
  },
  textH3: {
    fontSize: 12, 
    color: '#fff', 
    fontWeight: '600', 
    marginTop: 10
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  tabButton: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonText: {
    fontSize: 16,
    color: 'gray',
  },
  activeTabText: {
    color: 'blue',
  },
  textH2Black: {
    fontSize: 20, 
    color: '#191919', 
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
    color: '#67696c', 
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
  underlineText: { 
    textDecorationLine: 'underline', 
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
  buttonContainer2: { 
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
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
    marginLeft: 0,
  },
  buttonRight2: {
    backgroundColor: 'red',
    marginLeft: 20,
  },
  passwordContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#ccc', 
    paddingHorizontal: 10, 
 },
  disabledButton: {
    backgroundColor: 'gray',
    opacity: 0.5,
    borderWidth: 1,
    borderColor: 'gray',
  },
  codeInput: {
    width: 46,
    height: 50,
    textAlign: 'center',
    fontSize: 24,
    borderColor: 'gray',
    borderWidth: 1,
    marginHorizontal: 4,
    borderRadius: 5,
  },
  buttonText: { 
    color: 'white',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  banner: {
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerText: {
    color: '#6090d5',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom:10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 5,
  },
  inputRegister: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  buttonRegister: {
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10
  },
  buttonTextRegister: {
    color: 'white',
    fontSize: 18,
  },
});

export default styles;
