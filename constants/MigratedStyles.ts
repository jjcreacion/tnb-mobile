/**
 * Estilos Migrados - Reemplazo gradual de app/styles.ts
 * Usa el Theme system y tokens de diseño consistentes
 */

import { Theme } from '@/constants/Theme';
import { Platform, StyleSheet } from 'react-native';

export const MigratedStyles = StyleSheet.create({
  // ===== CONTAINERS =====
  containerSplash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
    padding: Theme.spacing.lg,
    paddingTop: Theme.spacing['5xl'],
  },

  modalContainer2: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
    padding: Theme.spacing.md,
    paddingTop: Theme.spacing.md,
  },

  // ===== GRADIENTS =====
  gradientSplash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  gradientLogin: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ===== SPLASH SCREEN STYLES =====
  imageIndex: {
    width: 200,
    height: 200,
    margin: 10,
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
    color: Theme.colors.error[500], 
    fontWeight: '600', 
    marginTop: -10,
    marginBottom: 30,
  },

  // ===== REGISTER COMPLETE STYLES =====
  registerCompleteContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  registerCompleteMessage1: {
    marginTop: 20,
    fontSize: 30, 
    fontWeight: 'bold',
    color: Theme.colors.text.primary,
    textAlign: 'center',
  },

  registerCompleteMessage2: {
    marginTop: 8,
    fontSize: 18,
    color: Theme.colors.text.primary,
    textAlign: 'center',
  },

  registerCompleteButton: { 
    marginTop: 20,
    backgroundColor: Theme.colors.error[500],
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.sm,
  },

  registerCompleteButtonText: {
    color: Theme.colors.text.inverse,
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.bold,
  },

  // ===== SHARE AND EARN STYLES =====
  shareAndEarnContainer: {
    flex: 1,
    backgroundColor: Theme.colors.neutral[100],
    paddingTop: 60,
    paddingHorizontal: Theme.spacing.lg,
    alignItems: 'center',
  },

  shareAndEarnInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
  },

  shareAndEarnInfoIcon: {
    marginRight: Theme.spacing.sm,
    marginTop: 2,
  },

  shareAndEarnAdditionalInfoContainer: {
    padding: Theme.spacing.sm,
    width: '100%',
    marginTop: 5, 
  },

  shareAndEarnAdditionalInfoText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.neutral[600],
    flex: 1,
    lineHeight: 20,
    textAlign: 'justify',
  },

  shareAndEarnBackButton: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },

  shareAndEarnBackButtonText: {
    fontSize: Theme.typography.fontSize.lg,
    marginLeft: Theme.spacing.sm,
    color: Theme.colors.text.primary,
  },

  shareAndEarnContent: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },

  shareAndEarnImageContainer: {
    width: '100%',
    height: 200,
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: Theme.spacing.sm,
    position: 'relative',
  },

  shareAndEarnImage: {
    width: '100%',
    height: '100%',
  },

  shareAndEarnShareImageButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  shareAndEarnTitle: {
    fontSize: 28,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
    marginBottom: 1,
    textAlign: 'center',
  },

  shareAndEarnSubtitle: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.neutral[500],
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 15,
  },

  shareAndEarnInvitationLinkContainer: {
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    width: '100%',
    ...Theme.shadows.md,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: Theme.colors.border.light,
  },

  shareAndEarnInvitationLinkText: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.semiBold,
    color: Theme.colors.neutral[600],
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },

  shareAndEarnLinkDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Theme.colors.neutral[50],
    borderRadius: Theme.borderRadius.sm,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border.light,
  },

  shareAndEarnLink: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.neutral[700],
    flex: 1,
    marginRight: Theme.spacing.sm,
  },

  shareAndEarnCopyButton: {
    padding: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.xs,
    backgroundColor: Theme.colors.secondary[500],
  },

  shareAndEarnButtonContainer: {
    width: '100%',
  },

  shareAndEarnShareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.success[500],
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.sm,
    ...Theme.shadows.md,
  },

  shareAndEarnButtonText: {
    color: Theme.colors.text.inverse,
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.bold,
    marginLeft: Theme.spacing.sm,
  },

  shareAndEarnIcon: {
    marginRight: 5,
  },

  // ===== INPUTS =====
  input: {
    height: Theme.inputSizes.md.height,
    borderColor: Theme.colors.border.default,
    borderWidth: 1,
    width: '100%',
    paddingHorizontal: Theme.inputSizes.md.paddingHorizontal,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.background.primary,
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.primary,
  },

  inputRegister: {
    height: 40,
    borderColor: Theme.colors.border.default,
    borderWidth: 1,
    marginBottom: Theme.spacing.base,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Theme.colors.background.primary,
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.primary,
  },

  inputError: {
    borderColor: Theme.colors.error[500],
    borderWidth: 1.5,
  },

  // ===== PASSWORD INPUTS =====
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border.default,
    borderRadius: Theme.borderRadius.sm,
    marginBottom: Theme.spacing.md,
    paddingRight: Theme.spacing.md,
    backgroundColor: Theme.colors.background.primary,
  },

  passwordInput: {
    flex: 1,
    borderWidth: 0,
    marginBottom: 0,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.primary,
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border.default,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Theme.colors.background.primary,
  },

  // ===== BUTTONS =====
  buttonPhone: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.background.primary,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.sm,
    alignItems: 'center',
    marginVertical: Theme.spacing.xs,
    width: '80%',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: Theme.colors.border.default,
    ...Theme.shadows.sm,
  },

  buttonEmail: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.primary[500],
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.sm,
    alignItems: 'center',
    marginVertical: Theme.spacing.xs,
    width: '80%',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: Theme.colors.text.inverse,
    ...Theme.shadows.md,
  },

  buttonSignUp: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.primary[400],
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.sm,
    alignItems: 'center',
    marginVertical: Theme.spacing.xs,
    width: '80%',
    justifyContent: 'center',
    position: 'relative',
    ...Theme.shadows.md,
  },

  buttonRegister: {
    backgroundColor: Theme.colors.primary[500],
    padding: Theme.spacing.base,
    borderRadius: Theme.borderRadius.sm,
    alignItems: 'center',
    marginTop: Theme.spacing.base,
    ...Theme.shadows.md,
  },

  button: {
    width: 60,
    height: 60,
    borderRadius: Theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.md,
  },

  buttonLeft: {
    backgroundColor: Theme.colors.neutral[400],
  },

  buttonRight: {
    backgroundColor: Theme.colors.primary[500],
    marginLeft: 0,
  },

  buttonRight2: {
    backgroundColor: Theme.colors.primary[500],
    marginLeft: Theme.spacing.lg,
  },

  disabledButton: {
    backgroundColor: Theme.colors.neutral[300],
    opacity: 0.6,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[400],
  },

  // ===== BUTTON TEXTS =====
  buttonTextPhone: {
    fontSize: Theme.typography.fontSize.lg,
    color: Theme.colors.text.primary,
    marginLeft: Theme.spacing.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },

  buttonTextEmail: {
    fontSize: Theme.typography.fontSize.lg,
    color: Theme.colors.text.inverse,
    marginLeft: Theme.spacing.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },

  buttonTextSignUp: {
    fontSize: Theme.typography.fontSize.lg,
    color: Theme.colors.text.inverse,
    marginLeft: Theme.spacing.md,
    fontWeight: Theme.typography.fontWeight.medium,
  },

  buttonText: {
    color: Theme.colors.text.inverse,
    fontWeight: Theme.typography.fontWeight.bold,
    fontSize: Theme.typography.fontSize.base,
  },

  // ===== TEXT STYLES =====
  textH1: {
    fontSize: Theme.typography.fontSize['3xl'],
    color: Theme.colors.text.primary,
    fontWeight: Theme.typography.fontWeight.bold,
    textAlign: 'center',
  },

  textH2: {
    fontSize: Theme.typography.fontSize['2xl'],
    color: Theme.colors.text.primary,
    fontWeight: Theme.typography.fontWeight.semiBold,
    marginTop: Theme.spacing.md,
  },

  textH2Blue: {
    fontSize: Theme.typography.fontSize.xl,
    color: Theme.colors.secondary[500],
    fontWeight: Theme.typography.fontWeight.semiBold,
    marginTop: Theme.spacing.md,
  },

  label: {
    fontSize: Theme.typography.fontSize.lg,
    marginBottom: Theme.spacing.xs,
    color: Theme.colors.text.primary,
    fontWeight: Theme.typography.fontWeight.medium,
  },

  errorText: {
    color: Theme.colors.error[500],
    fontSize: Theme.typography.fontSize.xs,
    marginTop: Theme.spacing.xs,
  },

  underlineText: {
    textDecorationLine: 'underline',
  },

  // ===== LAYOUT HELPERS =====
  buttonContainer: {
    position: 'absolute',
    bottom: Theme.spacing.lg,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
  },

  buttonContainer2: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Theme.spacing.md,
  },

  formContainer: {
    padding: Theme.spacing.base,
  },

  scrollContent: {
    flexGrow: 1,
    padding: Theme.spacing.xs,
  },

  // ===== SPECIAL COMPONENTS =====
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.base,
  },

  codeInput: {
    width: 46,
    height: 50,
    textAlign: 'center',
    fontSize: Theme.typography.fontSize['2xl'],
    borderColor: Theme.colors.border.default,
    borderWidth: 1,
    marginHorizontal: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Theme.colors.background.primary,
    color: Theme.colors.text.primary,
  },

  // ===== BACKGROUNDS =====
  backgroundImageLogin: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },

  // ===== STATES =====
  activeTab: {
    borderColor: Theme.colors.primary[500],
    borderWidth: 2,
  },

  // ===== PICKER =====
  pickerStyle: {
    height: 50,
    width: '100%',
    borderColor: Theme.colors.border.default,
    borderWidth: 1,
    borderRadius: Theme.borderRadius.sm,
    marginBottom: Theme.spacing.md,
    backgroundColor: Theme.colors.background.primary,
  },

  // ===== MISC =====
  eyeIcon: {
    padding: Theme.spacing.xs,
  },

  iconLeft: {
    position: 'absolute',
    left: Theme.spacing.md,
  },

  mapStyle: {
    width: '100%',
    height: 200,
    marginTop: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
  },

  containerTermsofServices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ===== BANNERS =====
  banner: {
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },

  bannerText: {
    color: Theme.colors.secondary[400],
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ===== SIDE MENU =====
  sideMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },

  sideMenuContainer: {
    width: '70%', 
    height: '100%',
    backgroundColor: Theme.colors.background.primary,
    paddingTop: 50,
    borderRightWidth: 1,
    borderRightColor: Theme.colors.border.light,
  },

  sideMenuSeparator: {
    height: 1,
    backgroundColor: Theme.colors.border.light,
    marginVertical: Theme.spacing.sm,
    marginHorizontal: Theme.spacing.lg,
  },

  sideMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.light,
    paddingBottom: Theme.spacing.md,
  },

  sideMenuTitle: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
  },

  sideMenuCloseButton: {
    padding: Theme.spacing.xs,
  },

  sideMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.light,
  },

  sideMenuItemText: {
    fontSize: Theme.typography.fontSize.base,
    marginLeft: Theme.spacing.md,
    color: Theme.colors.text.primary,
  },

  // ===== CAMPAIGN MODAL =====
  campaignModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  campaignModalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.lg,
    alignItems: 'center',
    ...Theme.shadows.lg,
  },

  campaignModalScrollViewContent: {
    alignItems: 'center',
    paddingBottom: Theme.spacing.sm,
  },

  campaignModalCloseButton: {
    position: 'absolute',
    top: Theme.spacing.sm,
    right: Theme.spacing.sm,
    zIndex: 1,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Theme.colors.text.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  campaignModalImage: {
    width: '100%',
    height: 200,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
    resizeMode: 'cover',
  },

  campaignModalTitle: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
    color: Theme.colors.text.primary,
  },

  campaignModalDescription: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  },

  campaignModalContactContainer: {
    width: '100%',
    marginTop: Theme.spacing.sm,
  },

  campaignModalContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.info[500],
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    marginBottom: Theme.spacing.sm,
    justifyContent: 'center',
  },

  campaignModalWhatsappButton: {
    backgroundColor: '#25D366',
  },

  campaignModalContactButtonText: {
    color: Theme.colors.text.inverse,
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.bold,
    marginLeft: Theme.spacing.sm,
  },

  // ===== LOGIN SCREEN =====
  loginBackgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  loginOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },

  loginScreen: {
    backgroundColor: 'transparent',
  },

  loginKeyboardView: {
    flex: 1,
  },

  loginContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing['2xl'],
  },

  loginLogoContainer: {
    alignItems: 'center',
    marginTop: Theme.spacing['4xl'],
  },

  loginLogo: {
    width: 120,
    height: 120,
    marginBottom: Theme.spacing.lg,
  },

  loginWelcomeText: {
    marginBottom: Theme.spacing.xs,
    textAlign: 'center',
  },

  loginSubtitle: {
    textAlign: 'center',
    opacity: 0.9,
  },

  loginFormContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: Theme.spacing.xl,
  },

  loginCard: {
    backgroundColor: Theme.colors.surface.primary,
    borderRadius: Theme.borderRadius['3xl'],
    padding: Theme.spacing.xl,
    ...Theme.shadows.xl,
  },

  loginButton: {
    marginTop: Theme.spacing.md,
  },

  loginForgotButton: {
    marginTop: Theme.spacing.sm,
  },

  loginErrorContainer: {
    backgroundColor: Theme.colors.error[50],
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.base,
    marginBottom: Theme.spacing.md,
  },

  loginErrorText: {
    color: Theme.colors.error[600],
    fontSize: Theme.typography.fontSize.sm,
    textAlign: 'center',
  },

  loginDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Theme.spacing.xl,
  },

  loginDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Theme.colors.border.default,
  },

  loginDividerText: {
    marginHorizontal: Theme.spacing.md,
    color: Theme.colors.text.tertiary,
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },

  loginSignupButton: {
    borderWidth: 1.5,
  },

  // ===== REGISTER SCREEN =====
  registerHiddenWebView: { 
    height: 1, 
    width: 1, 
    position: 'absolute',
    top: -100, 
    left: -100,
  },

  registerContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
  },

  registerKeyboardAvoidingView: {
    flex: 1,
  },

  registerScrollContent: {
    paddingBottom: Theme.spacing.xl,
    paddingTop: Theme.spacing.md,
  },

  registerTitle: {
    textAlign: 'center',
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.lg,
  },

  registerFormContainer: {
    paddingHorizontal: Theme.spacing.base,
    gap: Theme.spacing.md,
  },

  registerSectionLabel: {
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.xs,
    fontWeight: Theme.typography.fontWeight.semiBold,
  },

  registerGpsButton: {
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },

  registerPickerContainer: { 
    borderColor: Theme.colors.border.light,
    borderWidth: 1,
    borderRadius: Theme.borderRadius.sm,
    marginBottom: Theme.spacing.sm,
    overflow: 'hidden', 
    backgroundColor: Theme.colors.background.primary,
    height: 40, 
    justifyContent: 'center', 
  },

  registerPicker: {
    width: '100%',
    color: Theme.colors.text.primary,
  },

  registerSuccessMessage: {
    textAlign: 'center',
    marginVertical: Theme.spacing.sm,
  },

  registerErrorMessage: {
    textAlign: 'center',
    marginVertical: Theme.spacing.sm,
  },

  registerButton: {
    marginTop: Theme.spacing.lg,
  },

  registerReferralStatusContainer: {
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.base,
  },

  registerReferralStatus: {
    textAlign: 'center',
    fontSize: Theme.typography.fontSize.sm,
    paddingVertical: Theme.spacing.xs,
  },

  registerPasswordInput: {
    backgroundColor: Theme.colors.background.primary,
    color: Theme.colors.text.primary,
  },

  // ===== PROFILE SCREEN =====
  profileContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
  },

  profileBackgroundImage: {
    height: 120,
    justifyContent: 'flex-end',
    position: 'relative',
  },

  profileBackgroundImageStyle: {
    borderBottomLeftRadius: Theme.borderRadius.xl,
    borderBottomRightRadius: Theme.borderRadius.xl,
  },

  profileBackButton: {
    position: 'absolute',
    top: Theme.spacing.base,
    left: Theme.spacing.base,
    backgroundColor: Theme.colors.overlay.medium,
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.full,
    zIndex: 10,
  },

  profileHeader: {
    alignItems: 'center',
    position: 'absolute',
    bottom: -75,
    left: 0,
    right: 0,
    zIndex: 1,
  },

  profilePictureContainer: {
    width: 150,
    height: 150,
    borderRadius: Theme.borderRadius.full,
    position: 'relative',
    borderWidth: 4,
    borderColor: Theme.colors.background.primary,
    ...Theme.shadows.lg,
  },

  profilePicture: {
    width: '100%',
    height: '100%',
    borderRadius: Theme.borderRadius.full,
  },

  profileChangePictureButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: Theme.colors.primary[500],
    borderRadius: Theme.borderRadius.full,
    padding: Theme.spacing.sm,
    ...Theme.shadows.md,
  },

  profileContentContainer: {
    flex: 1,
    paddingTop: 85, // Space for profile picture
    paddingHorizontal: Theme.spacing.base,
  },

  profileUserInfoCard: {
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
    paddingVertical: Theme.spacing.xl,
  },

  profileEmailText: {
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },

  profileUserIdText: {
    marginBottom: Theme.spacing.xs,
  },

  profileJoinDateText: {
    textAlign: 'center',
  },

  profileEditButtonContainer: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },

  profileFormCard: {
    marginBottom: Theme.spacing.xl,
    padding: Theme.spacing.lg,
  },

  profileSectionTitle: {
    marginBottom: Theme.spacing.lg,
    paddingBottom: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.light,
  },

  profileFormSection: {
    marginBottom: Theme.spacing.xl,
  },

  profileInputContainer: {
    marginBottom: Theme.spacing.base,
  },

  profileSaveButtonContainer: {
    marginTop: Theme.spacing.lg,
    paddingTop: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border.light,
  },

  // ===== REQUEST MODAL SCREEN =====
  requestModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.light,
    backgroundColor: Theme.colors.background.primary,
  },

  requestModalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.secondary,
  },

  requestModalHeaderTitle: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: Theme.spacing.base,
  },

  requestModalScrollView: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
  },

  requestModalFormContainer: {
    padding: Theme.spacing.lg,
  },

  requestModalCategoryCard: {
    marginBottom: Theme.spacing.xl,
  },

  requestModalCategoryContent: {
    alignItems: 'center',
    padding: Theme.spacing.lg,
  },

  requestModalCategoryImage: {
    width: 80,
    height: 80,
    borderRadius: Theme.borderRadius.xl,
    marginBottom: Theme.spacing.md,
  },

  requestModalCategoryTitle: {
    marginBottom: Theme.spacing.xs,
    textAlign: 'center',
  },

  requestModalCategoryDescription: {
    textAlign: 'center',
    lineHeight: Theme.typography.lineHeight.lg,
  },

  requestModalFieldContainer: {
    marginBottom: Theme.spacing.xl,
  },

  requestModalFieldLabel: {
    marginBottom: Theme.spacing.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },

  requestModalSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Theme.colors.background.primary,
    borderWidth: 1,
    borderColor: Theme.colors.border.default,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.sm,
  },

  requestModalLocationCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },

  requestModalSectionTitle: {
    marginBottom: Theme.spacing.lg,
  },

  requestModalMapContainer: {
    height: 200,
    borderRadius: Theme.borderRadius.md,
    overflow: 'hidden',
    marginTop: Theme.spacing.lg,
    position: 'relative',
    ...Theme.shadows.md,
  },

  requestModalMap: {
    flex: 1,
  },

  requestModalGpsButton: {
    position: 'absolute',
    bottom: Theme.spacing.md,
    right: Theme.spacing.md,
    backgroundColor: Theme.colors.primary[500],
    borderRadius: Theme.borderRadius.full,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.md,
  },

  requestModalImageUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.xl,
    backgroundColor: Theme.colors.background.primary,
    borderWidth: 2,
    borderColor: Theme.colors.primary[500],
    borderStyle: 'dashed',
    borderRadius: Theme.borderRadius.md,
    gap: Theme.spacing.sm,
  },

  requestModalImagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Theme.spacing.md,
    gap: Theme.spacing.sm,
  },

  requestModalImageItem: {
    width: 80,
    height: 80,
    borderRadius: Theme.borderRadius.md,
    position: 'relative',
    overflow: 'hidden',
  },

  requestModalPreviewImage: {
    width: '100%',
    height: '100%',
  },

  requestModalRemoveImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.full,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border.default,
    ...Theme.shadows.sm,
  },

  requestModalButtonContainer: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginTop: Theme.spacing['2xl'],
    marginBottom: Theme.spacing.lg,
  },

  requestModalCancelButton: {
    flex: 1,
  },

  requestModalSubmitButton: {
    flex: 2,
  },

  requestModalErrorText: {
    marginTop: Theme.spacing.xs,
  },

  requestModalSuccessContainer: {
    position: 'absolute',
    top: Theme.spacing['4xl'],
    left: Theme.spacing.lg,
    right: Theme.spacing.lg,
    backgroundColor: Theme.colors.success[50],
    padding: Theme.spacing.base,
    borderRadius: Theme.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.success[500],
  },

  requestModalErrorContainer: {
    position: 'absolute',
    top: Theme.spacing['4xl'],
    left: Theme.spacing.lg,
    right: Theme.spacing.lg,
    backgroundColor: Theme.colors.error[50],
    padding: Theme.spacing.base,
    borderRadius: Theme.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.error[500],
  },

  requestModalReadOnlyInput: {
    backgroundColor: Theme.colors.background.secondary,
    color: Theme.colors.text.secondary,
  },

  requestModalFieldHint: {
    marginTop: Theme.spacing.xs,
    lineHeight: Theme.typography.lineHeight.sm,
    fontStyle: 'italic',
  },

  requestModalOutsideMapTouchArea: {
    marginTop: Theme.spacing.md,
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.primary[50],
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.primary[500],
    borderStyle: 'dashed',
    alignItems: 'center',
  },

  requestModalBottomSheetContent: {
    padding: Theme.spacing.lg,
  },

  requestModalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.secondary,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border.light,
  },

  requestModalSearchIcon: {
    marginRight: Theme.spacing.sm,
  },

  requestModalSearchInput: {
    flex: 1,
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.primary,
    paddingVertical: Theme.spacing.xs,
  },

  requestModalItemsCount: {
    marginBottom: Theme.spacing.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },

  requestModalSubCategoryList: {
    maxHeight: 320,
  },

  requestModalSubCategoryItem: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.lg,
    minHeight: 72,
    borderBottomWidth: 0.5,
    borderBottomColor: Theme.colors.border.light,
    backgroundColor: Theme.colors.background.primary,
  },

  requestModalSubCategorySelectedItem: {
    backgroundColor: Theme.colors.primary[50],
  },

  requestModalSubCategoryLastItem: {
    borderBottomWidth: 0,
  },

  requestModalSubCategoryItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  requestModalSubCategoryInfo: {
    flex: 1,
    marginRight: Theme.spacing.md,
  },

  requestModalSubCategorySelectedText: {
    color: Theme.colors.primary[600],
    fontWeight: Theme.typography.fontWeight.semiBold,
  },

  requestModalEmptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing['4xl'],
    paddingHorizontal: Theme.spacing.xl,
  },

  requestModalEmptyStateText: {
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.xs,
    fontWeight: Theme.typography.fontWeight.semiBold,
  },

  requestModalEmptyStateSubtext: {
    textAlign: 'center',
  },

  requestModalSuccessText: {
    fontWeight: Theme.typography.fontWeight.semiBold,
    textAlign: 'center',
  },

  requestModalTextAreaContainer: {
    backgroundColor: Theme.colors.background.primary,
    borderWidth: 1,
    borderColor: Theme.colors.border.default,
    borderRadius: Theme.borderRadius.lg,
    minHeight: 100,
    maxHeight: 150,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    ...Theme.shadows.sm,
  },

  requestModalTextAreaInput: {
    flex: 1,
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.primary,
    lineHeight: Theme.typography.lineHeight.lg,
    textAlignVertical: 'top',
    padding: 0,
  },

  requestModalTextAreaError: {
    borderColor: Theme.colors.error[500],
    borderWidth: 1.5,
  },

  // ==============================================
  // SERVICE REQUEST DETAIL SCREEN
  // ==============================================

  serviceDetailContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
  },

  serviceDetailScrollContent: {
    padding: Theme.spacing.base,
    paddingBottom: Theme.spacing['2xl'],
  },

  serviceDetailImageModalContainer: {
    flex: 1,
    backgroundColor: Theme.colors.overlay.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },

  serviceDetailModalCloseButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: Theme.spacing.lg,
    zIndex: 2,
    backgroundColor: Theme.colors.overlay.medium,
    borderRadius: Theme.borderRadius.full,
    padding: Theme.spacing.xs,
  },

  serviceDetailModalImage: {
    width: '100%',
    height: '80%',
  },

  serviceDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: Theme.spacing.base,
    paddingHorizontal: Theme.spacing.base,
    backgroundColor: Theme.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.light,
  },

  serviceDetailImageCard: {
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    marginTop: Theme.spacing.lg,
    ...Theme.shadows.md,
  },

  serviceDetailImagePreviewContainer: {
    flexDirection: 'row',
    marginTop: Theme.spacing.sm,
  },

  serviceDetailPreviewImage: {
    width: 100,
    height: 100,
    borderRadius: Theme.borderRadius.lg,
    marginRight: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border.default,
  },

  serviceDetailBackButton: {
    padding: Theme.spacing.xs,
    marginRight: Theme.spacing.base,
  },

  serviceDetailHeaderTitle: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
  },

  serviceDetailCard: {
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    ...Theme.shadows.md,
  },

  serviceDetailTitle: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },

  serviceDetailRequestId: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.base,
  },

  serviceDetailSeparator: {
    height: 1,
    backgroundColor: Theme.colors.border.light,
    marginVertical: Theme.spacing.base,
  },

  serviceDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.base,
  },

  serviceDetailIcon: {
    marginRight: Theme.spacing.base,
  },

  serviceDetailText: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.primary,
    flex: 1,
  },

  serviceDetailStatusBadge: {
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.full,
  },

  serviceDetailStatusBadgeText: {
    color: Theme.colors.text.inverse,
    fontWeight: Theme.typography.fontWeight.bold,
    fontSize: Theme.typography.fontSize.sm,
  },

  serviceDetailMapCard: {
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    ...Theme.shadows.md,
  },

  serviceDetailMapTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.base,
    color: Theme.colors.text.primary,
  },

  serviceDetailMapContainer: {
    height: 250,
    borderRadius: Theme.borderRadius.md,
    overflow: 'hidden',
  },

  serviceDetailMap: {
    ...StyleSheet.absoluteFillObject,
  },

  serviceDetailNoMapContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.secondary,
    borderRadius: Theme.borderRadius.md,
  },

  serviceDetailNoMapText: {
    marginTop: Theme.spacing.sm,
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
  },

  serviceDetailErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  serviceDetailBackLink: {
    marginTop: Theme.spacing.lg,
    color: Theme.colors.primary[500],
    fontSize: Theme.typography.fontSize.base,
  },
});