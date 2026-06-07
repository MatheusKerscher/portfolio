"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildSignatureHtml,
  buildSignatureText,
  parseSignatureData,
  SignaturePreview,
  type SignatureData,
} from "./signature-template";

const vp = { once: true, amount: 0 } as const;
const ease = [0.19, 1, 0.22, 1] as [number, number, number, number];

const initialData: SignatureData = {
  name: "Matheus Kerscher",
  role: "Desenvolvedor FullStack",
  email: "matheuskerscher@outlook.com",
  website: "https://kerscher.dev.br",
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
  "w-full bg-transparent border border-border rounded-lg px-4 py-3 text-sm text-black dark:text-white placeholder:text-gray focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-colors duration-200";

export default function EmailSignaturePage() {
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
    <section className="py-32 px-6 lg:px-8 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <motion.p
          className="section-label"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          viewport={vp}
        >
          Ferramenta — Assinatura de email
        </motion.p>

        <motion.h1
          className="font-bold text-black dark:text-white leading-tight mb-4"
          style={{
            fontFamily: "var(--font-syne), sans-serif",
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            letterSpacing: "-0.02em",
          }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.1, ease }}
          viewport={vp}
        >
          Gerador de assinatura de email
        </motion.h1>

        <motion.p
          className="text-gray dark:text-neutral-400 text-lg leading-relaxed mb-16 max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease }}
          viewport={vp}
        >
          Preencha seus dados, veja o preview em tempo real e copie a assinatura
          pronta para colar no Gmail, Outlook ou outro cliente de email.
        </motion.p>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
            viewport={vp}
          >
            <Card>
              <CardHeader>
                <CardTitle
                  style={{ fontFamily: "var(--font-syne), sans-serif" }}
                  className="text-lg font-bold"
                >
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

                    return (
                      <label key={field.key} className="flex flex-col gap-2">
                        <span className="text-xs font-semibold tracking-widest uppercase text-gray dark:text-neutral-400">
                          {field.label}
                        </span>
                        <input
                          type={field.type}
                          value={data[field.key]}
                          placeholder={field.placeholder}
                          onChange={(e) =>
                            handleChange(field.key, e.target.value)
                          }
                          aria-invalid={Boolean(error)}
                          className={
                            error
                              ? `${inputClasses} border-destructive focus:border-destructive focus:ring-destructive/20`
                              : inputClasses
                          }
                        />
                        {error && (
                          <span className="text-xs text-destructive">
                            {error}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            className="flex flex-col gap-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease }}
            viewport={vp}
          >
            <Card>
              <CardHeader>
                <CardTitle
                  style={{ fontFamily: "var(--font-syne), sans-serif" }}
                  className="text-lg font-bold"
                >
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border bg-white dark:bg-[#1a1a1a] p-6 mb-6 overflow-x-auto">
                  <SignaturePreview data={sanitized} />
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!isValid}
                  className="btn-accent rounded-lg w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:gap-2"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
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
                <CardTitle
                  style={{ fontFamily: "var(--font-syne), sans-serif" }}
                  className="text-base font-bold"
                >
                  Como colar mantendo a formatação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-4 text-sm text-gray dark:text-neutral-400 leading-relaxed">
                  <li>
                    <span className="font-semibold text-black dark:text-white">
                      Gmail:
                    </span>{" "}
                    Configurações → Ver todas as configurações → Geral →
                    Assinatura → cole o conteúdo com{" "}
                    <kbd className="px-1.5 py-0.5 rounded border border-border text-xs">
                      Ctrl+V
                    </kbd>{" "}
                    dentro do editor de assinatura.
                  </li>
                  <li>
                    <span className="font-semibold text-black dark:text-white">
                      Outlook:
                    </span>{" "}
                    Arquivo → Opções → Email → Assinaturas → crie uma nova
                    assinatura e cole com{" "}
                    <kbd className="px-1.5 py-0.5 rounded border border-border text-xs">
                      Ctrl+V
                    </kbd>{" "}
                    no campo de edição.
                  </li>
                  <li>
                    O botão &ldquo;Copiar assinatura&rdquo; copia tanto o
                    conteúdo formatado quanto uma versão em texto simples — ao
                    colar com Ctrl+V em um campo que aceita rich text, a
                    formatação (cores, negrito e o ícone com suas iniciais) é
                    preservada automaticamente.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
