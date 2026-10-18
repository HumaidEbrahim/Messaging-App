// Security rule tests. Run with `npm run test:rules` (needs Java for the emulator).
import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, test } from 'vitest'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing'
import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'

let env

const profile = (name, extra = {}) => ({
  username: name,
  status: 'hi',
  photo: null,
  creationDate: new Date('2025-01-01'),
  friends: [],
  incomingRequests: [],
  email: `${name}@example.com`,
  ...extra,
})

const emptyLast = { message: '', sentAt: null, sentBy: null }

const as = (uid) =>
  env.authenticatedContext(uid, { email: `${uid}@example.com` }).firestore()

const seed = (fn) => env.withSecurityRulesDisabled((ctx) => fn(ctx.firestore()))

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-chattybatty',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  })
})

afterAll(() => env?.cleanup())

beforeEach(async () => {
  await env.clearFirestore()
  // alice <-> bob are friends; carol is a stranger; dave is alice's friend too.
  await seed(async (db) => {
    await setDoc(
      doc(db, 'users/alice'),
      profile('alice', { friends: ['bob', 'dave'] }),
    )
    await setDoc(doc(db, 'users/bob'), profile('bob', { friends: ['alice'] }))
    await setDoc(doc(db, 'users/carol'), profile('carol'))
    await setDoc(doc(db, 'users/dave'), profile('dave', { friends: ['alice'] }))
    await setDoc(doc(db, 'chat/dm_alice_bob'), {
      participants: ['alice', 'bob'],
      isGroup: false,
      lastMessage: emptyLast,
      readBy: {},
    })
    await setDoc(doc(db, 'chat/group1'), {
      participants: ['alice', 'bob', 'dave'],
      isGroup: true,
      groupName: 'Bats',
      groupDesc: '',
      groupCreator: 'alice',
      lastMessage: emptyLast,
      readBy: {},
    })
    await setDoc(doc(db, 'chat/group1/messages/m1'), {
      message: 'hello',
      sentBy: 'bob',
      sentAt: new Date(),
    })
  })
})

describe('users', () => {
  test('a new user can create their own profile', async () => {
    await assertSucceeds(
      setDoc(doc(as('erin'), 'users/erin'), {
        ...profile('erin'),
        creationDate: serverTimestamp(),
      }),
    )
  })

  test('a new profile cannot start with friends or a different email', async () => {
    const db = as('erin')
    await assertFails(
      setDoc(doc(db, 'users/erin'), {
        ...profile('erin', { friends: ['alice'] }),
        creationDate: serverTimestamp(),
      }),
    )
    await assertFails(
      setDoc(doc(db, 'users/erin'), {
        ...profile('erin', { email: 'alice@example.com' }),
        creationDate: serverTimestamp(),
      }),
    )
  })

  test('nobody can create a profile for someone else', async () => {
    await assertFails(
      setDoc(doc(as('carol'), 'users/frank'), {
        ...profile('frank'),
        creationDate: serverTimestamp(),
      }),
    )
  })

  test('signed-out users cannot read profiles', async () => {
    await assertFails(
      getDoc(doc(env.unauthenticatedContext().firestore(), 'users/alice')),
    )
  })

  test('the user directory cannot be listed, but one email can be looked up', async () => {
    const db = as('carol')
    await assertFails(getDocs(collection(db, 'users')))
    await assertSucceeds(
      getDocs(
        query(
          collection(db, 'users'),
          where('email', '==', 'alice@example.com'),
          limit(1),
        ),
      ),
    )
  })

  test('users can update their status but not their email', async () => {
    const db = as('alice')
    await assertSucceeds(updateDoc(doc(db, 'users/alice'), { status: 'busy' }))
    await assertFails(
      updateDoc(doc(db, 'users/alice'), { email: 'x@example.com' }),
    )
    await assertFails(
      updateDoc(doc(db, 'users/alice'), { status: 'x'.repeat(141) }),
    )
  })

  test('users cannot add friends to their own list without a request', async () => {
    await assertFails(
      updateDoc(doc(as('carol'), 'users/carol'), {
        friends: arrayUnion('alice'),
      }),
    )
  })

  test('users can send and cancel a friend request', async () => {
    const db = as('carol')
    await assertSucceeds(
      updateDoc(doc(db, 'users/alice'), {
        incomingRequests: arrayUnion('carol'),
      }),
    )
    await assertSucceeds(
      updateDoc(doc(db, 'users/alice'), {
        incomingRequests: arrayRemove('carol'),
      }),
    )
  })

  test('users cannot send requests on behalf of someone else', async () => {
    await assertFails(
      updateDoc(doc(as('carol'), 'users/alice'), {
        incomingRequests: arrayUnion('dave'),
      }),
    )
  })

  test('users cannot put themselves on someone’s friends list uninvited', async () => {
    await assertFails(
      updateDoc(doc(as('carol'), 'users/alice'), {
        friends: arrayUnion('carol'),
      }),
    )
  })

  test('accepting a pending request makes both people friends', async () => {
    await seed((db) =>
      updateDoc(doc(db, 'users/alice'), { incomingRequests: ['carol'] }),
    )
    const db = as('alice')
    const batch = writeBatch(db)
    batch.update(doc(db, 'users/alice'), {
      friends: arrayUnion('carol'),
      incomingRequests: arrayRemove('carol'),
    })
    batch.update(doc(db, 'users/carol'), {
      friends: arrayUnion('alice'),
      incomingRequests: arrayRemove('alice'),
    })
    await assertSucceeds(batch.commit())
  })

  test('either friend can end the friendship', async () => {
    const db = as('bob')
    const batch = writeBatch(db)
    batch.update(doc(db, 'users/bob'), { friends: arrayRemove('alice') })
    batch.update(doc(db, 'users/alice'), { friends: arrayRemove('bob') })
    await assertSucceeds(batch.commit())
  })

  test('users cannot remove other people from someone’s friends', async () => {
    await assertFails(
      updateDoc(doc(as('carol'), 'users/alice'), {
        friends: arrayRemove('bob'),
      }),
    )
  })
})

describe('chats', () => {
  const newDm = (participants) => ({
    participants,
    isGroup: false,
    lastMessage: emptyLast,
    createdAt: serverTimestamp(),
    readBy: {},
  })

  test('friends can start a direct chat at its deterministic id', async () => {
    await assertSucceeds(
      setDoc(doc(as('alice'), 'chat/dm_alice_dave'), newDm(['alice', 'dave'])),
    )
  })

  test('direct chats need a deterministic id and a friend', async () => {
    const db = as('alice')
    await assertFails(setDoc(doc(db, 'chat/random'), newDm(['alice', 'dave'])))
    await assertFails(
      setDoc(doc(db, 'chat/dm_alice_carol'), newDm(['alice', 'carol'])),
    )
  })

  test('nobody can create a chat they are not in', async () => {
    await assertFails(
      setDoc(doc(as('carol'), 'chat/dm_alice_bob2'), newDm(['alice', 'bob'])),
    )
  })

  test('groups can only include the creator’s friends', async () => {
    const group = (participants) => ({
      participants,
      isGroup: true,
      groupName: 'Night owls',
      groupDesc: '',
      groupCreator: 'alice',
      lastMessage: emptyLast,
      createdAt: serverTimestamp(),
      readBy: {},
    })
    const db = as('alice')
    await assertSucceeds(
      setDoc(doc(db, 'chat/g2'), group(['alice', 'bob', 'dave'])),
    )
    await assertFails(
      setDoc(doc(db, 'chat/g3'), group(['alice', 'bob', 'carol'])),
    )
  })

  test('only members can read a chat and its messages', async () => {
    await assertSucceeds(getDoc(doc(as('bob'), 'chat/group1')))
    await assertFails(getDoc(doc(as('carol'), 'chat/group1')))
    await assertSucceeds(
      getDocs(collection(as('dave'), 'chat/group1/messages')),
    )
    await assertFails(getDocs(collection(as('carol'), 'chat/group1/messages')))
  })

  test('members only see their own chats in a list query', async () => {
    const db = as('bob')
    await assertSucceeds(
      getDocs(
        query(
          collection(db, 'chat'),
          where('participants', 'array-contains', 'bob'),
        ),
      ),
    )
    await assertFails(getDocs(collection(db, 'chat')))
  })

  test('a member can send a message with the chat preview', async () => {
    const db = as('bob')
    const batch = writeBatch(db)
    batch.set(doc(collection(db, 'chat/dm_alice_bob/messages')), {
      message: 'hey',
      sentBy: 'bob',
      sentAt: serverTimestamp(),
    })
    batch.update(doc(db, 'chat/dm_alice_bob'), {
      lastMessage: { message: 'hey', sentBy: 'bob', sentAt: serverTimestamp() },
      'readBy.bob': serverTimestamp(),
    })
    await assertSucceeds(batch.commit())
  })

  test('messages must be from the sender, within limits, and from a member', async () => {
    const send = (db, data) =>
      setDoc(doc(collection(db, 'chat/dm_alice_bob/messages')), {
        sentAt: serverTimestamp(),
        ...data,
      })
    await assertFails(send(as('bob'), { message: 'spoof', sentBy: 'alice' }))
    await assertFails(
      send(as('bob'), { message: 'x'.repeat(2001), sentBy: 'bob' }),
    )
    await assertFails(send(as('bob'), { message: '', sentBy: 'bob' }))
    await assertFails(send(as('carol'), { message: 'hi', sentBy: 'carol' }))
  })

  test('messages cannot be edited', async () => {
    await assertFails(
      updateDoc(doc(as('bob'), 'chat/group1/messages/m1'), {
        message: 'edited',
      }),
    )
  })

  test('members can mark a chat read only for themselves', async () => {
    const db = as('bob')
    await assertSucceeds(
      updateDoc(doc(db, 'chat/group1'), { 'readBy.bob': serverTimestamp() }),
    )
    await assertFails(
      updateDoc(doc(db, 'chat/group1'), { 'readBy.alice': serverTimestamp() }),
    )
  })

  test('only the admin can rename a group or change its members', async () => {
    await assertFails(
      updateDoc(doc(as('bob'), 'chat/group1'), { groupName: 'Mine now' }),
    )
    await assertFails(
      updateDoc(doc(as('bob'), 'chat/group1'), {
        participants: arrayRemove('dave'),
      }),
    )
    await assertSucceeds(
      updateDoc(doc(as('alice'), 'chat/group1'), { groupName: 'Renamed' }),
    )
    await assertSucceeds(
      updateDoc(doc(as('alice'), 'chat/group1'), {
        participants: arrayRemove('dave'),
      }),
    )
  })

  test('the admin can only add their own friends', async () => {
    await assertFails(
      updateDoc(doc(as('alice'), 'chat/group1'), {
        participants: arrayUnion('carol'),
      }),
    )
  })

  test('members can leave a group', async () => {
    await assertSucceeds(
      updateDoc(doc(as('dave'), 'chat/group1'), {
        participants: arrayRemove('dave'),
      }),
    )
  })

  test('only the admin can delete a group, including its messages', async () => {
    await assertFails(deleteDoc(doc(as('bob'), 'chat/group1')))
    await assertSucceeds(deleteDoc(doc(as('alice'), 'chat/group1/messages/m1')))
    await assertSucceeds(deleteDoc(doc(as('alice'), 'chat/group1')))
  })

  test('leaving clears your read receipt', async () => {
    await assertSucceeds(
      updateDoc(doc(as('dave'), 'chat/group1'), {
        participants: arrayRemove('dave'),
        'readBy.dave': deleteField(),
      }),
    )
  })

  test('removing a member clears their read receipt', async () => {
    await assertSucceeds(
      updateDoc(doc(as('alice'), 'chat/group1'), {
        participants: arrayRemove('bob'),
        'readBy.bob': deleteField(),
      }),
    )
  })

  test('the admin can remove everyone else from a group', async () => {
    const db = as('alice')
    await assertSucceeds(
      updateDoc(doc(db, 'chat/group1'), { participants: arrayRemove('bob') }),
    )
    await assertSucceeds(
      updateDoc(doc(db, 'chat/group1'), { participants: arrayRemove('dave') }),
    )
  })

  test('chats created by the previous app version keep working', async () => {
    // Old direct chats have random ids and no isGroup/readBy fields.
    await seed((db) =>
      setDoc(doc(db, 'chat/legacy'), {
        participants: ['alice', 'bob'],
        lastMessage: emptyLast,
      }),
    )
    const db = as('alice')
    const batch = writeBatch(db)
    batch.set(doc(collection(db, 'chat/legacy/messages')), {
      message: 'still here',
      sentBy: 'alice',
      sentAt: serverTimestamp(),
    })
    batch.update(doc(db, 'chat/legacy'), {
      lastMessage: {
        message: 'still here',
        sentBy: 'alice',
        sentAt: serverTimestamp(),
      },
      'readBy.alice': serverTimestamp(),
    })
    await assertSucceeds(batch.commit())
  })

  test('direct chats cannot be deleted', async () => {
    await assertFails(deleteDoc(doc(as('alice'), 'chat/dm_alice_bob')))
  })
})
