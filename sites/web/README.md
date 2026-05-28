# sites/web

The public site at `react-call.desko.dev` — Astro, React islands,
Tailwind v4, Expressive Code. See
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

The existing Vercel project that serves `react-call.desko.dev` is
reconfigured in place to deploy this site instead of `sites/demo`.
There is no second project and no separate demo subdomain — the new
site replaces the old at the same URL.

### Switchover

In the Vercel dashboard, on the existing `react-call` project:

1. **Settings → General → Root Directory** → change from the repo
   root to `sites/web`. Vercel will pick up `sites/web/vercel.json`
   (framework: astro, corepack enabled so pnpm 11 is available).
2. **Settings → General → Install Command** → leave at default
   (`pnpm install --frozen-lockfile`). Runs from `sites/web/` but
   pnpm walks up to the workspace root and installs every package.
3. **Settings → General → Build Command** → leave at default
   (`pnpm run build`).
4. **Output Directory** → leave at default — Astro writes to `dist`.
5. Trigger a redeploy.

`sites/demo` stays in the repo as an archive (decision 11) but is no
longer deployed. The repo-root `vercel.json` becomes irrelevant once
the project's Root Directory moves into `sites/web/` — it can be
deleted in the same PR or whenever convenient.
