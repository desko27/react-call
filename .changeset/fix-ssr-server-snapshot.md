---
"react-call": patch
---

Fix React's `"The result of getServerSnapshot should be cached to avoid an infinite loop"` warning logged on every render in any SSR consumer (Next.js App Router included).

`createStackStore`'s `getServerSnapshot` returned a fresh `[]` each call, so `useSyncExternalStore`'s `Object.is` comparison always reported "changed" and React entered the recovery path. Fixed by returning a single stable empty-stack reference per store. No runtime behaviour change for client-only consumers (Vite CSR, CRA, etc.) — they never touched the SSR snapshot path.

Surfaced by the new `apps/nextjs/` playground introduced in the same release; shipped briefly in `2.0.0-next.1`.
