'use client';

/**
 * Клиент жағында үлкен файлдарды (видео) ТІКЕЛЕЙ Supabase Storage-қа
 * жүктеу — Vercel serverless функциясының 4.5MB body лимитін
 * айналып өтеді (байт ағыны Next.js серверінен өтпейді).
 *
 * Қолдану:
 *   const url = await uploadFileDirect(file, "videos", (pct) => setProgress(pct));
 */

export async function uploadFileDirect(
  file: File,
  subdir: 'posters' | 'videos' | 'avatars',
  onProgress?: (pct: number) => void,
): Promise<string> {
  // 1) Серверден signed upload ticket алу.
  const ticketRes = await fetch('/api/upload/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      size: file.size,
      mimeType: file.type,
      subdir,
    }),
  });
  const ticket = await ticketRes.json();
  if (!ticketRes.ok) {
    throw new Error(ticket?.error || 'Жүктеу үшін рұқсат алу мүмкін болмады');
  }

  // 2) Файлды тікелей Supabase Storage-қа жіберу (XHR — progress үшін).
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', ticket.signedUrl);
    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable || !onProgress) return;
      onProgress((e.loaded / e.total) * 100);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Жүктеу қатесі (HTTP ${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new Error('Желі қатесі — жүктеу сәтсіз аяқталды'));

    const fd = new FormData();
    fd.append('cacheControl', '31536000');
    fd.append('', file);
    xhr.send(fd);
  });

  return ticket.publicUrl as string;
}
