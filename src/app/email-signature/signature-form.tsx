"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MotionSection from "../components/motion-section";
import { site } from "../data/site";
import {
  buildSignatureHtml,
  buildSignatureText,
  parseSignatureData,
  SignaturePreview,
  type SignatureData,
} from "./signature-template";

const initialData: SignatureData = {
  name: site.name,
  role: site.role,
  email: site.email,
  website: site.url,
};

const fields: {
  key: keyof SignatureData;
  label: string;
  placeholder: string;
  type: string;
}[] = [
  {
    key: "name",
    label: "Nome",
    placeholder: "Seu nome completo",
    type: "text",
  },
  {
    key: "role",
    label: "Cargo / título",
    placeholder: "Ex: Desenvolvedor FullStack",
    type: "text",
  },
  {
    key: "email",
    label: "Email",
    placeholder: "voce@email.com",
    type: "email",
  },
  {
    key: "website",
    label: "Site",
    placeholder: "https://seusite.com",
    type: "url",
  },
];

const inputClasses =
  "w-full rounded-lg border border-line-strong bg-transparent px-4 py-3 text-sm text-ink transition-colors duration-200 placeholder:text-ink-muted";

const cardTitleStyle = { fontFamily: "var(--font-syne), sans-serif" };

export default function SignatureForm() {
  const [data, setData] = useState<SignatureData>(initialData);
  const [copied, setCopied] = useState(false);

  const { data: sanitized, errors } = useMemo(
    () => parseSignatureData(data),
    [data],
  );
  const isValid = Object.keys(errors).length === 0;

  function handleChange(key: keyof SignatureData, value: string) {
    setData((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  }

  async function handleCopy() {
    if (!isValid) return;

    const html = buildSignatureHtml(sanitized);
    const text = buildSignatureText(sanitized);

    try {
      if (typeof ClipboardItem !== "undefined") {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([html], { type: "text/html" }),
            "text/plain": new Blob([text], { type: "text/plain" }),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(html);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <MotionSection delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle style={cardTitleStyle} className="text-lg font-bold">
              Seus dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-col gap-5"
              onSubmit={(e) => e.preventDefault()}
            >
              {fields.map((field) => {
                const error = errors[field.key];
                const errorId = `signature-${field.key}-error`;

                return (
                  <label key={field.key} className="flex flex-col gap-2">
                    <span className="text-xs font-semibold tracking-widest text-ink-muted uppercase">
                      {field.label}
                    </span>
                    <input
                      type={field.type}
                      value={data[field.key]}
                      placeholder={field.placeholder}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      aria-invalid={Boolean(error)}
                      aria-describedby={error ? errorId : undefined}
                      className={
                        error ? `${inputClasses} border-danger` : inputClasses
                      }
                    />
                    {error && (
                      <span id={errorId} className="text-xs text-danger">
                        {error}
                      </span>
                    )}
                  </label>
                );
              })}
            </form>
          </CardContent>
        </Card>
      </MotionSection>

      <MotionSection delay={0.2} className="flex flex-col gap-8">
        <Card>
          <CardHeader>
            <CardTitle style={cardTitleStyle} className="text-lg font-bold">
              Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* White in both themes: it previews the signature on an email background. */}
            <div className="mb-6 overflow-x-auto rounded-lg border border-line bg-white p-6">
              <SignaturePreview data={sanitized} />
            </div>

            <button
              type="button"
              onClick={handleCopy}
              disabled={!isValid}
              className="btn-accent w-full justify-center rounded-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:gap-2"
            >
              {copied ? (
                <Check size={18} aria-hidden="true" />
              ) : (
                <Copy size={18} aria-hidden="true" />
              )}
              {copied
                ? "Copiado!"
                : isValid
                  ? "Copiar assinatura"
                  : "Corrija os campos para copiar"}
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle style={cardTitleStyle} className="text-base font-bold">
              Como colar mantendo a formatação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-4 text-sm leading-relaxed text-ink-muted">
              <li>
                <span className="font-semibold text-ink">Gmail:</span>{" "}
                Configurações → Ver todas as configurações → Geral → Assinatura
                → cole o conteúdo com{" "}
                <kbd className="rounded border border-line-strong px-1.5 py-0.5 text-xs">
                  Ctrl+V
                </kbd>{" "}
                dentro do editor de assinatura.
              </li>
              <li>
                <span className="font-semibold text-ink">Outlook:</span> Arquivo
                → Opções → Email → Assinaturas → crie uma nova assinatura e cole
                com{" "}
                <kbd className="rounded border border-line-strong px-1.5 py-0.5 text-xs">
                  Ctrl+V
                </kbd>{" "}
                no campo de edição.
              </li>
              <li>
                O botão &ldquo;Copiar assinatura&rdquo; copia tanto o conteúdo
                formatado quanto uma versão em texto simples — ao colar com
                Ctrl+V em um campo que aceita rich text, a formatação (cores,
                negrito e o ícone com suas iniciais) é preservada
                automaticamente.
              </li>
            </ul>
          </CardContent>
        </Card>
      </MotionSection>
    </div>
  );
}
