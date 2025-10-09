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
    backgroundColor: Theme.colors.background.primary,
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
});