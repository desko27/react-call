// Rasterizes public/og.svg into public/og.png.
//
// Why this exists: SVG is not a valid Open Graph image format. Reddit,
// X/Twitter, Facebook, LinkedIn, Slack, Discord and iMessage all ignore an
// `og:image` that points at an SVG and fall back to a generic placeholder, so
// shared links show no preview. og.svg stays the editable source of truth and
// this script bakes it into the PNG that the meta tags actually reference.
//
// Fonts are vendored as TTFs (scripts/og-fonts) and loaded explicitly so the
// render is deterministic and on-brand (Geist + Fira Code) regardless of which
// fonts the build machine happens to have installed — resvg renders no text at
// all when it cannot resolve a font.
//
// Run after editing og.svg:  pnpm --filter web og

import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

const here = dirname(fileURLToPath(import.meta.url))
const publicDir = join(here, '..', 'public')
const fontsDir = join(here, 'og-fonts')

const svg = readFileSync(join(publicDir, 'og.svg'), 'utf8')
const fontFiles = readdirSync(fontsDir)
  .filter((f) => f.endsWith('.ttf'))
  .map((f) => join(fontsDir, f))

const resvg = new Resvg(svg, {
  // The SVG already declares width/height 1200x630; honor it 1:1.
  fitTo: { mode: 'width', value: 1200 },
  font: {
    fontFiles,
    loadSystemFonts: false,
    defaultFontFamily: 'Geist',
  },
})

const png = resvg.render().asPng()
const out = join(publicDir, 'og.png')
writeFileSync(out, png)

console.log(`Wrote ${out} (${png.length} bytes)`)
