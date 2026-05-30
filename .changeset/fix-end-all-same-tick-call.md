---
"react-call": patch
---

Fix: an end-all `end()` (called without a target promise) no longer drops calls made later in the same synchronous tick ([ADR-0020](docs/adr/0020-end-all-deferred-removal-scoped-to-resolved-calls.md)).

Previously, `end()` scheduled a deferred stack-clear that wiped the **entire** stack on the next macrotask — including any `call()`/`upsert()` issued after it. So a single handler like:

```ts
Upload.end() // end all (stack may be empty — intended no-op)
for (const file of files) Upload.call({ label: file.name, state: 'uploading' })
```

ended up rendering nothing: the three new calls were appended, then clobbered when the end-all's deferred removal fired. The removal is now scoped to exactly the calls that `end()` resolved, so calls added afterwards survive. Targeted `end(promise, value)` and `update()` were never affected.
