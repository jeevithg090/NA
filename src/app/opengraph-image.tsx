import { ImageResponse } from 'next/og';

export const alt = 'Papers, Please: search MIT Manipal previous-year question papers';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px',
        background: '#0c1220',
        color: '#f8fafc',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ fontSize: 36, color: '#5ee6eb', marginBottom: 24 }}>Papers, Please</div>
      <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1, maxWidth: 900 }}>
        MIT Manipal question papers, searchable
      </div>
      <div style={{ fontSize: 32, color: '#a3b3c9', marginTop: 32 }}>
        Filter by year, programme, term, semester and branch
      </div>
    </div>,
    size,
  );
}
