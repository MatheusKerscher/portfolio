import MotionSection from "../components/motion-section";
import SignatureForm from "./signature-form";

export default function EmailSignaturePage() {
  return (
    <section
      aria-labelledby="signature-heading"
      className="border-t border-line px-6 py-32 lg:px-8"
    >
      <div className="mx-auto max-w-5xl">
        <p className="section-label">Ferramenta — Assinatura de email</p>

        <h1
          id="signature-heading"
          className="mb-4 leading-tight font-bold text-ink"
          style={{
            fontFamily: "var(--font-syne), sans-serif",
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            letterSpacing: "-0.02em",
          }}
        >
          Gerador de assinatura de email
        </h1>

        <MotionSection delay={0.1}>
          <p className="mb-16 max-w-2xl text-lg leading-relaxed text-ink-muted">
            Preencha seus dados, veja o preview em tempo real e copie a
            assinatura pronta para colar no Gmail, Outlook ou outro cliente de
            email.
          </p>
        </MotionSection>

        <SignatureForm />
      </div>
    </section>
  );
}
