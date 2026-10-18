import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Alert } from 'react-native';

export async function registerForPushNotificationsAsync() {
  try {
    let token;

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        // Use a safe way to alert in async functions
        console.log('Push notification permission not granted');
        return null;
      }

      // Critical: Ensure the function exists before calling
      if (typeof Notifications.getExpoPushTokenAsync === 'function') {
        token = (await Notifications.getExpoPushTokenAsync()).data;
      } else {
        console.error('Notifications.getExpoPushTokenAsync is not a function');
      }
    } else {
      console.log('Push notifications must be tested on a physical device');
    }

    if (Platform.OS === 'android') {
      try {
        if (typeof Notifications.setNotificationChannelAsync === 'function') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#ec4899',
            sound: 'default',
          });
        }
      } catch (e) {
        console.error('setNotificationChannelAsync error:', e);
      }
    }

    return token;
  } catch (error) {
    console.error('Critical error in registerForPushNotificationsAsync:', error);
    return null;
  }
}

export const setAppNotificationHandler = () => {
  Notifications.setNotificationHandler({
    handleNotification: async (notification: any) => {
      console.log('Notification received:', notification);
      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      };
    },
  });
};
