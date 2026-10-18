// Fills the local Firestore emulator with demo friends, chats and messages.
//
//   1. npm run emulators          (in one terminal)
//   2. npm run dev:emulators      (in another), then sign in once
//   3. npm run seed -- you@example.com
//
// The email must match the account you signed in with in step 2.
import { initializeTestEnvironment } from '@firebase/rules-unit-testing'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'

const email = process.argv[2]?.toLowerCase()
if (!email) {
  console.error('Usage: npm run seed -- <email you signed in with>')
  process.exit(1)
}

const env = await initializeTestEnvironment({
  projectId: 'demo-chattybatty',
  firestore: { host: '127.0.0.1', port: 8080 },
})

await env.withSecurityRulesDisabled(async (ctx) => {
  const db = ctx.firestore()
  const found = await getDocs(
    query(collection(db, 'users'), where('email', '==', email)),
  )
  if (found.empty) {
    throw new Error(`No profile for ${email}. Sign in to the app once first.`)
  }
  const me = found.docs[0].id

  const ago = (minutes) => Timestamp.fromMillis(Date.now() - minutes * 60_000)
  const people = [
    { id: 'demo-luna', username: 'Luna Park', status: 'Hanging upside down' },
    { id: 'demo-ravi', username: 'Ravi Mehta', status: 'Back at 6' },
    { id: 'demo-sofia', username: 'Sofia Alves', status: 'Night shift ☕' },
    {
      id: 'demo-kenji',
      username: 'Kenji Watanabe',
      status: 'Wants to be your friend',
    },
  ]

  for (const person of people) {
    await setDoc(doc(db, 'users', person.id), {
      username: person.username,
      status: person.status,
      photo: null,
      creationDate: ago(60 * 24 * 90),
      friends: person.id === 'demo-kenji' ? [] : [me],
      incomingRequests: [],
      email: `${person.id}@example.com`,
    })
  }

  await updateDoc(doc(db, 'users', me), {
    friends: ['demo-luna', 'demo-ravi', 'demo-sofia'],
    incomingRequests: ['demo-kenji'],
  })

  const chats = [
    {
      id: `dm_${[me, 'demo-luna'].sort().join('_')}`,
      data: { participants: [me, 'demo-luna'], isGroup: false },
      messages: [
        ['demo-luna', 'Are you coming to the cave tonight?', 60 * 26],
        [me, 'Wouldn’t miss it', 60 * 26 - 2],
        ['demo-luna', 'Bring snacks. Moths preferred.', 60 * 26 - 3],
        ['demo-luna', 'Kidding. Mostly.', 60 * 26 - 3],
        [me, 'Haha, see you at dusk 🦇', 40],
        ['demo-luna', 'Here’s the map: https://example.com/cave', 6],
      ],
    },
    {
      id: 'demo-group',
      data: {
        participants: [me, 'demo-luna', 'demo-ravi', 'demo-sofia'],
        isGroup: true,
        groupName: 'Night owls',
        groupDesc: 'Planning the weekend.',
        groupCreator: me,
      },
      messages: [
        ['demo-ravi', 'Who’s free Saturday?', 180],
        ['demo-sofia', 'Me! After 9 though', 175],
        [me, 'Same, let’s do late dinner', 170],
        ['demo-luna', '👍', 168],
        ['demo-ravi', 'Booking a table for 4 at 9:30', 12],
      ],
    },
    {
      id: `dm_${[me, 'demo-sofia'].sort().join('_')}`,
      data: { participants: [me, 'demo-sofia'], isGroup: false },
      messages: [['demo-sofia', 'Thanks for yesterday!', 60 * 24 * 3]],
    },
  ]

  for (const chat of chats) {
    const batch = writeBatch(db)
    const last = chat.messages[chat.messages.length - 1]
    batch.set(doc(db, 'chat', chat.id), {
      ...chat.data,
      createdAt: ago(60 * 24 * 7),
      lastMessage: { sentBy: last[0], message: last[1], sentAt: ago(last[2]) },
      // Leave the newest message unread so the unread badge shows.
      readBy: { [me]: ago(last[2] + 1) },
    })
    chat.messages.forEach(([sentBy, message, minutes], i) => {
      batch.set(
        doc(db, 'chat', chat.id, 'messages', `m${String(i).padStart(3, '0')}`),
        {
          sentBy,
          message,
          sentAt: ago(minutes),
        },
      )
    })
    await batch.commit()
  }

  console.log(`Seeded demo data for ${email} (${me}).`)
})

await env.cleanup()
