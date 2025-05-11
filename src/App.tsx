import ScrollToTop from "react-scroll-to-top";
import AboutMe from "./components/AboutMe";
import Contact from "./components/Contact";
import Header from "./components/Header";
import Projects from "./components/Projects";
import { GoMoveToTop } from "react-icons/go";
import { useRef } from "react";
import Footer from "./components/Footer";

function App() {
  const projectsSectionRef = useRef<HTMLElement>(null!)
  const contactSectionRef = useRef<HTMLElement>(null!)

  return (
    <>
      <Header 
        projectsSectionRef={projectsSectionRef}
        contactSectionRef={contactSectionRef}
      />
      <AboutMe />
      <Projects  elementRef={projectsSectionRef}/>
      <Contact elementRef={contactSectionRef}/>

      <Footer />

      <ScrollToTop
        smooth
        component={<GoMoveToTop size={24} color="#ffffff" />}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "none",
          borderRadius: "50%",
          padding: "8px",
          backgroundColor: "#84b456",
          right: 10,
          bottom: 10
        }}
      />
    </>
  );
}

export default App;
