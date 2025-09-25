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
    position: 'relative',
  },
  absoluteScreen: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  // Search Styles
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  addressSearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 4,
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
    backgroundColor: '#f9fffe',
    borderColor: '#a8d8a8',
    borderWidth: 1.2,
    ...Platform.select({
      ios: {
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  addressIconContainer: {
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
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
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  floatingAddButton: {
    marginTop: 0,
    marginBottom: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
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
  newAddressFormContainer: {
    flex: 1,
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
  saveAddressButtonDisabled: {
    backgroundColor: '#cccccc',
    opacity: 0.6,
  },
  saveAddressButtonTextDisabled: {
    color: '#888888',
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

  // Address Autocomplete Styles
  autocompleteContainer: {
    position: 'relative',
  },
  autocompleteInputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  autocompleteIndicator: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  manualEntryButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
    padding: 4,
  },

  // Suggestions Styles
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderTopWidth: 0,
    maxHeight: 250,
    zIndex: 1001,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  suggestionsList: {
    maxHeight: 320, // Allows up to 4-5 suggestions (70px per suggestion approximately)
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  suggestionIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  suggestionText: {
    flex: 1,
  },
  suggestionPrimary: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    lineHeight: 20,
  },
  suggestionSecondary: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    lineHeight: 18,
  },

  // Error States
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#FF6B6B',
    marginLeft: 8,
  },
  errorRetryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  errorRetryText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },

  // No Results State
  noResultsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  noResultsText: {
    flex: 1,
    fontSize: 14,
    color: '#999',
    marginLeft: 8,
  },
  noResultsButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  noResultsButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },

  // Warning Messages
  warningContainer: {
    backgroundColor: '#FFF9E6',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FFA500',
  },
  warningText: {
    fontSize: 14,
    color: '#B8860B',
    fontWeight: '500',
  },

  // Debug Panel Styles (Development only)
  debugContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  debugHeader: {
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
  debugTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  debugSection: {
    backgroundColor: '#fff',
    marginVertical: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  debugSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  debugSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  debugConfigRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  debugConfigLabel: {
    fontSize: 14,
    color: '#666',
  },
  debugConfigValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  debugStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  debugStatItem: {
    alignItems: 'center',
  },
  debugStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  debugStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  debugAvgResponse: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginTop: 12,
  },
  debugClearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FF3B30',
    borderRadius: 4,
  },
  debugClearButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  debugTelemetryList: {
    flex: 1,
  },
  debugEmptyState: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
    padding: 20,
  },
  telemetryItem: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    marginBottom: 8,
    borderRadius: 6,
    borderLeftWidth: 4,
  },
  telemetryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  telemetryEventType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 6,
    flex: 1,
  },
  telemetryTimestamp: {
    fontSize: 11,
    color: '#999',
  },
  telemetryText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
})
