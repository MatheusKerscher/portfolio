import { ImageResponse } from "next/og";
import { heroCopy, site } from "./data/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        background: "#f8f7f3",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      <div
        style={{
          width: 48,
          height: 4,
          background: "#137a3a",
          marginBottom: 40,
        }}
      />

      <p
        style={{
          fontSize: 24,
          color: "#5f5f5f",
          margin: "0 0 16px 0",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {heroCopy.eyebrow}
      </p>

      <h1
        style={{
          fontSize: 84,
          fontWeight: 800,
          color: "#111111",
          lineHeight: 1,
          margin: "0 0 40px 0",
          letterSpacing: "-0.03em",
        }}
      >
        {heroCopy.heading}
      </h1>

      <p style={{ fontSize: 22, color: "#5f5f5f", margin: 0 }}>
        React · Next.js · Node.js · TypeScript
      </p>

      <p
        style={{
          position: "absolute",
          bottom: 60,
          right: 80,
          fontSize: 20,
          color: "#137a3a",
          margin: 0,
          fontWeight: 600,
        }}
      >
        {site.url.replace("https://", "")}
      </p>
    </div>,
    { ...size },
  );
}
