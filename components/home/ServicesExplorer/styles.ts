import { StyleSheet, Platform } from 'react-native'
import { Theme } from '@/constants/Theme'

export const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 5,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colors.primary[800],
  },
  searchIcon: {
    padding: 5,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchInput: {
    height: 45,
    backgroundColor: Theme.colors.background.primary,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border.default,
  },
  allServicesContainer: {
    flexDirection: 'column',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  serviceItem: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: Theme.colors.background.primary,
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  serviceItemImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 5,
    resizeMode: 'cover',
  },
  serviceItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceTitle: {
    fontSize: 16,
    marginLeft: 15,
    fontWeight: '500',
    color: Theme.colors.text.primary,
  },
  serviceDescription: {
    fontSize: 12,
    marginLeft: 15,
    color: Theme.colors.text.secondary,
  },
  errorMessage: {
    color: Theme.colors.error[500],
    textAlign: 'center',
    padding: 20,
  },
  noResultsMessage: {
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
  },
})
