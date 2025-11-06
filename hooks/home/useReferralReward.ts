import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setReferralReward } from '@/store/slices/uiSlice'
import { settingsService } from '@/services/api'

export const useReferralReward = () => {
  const dispatch = useAppDispatch()
  const currentReward = useAppSelector((state) => state.ui.referralReward)

  useEffect(() => {
    const fetchReferralReward = async () => {
      try {
        const data = await settingsService.getReferralReward()
        const rewardValue = parseFloat(data.value).toFixed(0)
        dispatch(setReferralReward(rewardValue))
      } catch (error) {
        console.error('Error fetching referral reward:', error)
        // Keep default value of '15'
      }
    }

    if (currentReward === null) {
      fetchReferralReward()
    }
  }, [dispatch, currentReward])
}
