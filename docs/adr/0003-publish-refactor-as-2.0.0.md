# Publish refactor as 2.0.0, not 1.9.0

When the `dev` branch reaches publishable state, it will ship as `react-call@2.0.0` — not as `1.9.0` continuing the 1.x line. The `package.json` version stays at `1.9.0-dev.0` during the refactor (so the existing `dev` dist-tag on npm keeps working for opt-in users); the bump to `2.0.0-dev.0` happens when the changesets-based release flow lands and the first 2.0 prerelease cuts.

We chose `2.0.0` over `1.9.0` because ADR-0001 changes observable behaviour (the moment the "Multiple instances of `<Root>` found!" error fires moves from Root mount to `call()` invocation) — under strict semver that qualifies as breaking, regardless of how few consumers it affects in practice. Separately, the tooling overhaul still ahead of us (build pipeline, `exports` map hygiene via `publint`/`attw`, dist-lint snapshots) is likely to surface further small, intentional breakages — bundle output diffs, removal of historical `package.json` fields, stricter type exports — that fit naturally inside a single major bump without requiring per-change justification. Major-version headroom now is cheaper than discovering mid-implementation that a "minor refactor" accidentally became one.

## Considered options

- **Ship as `1.9.0` (continue the 1.x line).** Lower migration friction: dependabot autobumps it, most consumers update without review. Rejected: the ADR-0001 behaviour change is real, and pre-emptively constraining ourselves to "no further breakage" during the tooling overhaul would force awkward workarounds the first time we discover a `package.json` field that wants removing or an `exports` condition that wants reordering.
- **Defer the decision until publish-time.** Technically valid — version is the last thing decided before `changeset publish`. Rejected here because the user explicitly raised the question and a recorded decision now anchors several downstream choices (release notes structure, README upgrade guide, dist-tag transition plan) without waiting for them to come up individually.

## Consequences

- Release notes for `2.0.0` must include a short "What changed for consumers" section calling out the `<Root>` error-timing change (ADR-0001) plus whatever cleanups the tooling phase introduces, even though the public API surface is functionally identical to `1.8.x` for correct usage.
- The `dev` dist-tag on npm currently points at `1.9.0-dev.0`. When the release flow lands, the first `2.0.0-dev.N` cut will move that tag forward; existing opt-in users get the prerelease automatically. The `1.9.0-dev.0` artifact stays installable by explicit version pin but is effectively superseded.
- We give ourselves explicit permission, while implementing the tooling overhaul, to make small breaking changes (drop deprecated `package.json` fields, tighten `exports`, normalise bundle filenames, etc.) without each one requiring its own ADR. The header decision recorded here is the umbrella; individual cleanups land in the changeset summary that accompanies the relevant commit.
