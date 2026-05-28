# Test coverage as a CI ratchet gate, not an aspirational target

Coverage is measured by `@vitest/coverage-v8` configured in the root `vitest.config.ts`, with `all: true` so the percentage describes the whole `packages/*/src` runtime tree rather than only the files some test happens to import. The thresholds (`statements: 83`, `branches: 68`, `functions: 92`, `lines: 90`) are floored to the coverage measured the day this landed — a ratchet that blocks regressions without demanding new tests. It runs by folding `--coverage` into the existing `test` CI job (`pnpm test:coverage`); a threshold miss fails that job. No external service, token, or badge.

We chose a ratchet over a fixed or 100% target because the goal is to stop coverage *dropping*, the same philosophy as the `size-limit` budget (ADR-0007): a concrete number that fails CI on regression and gets tightened deliberately as the suite grows, never a goal that forces unrelated PRs to write tests to go green. `all: true` is what makes the gate honest — it immediately surfaced that `packages/react-call/src/vite/index.ts` (the `reactCall()` plugin factory) sits at 0%: only the pure `transform.ts` helper is unit-tested, and the plugin's Vite lifecycle wiring (`configResolved`, `transform`, the `serve`-gating) has no test exercising it. Without `all: true` that module would have been invisible to the percentage.

## Considered options

- **`@vitest/coverage-istanbul`.** Rejected as the default — v8 is Vitest's built-in provider, needs no babel instrumentation step, and Vitest 4 remaps it accurately to the TS/TSX sources. Revisit only if v8's branch numbers prove unreliable for this codebase's JSX.
- **A separate `coverage` CI job** (parallel to `size` / `dist-lint`, matching the one-job-per-concern pattern). Rejected because it would run the unit suite a second time for no new signal; v8's overhead on the existing `test` job is negligible, so folding it in is cheaper.
- **Fixed aspirational targets (e.g. 90/80) or a 100% gate.** Rejected: both would either fail on landing or force test-writing now. The ratchet captures today's reality and only ever moves up.
- **Default "touched files only" measurement.** Rejected — it produces a flattering number and hides an entirely-untested module (exactly the `vite/index.ts` case above) until someone writes its first test.

## Consequences

- **Thresholds are floored integers (83/68/92/90), not the exact measured values** (83.18 / 68.85 / 92.15 / 90.2). The sub-point gap is deliberate headroom for no-op refactors that shuffle statements without reducing real coverage. Bump the thresholds up — never down — as coverage grows; a downward edit should be as suspicious in review as raising a `size-limit` budget.
- **`vite/index.ts` at 0% is a known gap, not an oversight.** The ratchet locks in the current aggregate so it cannot get worse; closing the gap (a test that runs the plugin through a real Vite `transform` in `serve` mode) is a follow-up that will let the thresholds rise.
- **Excludes carry no runtime to cover:** `*.d.ts`, `**/types.*.ts` (type-only modules compile to nothing), and `packages/*/src/main.ts` (a re-export barrel). Adding logic to any of these means removing it from the exclude list.
- **The HTML report is local-only.** `reporter: ['text', 'html']` writes `coverage/` (already gitignored); `text` is what CI logs. There is no upload, badge, or third-party dependency — if a public coverage badge is ever wanted, that is a separate decision (Codecov/Coveralls) with its own token and lock-in trade-off.
