/**
 * The copy of the Inspector in Brazilian Portuguese. It is apart from the main dictionary
 * because the Inspector panel, a lazy client chunk, is the only code that imports it.
 */
const pt = {
  toggle: "Inspetor do site",
  title: "Inspetor",
  intro:
    "Este site se audita ao vivo. Os números abaixo foram medidos agora, no seu navegador.",
  close: "Fechar inspetor",
  tabs: {
    performance: "Performance",
    accessibility: "Acessibilidade",
    seo: "SEO & GEO",
    code: "Código",
  },
  vitals: {
    heading: "Core Web Vitals desta visita",
    waiting: "aguardando",
    waitingForInput: "interaja com a página",
    unsupported: "não suportado neste navegador",
    ratings: {
      good: "bom",
      "needs-improvement": "precisa melhorar",
      poor: "ruim",
    },
    names: {
      LCP: "Largest Contentful Paint",
      CLS: "Cumulative Layout Shift",
      INP: "Interaction to Next Paint",
      FCP: "First Contentful Paint",
      TTFB: "Time to First Byte",
    },
  },
  weight: {
    heading: "Peso desta página",
    requests: "requisições",
    transferred: "transferidos",
    script: "de JavaScript",
    cached: "Nada foi transferido agora: a página veio do cache.",
  },
  lab: {
    heading: "Lighthouse em laboratório",
    mobile: "Mobile",
    desktop: "Desktop",
    categories: {
      performance: "Performance",
      accessibility: "Acessibilidade",
      bestPractices: "Boas práticas",
      seo: "SEO",
    },
    note: (run: {
      runs: number;
      version: string;
      date: string;
      commit: string;
      latency: number;
    }) =>
      `Mediana de ${run.runs} execuções do Lighthouse ${run.version} em ${run.date}, no commit ${run.commit}, com ${run.latency} ms de latência por resposta.`,
  },
  overlays: {
    heading: "Destacar na página",
    landmarks: "Landmarks",
    headings: "Títulos",
    focus: "Ordem de foco",
  },
  contrast: {
    heading: "Contraste da paleta, lido do CSS desta página",
    on: "sobre",
    minimum: "mínimo",
    pass: "passa",
    fail: "falha",
  },
  preferences: {
    heading: "Suas preferências",
    reducedMotion: "Movimento reduzido",
    theme: "Tema",
    skin: "Skin",
    on: "ativo",
    off: "inativo",
    light: "claro",
    dark: "escuro",
    normal: "normal",
    pixel: "8-bit",
  },
  seo: {
    heading: "O que buscadores e IAs leem",
    title: "Título",
    description: "Descrição",
    canonical: "Canônico",
    language: "Idioma",
    structured: "Dados estruturados (JSON-LD)",
    none: "nenhum nesta página",
    files: "Arquivos para buscadores e IAs",
  },
  code: {
    heading: "Como foi construído",
    stack: "Stack, como declarada no package.json",
    repository: "Repositório",
    spec: "Especificações do projeto",
    commit: "Commit publicado",
  },
};

export default pt;
