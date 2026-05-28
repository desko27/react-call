# sites/web

The public docs site at `react-call.desko.dev` (post-switch) — Astro,
React islands, Tailwind v4, Expressive Code. See
[ADR-0017](../../docs/adr/0017-public-site-on-plain-astro-not-starlight.md)
and [ADR-0018](../../docs/adr/0018-examples-gallery-islands-with-on-demand-sandpack.md)
for the why.

## Develop

```sh
pnpm --filter web dev      # http://localhost:4321
pnpm --filter web build    # static output → dist/
pnpm --filter web preview  # serve the production build locally
pnpm --filter web check:types
```

## Add an example

Each gallery example is a folder under `src/examples/<slug>/` with four
files. The gallery (`/examples`), detail page (`/examples/<slug>`), and
"Open in CodeSandbox" button all pick it up automatically.

```
src/examples/<slug>/
├── callable.tsx   # the Callable: createCallable(…) + call.end(…)
├── caller.tsx     # the trigger UI: await Confirm.call(…)
├── index.tsx      # composition for the live demo (default export)
├── meta.ts        # typed metadata: title, category, behaviors, files…
└── notes.mdx      # optional prose: when to use, gotchas
```

The `files` field in `meta.ts` carries the display filenames for the
code blocks (e.g. `Confirm.tsx`) — these don't need to match the
on-disk filenames.

## Deploy (Vercel)

Per decision 17 ([grilling notes](#)), the site ships as a **second
Vercel project** alongside the existing one, so the legacy demo stays
live during development.

### One-time setup

1. Create a new Vercel project pointed at this repo.
2. **Root Directory** → `sites/web`. Vercel detects Astro and uses the
   `vercel.json` here (framework: astro, output: `dist`, corepack
   enabled so pnpm 11 is available).
3. **Install Command** → leave Vercel's default
   (`pnpm install --frozen-lockfile`). It runs from `sites/web/` but
   pnpm walks up to the workspace root and installs every package.
4. **Build Command** → leave default (`pnpm run build`).
5. Assign a preview domain — recommended `next.react-call.desko.dev`
   (aligns with the `@next` npm tag of the library).

### Switchover (when ready to make it public)

1. Move `react-call.desko.dev` from the old demo project to this one.
2. Move the old demo to `demo.react-call.desko.dev`.
3. Both moves in the same minute → zero downtime.

`sites/demo` stays in the repo as an archive (decision 11). The old
Vercel project keeps deploying it from the same root as before.
