import { z } from "zod";

export type SignatureData = {
  name: string;
  role: string;
  email: string;
  website: string;
};

const sanitizeText = (value: string) =>
  value
    .trim()
    .replace(/[<>]/g, "")
    .replace(/[\x00-\x1F\x7F]/g, "");

const optionalEmail = z.union([
  z.literal(""),
  z.string().trim().toLowerCase().pipe(z.email("Email inválido")),
]);

const optionalUrl = z.union([
  z.literal(""),
  z.string().trim().pipe(z.url("Site inválido (use https://...)")),
]);

export const signatureSchema = z.object({
  name: z.string().trim().min(1, "Informe seu nome").transform(sanitizeText),
  role: z.string().transform(sanitizeText),
  email: optionalEmail,
  website: optionalUrl,
});

export type SignatureErrors = Partial<Record<keyof SignatureData, string>>;

export function parseSignatureData(data: SignatureData): {
  data: SignatureData;
  errors: SignatureErrors;
} {
  const result = signatureSchema.safeParse(data);

  if (result.success) {
    return { data: result.data, errors: {} };
  }

  const errors: SignatureErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof SignatureData | undefined;
    if (key && !errors[key]) errors[key] = issue.message;
  }

  return { data, errors };
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function displayUrl(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

const ACCENT = "#16a34a";
const INK = "#111111";
const MUTED = "#737373";

export function SignatureLogo({
  name,
  size = 56,
}: {
  name: string;
  size?: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        backgroundColor: ACCENT,
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-syne), sans-serif",
        fontWeight: 800,
        fontSize: size * 0.36,
        letterSpacing: "-0.02em",
        flexShrink: 0,
      }}
    >
      {initials(name) || "?"}
    </div>
  );
}

export function SignaturePreview({ data }: { data: SignatureData }) {
  const url = data.website ? displayUrl(data.website) : "";

  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        alignItems: "center",
        fontFamily: "var(--font-catamaran), sans-serif",
      }}
    >
      <SignatureLogo name={data.name} />

      <div style={{ borderLeft: `2px solid ${ACCENT}`, paddingLeft: 16 }}>
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-syne), sans-serif",
            fontWeight: 800,
            fontSize: 17,
            color: INK,
            letterSpacing: "-0.01em",
          }}
        >
          {data.name || "Seu nome"}
        </p>
        {data.role && (
          <p style={{ margin: "2px 0 8px", fontSize: 13, color: MUTED }}>
            {data.role}
          </p>
        )}

        {data.email && (
          <p style={{ margin: "2px 0", fontSize: 13, lineHeight: 1.6 }}>
            <a
              href={`mailto:${data.email}`}
              style={{ color: ACCENT, fontWeight: 600, textDecoration: "none" }}
            >
              {data.email}
            </a>
          </p>
        )}
        {url && (
          <p style={{ margin: "2px 0", fontSize: 13, lineHeight: 1.6 }}>
            <a
              href={data.website}
              style={{ color: ACCENT, fontWeight: 600, textDecoration: "none" }}
            >
              {url}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildSignatureHtml(data: SignatureData) {
  const name = escapeHtml(data.name || "Seu nome");
  const role = escapeHtml(data.role);
  const email = escapeHtml(data.email);
  const website = escapeHtml(data.website);
  const url = website ? escapeHtml(displayUrl(data.website)) : "";
  const badge = escapeHtml(initials(data.name) || "?");

  const contactLines = [
    email
      ? `<p style="margin:2px 0;font-size:13px;line-height:1.6;"><a href="mailto:${email}" style="color:${ACCENT};font-weight:600;text-decoration:none;">${email}</a></p>`
      : "",
    url
      ? `<p style="margin:2px 0;font-size:13px;line-height:1.6;"><a href="${website}" style="color:${ACCENT};font-weight:600;text-decoration:none;">${url}</a></p>`
      : "",
  ]
    .filter(Boolean)
    .join("\n      ");

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="font-family:Catamaran,Arial,sans-serif;font-size:13px;color:${INK};">
  <tr>
    <td style="vertical-align:middle;padding-right:16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="56" height="56" style="background-color:${ACCENT};border-radius:12px;width:56px;height:56px;">
        <tr>
          <td align="center" valign="middle" style="font-family:'Syne',Arial,sans-serif;font-weight:800;font-size:20px;color:#ffffff;letter-spacing:-0.02em;">${badge}</td>
        </tr>
      </table>
    </td>
    <td style="vertical-align:middle;border-left:2px solid ${ACCENT};padding-left:16px;">
      <p style="margin:0;font-family:'Syne',Arial,sans-serif;font-weight:800;font-size:17px;color:${INK};letter-spacing:-0.01em;">${name}</p>
      ${role ? `<p style="margin:2px 0 8px;font-size:13px;color:${MUTED};">${role}</p>` : ""}
      ${contactLines}
    </td>
  </tr>
</table>`;
}

export function buildSignatureText(data: SignatureData) {
  return [data.name, data.role, data.email, data.website]
    .filter(Boolean)
    .join("\n");
}
