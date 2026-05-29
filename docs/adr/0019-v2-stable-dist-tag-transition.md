# v2 stable dist-tag transition

> Status: accepted — supersedes the dist-tag consequence of ADR-0003.

When `2.0.0` ships to the `latest` dist-tag, we move the `next` tag to `2.0.0` (rather than leaving it at the last prerelease `2.0.0-next.6`) and remove the `dev` tag entirely. The end state is a single meaningful tag, `latest`, with `next == latest` until a future prerelease line re-points it via changesets pre mode.

We move `next` instead of leaving it because a `next` tag pointing *below* `latest` is a footgun: once `latest` is `2.0.0`, `npm install react-call@next` would otherwise resolve to a prerelease older than stable. Dist-tags resolve only at install time and get baked into consumer lockfiles, so moving or removing a tag never alters an already-installed project — its lockfile keeps the exact version, which stays published forever (removing a tag is not an unpublish). The only consumers a tag change can reach are those who install fresh without a lockfile, or who pin the literal tag string as their version spec (`"react-call": "next"` / `"dev"`), which is discouraged. Moving `next`→`2.0.0` rolls those rare literal-tag consumers gracefully onto stable; removing `next` would instead break their install with "no matching version".

We remove `dev` rather than advance it because it points at `1.9.0-dev.0`, an orphaned pre-refactor artifact. ADR-0003 predicted the first `2.0.0-dev.N` cut would move `dev` forward, but the 2.0 prereleases shipped on the `next` tag instead, so `dev` never advanced. It is the most experimental/legacy tag, least likely to carry careful production consumers, so a clean removal beats keeping a tag that resolves to a dead artifact.

## Considered options

- **Leave `next` stale at `2.0.0-next.6`.** Rejected: it would resolve to a prerelease older than `latest`, the footgun above.
- **Remove `next` as well as `dev`.** Rejected: a hard `npm dist-tag rm` would break the rare `"react-call": "next"` literal-spec consumer with a "no matching version" install failure. Moving it onto stable is graceful and keeps the tag meaningful.
- **Repoint `dev`→`2.0.0` instead of removing it.** A viable zero-risk alternative (no install ever fails). Rejected for a cleaner tag list, since `dev` is legacy with no real consumers; choose this instead if zero breakage of a literal-`dev`-spec consumer is required.

## Consequences

- These are manual `npm dist-tag add/rm` operations from a maintainer machine with an npm login. CI cannot perform them: the trusted-publisher OIDC flow (ADR-0008) grants the release workflow *publish* rights only, with no `NPM_TOKEN` available for tag management.
- Run them in the post-publish batch, only after verifying `npm view react-call dist-tags` shows `latest: 2.0.0` — so no window exists where `next`/`latest` disagree about what stable is.
- The `2.0.0-next.6` and `1.9.0-dev.0` artifacts stay installable by explicit version pin; only their tag pointers change.
