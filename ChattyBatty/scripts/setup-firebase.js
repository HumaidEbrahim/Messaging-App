// Connects this app to a real Firebase project:
//   - picks (or registers) a web app in the project and writes .env
//   - creates the Firestore database if there isn't one
//   - saves the project in .firebaserc and deploys firestore.rules
//
// Usage:
//   npx firebase login              (once, opens your browser)
//   npm run setup                   (asks which project to use)
//   npm run setup -- my-project-id  (no question)
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs'
import { createInterface } from 'node:readline/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const firebaseBin = path.join(
  root,
  'node_modules/firebase-tools/lib/bin/firebase.js',
)
const rl = createInterface({ input: process.stdin, output: process.stdout })

const fail = (message) => {
  console.error(`\n✖ ${message}`)
  rl.close()
  process.exit(1)
}

/** Runs a Firebase CLI command with --json and returns its `result`. */
const firebase = (args, { allowFailure = false } = {}) => {
  const run = spawnSync(process.execPath, [firebaseBin, ...args, '--json'], {
    cwd: root,
    encoding: 'utf8',
  })
  const out = run.stdout ?? ''
  let parsed
  try {
    parsed = JSON.parse(out.slice(out.indexOf('{')))
  } catch {
    if (allowFailure) return null
    fail(`firebase ${args.join(' ')} failed:\n${run.stderr || out}`)
  }
  if (parsed.status !== 'success') {
    if (allowFailure) return null
    fail(`firebase ${args.join(' ')} failed:\n${parsed.error ?? out}`)
  }
  return parsed.result
}

const ask = async (question, fallback = '') => {
  const answer = (
    await rl.question(`${question}${fallback ? ` [${fallback}]` : ''} `)
  ).trim()
  return answer || fallback
}

// ---------------------------------------------------------------- 1. Login
const accounts = firebase(['login:list'])
if (!accounts?.length) {
  fail('You are not logged in to Firebase. Run `npx firebase login` first.')
}
console.log(
  `✔ Logged in as ${accounts[0].user?.email ?? accounts[0].email ?? 'you'}`,
)

// -------------------------------------------------------------- 2. Project
let projectId = process.argv[2]
if (!projectId) {
  const projects = firebase(['projects:list'])
  if (!projects.length) {
    fail(
      'Your account has no Firebase projects. Create one at ' +
        'https://console.firebase.google.com, then run this again.',
    )
  }
  console.log('\nYour Firebase projects:')
  projects.forEach((p, i) =>
    console.log(`  ${i + 1}. ${p.displayName} (${p.projectId})`),
  )
  const choice = await ask(
    'Use which project? Enter its number:',
    projects.length === 1 ? '1' : '',
  )
  projectId = projects[Number(choice) - 1]?.projectId
  if (!projectId) fail(`"${choice}" isn't one of the listed numbers.`)
}
console.log(`✔ Using project ${projectId}`)

// -------------------------------------------------------------- 3. Web app
let apps = firebase(['apps:list', 'WEB', '--project', projectId])
let app = apps.find((a) => a.displayName === 'ChattyBatty') ?? apps[0]
if (!app) {
  console.log('… Registering a web app called ChattyBatty')
  app = firebase(['apps:create', 'WEB', 'ChattyBatty', '--project', projectId])
}
console.log(`✔ Web app ${app.displayName ?? ''} (${app.appId})`)

const { sdkConfig } = firebase([
  'apps:sdkconfig',
  'WEB',
  app.appId,
  '--project',
  projectId,
])
if (!sdkConfig?.apiKey) fail('Could not read the web app config.')

// ------------------------------------------------------------------ 4. .env
const envPath = path.join(root, '.env')
const envKeys = {
  VITE_FIREBASE_API_KEY: sdkConfig.apiKey,
  VITE_FIREBASE_AUTH_DOMAIN: sdkConfig.authDomain,
  VITE_FIREBASE_PROJECT_ID: sdkConfig.projectId,
  VITE_FIREBASE_STORAGE_BUCKET: sdkConfig.storageBucket,
  VITE_FIREBASE_MESSAGING_SENDER_ID: sdkConfig.messagingSenderId,
  VITE_FIREBASE_APP_ID: sdkConfig.appId,
  VITE_FIREBASE_MEASUREMENT_ID: sdkConfig.measurementId,
}
const envText =
  '# Written by `npm run setup`. Not secret, but specific to your project.\n' +
  Object.entries(envKeys)
    .map(([key, value]) => `${key}=${value ?? ''}`)
    .join('\n') +
  '\n'

if (existsSync(envPath) && readFileSync(envPath, 'utf8') !== envText) {
  copyFileSync(envPath, `${envPath}.backup`)
  console.log('… Saved your previous .env as .env.backup')
}
writeFileSync(envPath, envText)
console.log('✔ Wrote .env')

writeFileSync(
  path.join(root, '.firebaserc'),
  JSON.stringify({ projects: { default: projectId } }, null, 2) + '\n',
)
console.log('✔ Saved the project in .firebaserc')

// ------------------------------------------------------------- 5. Firestore
const databases = firebase(
  ['firestore:databases:list', '--project', projectId],
  {
    allowFailure: true,
  },
)
const hasDefault = databases?.some?.((db) => db.name?.endsWith('/(default)'))
if (!hasDefault) {
  console.log(
    '\nThis project has no Firestore database yet. Pick a location close to your users,\n' +
      'for example nam5 (US), eur3 (Europe) or africa-south1 (Johannesburg).\n' +
      'The location cannot be changed later.',
  )
  const location = await ask('Location:', 'nam5')
  const created = firebase(
    [
      'firestore:databases:create',
      '(default)',
      '--location',
      location,
      '--project',
      projectId,
    ],
    { allowFailure: true },
  )
  if (!created) {
    fail(
      `Couldn't create the database from here (new projects sometimes need it done once in the console).\n` +
        `  Create it at https://console.firebase.google.com/project/${projectId}/firestore\n` +
        `  then run \`npm run setup -- ${projectId}\` again.`,
    )
  }
  console.log(`✔ Created the Firestore database in ${location}`)
} else {
  console.log('✔ Firestore database exists')
}

// ----------------------------------------------------------------- 6. Rules
console.log('… Deploying firestore.rules')
firebase(['deploy', '--only', 'firestore:rules', '--project', projectId])
console.log('✔ Security rules deployed')

rl.close()

console.log(`
Almost done. Finish up in the Firebase console:

  1. Turn on Google sign-in:
  https://console.firebase.google.com/project/${projectId}/authentication/providers
     (Click "Get started" if asked, then Google → Enable → pick a support email → Save.)

  2. Only if you'll open the app from somewhere other than localhost (another
     computer on your network, or a hosted site): add that domain under
     Authorized domains:
     https://console.firebase.google.com/project/${projectId}/authentication/settings

Then start the app:

  npm run dev
`)
