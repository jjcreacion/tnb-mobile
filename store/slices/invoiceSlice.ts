import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { invoiceService } from '@/services/api'
import type { Invoice } from '@/types'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface InvoiceState {
  invoices: Invoice[]
  loading: boolean
  error: string | null
}

const initialState: InvoiceState = {
  invoices: [],
  loading: false,
  error: null,
}

export const fetchInvoices = createAsyncThunk(
  'invoice/fetchInvoices',
  async (_, { rejectWithValue }) => { 
    const userId = await AsyncStorage.getItem('userId')

    if (userId === null) {
      return rejectWithValue('No se encontró el ID de usuario.') 
    }
    
    return invoiceService.getInvoiceById(userId) 
  }
)

const invoiceSlice = createSlice({
  name: 'invoice',
  initialState,
  reducers: {
    clearCategories: (state) => {
      state.invoices = []
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false
        state.invoices = action.payload
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to load Invoices'
      })
  },
})

export const { clearCategories } = invoiceSlice.actions
export default invoiceSlice.reducer
