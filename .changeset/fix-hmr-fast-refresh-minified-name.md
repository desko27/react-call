---
"react-call": patch
---

Fix: Vite/React Fast Refresh no longer rejects a Callable as "incompatible" in the published build, so editing a Callable's own source while a call is open hot-updates in place instead of triggering a full reload that closes it ([ADR-0022](docs/adr/0022-pin-callable-name-for-fast-refresh.md), [#110](https://github.com/desko27/react-call/issues/110)).

The minified bundle renamed the returned component's function to a lowercase identifier, which fails react-refresh's `isLikelyComponentType` name check — and because the truthy minified `name` shadows `displayName`, neither setting `displayName` manually nor the `react-call/vite` plugin could work around it. `createCallable` now pins an uppercase `name` on the Callable (dev-only; production output is byte-for-byte unchanged), restoring Fast Refresh acceptance for the artifact consumers actually install.
