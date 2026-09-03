/**
 * Mux Video — сервер жағында Direct Upload және Asset статусын басқару.
 *
 * Ағын:
 *   1. Админ файл таңдайды → /api/upload/mux осы модульдегі
 *      createDirectUpload() арқылы Mux-тан бір реттік upload URL сұрайды.
 *   2. Браузер сол URL-ге видеоны ТІКЕЛЕЙ жібереді (@mux/upchunk).
 *   3. Mux видеоны өңдейді (транскодтау). Клиент getUploadStatus() арқылы
 *      polling жасайды НЕМЕСЕ Mux webhook (video.asset.ready) хабарлайды.
 *   4. playback_id алынған соң Episode.playbackId өрісіне сақталады.
 */

import Mux from "@mux/mux-node";

let client: Mux | null = null;

export function isMuxConfigured(): boolean {
  return Boolean(process.env.MUX_TOKEN_ID && process.env.MUX_TOKEN_SECRET);
}

function getMux(): Mux {
  if (!isMuxConfigured()) {
    throw new Error(
      "Mux конфигурацияланбаған. MUX_TOKEN_ID, MUX_TOKEN_SECRET орнатыңыз.",
    );
  }
  if (!client) {
    client = new Mux({
      tokenId: process.env.MUX_TOKEN_ID!,
      tokenSecret: process.env.MUX_TOKEN_SECRET!,
    });
  }
  return client;
}

export interface DirectUploadTicket {
  uploadId: string;
  url: string;
}

/** Браузер тікелей жүктей алатын бір реттік Mux upload URL жасайды. */
export async function createDirectUpload(): Promise<DirectUploadTicket> {
  const mux = getMux();
  const origin = process.env.NEXT_PUBLIC_APP_URL || "https://mansurdrama.kz";

  const upload = await mux.video.uploads.create({
    cors_origin: origin,
    new_asset_settings: {
      playback_policy: ["public"],
      video_quality: "basic",
    },
  });

  if (!upload.url) {
    throw new Error("Mux upload URL қайтармады");
  }
  return { uploadId: upload.id, url: upload.url };
}

export interface UploadStatus {
  status: string; // "waiting" | "asset_created" | "errored" | "cancelled" | "timed_out"
  assetId: string | null;
  playbackId: string | null;
  assetStatus: string | null; // "preparing" | "ready" | "errored"
}

/** Upload-тың ағымдағы күйін және (бар болса) дайын playback_id-ды қайтарады. */
export async function getUploadStatus(uploadId: string): Promise<UploadStatus> {
  const mux = getMux();
  const upload = await mux.video.uploads.retrieve(uploadId);

  if (!upload.asset_id) {
    return { status: upload.status, assetId: null, playbackId: null, assetStatus: null };
  }

  const asset = await mux.video.assets.retrieve(upload.asset_id);
  const playbackId = asset.playback_ids?.find((p) => p.policy === "public")?.id ?? null;

  return {
    status: upload.status,
    assetId: asset.id,
    playbackId: asset.status === "ready" ? playbackId : null,
    assetStatus: asset.status,
  };
}

/** Mux webhook (X-Mux-Signature) қолтаңбасын тексеріп, event-ті парстайды. */
export async function unwrapMuxWebhook(
  rawBody: string,
  signatureHeader: string | null,
): Promise<{ type: string; data: any } | null> {
  const secret = process.env.MUX_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return null;
  try {
    const mux = getMux();
    const event = await mux.webhooks.unwrap(rawBody, { "mux-signature": signatureHeader }, secret);
    return event as unknown as { type: string; data: any };
  } catch {
    return null;
  }
}

export function playbackUrl(playbackId: string): string {
  return `https://stream.mux.com/${playbackId}.m3u8`;
}

export function thumbnailUrl(playbackId: string): string {
  return `https://image.mux.com/${playbackId}/thumbnail.jpg`;
}
