import { apiClient } from './apiClient'
import type { Campaign } from '@/types'

export const campaignService = {
  async getActiveCampaigns(): Promise<Campaign[]> {
    return apiClient.get<Campaign[]>('/mobile-campaigns/active')
  },

  async expressInterest(campaignId: number, userId: number): Promise<void> {
    return apiClient.post(`/mobile-campaigns/${campaignId}/express-interest`, {
      userId,
    })
  },
}
