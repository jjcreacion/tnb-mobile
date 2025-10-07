import { StyleSheet, Platform, Dimensions } from 'react-native'

const { width: screenWidth } = Dimensions.get('window')

export const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7c1310',
  },
  carouselContainer: {
    height: 200,
    marginBottom: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendedCard: {
    width: screenWidth - 40,
    height: 180,
    borderRadius: 15,
    overflow: 'hidden',
    marginHorizontal: 20,
    justifyContent: 'flex-end',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  recommendedCardImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  recommendedCardOverlay: {
    padding: 15,
    justifyContent: 'flex-end',
    flex: 1,
  },
  recommendedCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 5,
  },
  recommendedCardDescription: {
    fontSize: 13,
    color: '#E0E0E0',
    marginTop: 2,
  },
  errorMessage: {
    color: 'red',
    textAlign: 'center',
    padding: 20,
  },
  noCampaignsMessage: {
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
})
