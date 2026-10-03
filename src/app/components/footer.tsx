import { GithubIcon, LinkedinIcon } from "./social-icons";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border px-6 py-8 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-gray dark:text-neutral-400">
          &copy; {currentYear} Matheus Kerscher
        </p>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com/MatheusKerscher"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray transition-colors duration-200 hover:text-black dark:text-neutral-400 dark:hover:text-white"
            aria-label="GitHub de Matheus Kerscher"
            title="GitHub"
          >
            <GithubIcon size={18} />
          </a>
          <a
            href="https://www.linkedin.com/in/matheus-kerscher/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray transition-colors duration-200 hover:text-black dark:text-neutral-400 dark:hover:text-white"
            aria-label="LinkedIn de Matheus Kerscher"
            title="LinkedIn"
          >
            <LinkedinIcon size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
