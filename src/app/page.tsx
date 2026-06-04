import HeroSection from "./components/hero-section";
import AboutSection from "./components/about-section";
import ProjectsSection from "./components/projects-section";
import CurriculumSection from "./components/curriculum-section";
import ContactSection from "./components/contact-section";

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ProjectsSection />
      <CurriculumSection />
      <ContactSection />
    </>
  );
}
