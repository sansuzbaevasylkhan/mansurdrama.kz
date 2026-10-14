import { Expo } from 'expo-server-sdk';
import { prisma } from '@/lib/prisma';

export async function sendPushNotification(userId: string, title: string, body: string, data: any = {}) {
  try {
    const pushTokenRecord = await prisma.pushToken.findUnique({
      where: { userId },
    });

    if (!pushTokenRecord) {
      console.log(`[PUSH_NOTIF] No token found for user ${userId}`);
      return { success: false, error: 'No push token found' };
    }

    const pushToken = pushTokenRecord.token;

    // Check if token is valid Expo push token
    if (!Expo.isExpoPushToken(pushToken)) {
      console.log(`[PUSH_NOTIF] Invalid Expo push token for user ${userId}`);
      return { success: false, error: 'Invalid push token' };
    }

    const message = {
      to: pushToken,
      sound: 'default',
      title,
      body,
      data,
    };

    const ticket = await Expo.sendPushNotificationAsync(message);

    return { success: true, ticket };
  } catch (error) {
    console.error(`[PUSH_NOTIF_ERROR] User ${userId}:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function sendBroadcastNotification(userIds: string[], title: string, body: string, data: any = {}) {
  const results = [];
  for (const userId of userIds) {
    const res = await sendPushNotification(userId, title, body, data);
    results.push({ userId, ...res });
  }
  return results;
}
