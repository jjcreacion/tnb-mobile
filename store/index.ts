import AsyncStorage from '@react-native-async-storage/async-storage'
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import {
    FLUSH,
    PAUSE,
    PERSIST,
    persistReducer,
    persistStore,
    PURGE,
    REGISTER,
    REHYDRATE,
} from 'redux-persist'

import addressReducer from './slices/addressSlice'
import authReducer from './slices/authSlice'
import campaignReducer from './slices/campaignSlice'
import categoryReducer from './slices/categorySlice'
import deviceReducer from './slices/deviceSlice'
import invoiceReducer from './slices/invoiceSlice'
import notificationReducer from './slices/notificationSlice'
import uiReducer from './slices/uiSlice'
import userReducer from './slices/userSlice'

const rootReducer = combineReducers({
  auth: authReducer,
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
