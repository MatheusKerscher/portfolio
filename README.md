# Portfolio

Personal portfolio of Matheus Kerscher, FullStack developer. The site presents the technologies I work
with, selected projects, my professional experience and ways to get in touch. It is live at
[kerscher.dev.br](https://kerscher.dev.br).

![Portfolio thumbnail](public/thumbnails/thumbnail.png)

## Stack

- [Next.js](https://nextjs.org) 16 (App Router, Turbopack) and [React](https://react.dev) 19
- [TypeScript](https://www.typescriptlang.org) 6
- [Tailwind CSS](https://tailwindcss.com) 4, with [shadcn/ui](https://ui.shadcn.com) components on
  [Radix UI](https://www.radix-ui.com)
- [Framer Motion](https://www.framer.com/motion) 14 for animations and [Lenis](https://lenis.darkroom.engineering)
  for smooth scrolling
- [next-themes](https://github.com/pacocoursey/next-themes) for the light and dark themes
- [Zod](https://zod.dev) 4 for validation

## Getting started

Prerequisites: [Node.js](https://nodejs.org) 22 (`lts/jod`, pinned in [.nvmrc](.nvmrc)) and npm.

```sh
git clone https://github.com/MatheusKerscher/portfolio.git
cd portfolio
npm install
npm run dev
```

The site is served at <http://localhost:3000>.

## Scripts

| Script                        | What it does                                   |
| ----------------------------- | ---------------------------------------------- |
| `npm run dev`                 | Starts the development server                  |
| `npm run build`               | Builds for production, including type checking |
| `npm start`                   | Serves the production build                    |
| `npm run lint:eslint:check`   | Runs ESLint                                    |
| `npm run lint:prettier:check` | Checks formatting with Prettier                |
| `npm run lint:prettier:fix`   | Formats the code with Prettier                 |
| `npm run commit`              | Opens the Commitizen prompt for a commit       |
| `npm run update-dependencies` | Interactively updates dependencies             |

## Project structure

```
src/
├── app/
│   ├── components/        page sections and site-specific components
│   ├── data/              content: projects and curriculum
│   ├── email-signature/   email signature generator page
│   ├── layout.tsx         root layout, fonts and metadata
│   └── page.tsx           home page
├── components/ui/         shadcn/ui components
└── lib/                   shared utilities
public/                    static assets
.specs/                    specifications for work in flight
```

## Contributing

Commits follow [Conventional Commits](https://www.conventionalcommits.org) and are checked by commitlint
on every commit and pull request. Pull requests also run ESLint and Prettier.

Work starts as a specification before any code is written. The process is described in
[.specs/README.md](.specs/README.md).

## License

[MIT](LICENSE)
