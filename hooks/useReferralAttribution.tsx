import { useEffect, useState, useCallback } from 'react';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REFERRER_ID_KEY = '@referral_data:referrerId';

export const useReferralAttribution = () => {
    const [initialReferrerId, setInitialReferrerId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const processDeepLink = useCallback(async (url: string | null) => {
        if (!url) return;
        
        const { path, queryParams } = Linking.parse(url);

        if (path === 'register' && queryParams?.referrerId && typeof queryParams.referrerId === 'string') {
            const referrerId = queryParams.referrerId;
            console.log('[Referral Attrib] Deep Link capturado. ID:', referrerId);

            try {
                await AsyncStorage.setItem(REFERRER_ID_KEY, referrerId);
                setInitialReferrerId(referrerId);
            } catch (error) {
                console.error('Error saving referrerId to AsyncStorage:', error);
            }
        }
    }, []);

    useEffect(() => {
        Linking.getInitialURL()
            .then(url => {
                if (url) {
                    processDeepLink(url);
                }
            })
            .catch(err => console.error('An error occurred on initial URL', err))
            .finally(() => setIsLoading(false));

        const subscription = Linking.addEventListener('url', ({ url }) => {
            processDeepLink(url);
        });

        return () => {
            subscription.remove();
        };
    }, [processDeepLink]);

    const getStoredReferrerCode = async (): Promise<string | null> => {
        try {
            return await AsyncStorage.getItem(REFERRER_ID_KEY);
        } catch (error) {
            console.error('Error reading referrerId from AsyncStorage:', error);
            return null;
        }
    };

    return { 
        isLoadingAttribution: isLoading, 
        initialReferrerId,
        getStoredReferrerCode,
        REFERRER_ID_KEY 
    };
};