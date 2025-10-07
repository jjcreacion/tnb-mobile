import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Campaign, Category } from '@/types'

interface UIState {
  isMenuVisible: boolean
  isSearchVisible: boolean
  serviceSearchQuery: string
  isRequestModalVisible: boolean
  selectedServiceData: Category | null
  isCampaignModalVisible: boolean
  selectedCampaignData: Campaign | null
  isAddressModalVisible: boolean
  referralReward: string
}

const initialState: UIState = {
  isMenuVisible: false,
  isSearchVisible: false,
  serviceSearchQuery: '',
  isRequestModalVisible: false,
  selectedServiceData: null,
  isCampaignModalVisible: false,
  selectedCampaignData: null,
  isAddressModalVisible: false,
  referralReward: '15',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleMenu: (state) => {
      state.isMenuVisible = !state.isMenuVisible
    },
    setMenuVisible: (state, action: PayloadAction<boolean>) => {
      state.isMenuVisible = action.payload
    },
    toggleSearch: (state) => {
      state.isSearchVisible = !state.isSearchVisible
      if (!state.isSearchVisible) {
        state.serviceSearchQuery = ''
      }
    },
    setSearchVisible: (state, action: PayloadAction<boolean>) => {
      state.isSearchVisible = action.payload
      if (!action.payload) {
        state.serviceSearchQuery = ''
      }
    },
    setServiceSearchQuery: (state, action: PayloadAction<string>) => {
      state.serviceSearchQuery = action.payload
    },
    openRequestModal: (state, action: PayloadAction<Category>) => {
      state.isRequestModalVisible = true
      state.selectedServiceData = action.payload
    },
    closeRequestModal: (state) => {
      state.isRequestModalVisible = false
      state.selectedServiceData = null
    },
    openCampaignModal: (state, action: PayloadAction<Campaign>) => {
      state.isCampaignModalVisible = true
      state.selectedCampaignData = action.payload
    },
    closeCampaignModal: (state) => {
      state.isCampaignModalVisible = false
      state.selectedCampaignData = null
    },
    openAddressModal: (state) => {
      state.isAddressModalVisible = true
    },
    closeAddressModal: (state) => {
      state.isAddressModalVisible = false
    },
    setReferralReward: (state, action: PayloadAction<string>) => {
      state.referralReward = action.payload
    },
  },
})

export const {
  toggleMenu,
  setMenuVisible,
  toggleSearch,
  setSearchVisible,
  setServiceSearchQuery,
  openRequestModal,
  closeRequestModal,
  openCampaignModal,
  closeCampaignModal,
  openAddressModal,
  closeAddressModal,
  setReferralReward,
} = uiSlice.actions

export default uiSlice.reducer
