import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { userService } from '@/services/api'
import type { Invoice } from '@/types/invoice.types'
import { invoiceService } from '@/services/api/invoiceService'

interface InvoiceState {
  invoice_id: string | null
  fk_user: string | null
  invoice_amount: number | null;
  invoice_status: string | null; 
  public_link: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
}

const initialState: InvoiceState = {
  invoice_id: null,
  fk_user: null,
  invoice_amount: null,
  invoice_status: null,
  public_link: null,
  invoice_number: null,
  invoice_date: null,
}

export const loadInvoiceData = createAsyncThunk(
  'invoice/loadInvoiceData',
  async (_, { rejectWithValue }) => {
    try {
      const userId = await AsyncStorage.getItem('userId')
      if (!userId) {
        throw new Error('User ID not found')
      }

      const invoiceData = await invoiceService.getInvoiceById(userId)

      return {
        invoiceData,
      }
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)