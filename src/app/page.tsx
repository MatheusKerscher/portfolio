import { pageMetadata } from "@/lib/metadata";
import AboutSection from "./components/about-section";
import ContactSection from "./components/contact-section";
import CurriculumSection from "./components/curriculum-section";
import HeroSection from "./components/hero-section";
import JsonLd from "./components/json-ld";
import ProjectsSection from "./components/projects-section";
import StackController from "./components/stack-controller";

export const metadata = pageMetadata({ path: "/" });

/**
 * Each section is a panel inside a slot. The slot is the anchor target (`#projetos`), because it
 * stays in normal flow while its panel is pinned. The stack starts below the fixed navbar.
 */
export default function Home() {
  return (
    <>
      <JsonLd />
      <StackController />
      <div className="stack">
        <div id="hero" className="stack-slot">
          <HeroSection />
        </div>
        <div id="sobre" className="stack-slot">
          <AboutSection />
        </div>
        <div id="projetos" className="stack-slot">
          <ProjectsSection />
        </div>
        <div id="curriculo" className="stack-slot">
          <CurriculumSection />
        </div>
        <div id="contato" className="stack-slot">
          <ContactSection />
        </div>
      </div>
    </>
  );
}
