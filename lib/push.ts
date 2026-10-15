import { prisma } from '@/lib/prisma';

interface PushData {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export async function sendPush(targets: { userIds?: string[]; tokens?: string[] }, content: PushData) {
  const { title, body, data } = content;
  let allTokens: string[] = [];

  if (targets.tokens) {
    allTokens = [...targets.tokens];
  }

  if (targets.userIds && targets.userIds.length > 0) {
    const usersTokens = await prisma.pushToken.findMany({
      where: {
        userId: { in: targets.userIds },
      },
    });
    allTokens.push(...usersTokens.map((t) => t.token));
  }

  if (allTokens.length === 0) return { sent: 0, failed: 0 };

  // Remove duplicates
  const uniqueTokens = Array.from(new Set(allTokens));
  const chunks = [];
  for (let i = 0; i < uniqueTokens.length; i += 100) {
    chunks.push(uniqueTokens.slice(i, i + 100));
  }

  let totalSent = 0;
  let totalFailed = 0;

  for (const chunk of chunks) {
    const messages = chunk.map((token) => ({
      to: token,
      sound: 'default',
      title,
      body,
      data,
    }));

    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(messages),
      });

      const resData = await response.json();

      if (!response.ok) {
        console.error('Expo Push API error:', resData);
        totalFailed += chunk.length;
        continue;
      }

      // Expo returns a list of receipts in a second request usually,
      // but we can process the initial response for basic errors.
      // For full "DeviceNotRegistered" cleanup, we should ideally wait for the receipt.
      // However, for a simpler implementation, we'll assume the request was accepted.
      totalSent += messages.length;
    } catch (error) {
      console.error('Error sending push chunk:', error);
      totalFailed += chunk.length;
    }
  }

  return { sent: totalSent, failed: totalFailed };
}

/**
 * Helper to send push to a specific user with Notification history persistence
 * and filtering based on user settings.
 */
export async function notifyUser(userId: string, content: PushData, type: NotificationType = 'SYSTEM') {
  // 1. Check Notification Settings
  if (type !== 'SYSTEM') {
    const settings = await prisma.notificationSetting.findUnique({
      where: { userId },
    });

    if (settings) {
      if (type === 'payments' && !settings.payments) return;
      if (type === 'newEpisodes' && !settings.newEpisodes) return;
      if (type === 'promos' && !settings.promos) return;
    }
  }

  // 2. Save to Notification history
  await prisma.notification.create({
    data: {
      userId,
      title: content.title,
      body: content.body,
      type: type.toUpperCase(),
      payload: content.data,
    },
  });

  // 3. Send the actual push
  return sendPush({ userIds: [userId] }, content);
}
