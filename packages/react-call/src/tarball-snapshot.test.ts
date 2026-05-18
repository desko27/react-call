import { execSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const PACKAGE_DIR = resolve(__dirname, '..')

interface PackInfo {
  files: Array<{ path: string; size: number }>
}

function getPackedFiles(): string[] {
  const stdout = execSync('npm pack --dry-run --json', {
    cwd: PACKAGE_DIR,
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'ignore'],
  })
  const parsed = JSON.parse(stdout) as PackInfo[]
  const info = parsed[0]
  if (!info) throw new Error('npm pack --json returned no package info')
  return info.files.map((f) => f.path).sort()
}

async function readPackageJson(): Promise<Record<string, unknown>> {
  const raw = await readFile(resolve(PACKAGE_DIR, 'package.json'), 'utf-8')
  return JSON.parse(raw) as Record<string, unknown>
}

describe('tarball snapshot — ADR-0007 publishable artifact contract', () => {
  it('tarball file list matches snapshot', async () => {
    const files = getPackedFiles()
    await expect(`${files.join('\n')}\n`).toMatchFileSnapshot(
      './tarball.snapshot.txt',
    )
  })

  it('package.json has no install-time scripts', async () => {
    const pkg = await readPackageJson()
    const scripts = (pkg.scripts ?? {}) as Record<string, string>
    expect(scripts.preinstall).toBeUndefined()
    expect(scripts.install).toBeUndefined()
    expect(scripts.postinstall).toBeUndefined()
  })

  it('package.json declares no bin (react-call is a library, not a CLI)', async () => {
    const pkg = await readPackageJson()
    expect(pkg.bin).toBeUndefined()
  })
})
