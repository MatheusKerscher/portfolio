import { Typewriter } from "react-simple-typewriter";

const typewriterWords = ["Programação", "Tecnologia", "Inovação"];

const AboutMe = () => {
  return (
    <main className="h-screen flex flex-col items-center justify-center">
      <img src="/src/assets/images/about-me-cartoon.png" alt="Matheus Kerscher estilo cartoon" className="h-2/12 rounded-full"/>

      <h1 className="text-green text-center font-bold text-4xl md:text-5xl mt-4">
        Matheus Kerscher
      </h1>

      <p className="text-primary text-center font-medium text-lg md:text-xl my-4">
        Desenvolvedor FrontEnd
      </p>

      <p className="text-secondary text-center text-sm md:text-base">
        Apaixonado por{" "}
        <span className="text-green font-bold">
          <Typewriter words={typewriterWords} loop={false} cursor={true} />
        </span>
      </p>
    </main>
  );
};

export default AboutMe;
