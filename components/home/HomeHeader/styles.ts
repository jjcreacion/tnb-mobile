import { StyleSheet, Platform } from 'react-native'

export const styles = StyleSheet.create({
  backgroundTop: {
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
  },
  linearGradientHeader: {
    width: '100%',
    paddingTop: 60,
    paddingBottom: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 0,
    marginBottom: 0,
    width: '100%',
    backgroundColor: 'transparent',
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    marginRight: 10,
  },
  companyLogo: {
    width: 28,
    height: 28,
    marginRight: 5,
  },
  getMoneyButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  getMoneyButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 14,
  },
  balanceButton: {
    backgroundColor: '#F5EDED',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  balanceButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 14,
  },
})
