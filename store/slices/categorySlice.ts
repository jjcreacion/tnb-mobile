import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { categoryService } from '@/services/api'
import type { Category } from '@/types'

interface CategoryState {
  categories: Category[]
  loading: boolean
  error: string | null
}

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
}

export const fetchCategories = createAsyncThunk(
  'category/fetchCategories',
  async () => {
    return categoryService.getAllCategories()
  }
)

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    clearCategories: (state) => {
      state.categories = []
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false
        state.categories = action.payload
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to load categories'
      })
  },
})

export const { clearCategories } = categorySlice.actions
export default categorySlice.reducer
