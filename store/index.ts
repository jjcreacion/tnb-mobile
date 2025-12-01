import { configureStore } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { combineReducers } from '@reduxjs/toolkit'

import userReducer from './slices/userSlice'
import addressReducer from './slices/addressSlice'
import campaignReducer from './slices/campaignSlice'
import categoryReducer from './slices/categorySlice'
import invoiceReducer from './slices/invoiceSlice'
import uiReducer from './slices/uiSlice'
import deviceReducer from './slices/deviceSlice'
import notificationReducer from './slices/notificationSlice' 

const rootReducer = combineReducers({
  user: userReducer,
  address: addressReducer,
  campaign: campaignReducer,
  category: categoryReducer,
  invoice: invoiceReducer,
  ui: uiReducer,
  device: deviceReducer,
  notifications: notificationReducer,
})

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['user'], // Only persist user data
  blacklist: ['campaign', 'category', 'address', 'ui'],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
