import { Typewriter } from "react-simple-typewriter";
import { floatIconList } from "./floatIcon.data";
import FloatIcon from "./FloatIcon";

const typewriterWords = ["Programação", "Tecnologia", "Inovação", "IA"];

const AboutMe = () => {
  return (
    <main className="h-screen flex flex-col items-center justify-center">
      {floatIconList.map((icon) => (
        <FloatIcon key={icon.cover} {...icon} />
      ))}

      <img
        src="images/about-me-cartoon.png"
        alt="Matheus Kerscher estilo cartoon"
        className="h-2/12 rounded-full z-[98]"
      />

      <h1 className="text-green text-center font-bold text-4xl md:text-6xl mt-4 z-[98]">
        Matheus Kerscher
      </h1>

      <p className="text-primary text-center font-medium text-lg md:text-2xl my-4 z-[98]">
        Desenvolvedor FrontEnd
      </p>

      <p className="text-secondary text-center text-sm md:text-lg z-[98]">
        Apaixonado por{" "}
        <span className="text-green font-bold">
          <Typewriter words={typewriterWords} loop={false} cursor={true} cursorColor="#707070"/>
        </span>
      </p>
    </main>
  );
};

export default AboutMe;
