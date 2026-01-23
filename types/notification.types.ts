export interface Notification {
    id: number;
    title: string;
    body: string;
    isRead: boolean;
    createdAt: string;
}

export interface NotificationsState {
    history: Notification[];
    currentDevice: any | null; 
    loading: boolean;
    error: string | null;
}