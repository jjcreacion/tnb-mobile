import { StyleSheet, Platform } from 'react-native';
import { Theme } from '@/constants/Theme';

export const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.base,
  },

  gradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.base,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },

  menuButton: {
    width: 40,
    height: 40,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  titleContainer: {
    flex: 1,
  },

  title: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.inverse,
    marginBottom: 2,
  },

  subtitle: {
    fontSize: Theme.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: Theme.typography.fontWeight.medium,
  },
});
