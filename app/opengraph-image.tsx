import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'MansurDrama.kz';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(135deg, #0a0a10 0%, #1c1c1e 50%, #0a0a10 100%)',
          color: 'white',
          padding: 80,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 28,
            color: 'rgba(255,255,255,0.7)',
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
              display: 'flex',
            }}
          />
          MansurDrama.kz
        </div>
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
            textAlign: 'center',
            background:
              'linear-gradient(90deg, #f9a8d4, #ec4899, #8b5cf6)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Қысқа дорамалар
        </div>
        <div
          style={{
            fontSize: 36,
            color: 'rgba(255,255,255,0.75)',
            marginTop: 24,
          }}
        >
          HD · Тегін · Кез-келген құрылғыда
        </div>
      </div>
    ),
    { ...size },
  );
}
