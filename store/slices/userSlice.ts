import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { userService } from '@/services/api'
import type { User, Address } from '@/types'

interface UserState {
    userId: string | null
    userName: string
    userBalance: number | null
    userData: User | null
    loading: boolean
    error: string | null
}

const initialState: UserState = {
    userId: null,
    userName: 'User',
    userBalance: null,
    userData: null,
    loading: false,
    error: null,
}

export const toggleSmsNotifications = createAsyncThunk(
    'user/toggleSmsNotifications',
    async (status: boolean, { getState, rejectWithValue }) => {
        try {
            const state = getState() as { user: UserState };
            const pkUser = state.user.userData?.pkUser || state.user.userId; 
            if (!pkUser) { 
                return rejectWithValue('Datos de usuario no cargados o PK no encontrado.');
            }

            const updatedUser = await userService.toggleSmsNotifications(pkUser, status);
            return updatedUser;
            
        } catch (error: any) {
            const errorMessage = error?.message || 'Error al conectar con el servidor.';
            console.error('Error al cambiar notificaciones SMS:', errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);


export const loadUserData = createAsyncThunk(
    'user/loadUserData',
    async (_, { rejectWithValue }) => {
        try {
            const userId = await AsyncStorage.getItem('userId')
            if (!userId) {
                throw new Error('User ID not found')
            }

            const userData = await userService.getUserById(userId)
            
            let userName = 'User'
            if (userData?.person?.firstName && userData?.person?.lastName) {
                userName = `${userData.person.firstName} ${userData.person.lastName}`
            } else if (userData?.person?.firstName) {
                userName = userData.person.firstName
            }

            return {
                userId,
                userName,
                userBalance: userData.balance,
                userData,
            }
        } catch (error: any) {
            return rejectWithValue(error.message)
        }
    }
)

// -----------------------------------------------------------
// SLICE
// -----------------------------------------------------------

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUserName: (state, action: PayloadAction<string>) => {
            state.userName = action.payload
        },
        setUserBalance: (state, action: PayloadAction<number>) => {
            state.userBalance = action.payload
        },
        clearUser: (state) => {
            state.userId = null
            state.userName = 'User'
            state.userBalance = null
            state.userData = null
        },  
        setSmsNotificationsStatus: (state, action: PayloadAction<boolean>) => {
            if (state.userData) {
                state.userData.smsNotifications = action.payload
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadUserData.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(loadUserData.fulfilled, (state, action) => {
                state.loading = false
                state.userId = action.payload.userId
                state.userName = action.payload.userName
                state.userBalance = action.payload.userBalance
                state.userData = action.payload.userData
            })
            .addCase(loadUserData.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
                state.userName = 'User'
                state.userBalance = null
            })
            
            .addCase(toggleSmsNotifications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(toggleSmsNotifications.fulfilled, (state, action: PayloadAction<User>) => {
                state.loading = false;
                state.userData = action.payload;
            })
            .addCase(toggleSmsNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                console.error('Error al cambiar notificaciones SMS:', action.payload);
            });
    },
})

export const { setUserName, setUserBalance, clearUser, setSmsNotificationsStatus } = userSlice.actions
export default userSlice.reducer