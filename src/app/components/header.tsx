import Image from "next/image";

import { Github, Linkedin, Mail, MapPin, Instagram } from "lucide-react";

const Header = () => {
  return (
    <header className="mb-10 lg:mb-0 flex flex-col items-center lg:items-start">
      <Image
        src="/profile-photo.jpg"
        alt="Matheus Kerscher sorrindo"
        width={180}
        height={180}
        className="rounded-full"
        priority
      />

      <section className="my-4">
        <h1 className="text-center lg:text-start font-bold text-xl md:text-2xl lg:text-3xl">
          Matheus Kerscher
        </h1>

        <p className="text-center lg:text-start font-semibold text-gray md:text-lg">
          Desenvolvedor FullStack
        </p>
      </section>

      <section className="text-gray mt-4 not-md:text-sm">
        <ul className="flex flex-col gap-2 items-center lg:items-start">
          <li className="social-media-item">
            <MapPin size={20} />

            <span>PR, Brasil</span>
          </li>

          <li>
            <a
              className="social-media-item tag-link"
              target="_blank"
              href="mailto:matheuskerscher@outlook.com"
              title="E-mail"
            >
              <Mail size={20} />

              <span>matheuskerscher@outlook.com</span>
            </a>
          </li>

          <li>
            <a
              className="social-media-item tag-link"
              target="_blank"
              href="https://www.linkedin.com/in/matheus-kerscher/"
              title="LinkedIn"
            >
              <Linkedin size={18} color="#0b65c3" />

              <span>in/matheus-kerscher</span>
            </a>
          </li>

          <li>
            <a
              className="social-media-item tag-link"
              target="_blank"
              href="https://github.com/MatheusKerscher"
              title="GitHub"
            >
              <Github size={20} color="#171717" />

              <span>MatheusKerscher</span>
            </a>
          </li>

          <li>
            <a
              className="social-media-item tag-link"
              target="_blank"
              href="https://www.instagram.com/matheuskerscher/"
              title="Instagram"
            >
              <Instagram size={20} color="#dd2a7b" />

              <span>MatheusKerscher</span>
            </a>
          </li>
        </ul>
      </section>

      <div className="w-full border-t border-border my-5"></div>

      <section className="">
        <h2 className="font-bold text-gray text-center lg:text-start">
          Principais stacks
        </h2>

        <div className="flex flex-wrap gap-4 mt-3 justify-center lg:justify-start">
          <span className="stack-icon-container" title="Git">
            <Image
              src="/git.svg"
              alt="NextJS logo"
              width={26}
              height={26}
              className="rounded-full"
              priority
            />
          </span>

          <span className="stack-icon-container" title="Next JS">
            <Image
              src="/nextjs.svg"
              alt="NextJS logo"
              width={26}
              height={26}
              className="rounded-full"
              priority
            />
          </span>

          <span className="stack-icon-container" title="React">
            <Image
              src="/react.svg"
              alt="NextJS logo"
              width={26}
              height={26}
              className="rounded-full"
              priority
            />
          </span>

          <span className="stack-icon-container" title="Tailwind CSS">
            <Image
              src="/tailwindcss.svg"
              alt="NextJS logo"
              width={26}
              height={26}
              className="rounded-full"
              priority
            />
          </span>

          <span className="stack-icon-container" title="Node JS">
            <Image
              src="/nodejs.svg"
              alt="NextJS logo"
              width={26}
              height={26}
              className="rounded-full"
              priority
            />
          </span>

          <span className="stack-icon-container" title="TypeScript">
            <Image
              src="/typescript.svg"
              alt="NextJS logo"
              width={26}
              height={26}
              className="rounded-full"
              priority
            />
          </span>

          <span className="stack-icon-container" title="JavaScript">
            <Image
              src="/javascript.svg"
              alt="NextJS logo"
              width={26}
              height={26}
              className="rounded-full"
              priority
            />
          </span>

          <span className="stack-icon-container" title="HTML 5">
            <Image
              src="/html.svg"
              alt="NextJS logo"
              width={20}
              height={20}
              priority
            />
          </span>

          <span className="stack-icon-container" title="CSS 3">
            <Image
              src="/css.svg"
              alt="NextJS logo"
              width={20}
              height={20}
              priority
            />
          </span>
        </div>
      </section>
    </header>
  );
};

export default Header;
