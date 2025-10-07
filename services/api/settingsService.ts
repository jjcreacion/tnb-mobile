import { apiClient } from './apiClient'

export const settingsService = {
  async getReferralReward(): Promise<{ value: string }> {
    return apiClient.get<{ value: string }>(
      '/app-settings/referral_reward_amount'
    )
  },
}
