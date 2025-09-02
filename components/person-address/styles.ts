import { Platform, StyleSheet } from 'react-native'

export const addressStyles = StyleSheet.create({
  // Container styles
  addressContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: 50,
  },
  addressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  contentContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  absoluteScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
  },

  // Address List Styles
  addressList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedAddressItem: {
    backgroundColor: '#f0f8ff',
    borderColor: '#4CAF50',
  },
  addressIconContainer: {
    marginRight: 15,
  },
  addressTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  addressActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  addressText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  addressSubText: {
    fontSize: 12,
    color: '#666',
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 15,
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  addAddressText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 10,
  },
  emptyAddressContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyAddressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  emptyAddressMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },

  // New Address Form Styles
  newAddressForm: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
  },
  formInputSecondary: {
    marginTop: 10,
  },
  formInputText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  formColumn: {
    flex: 1,
  },
  saveAddressButton: {
    backgroundColor: '#ea0e08',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  saveAddressButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  primarySwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingVertical: 10,
  },
  formButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
    marginTop: 30,
    marginBottom: 40,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    flex: 1,
  },
  cancelButtonText: {
    color: '#666',
  },
  updateButton: {
    flex: 1,
  },

  // City/State Selector Styles
  selectorContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchInput: {
    margin: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    fontSize: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  selectorSubtitle: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 20,
    marginBottom: 10,
    fontWeight: '500',
  },
  selectorItem: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        minHeight: 50,
      },
      android: {
        minHeight: 48,
      },
    }),
  },
  selectorItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectorItemSubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
})
