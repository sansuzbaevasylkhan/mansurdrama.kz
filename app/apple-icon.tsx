import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'MansurDrama.kz';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
          borderRadius: 32,
        }}
      >
        <svg
          viewBox="0 0 64 64"
          width={120}
          height={120}
        >
          <path d="M22 18 L22 46 L46 32 Z" fill="white" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
