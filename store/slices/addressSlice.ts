import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { addressService, userService } from '@/services/api'
import type { Address, City, State } from '@/types'

interface AddressState {
  addresses: Address[]
  primaryAddress: Address | null
  cities: City[]
  states: State[]
  loading: boolean
  error: string | null
}

const initialState: AddressState = {
  addresses: [],
  primaryAddress: null,
  cities: [],
  states: [],
  loading: false,
  error: null,
}

export const loadCitiesAndStates = createAsyncThunk(
  'address/loadCitiesAndStates',
  async () => {
    const [cities, states] = await Promise.all([
      addressService.getCities(),
      addressService.getStates(),
    ])
    return { cities, states }
  }
)

export const loadUserAddresses = createAsyncThunk(
  'address/loadUserAddresses',
  async (_, { rejectWithValue }) => {
    try {
      const userId = await AsyncStorage.getItem('userId')
      if (!userId) {
        return { addresses: [], primaryAddress: null }
      }

      const userData = await userService.getUserById(userId)

      if (userData?.person?.addresses && userData.person.addresses.length > 0) {
        const addresses = userData.person.addresses
        const primary = addresses.find((addr: Address) => addr.isPrimary === 1)
        return {
          addresses,
          primaryAddress: primary || addresses[0],
        }
      }

      return { addresses: [], primaryAddress: null }
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const updatePrimaryAddress = createAsyncThunk(
  'address/updatePrimaryAddress',
  async (
    { newAddress, currentPrimary }: { newAddress: Address; currentPrimary: Address | null },
    { rejectWithValue }
  ) => {
    try {
      // Update previous primary to secondary
      if (currentPrimary) {
        await addressService.updateAddressPrimary(currentPrimary.pkAddress, 0)
      }

      // Update new address to primary
      await addressService.updateAddressPrimary(newAddress.pkAddress, 1)

      return newAddress
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    clearAddresses: (state) => {
      state.addresses = []
      state.primaryAddress = null
    },
    setAddresses: (state, action: PayloadAction<Address[]>) => {
      state.addresses = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Load cities and states
      .addCase(loadCitiesAndStates.fulfilled, (state, action) => {
        state.cities = action.payload.cities
        state.states = action.payload.states
      })
      // Load user addresses
      .addCase(loadUserAddresses.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loadUserAddresses.fulfilled, (state, action) => {
        state.loading = false
        state.addresses = action.payload.addresses
        state.primaryAddress = action.payload.primaryAddress
      })
      .addCase(loadUserAddresses.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.addresses = []
        state.primaryAddress = null
      })
      // Update primary address
      .addCase(updatePrimaryAddress.fulfilled, (state, action) => {
        const newPrimary = action.payload
        state.addresses = state.addresses.map((addr) => ({
          ...addr,
          isPrimary: addr.pkAddress === newPrimary.pkAddress ? 1 : 0,
        }))
        state.primaryAddress = { ...newPrimary, isPrimary: 1 }
      })
  },
})

export const { clearAddresses, setAddresses } = addressSlice.actions
export default addressSlice.reducer
