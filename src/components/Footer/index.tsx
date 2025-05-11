const Footer = () => {
  return (
    <footer className="px-6 py-3 flex flex-col md:flex-row items-center justify-center md:justify-evenly gap-3 bg-secondary/50 text-sm">
      <span>Desenvolvido por Matheus Kerscher</span>

      <span>&copy; {new Date().getFullYear()}</span>
    </footer>
  );
};

export default Footer;
