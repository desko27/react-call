const REPO = 'desko27/react-call'

// Used when the build-time fetch fails (offline CI, GitHub down, rate limit).
// Roughly tracks the real count so the UI never shows an absurd number — it
// only matters on the rare failed build, and refreshes on the next deploy.
const FALLBACK_STARS = 1200

// Astro renders Header on every page, so memoize: one network request per
// build regardless of how many pages/components ask for the count.
let cached: Promise<number> | undefined

export function getStarCount(): Promise<number> {
  if (!cached) {
    cached = fetch(`https://api.github.com/repos/${REPO}`, {
      headers: { Accept: 'application/vnd.github+json' },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`GitHub API ${res.status}`)
        return res.json() as Promise<{ stargazers_count: number }>
      })
      .then((data) => data.stargazers_count)
      .catch(() => FALLBACK_STARS)
  }
  return cached
}

// 1215 -> "1.2k", 980 -> "980", 12345 -> "12.3k". Trailing ".0" is dropped.
export function formatStarCount(n: number): string {
  if (n < 1000) return String(n)
  return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
}
