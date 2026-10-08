import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import crypto from 'crypto';

/**
 * Mux Webhook Handler
 *
 * Mux sends POST requests to this endpoint when asset events occur.
 * Security: Validates the request signature using MUX_WEBHOOK_SECRET.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headerStore = await headers();
    const signature = headerStore.get('mux-signature');
    const secret = process.env.MUX_WEBHOOK_SECRET;

    if (!secret) {
      console.error('[Mux Webhook] MUX_WEBHOOK_SECRET is not configured');

      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    if (!signature) {
      console.error('[Mux Webhook] Missing mux-signature header');

      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Validate signature to ensure the request comes from Mux
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(body);

    const digest = hmac.digest('hex');

    if (digest !== signature) {
      console.error('[Mux Webhook] Invalid signature');

      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);

    console.log('[Mux Webhook] Received event:', event.type);

    switch (event.type) {
      case 'video.asset.created': {
        // Asset was created.
        // We can track the assetId here if needed.
        break;
      }

      case 'video.asset.ready': {
        // Video is processed and ready for playback.
        const {
          playback_id: playbackId,
          id: assetId,
        } = event.data;

        if (playbackId) {
          await prisma.episode.updateMany({
            where: {
              playbackId,
            },
            data: {},
          });

          console.log(
            `[Mux Webhook] Asset ${assetId} is now ready. PlaybackID: ${playbackId}`
          );
        } else {
          console.log(
            `[Mux Webhook] Asset ${assetId} is ready, but no playback_id was provided.`
          );
        }

        break;
      }

      case 'video.asset.deleted': {
        const {
          playback_id: playbackId,
          id: assetId,
        } = event.data;

        if (playbackId) {
          await prisma.episode.updateMany({
            where: {
              playbackId,
            },
            data: {
              videoUrl: null,
              playbackId: null,
            },
          });

          console.log(
            `[Mux Webhook] Asset ${assetId} deleted. PlaybackID: ${playbackId}`
          );
        } else {
          console.log(
            `[Mux Webhook] Asset ${assetId} deleted, but no playback_id was provided.`
          );
        }

        break;
      }

      default: {
        // Ignore other Mux events
        console.log(
          `[Mux Webhook] Ignoring event: ${event.type}`
        );

        break;
      }
    }

    return NextResponse.json(
      { received: true },
      { status: 200 }
    );
  } catch (err) {
    console.error(
      '[Mux Webhook] Error processing webhook:',
      err
    );

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
