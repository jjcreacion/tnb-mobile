/**
 * Estilos Migrados - Reemplazo gradual de app/styles.ts
 * Usa el Theme system y tokens de diseño consistentes
 */

import { Theme } from '@/constants/Theme';
import { StyleSheet } from 'react-native';

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
});