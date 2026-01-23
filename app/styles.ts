
import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';

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
    borderColor: Theme.colors.border.light,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: Theme.colors.background.primary,
  },
  containerTermsofServices: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center', 
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border.default,
    borderRadius: 5,
    marginBottom: 10,
    paddingRight: 10,
    backgroundColor: Theme.colors.background.primary,
  },
  passwordInput: {
    flex: 1, 
    borderWidth: 0, 
    marginBottom: 0, 
    paddingVertical: 10, 
    paddingHorizontal: 10,
  },
  eyeIcon: {
    padding: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
    padding: 20,
    paddingTop: 60
  },
  modalContainer2: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
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
    borderColor: Theme.colors.error[500],
  },
  inputError: {
    borderColor: Theme.colors.error[500],
  },
  errorText: {
    color: Theme.colors.error[500],
    fontSize: 12,
    marginTop: 5,
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
    backgroundColor: Theme.colors.neutral[500],
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonTextGPS: {
    color: Theme.colors.text.inverse,
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickerContainer: {
    borderColor: Theme.colors.border.light,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    overflow: 'hidden',
    backgroundColor: Theme.colors.background.primary,
    height: 40,
    justifyContent: 'center',
  },
  picker: {
    width: '100%',
  },
  buttonDisabled: {
    backgroundColor: Theme.colors.neutral[400]
  },
  abstractShape1: {
    position: 'absolute',
    top: '20%',
    right: '30%',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Theme.colors.whiteOverlay.light
  },
  abstractShape2: {
    position: 'absolute',
    bottom: '10%',
    left: '40%',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Theme.colors.whiteOverlay.light
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
    color: Theme.colors.primary[500],
    fontWeight: '600',
    marginTop: -10,
    marginBottom: 30
  },
  textH1Red: {
    fontSize: 26,
    color: Theme.colors.primary[500],
    fontWeight: '600',
    marginTop: 10
  },
  textH1: {
    fontSize: 24,
    color: Theme.colors.primary[500],
    fontWeight: '600',
    marginTop: 10
  },
  textH2: {
    fontSize: 20,
    color: Theme.colors.primary[500],
    fontWeight: '600',
    marginTop: 10
  },
  textH3: {
    fontSize: 12,
    color: Theme.colors.text.inverse,
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
    color: Theme.colors.neutral[500],
  },
  activeTabText: {
    color: Theme.colors.primary[500],
  },
  textH2Black: {
    fontSize: 20,
    color: Theme.colors.neutral[900],
    fontWeight: '600',
    marginTop: 10
  },
  textH3Black: {
    fontSize: 12,
    color: Theme.colors.neutral[900],
    fontWeight: '600',
    marginTop: 10
  },
  textH3Blue: {
    fontSize: 16,
    color: Theme.colors.primary[600],
    fontWeight: '600',
    marginTop: 10
  },
  
  TermsofServices: {
    fontSize: 16,
    color: Theme.colors.neutral[600],
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  textH2Blue: {
    fontSize: 20,
    color: Theme.colors.primary[600],
    fontWeight: '600',
    marginTop: 10
  },
  underlineText: { 
    textDecorationLine: 'underline', 
  },
  buttonPhone: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.background.primary,
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
    backgroundColor: Theme.colors.primary[500],
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 5,
    width: '80%',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: Theme.colors.background.primary,
  },
  buttonSignUp: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.primary[500],
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
    color: Theme.colors.text.primary,
    marginLeft: 10,
  },
  buttonTextEmail: {
    fontSize: 18,
    color: Theme.colors.text.inverse,
    marginLeft: 10,
  },
  buttonTextSignUp: {
    fontSize: 18,
    color: Theme.colors.text.inverse,
    marginLeft: 10,
  },
  input: {
    height: 50,
    borderColor: Theme.colors.neutral[400],
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
    backgroundColor: Theme.colors.neutral[500],
  },
  buttonRight: {
    backgroundColor: Theme.colors.primary[500],
    marginLeft: 0,
  },
  buttonRight2: {
    backgroundColor: Theme.colors.primary[500],
    marginLeft: 20,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border.default,
    paddingHorizontal: 10,
  },
  disabledButton: {
    backgroundColor: Theme.colors.neutral[400],
    opacity: 0.5,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[400],
  },
  codeInput: {
    width: 46,
    height: 50,
    textAlign: 'center',
    fontSize: 24,
    borderColor: Theme.colors.neutral[400],
    borderWidth: 1,
    marginHorizontal: 4,
    borderRadius: 5,
  },
  buttonText: {
    color: Theme.colors.text.inverse,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
  },
  banner: {
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerText: {
    color: Theme.colors.primary[500],
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    padding: 15,
  },
  label: {
    fontSize: 18,
    marginBottom: 5,
  },
  inputRegister: {
    height: 40,
    borderColor: Theme.colors.neutral[400],
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  buttonRegister: {
    backgroundColor: Theme.colors.primary[500],
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10
  },
  buttonTextRegister: {
    color: Theme.colors.text.inverse,
    fontSize: 18,
  },
});

export default styles;
