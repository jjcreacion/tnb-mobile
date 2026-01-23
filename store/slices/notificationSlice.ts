import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { notificationService } from '@/services/api'; 
import type { Notification, NotificationsState } from '@/types/notification.types';

const initialState: NotificationsState = {
  history: [],
  currentDevice: null,
  loading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (userId: number, { rejectWithValue }) => {
    try {
      return await notificationService.getNotifications(userId);
    } catch (error) {
      return rejectWithValue('Error al cargar el historial de notificaciones.');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markNotificationAsRead',
  async (notificationId: number, { rejectWithValue }) => {
    try {
      return await notificationService.markAsRead(notificationId);
    } catch (error) {
      return rejectWithValue('Error al marcar la notificación como leída.');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotificationHistory: (state) => {
      state.history = [];
      state.error = null;
    },
    markReadLocally: (state, action: PayloadAction<number>) => {
        const index = state.history.findIndex(n => n.id === action.payload);
        if (index !== -1) {
            state.history[index].isRead = true;
        }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<Notification[]>) => {
        state.loading = false;
        state.history = action.payload; 
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || 'Error desconocido al listar.';
      })

      .addCase(markNotificationAsRead.pending, (state) => {
          // Opcional
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action: PayloadAction<Notification>) => {
        const updatedNotification = action.payload;
        const index = state.history.findIndex(n => n.id === updatedNotification.id);
        
        if (index !== -1) {
          state.history[index] = updatedNotification; 
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        console.error('Failed to mark notification as read:', action.payload || action.error.message);
      });
  },
});

export const { clearNotificationHistory, markReadLocally } = notificationSlice.actions;
export default notificationSlice.reducer;