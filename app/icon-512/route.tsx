import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #dff7f2 0%, #76cbb1 55%, #0f3f35 100%)",
          color: "#12372f",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 30,
            borderRadius: 110,
            border: "16px solid rgba(255,255,255,0.45)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <div style={{ fontSize: 280, fontWeight: 900, lineHeight: 1 }}>M</div>
          <div style={{ fontSize: 74, fontWeight: 700, letterSpacing: 14 }}>MATHI</div>
        </div>
      </div>
    ),
    {
      width: 512,
      height: 512,
    }
  );
}