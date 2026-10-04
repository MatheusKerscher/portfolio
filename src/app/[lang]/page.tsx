import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/metadata";
import AboutSection from "../components/about-section";
import ContactSection from "../components/contact-section";
import CurriculumSection from "../components/curriculum-section";
import HeroSection from "../components/hero-section";
import JsonLd from "../components/json-ld";
import ProjectsSection from "../components/projects-section";
import StackController from "../components/stack-controller";
import { hasLocale } from "../data/locales";
import { sections } from "../data/site";

export async function generateMetadata({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return pageMetadata(lang);
}

/**
 * Each section is a panel inside a slot. The slot is the anchor target (`#projects`), because it
 * stays in normal flow while its panel is pinned. The stack starts below the fixed navbar.
 */
export default function Home() {
  return (
    <>
      <JsonLd />
      <StackController />
      <div className="stack">
        <div id={sections.hero} className="stack-slot">
          <HeroSection />
        </div>
        <div id={sections.about} className="stack-slot">
          <AboutSection />
        </div>
        <div id={sections.projects} className="stack-slot">
          <ProjectsSection />
        </div>
        <div id={sections.experience} className="stack-slot">
          <CurriculumSection />
        </div>
        <div id={sections.contact} className="stack-slot">
          <ContactSection />
        </div>
      </div>
    </>
  );
}
