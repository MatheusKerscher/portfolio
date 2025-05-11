import type { RefObject } from "react";

type HeaderProps = {
  projectsSectionRef: RefObject<HTMLElement>;
  contactSectionRef: RefObject<HTMLElement>;
};

const Header = ({ projectsSectionRef, contactSectionRef }: HeaderProps) => {
  return (
    <header className="fixed top-6 flex justify-center w-full select-none z-[99]">
      <div className="p-3 rounded-4xl flex gap-3 justify-between items-center flex-wrap w-11/12 md:w-5/12 lg:w-4/12 backdrop-blur-lg bg-secondary/15">
        <span className="hidden md:block text-green font-semibold text-lg">
          {"<Matheus/>"}
        </span>

        <span className="block md:hidden text-green font-semibold text-lg">
          {"</>"}
        </span>

        <nav>
          <ul className="flex gap-3 text-primary">
            <li
              className="cursor-pointer duration-200 hover:font-medium"
              onClick={() =>
                projectsSectionRef.current.scrollIntoView({
                  behavior: "smooth",
                })
              }
            >
              Projetos
            </li>

            <li
              className="cursor-pointer duration-200 hover:font-medium"
              onClick={() =>
                contactSectionRef.current.scrollIntoView({
                  behavior: "smooth",
                })
              }
            >
              Contato
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
