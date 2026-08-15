import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const first = (...values) => values.find((value) => typeof value === 'string' && value.trim()) || null
const commitSha = first(process.env.VERCEL_GIT_COMMIT_SHA, process.env.GITHUB_SHA, process.env.GIT_COMMIT_SHA)
const branch = first(process.env.VERCEL_GIT_COMMIT_REF, process.env.GITHUB_HEAD_REF, process.env.GITHUB_REF_NAME, process.env.GIT_BRANCH)
const source = process.env.VERCEL === '1' ? 'vercel' : process.env.GITHUB_ACTIONS === 'true' ? 'github-actions' : 'local'

const metadata = {
  app: 'alpha-tech-client',
  commitSha,
  branch,
  source,
  node: process.version,
  builtAt: new Date().toISOString(),
}

const publicDir = path.resolve(process.cwd(), 'public')
await mkdir(publicDir, { recursive: true })
await writeFile(path.join(publicDir, 'release.json'), `${JSON.stringify(metadata, null, 2)}\n`, 'utf8')
console.log(`[release] ${metadata.app} ${commitSha || 'unknown'} ${branch || 'unknown'} (${source})`)
