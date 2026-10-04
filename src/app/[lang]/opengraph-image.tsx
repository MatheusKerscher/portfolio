import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { dictionaryFor } from "../data/dictionaries";
import { defaultLocale, hasLocale, localeParams } from "../data/locales";
import { site } from "../data/site";

// The name is the same in every language; the image itself is rendered per language.
export const alt = site.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// A metadata image under a dynamic segment is prerendered only for the params it lists itself.
export const dynamicParams = false;
export const generateStaticParams = localeParams;

// The light-theme tokens of globals.css: the image renderer has no CSS variables.
const PAPER = "#f8f7f3";
const INK = "#111111";
const MUTED = "#5f5f5f";
const BRAND = "#137a3a";

const [firstName, lastName] = site.heading.split(" ");

export default async function OgImage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  const { hero } = dictionaryFor(hasLocale(lang) ? lang : defaultLocale);

  // Pre-scaled 5× by scripts/pixel-assets.mjs: the renderer would blur an enlarged sprite.
  const sprite = await readFile(
    join(process.cwd(), "public/avatar/avatar-460.png"),
    "base64",
  );

  return new ImageResponse(
    <div
      style={{
        background: PAPER,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 80px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 36 }}>
          {[0, 1, 2, 3, 4].map((dot) => (
            <div
              key={dot}
              style={{ width: 12, height: 12, background: BRAND }}
            />
          ))}
        </div>

        <p
          style={{
            fontSize: 22,
            color: MUTED,
            margin: "0 0 20px 0",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {hero.eyebrow}
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 84,
            fontWeight: 800,
            color: INK,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            marginBottom: 36,
          }}
        >
          <span>{firstName}</span>
          <span>{lastName}</span>
        </div>

        <p style={{ fontSize: 22, color: MUTED, margin: "0 0 28px 0" }}>
          {site.knowsAbout.slice(0, 4).join(" · ")}
        </p>

        <p style={{ fontSize: 22, color: BRAND, margin: 0, fontWeight: 600 }}>
          {site.url.replace("https://", "")}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          width: 460,
          height: 460,
          background: BRAND,
          boxShadow: `16px 16px 0 ${INK}`,
        }}
      >
        <img
          src={`data:image/png;base64,${sprite}`}
          width={460}
          height={460}
          alt=""
        />
      </div>
    </div>,
    { ...size },
  );
}
