import type { InspectorDictionary } from "./index";

/** The copy of the Inspector in English. */
const en = {
  toggle: "Site inspector",
  title: "Inspector",
  intro:
    "This site audits itself live. The numbers below were measured just now, in your browser.",
  close: "Close inspector",
  tabs: {
    performance: "Performance",
    accessibility: "Accessibility",
    seo: "SEO & GEO",
    code: "Code",
  },
  vitals: {
    heading: "Core Web Vitals of this visit",
    waiting: "waiting",
    waitingForInput: "interact with the page",
    unsupported: "not supported in this browser",
    ratings: {
      good: "good",
      "needs-improvement": "needs improvement",
      poor: "poor",
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
    heading: "Weight of this page",
    requests: "requests",
    transferred: "transferred",
    script: "of JavaScript",
    cached: "Nothing was transferred just now: the page came from the cache.",
  },
  lab: {
    heading: "Lighthouse in the lab",
    mobile: "Mobile",
    desktop: "Desktop",
    categories: {
      performance: "Performance",
      accessibility: "Accessibility",
      bestPractices: "Best practices",
      seo: "SEO",
    },
    note: (run: {
      runs: number;
      version: string;
      date: string;
      commit: string;
      latency: number;
    }) =>
      `Median of ${run.runs} runs of Lighthouse ${run.version} on ${run.date}, at commit ${run.commit}, with ${run.latency} ms of latency per response.`,
  },
  overlays: {
    heading: "Highlight on the page",
    landmarks: "Landmarks",
    headings: "Headings",
    focus: "Focus order",
  },
  contrast: {
    heading: "Palette contrast, read from the CSS of this page",
    on: "on",
    minimum: "minimum",
    pass: "passes",
    fail: "fails",
  },
  preferences: {
    heading: "Your preferences",
    reducedMotion: "Reduced motion",
    theme: "Theme",
    skin: "Skin",
    on: "on",
    off: "off",
    light: "light",
    dark: "dark",
    normal: "normal",
    pixel: "8-bit",
  },
  seo: {
    heading: "What search engines and AIs read",
    title: "Title",
    description: "Description",
    canonical: "Canonical",
    language: "Language",
    structured: "Structured data (JSON-LD)",
    none: "none on this page",
    files: "Files for search engines and AIs",
  },
  code: {
    heading: "How it was built",
    stack: "Stack, as declared in package.json",
    repository: "Repository",
    spec: "Project specifications",
    commit: "Deployed commit",
  },
} satisfies InspectorDictionary;

export default en;
