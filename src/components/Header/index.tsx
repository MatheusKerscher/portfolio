const Header = () => {
  return (
    <header className="fixed top-6 flex justify-center w-full select-none">
      <div className="p-3 rounded-4xl flex gap-3 justify-between items-center flex-wrap w-11/12 md:w-5/12 lg:w-4/12 z-10 backdrop-blur-lg bg-secondary/10">
        <span className="hidden md:block text-green font-semibold">
          {"<Matheus/>"}
        </span>

        <span className="block md:hidden text-green font-semibold">
          {"</>"}
        </span>

        <nav>
          <ul className="flex gap-3">
            <li className="cursor-pointer duration-200 hover:font-medium">
              Projetos
            </li>
            
            <li className="cursor-pointer duration-200 hover:font-medium">
              Contato
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
