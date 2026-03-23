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
          background: "linear-gradient(145deg, #ebfbf7 0%, #8ad8bf 58%, #0f3f35 100%)",
          color: "#12372f",
          fontFamily: "sans-serif",
          borderRadius: 42,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontSize: 102, fontWeight: 900, lineHeight: 1 }}>M</div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 6 }}>MATHI</div>
        </div>
      </div>
    ),
    {
      width: 180,
      height: 180,
    }
  );
}