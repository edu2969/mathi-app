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
            inset: 12,
            borderRadius: 40,
            border: "8px solid rgba(255,255,255,0.45)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <div style={{ fontSize: 104, fontWeight: 900, lineHeight: 1 }}>M</div>
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: 6 }}>MATHI</div>
        </div>
      </div>
    ),
    {
      width: 192,
      height: 192,
    }
  );
}