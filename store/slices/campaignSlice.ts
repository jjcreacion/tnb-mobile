import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { campaignService } from '@/services/api'
import type { Campaign } from '@/types'

interface CampaignState {
  campaigns: Campaign[]
  loading: boolean
  error: string | null
}

const initialState: CampaignState = {
  campaigns: [],
  loading: false,
  error: null,
}

export const fetchCampaigns = createAsyncThunk(
  'campaign/fetchCampaigns',
  async () => {
    const data = await campaignService.getActiveCampaigns()
    // Add contact info to campaigns
    const campaignsWithContact = data.map((camp) => ({
      ...camp,
      phone: '(862)4012414',
      whatsapp: '+1(229)4445456',
    }))
    return campaignsWithContact
  }
)

export const expressInterest = createAsyncThunk(
  'campaign/expressInterest',
  async ({ campaignId, userId }: { campaignId: number; userId: number }) => {
    await campaignService.expressInterest(campaignId, userId)
    return campaignId
  }
)

const campaignSlice = createSlice({
  name: 'campaign',
  initialState,
  reducers: {
    clearCampaigns: (state) => {
      state.campaigns = []
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCampaigns.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.loading = false
        state.campaigns = action.payload
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to load campaigns'
      })
  },
})

export const { clearCampaigns } = campaignSlice.actions
export default campaignSlice.reducer
