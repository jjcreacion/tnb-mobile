import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  loadCitiesAndStates,
  loadUserAddresses,
  updatePrimaryAddress,
} from '@/store/slices/addressSlice'
import { expressInterest, fetchCampaigns } from '@/store/slices/campaignSlice'
import { fetchCategories } from '@/store/slices/categorySlice'
import {
  closeAddressModal,
  closeCampaignModal,
  closeRequestModal,
  openAddressModal,
  openCampaignModal,
  openRequestModal,
  setMenuVisible,
  setServiceSearchQuery,
  toggleSearch,
} from '@/store/slices/uiSlice'
import { loadUserData } from '@/store/slices/userSlice'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'
import { StatusBar } from 'expo-status-bar'
import React, { useCallback, useEffect } from 'react'
import { Alert, StyleSheet, View } from 'react-native'

import {
  AddressSelector,
  CampaignCarousel,
  HomeHeader,
  ServicesExplorer,
} from '@/components/home'
import { AddressModal } from '@/components/person-address'
import CampaignModal from '../(screens)/CampaignModal'
import RequestModal from '../(screens)/RequestModal'
import SideMenu from '../(screens)/SideMenu'

import { useReferralReward } from '@/hooks/home/useReferralReward'
import { Theme } from '@/constants/Theme'
import type { Address, Campaign, Category } from '@/types'

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL || ''

const HomeScreen: React.FC = () => {
  const dispatch = useAppDispatch()

  // Load referral reward
  useReferralReward()

  // Redux selectors
  const { userName, userBalance } = useAppSelector((state) => state.user)
  const { addresses, primaryAddress, cities, states } = useAppSelector(
    (state) => state.address
  )
  const { campaigns, loading: loadingCampaigns, error: errorCampaigns } =
    useAppSelector((state) => state.campaign)
  const { categories, loading: loadingCategories, error: errorCategories } =
    useAppSelector((state) => state.category)
  const {
    isMenuVisible,
    isSearchVisible,
    serviceSearchQuery,
    isRequestModalVisible,
    selectedServiceData,
    isCampaignModalVisible,
    selectedCampaignData,
    isAddressModalVisible,
    referralReward,
  } = useAppSelector((state) => state.ui)

  // Load initial data
  useEffect(() => {
    dispatch(loadUserData())
    dispatch(loadUserAddresses())
    dispatch(loadCitiesAndStates())
    dispatch(fetchCampaigns())
    dispatch(fetchCategories())
  }, [dispatch])

  // Handlers
  const handleMenuPress = useCallback(() => {
    dispatch(setMenuVisible(true))
  }, [dispatch])

  const handleToggleSearch = useCallback(() => {
    dispatch(toggleSearch())
  }, [dispatch])

  const handleSearchChange = useCallback(
    (text: string) => {
      dispatch(setServiceSearchQuery(text))
    },
    [dispatch]
  )

  const handleServicePress = useCallback(
    (category: Category) => {
      dispatch(openRequestModal(category))
    },
    [dispatch]
  )

  const handleCloseServiceModal = useCallback(() => {
    dispatch(closeRequestModal())
  }, [dispatch])

  const handleCampaignPress = useCallback(
    async (campaign: Campaign) => {
      const userIdString = await AsyncStorage.getItem('userId')

      if (userIdString === null) {
        console.error('Error: ID de usuario no encontrado en AsyncStorage.')
        return
      }

      const userId = parseInt(userIdString, 10)

      try {
        await dispatch(
          expressInterest({ campaignId: campaign.campaignsId, userId })
        ).unwrap()
        console.log(
          `Interest expressed for campaign ${campaign.campaignsId} by user ${userId}`
        )
      } catch (error) {
        console.error('Network error expressing interest:', error)
        Alert.alert(
          'Error',
          'Could not connect to the server. Please check your internet connection.'
        )
      }

      dispatch(openCampaignModal(campaign))
    },
    [dispatch]
  )

  const handleCloseCampaignModal = useCallback(() => {
    dispatch(closeCampaignModal())
  }, [dispatch])

  const handleAddressPress = useCallback(() => {
    dispatch(openAddressModal())
  }, [dispatch])

  const handleAddressSelect = useCallback(
    async (address: Address) => {
      if (address.pkAddress === primaryAddress?.pkAddress) {
        return
      }

      try {
        await dispatch(
          updatePrimaryAddress({
            newAddress: address,
            currentPrimary: primaryAddress,
          })
        ).unwrap()
      } catch (error) {
        console.error('Error al actualizar dirección primaria:', error)
        Alert.alert(
          'Error',
          'Ocurrió un error al actualizar la dirección. Por favor intenta de nuevo.'
        )
      }
    },
    [dispatch, primaryAddress]
  )

  const handleCloseAddressModal = useCallback(() => {
    dispatch(closeAddressModal())
  }, [dispatch])

  const handleAddressAdded = useCallback(() => {
    dispatch(loadUserData())
    dispatch(loadUserAddresses())
  }, [dispatch])

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor={Theme.colors.primary[500]} />
      <HomeHeader
        onMenuPress={handleMenuPress}
        referralReward={referralReward}
        userBalance={userBalance}
      />

      <AddressSelector
        primaryAddress={primaryAddress}
        addressCount={addresses.length}
        onPress={handleAddressPress}
      />

      <CampaignCarousel
        campaigns={campaigns}
        loading={loadingCampaigns}
        error={errorCampaigns}
        onCampaignPress={handleCampaignPress}
        apiBaseUrl={API_BASE_URL}
      />

      <ServicesExplorer
        categories={categories}
        loading={loadingCategories}
        error={errorCategories}
        searchQuery={serviceSearchQuery}
        isSearchVisible={isSearchVisible}
        onServicePress={handleServicePress}
        onToggleSearch={handleToggleSearch}
        onSearchChange={handleSearchChange}
        apiBaseUrl={API_BASE_URL}
      />

      <RequestModal
        isVisible={isRequestModalVisible}
        onClose={handleCloseServiceModal}
        selectedCategory={selectedServiceData}
        primaryAddress={primaryAddress}
        cities={cities}
        states={states}
      />

      <CampaignModal
        isVisible={isCampaignModalVisible}
        onClose={handleCloseCampaignModal}
        campaign={selectedCampaignData}
      />

      <SideMenu
        isVisible={isMenuVisible}
        onClose={() => dispatch(setMenuVisible(false))}
      />

      <AddressModal
        isVisible={isAddressModalVisible}
        onClose={handleCloseAddressModal}
        addresses={addresses}
        onAddressSelect={handleAddressSelect}
        primaryAddress={primaryAddress}
        onAddNewAddress={() => {}}
        onAddressAdded={handleAddressAdded}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: Theme.colors.neutral[200],
  },
})

export default HomeScreen
