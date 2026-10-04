export type Thumbnail = { src: string; width: number; height: number };

/** The 8-bit version of a thumbnail, written by `scripts/pixel-assets.mjs`. */
export const pixelThumbnail = (thumbnail: Thumbnail) =>
  thumbnail.src.replace("/thumbnails/", "/thumbnails/8bit/");

export type ProjectId =
  "to-do-list" | "web-carros" | "dev-controle" | "my-mock" | "cripto-currency";

/** The description of a project is copy: it is in the dictionaries, by id. */
export type Project = {
  id: ProjectId;
  title: string;
  tags: string[];
  /** Screenshot of the project, in `public/thumbnails/`, with its intrinsic size. */
  thumbnail: Thumbnail;
  websiteUrl?: string;
  repositoryUrl?: string;
};

export const projects: Project[] = [
  {
    id: "to-do-list",
    title: "To-do List",
    tags: ["Next.js", "React", "TypeScript", "Tailwind"],
    thumbnail: {
      src: "/thumbnails/thumbnail-to-do-list.png",
      width: 1500,
      height: 900,
    },
    websiteUrl: "https://coopers-front.kerscher.dev.br/",
  },
  {
    id: "web-carros",
    title: "Web Carros",
    tags: ["Next.js", "React", "TypeScript", "Tailwind"],
    thumbnail: {
      src: "/thumbnails/thumbnail-web-carros.png",
      width: 1498,
      height: 901,
    },
    websiteUrl: "https://web-carros-pi.vercel.app/",
  },
  {
    id: "dev-controle",
    title: "Dev Controle",
    tags: ["Next.js", "PostgreSQL", "TypeScript", "Tailwind"],
    thumbnail: {
      src: "/thumbnails/thumbnail-dev-controle.png",
      width: 1497,
      height: 908,
    },
    websiteUrl: "https://dev-controle-topaz.vercel.app/",
  },
  {
    id: "my-mock",
    title: "MyMock",
    tags: ["Next.js", "React", "Node.js", "TypeScript"],
    thumbnail: {
      src: "/thumbnails/thumbnail-my-mock.png",
      width: 1497,
      height: 901,
    },
    websiteUrl: "https://my-mock-ecru.vercel.app/",
  },
  {
    id: "cripto-currency",
    title: "Cripto Currency",
    tags: ["React", "API REST", "Tailwind"],
    thumbnail: {
      src: "/thumbnails/thumbnail-cripto-currency.png",
      width: 1520,
      height: 900,
    },
    websiteUrl: "https://cripto-currency-orcin.vercel.app/",
  },
];
