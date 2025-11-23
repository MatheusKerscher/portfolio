const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-gray-300 text-sm select-none">
      <div className="w-screen max-w-6xl mx-auto flex flex-wrap gap-4 justify-between p-3 lg:px-1">
        <p>&copy; {currentYear}</p>
        <p>Feito com ❤️ por Matheus Kerscher</p>
      </div>
    </footer>
  );
};

export default Footer;
