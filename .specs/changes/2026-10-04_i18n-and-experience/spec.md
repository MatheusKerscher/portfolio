# Spec — Experience from LinkedIn, and the site in Brazilian Portuguese and English

## Problem

- **The experience is out of date.** The site shows CWB Tecnologia as the current employer ("Mai 2024 —
  Presente") and says "mais de 3 anos de experiência". The requester's LinkedIn profile, exported on
  2026-10-04, shows that job ended in June 2026, a new one at Coopers Digital started then, and the
  first job started in February 2022, more than four years ago. The JSON-LD (`worksFor`) and `llms.txt`
  repeat the stale facts.
- **The site exists in one language.** Every visible string, the metadata, the JSON-LD and `llms.txt`
  are in Brazilian Portuguese. A recruiter or client who does not read Portuguese has no version to
  read, and search engines have no English page to serve.
- **The copy is not separable from the facts.** `src/app/data/site.ts` holds language-neutral facts
  (URLs, the email, icons) and Portuguese copy in the same objects, and Client Components import it
  directly, so a second language cannot be added without restructuring it.
- **`/email-signature` is no longer wanted.** The requester asked for the page to be removed.

## Expected outcome

The home page exists at `/` in Brazilian Portuguese and at `/en` in English, with the same content and
behaviour, the career data of the LinkedIn profile, a language switch in the navbar, and metadata that
tells search engines and AI assistants which version is which.

## Scope

1. **Remove `/email-signature`**: the route, its form and template, `src/components/ui/card.tsx` and
   the `zod` dependency, which only it used. The URL redirects to `/`.
2. **Experience from the LinkedIn profile**: the four jobs and the degree of the exported profile, and
   every fact derived from them (current employer, years of experience, summary, technologies named in
   metadata).
3. **Two languages** without an i18n library: the route `app/[lang]`, typed TypeScript dictionaries and
   `next/root-params`, as the internationalization guide bundled with Next 16.3.8 describes. Portuguese
   stays at `/`; English is at `/en`.
4. **Everything visible is translated**: the five sections, the navbar, the footer, the 8-bit mode
   labels, the Inspector, the metadata, the JSON-LD, the Open Graph image and `llms.txt`.
5. **A language switch** in the navbar that works without JavaScript and keeps the current section.
6. **Anchors in English, the same in both languages**: `#about`, `#projects`, `#experience`,
   `#contact`.
7. **SEO and GEO per language**: canonical, `hreflang` alternates with `x-default`, the sitemap, the
   JSON-LD and one `llms.txt` per language.

## Out of scope

- **Automatic language detection**, by `Accept-Language` or a cookie. It needs a proxy that runs on
  every request and a redirect on the home page, which PageSpeed measures in English. The visitor and
  the search engine choose.
- **New technology cards.** The profile names React Native, Vue, Nuxt, NestJS, PHP and WordPress. They
  go into the text and the metadata; a card needs an icon asset, and the carousel stays at nine cards.
- **The number of clients** ("8+"). It is not in the profile and stays until the requester changes it.
- **A localized 404 page.** The site has no custom 404 today.
- **Compatibility for the old Portuguese anchors.** A link to `/#projetos` opens the top of the page.
- **A third language.** Adding one is a dictionary file and a row in the locale table.

## Acceptance criteria

- [ ] `npm ci` succeeds without `--force` or `--legacy-peer-deps`, and `npm ls` reports no `invalid`.
- [ ] `npm run lint:eslint:check`, `npm run lint:prettier:check`, `npm run build` and `npm run test:e2e`
      exit 0.
- [ ] **Routes:** `/` and `/en` answer 200 and are prerendered (listed as static or SSG by the build);
      `/pt` and `/email-signature` answer 308 with `Location: /`; `/llms.txt` and `/en/llms.txt` answer
      200; an unknown path answers 404.
- [ ] **Language of each page:** `<html lang>` is `pt-BR` at `/` and `en` at `/en`.
- [ ] **Nothing is left untranslated:** no string of the Portuguese dictionary whose English counterpart
      differs appears in the text of `/en`, with the Inspector open as well; and
      `grep -rnE "[áéíóúâêôãõç]" src` matches only the Portuguese dictionaries and proper names.
- [ ] **The dictionaries cannot drift:** removing a key from `en.ts` makes `npm run build` fail with a
      type error.
- [ ] **Language switch:** in both languages and in the five projects, it leads to the other language,
      keeps the fragment of the current section, and marks the current language with `aria-current`.
      It works with JavaScript disabled.
- [ ] **Anchors:** the slots are `hero`, `about`, `projects`, `experience` and `contact` in both
      languages, and no source or test file refers to the old ids.
- [ ] **Experience:** the timeline shows the four jobs of the profile in its order, with Coopers Digital
      as the current one and CWB Tecnologia ended in June 2026; the JSON-LD `worksFor` is Coopers
      Digital; the years of experience are computed from February 2022.
- [ ] **SEO:** each page has its own canonical, `hreflang` links for `pt-BR`, `en` and `x-default`
      that are the same on both pages, and `og:locale`. The sitemap lists both URLs with their
      alternates. Each page has one JSON-LD graph with `inLanguage` of its language and the same
      `@id` for the person.
- [ ] **Only one email address is published** in `/`, `/en` and both `llms.txt`, and no phone number.
- [ ] **Accessibility:** axe reports no violation at `/en` in the four modes (light and dark, normal and
      8-bit).
- [ ] **Layout:** at `/en`, every panel fits below the navbar at 1512×749 and 1366×641 in both skins,
      and the page does not scroll sideways at 320 px.
- [ ] **Performance:** `npm run audit` reports a median of at least 95 in every category for `/` and
      for `/en`, mobile and desktop, and the script bytes transferred are not above the 197.9 KB of
      `1379c8b`.

## Requester decisions

| Decision                 | Choice                                                                                                                              | When       |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Source of the experience | The LinkedIn profile exported as PDF; LinkedIn itself answers HTTP 999 without a session                                            | 2026-10-04 |
| i18n approach            | No library: `app/[lang]`, typed dictionaries, `next/root-params`. `next-intl` was offered and not chosen                            | 2026-10-04 |
| URLs                     | Portuguese stays at `/`, English at `/en`; a switch and `hreflang`. A hint for other browser languages and a redirect were declined | 2026-10-04 |
| Branch                   | Everything on `feat/layout-redesign`; a separate branch was proposed and declined                                                   | 2026-10-04 |
| Email signature page     | Deleted                                                                                                                             | 2026-10-04 |
| Anchors                  | The same in both languages, in English                                                                                              | 2026-10-04 |

Defaults stated in the approved plan, which the requester did not change: `#experience` as the anchor of
the timeline; `/email-signature` redirects to `/`; the role is "Full-Stack Software Engineer" in English
and stays "Desenvolvedor FullStack" in Portuguese; job titles stay in English in both languages, as on
LinkedIn; the phone number of the profile is not published and the PDF is not committed.

## Dependencies and blockers

- The requester reviews the Portuguese and English copy and the timeline after delivery. It does not
  block the work: every string is in two files.
- The LinkedIn profile links to `www.kerscher.dev.br`; the canonical host is the apex. The requester
  changes the link when the Vercel primary domain is switched (rollout of the layout redesign spec).
