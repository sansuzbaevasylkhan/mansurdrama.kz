import { Expo } from 'expo-server-sdk';
import { prisma } from '@/lib/prisma';

const expo = new Expo();

export async function sendPushNotification(userId: string, title: string, body: string, data: any = {}) {
  try {
    const pushTokenRecords = await prisma.pushToken.findMany({
      where: { userId },
    });

    if (pushTokenRecords.length === 0) {
      console.log(`[PUSH_NOTIF] No tokens found for user ${userId}`);
      return { success: false, error: 'No push tokens found' };
    }

    const messages = pushTokenRecords
      .filter(record => Expo.isExpoPushToken(record.token))
      .map(record => ({
        to: record.token,
        sound: 'default',
        title,
        body,
        data,
      }));

    if (messages.length === 0) {
      return { success: false, error: 'No valid Expo push tokens' };
    }

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    }

    return { success: true, tickets };
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
