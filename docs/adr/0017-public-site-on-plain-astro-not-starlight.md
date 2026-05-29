# The public site is plain Astro, not Starlight

The public site at `sites/web` is built on plain Astro with hand-rolled layouts, not `@astrojs/starlight`. The site's center of gravity is a heavily visual landing page that dogfoods the library and a gallery of interactive examples, not reference prose — Starlight's opinionated docs-frame (fixed sidebar, conventional layout, typographic defaults) fights both of those, and the slice of the site that would benefit from Starlight (a small reference section) is intentionally left in the GitHub `README.md` as the canonical reference (see [ADR-0018](0018-examples-gallery-islands-with-on-demand-sandpack.md) for the gallery shape).

## Considered options

- **Starlight.** Sidebar, search (Pagefind), TOC, dark mode, i18n, content collections, MDX — all wired out of the box. Rejected: its layout primitives assume a reference-docs shape (sidebar-left + content-center + TOC-right), which actively obstructs an unconventional landing and a custom gallery grid. Escaping the frame for `/` and `/examples` while keeping it for a thin `/docs` is possible but means maintaining two parallel style systems for marginal benefit — the README already covers the reference surface that Starlight optimises for.
- **Plain Astro + hand-rolled layouts (chosen).** Maximum creative ceiling for the landing and the gallery; the pieces Starlight gives for free (sidebar nav, search, TOC, prev/next) are either not needed at this scale (≤30 pages, no Cmd+K) or trivially added later as the content grows.
- **Hybrid: Starlight under `/docs/*`, plain Astro everywhere else.** Considered as a forward-compatibility hedge. Rejected as over-engineering today: with the README as canonical reference, there is no `/docs/*` surface that justifies Starlight's machinery, and growing one later is cheaper than tearing Starlight out of an established site.

## Consequences

- **The README in the repo root stays canonical for API reference.** The site does not duplicate the reference surface; it links to GitHub for it. This preserves the npm/GitHub reading experience and avoids the divergence trap of mirrored docs.
- **No search engine in the initial build.** Page count is small enough that nav + a local filter on `/examples` covers discovery. Pagefind is reserved for if/when the corpus crosses ~50 pages.
- **No prev/next page chrome, no sidebar TOC, no built-in i18n routing.** Each is buildable in isolation if a real need surfaces. English is the only locale (`sites/web` content is monolingual).
- **The visual identity is fully owned.** Color signature, typography (Geist Sans + Geist Mono), code rendering (Expressive Code), and motion are all chosen for this site rather than inherited from a docs-frame.
- **The site is in `sites/web`, not `sites/docs`.** The directory name reflects that the site is the project's public web property (landing + gallery + a few concept pages), not a documentation site in the conventional sense. The legacy `sites/demo` is preserved in the tree as an archive and deployed separately at `demo.react-call.desko.dev`.
