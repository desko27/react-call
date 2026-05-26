# Examples are live React islands by default, with Sandpack opened on demand

Every example in the gallery at `sites/web` is a real React component (`src/content/examples/<slug>/index.tsx`) mounted as an Astro island on its detail page — the visitor interacts with the actual Callable, not a recording or a static screenshot. A "Open in playground" button lazily mounts Sandpack in a modal for the minority of visitors who want to edit code; the default page-load has zero in-browser bundler overhead. The same `index.tsx` source is both executed (as an island) and displayed (imported as `?raw` into the Expressive Code block), so the rendered demo and the shown code are guaranteed to be the same artifact.

## Considered options

- **Sandpack on every example page.** `@codesandbox/sandpack-react` mounted always-on. Rejected: a Sandpack instance is ~250 KB gzip and boots an in-browser bundler — a gallery index page with 12 mini-previews would ship multiple megabytes and crawl on first paint. The editability is not worth the cost when 90% of visitors only want to see the example behave.
- **StackBlitz WebContainers.** A full Node.js + Vite in the browser. Rejected: heavier than Sandpack, slower to boot, and overkill — no example in this library needs npm installs or a real Vite dev server. The compute model is wrong for the content shape.
- **Static screenshots / videos.** Cheapest. Rejected outright: the library's pitch is "your component is something you can `await`", and showing a screenshot of a dialog instead of a real `.call()` undercuts the entire mental model the site exists to transmit.
- **Live islands with no editor at all.** Rejected as the only option: a meaningful subset of visitors (the ones already past the "what is this" phase) want to poke the code. Closing that door entirely makes the site feel like a brochure.
- **Live islands by default + Sandpack on demand (chosen).** Island islands ship zero bundler runtime; the Sandpack modal is dynamically imported only when the visitor clicks "Open in playground". Bridges the cost/editability trade-off without compromise on either side.

## Consequences

- **Each example is a folder, not a file.** `src/content/examples/<slug>/` holds `index.tsx` (the runnable component and its trigger), `meta.ts` (typed metadata: `title`, `category`, `behaviors[]`, `tags[]`, `description`), and optionally `notes.mdx` (long-form prose for when-to-use / gotchas). The folder-per-example pattern is enforced by Astro's content collection schema with Zod.
- **The detail page renders the source of truth twice: once executed, once shown.** Both come from the same `index.tsx` — the island uses the default export, Expressive Code uses the `?raw` import. There is no separate "code snippet" file to keep in sync.
- **Code is presented as two labeled blocks** (`The Callable` / `The caller`), not one merged snippet or tabs. This is a deliberate pedagogical choice that mirrors the library's separation between declaration site and caller scope; collapsing them would undermine the mental model the gallery is built to transmit.
- **The Sandpack modal is lazy-loaded.** The Sandpack module is dynamically imported on the click of "Open in playground" — no Sandpack JS lands in any bundle on initial page load. Visitors who never click pay zero.
- **Examples are filtered, not searched.** A local input over `getCollection('examples')` + chips for `category` (UI pattern) + multi-select pills for `behaviors` (Upsert, MutationFlow, Nested, Update). No server, no Pagefind, no Algolia at this scale. See [ADR-0017](0017-public-site-on-plain-astro-not-starlight.md).
- **Adding an example is two-file minimum.** `mkdir <slug>/ && touch index.tsx meta.ts` puts a new card in the gallery automatically via the content collection. `notes.mdx` is opt-in for examples that warrant prose.
- **HMR for islands works as in any Astro+React project.** Edits to `index.tsx` hot-update the rendered island in dev. The Sandpack modal is its own isolated runtime — saves there are scoped to the modal session and not persisted.
