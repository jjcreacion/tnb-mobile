import { StyleSheet, Platform } from 'react-native'

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
    color: '#7c1310',
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
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
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
    backgroundColor: '#FFFFFF',
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
    color: '#333',
  },
  serviceDescription: {
    fontSize: 12,
    marginLeft: 15,
    color: '#666',
  },
  errorMessage: {
    color: 'red',
    textAlign: 'center',
    padding: 20,
  },
  noResultsMessage: {
    color: '#666',
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
  },
})
