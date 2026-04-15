import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseConfig';
import { useAuthContext } from '@/context/FundTrackerContext';

// Configure how notifications are handled when the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function useNotifications() {
  const { user } = useAuthContext();
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  
  // In-App Notification State
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    // Check permissions first without asking
    const checkPermissions = async () => {
      if (Device.isDevice) {
        const { status } = await Notifications.getPermissionsAsync();
        if (status === 'granted') {
          // Already granted, just register
          const token = await registerForPushNotificationsAsync(true);
          if (token) {
            setExpoPushToken(token);
            saveTokenToSupabase(token, user.id);
          }
        } else {
          // Not granted, show custom modal
          setShowPermissionModal(true);
        }
      }
    };

    checkPermissions();

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('[Notifications] Response received:', response);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [user?.id]);

  // Handle Realtime In-App Notifications
  useEffect(() => {
    if (!user?.id) return;

    const fetchInAppNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setRecentNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    };

    fetchInAppNotifications();

    const channelId = `in-app-notifs-${user.id}-${Date.now()}`;
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, () => {
        console.log('[Notifications] Realtime update received');
        fetchInAppNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const markAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      setUnreadCount(0);
    } catch (err) {
      console.error('[Notifications] Error marking as read:', err);
    }
  };

  const saveTokenToSupabase = async (token: string, userId: string) => {
    // GUARD: Prevent infinite re-render loops by checking if token is already correct
    if ((user as any)?.profile?.fcm_token === token) {
      console.log('[Notifications] Token already synced, skipping update');
      return;
    }

    try {
      await supabase
        .from('profiles')
        .update({ fcm_token: token })
        .eq('id', userId);
      console.log('[Notifications] Token saved successfully');
    } catch (err) {
      console.error('[Notifications] Error saving token:', err);
    }
  };

  const handleAllowNotifications = async () => {
    setShowPermissionModal(false);
    if (!user?.id) return;
    
    const token = await registerForPushNotificationsAsync(false);
    if (token) {
      setExpoPushToken(token);
      saveTokenToSupabase(token, user.id);
    }
  };

  return { 
    expoPushToken, 
    notification, 
    showPermissionModal, 
    setShowPermissionModal,
    handleAllowNotifications,
    unreadCount,
    recentNotifications,
    isDropdownVisible,
    setIsDropdownVisible,
    markAllAsRead
  };
}

async function registerForPushNotificationsAsync(skipPermissionRequest: boolean) {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted' && !skipPermissionRequest) {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') return;

    try {
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

      // Attempt to get device token (FCM)
      // Some versions of types expect 0 args, some expect 1. 
      // We try the common one first.
      const deviceTokenResult = await Notifications.getDevicePushTokenAsync();
      token = deviceTokenResult.data;
      console.log('[Notifications] SUCCESS: FCM Native Token obtained:', token.substring(0, 10) + '...');
    } catch (e) {
      console.log('[Notifications] ERROR: Native FCM token failed. falling back to Expo token (Caution: FCM v1 might fail)');
      try {
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        const expoTokenResult = await Notifications.getExpoPushTokenAsync({ projectId });
        token = expoTokenResult.data;
        console.log('[Notifications] Expo Push Token obtained:', token.substring(0, 20) + '...');
      } catch (err) {
        console.error('[Notifications] CRITICAL: Failed to get any push token:', err);
      }
    }
  }

  return token;
}
