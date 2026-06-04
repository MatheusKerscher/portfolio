import { Github, Linkedin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border px-6 lg:px-8 py-8">
      <div className="max-w-6xl mx-auto flex flex-wrap gap-4 items-center justify-between">
        <p className="text-sm text-gray">
          &copy; {currentYear} Matheus Kerscher
        </p>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com/MatheusKerscher"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray hover:text-black transition-colors duration-200"
            aria-label="GitHub de Matheus Kerscher"
            title="GitHub"
          >
            <Github size={18} aria-hidden="true" />
          </a>
          <a
            href="https://www.linkedin.com/in/matheus-kerscher/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray hover:text-black transition-colors duration-200"
            aria-label="LinkedIn de Matheus Kerscher"
            title="LinkedIn"
          >
            <Linkedin size={18} aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
