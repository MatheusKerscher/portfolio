import { pageMetadata } from "@/lib/metadata";
import AboutSection from "./components/about-section";
import ContactSection from "./components/contact-section";
import CurriculumSection from "./components/curriculum-section";
import HeroSection from "./components/hero-section";
import JsonLd from "./components/json-ld";
import ProjectsSection from "./components/projects-section";

export const metadata = pageMetadata({ path: "/" });

export default function Home() {
  return (
    <>
      <JsonLd />
      <HeroSection />
      <AboutSection />
      <ProjectsSection />
      <CurriculumSection />
      <ContactSection />
    </>
  );
}
