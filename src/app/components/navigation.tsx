"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const Navigation = () => {
  const currentPath = usePathname();

  return (
    <nav className="mb-3">
      <ul className="flex gap-3 justify-center md:justify-start">
        <li>
          <Link
            href="/"
            className={`button-nav ${currentPath === "/" ? "button-nav-active" : ""}`}
          >
            Projetos
          </Link>
        </li>

        <li>
          <Link
            href="/curriculum"
            className={`button-nav ${currentPath === "/curriculum" ? "button-nav-active" : ""}`}
          >
            Currículo
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
