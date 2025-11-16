import Image from "next/image";

import { MapPin } from "lucide-react";

const Header = () => {
  return (
    <header className="mb-3 lg:mb-0 flex flex-col items-center lg:items-start">
      <Image
        src="/profile-photo.jpg"
        alt="Matheus Kerscher sorrindo"
        width={180}
        height={180}
        className="rounded-full"
      />

      <section className="my-4">
        <h1 className="text-center lg:text-start font-bold text-xl md:text-2xl lg:text-3xl">
          Matheus Kerscher
        </h1>

        <p className="text-center lg:text-start font-semibold text-gray-500 md:text-lg">
          Desenvolvedor FullStack
        </p>
      </section>

      <section className="text-gray-500 mt-4">
        <ul>
          <li className="flex gap-1">
            <MapPin size={20} />

            <span>PR, Brasil</span>
          </li>
        </ul>
      </section>
    </header>
  );
};

export default Header;
