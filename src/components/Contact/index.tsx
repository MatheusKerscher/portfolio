import type { RefObject } from "react";

import { FaInstagram, FaLinkedin } from "react-icons/fa6";
import { FiGithub } from "react-icons/fi";
import { HiOutlineMail } from "react-icons/hi";

type ContactProps = {
  elementRef: RefObject<HTMLElement>
}

const Contact = ({elementRef}: ContactProps) => {
  return (
    <section ref={elementRef} className="mb-6 mt-12 px-6 md:px-0">
      <h2 className="text-green text-center text-3xl md:text-4xl font-bold mb-8">
        Onde me encontrar
      </h2>

      <div className="md:mx-auto w-full md:w-4/12 lg:3/12 bg-tertiary text-primary rounded-3xl p-5 text-sm md:text-base">
        <ul>
          <li className="bg-white mb-3 p-2 rounded-lg font-medium cursor-pointer shadow duration-150 hover:shadow-md">
            <a href="mailto:matheuskerscher@outlook.com" target="_blank" rel="noopner noreferrer" className="flex justify-between">
              E-mail

              <HiOutlineMail size={24} />
            </a>
          </li>

          <li className="bg-white mb-3 p-2 rounded-lg font-medium cursor-pointer shadow duration-150 hover:shadow-md">
            <a href="https://www.linkedin.com/in/matheus-kerscher/" target="_blank" rel="noopner noreferrer" className="flex justify-between">
              LinkedIn

              <FaLinkedin size={24} color="0e76a8"/>
            </a>
          </li>

          <li className="bg-white mb-3 p-2 rounded-lg font-medium cursor-pointer shadow duration-150 hover:shadow-md">
            <a href="https://github.com/MatheusKerscher" target="_blank" rel="noopner noreferrer" className="flex justify-between">
              GitHub

              <FiGithub size={24} color="171515" />
            </a>
          </li>

          <li className="bg-white p-2 rounded-lg font-medium cursor-pointer shadow duration-150 hover:shadow-md">
            <a href="https://www.instagram.com/matheuskerscher/" target="_blank" rel="noopner noreferrer" className="flex justify-between">
              Instagram

              <FaInstagram size={24} color="ff333a"/>
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default Contact;
