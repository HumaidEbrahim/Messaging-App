import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteField,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  addDoc,
} from 'firebase/firestore'
import { db } from '../firebaseConfig'
import {
  MAX_GROUP_DESC_LENGTH,
  MAX_GROUP_NAME_LENGTH,
  MAX_MESSAGE_LENGTH,
  MAX_STATUS_LENGTH,
} from './constants'

const chatRef = (chatId) => doc(db, 'chat', chatId)
const userRef = (uid) => doc(db, 'users', uid)

const emptyLastMessage = { message: '', sentAt: null, sentBy: null }

// ---------- Messages ----------

export const sendMessage = async ({ chatId, uid, text }) => {
  const message = text.trim().slice(0, MAX_MESSAGE_LENGTH)
  if (!message) return

  // Write the message and the chat preview together so they never disagree.
  const batch = writeBatch(db)
  const messageRef = doc(collection(db, 'chat', chatId, 'messages'))
  batch.set(messageRef, { message, sentBy: uid, sentAt: serverTimestamp() })
  batch.update(chatRef(chatId), {
    lastMessage: { message, sentBy: uid, sentAt: serverTimestamp() },
    [`readBy.${uid}`]: serverTimestamp(),
  })
  await batch.commit()
}

export const markChatRead = (chatId, uid) =>
  updateDoc(chatRef(chatId), { [`readBy.${uid}`]: serverTimestamp() })

// ---------- Chats ----------

const directChatId = (a, b) => `dm_${[a, b].sort().join('_')}`

/** Returns the id of the direct chat with `friendId`, creating it if needed. */
export const openDirectChat = async ({ chats, uid, friendId }) => {
  const existing = chats?.find(
    (chat) =>
      !chat.isGroup &&
      chat.participants.length === 2 &&
      chat.participants.includes(friendId),
  )
  if (existing) return existing.id

  const id = directChatId(uid, friendId)
  await setDoc(chatRef(id), {
    participants: [uid, friendId],
    isGroup: false,
    lastMessage: emptyLastMessage,
    createdAt: serverTimestamp(),
    readBy: {},
  })
  return id
}

export const createGroup = async ({ uid, name, description, memberIds }) => {
  const ref = await addDoc(collection(db, 'chat'), {
    participants: [uid, ...memberIds.filter((id) => id !== uid)],
    isGroup: true,
    groupName: name.trim().slice(0, MAX_GROUP_NAME_LENGTH),
    groupDesc: description.trim().slice(0, MAX_GROUP_DESC_LENGTH),
    groupCreator: uid,
    lastMessage: emptyLastMessage,
    createdAt: serverTimestamp(),
    readBy: {},
  })
  return ref.id
}

export const updateGroupDetails = (chatId, { name, description }) =>
  updateDoc(chatRef(chatId), {
    groupName: name.trim().slice(0, MAX_GROUP_NAME_LENGTH),
    groupDesc: description.trim().slice(0, MAX_GROUP_DESC_LENGTH),
  })

export const addGroupMembers = (chatId, memberIds) =>
  updateDoc(chatRef(chatId), { participants: arrayUnion(...memberIds) })

export const removeGroupMember = (chatId, memberId) =>
  updateDoc(chatRef(chatId), {
    participants: arrayRemove(memberId),
    [`readBy.${memberId}`]: deleteField(),
  })

export const leaveGroup = (chatId, uid) => removeGroupMember(chatId, uid)

/** Deletes a group and all of its messages (admin only). */
export const deleteGroup = async (chatId) => {
  const messages = await getDocs(collection(db, 'chat', chatId, 'messages'))

  // Batches are limited to 500 writes.
  const BATCH_LIMIT = 450
  for (let i = 0; i < messages.docs.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db)
    messages.docs.slice(i, i + BATCH_LIMIT).forEach((d) => batch.delete(d.ref))
    await batch.commit()
  }

  const batch = writeBatch(db)
  batch.delete(chatRef(chatId))
  await batch.commit()
}

// ---------- Profile ----------

export const updateStatus = (uid, status) =>
  updateDoc(userRef(uid), {
    status: status.trim().slice(0, MAX_STATUS_LENGTH),
  })

// ---------- Friends ----------

export const findUserByEmail = async (email) => {
  const normalized = email.trim().toLowerCase()
  if (!normalized) return null

  const snapshot = await getDocs(
    query(collection(db, 'users'), where('email', '==', normalized), limit(1)),
  )
  if (snapshot.empty) return null
  const found = snapshot.docs[0]
  return { ...found.data(), id: found.id }
}

export const sendFriendRequest = (uid, targetId) =>
  updateDoc(userRef(targetId), { incomingRequests: arrayUnion(uid) })

export const cancelFriendRequest = (uid, targetId) =>
  updateDoc(userRef(targetId), { incomingRequests: arrayRemove(uid) })

export const acceptFriendRequest = async (uid, requesterId) => {
  const batch = writeBatch(db)
  batch.update(userRef(uid), {
    friends: arrayUnion(requesterId),
    incomingRequests: arrayRemove(requesterId),
  })
  batch.update(userRef(requesterId), {
    friends: arrayUnion(uid),
    incomingRequests: arrayRemove(uid),
  })
  await batch.commit()
}

export const declineFriendRequest = (uid, requesterId) =>
  updateDoc(userRef(uid), { incomingRequests: arrayRemove(requesterId) })

export const removeFriend = async (uid, friendId) => {
  const batch = writeBatch(db)
  batch.update(userRef(uid), { friends: arrayRemove(friendId) })
  batch.update(userRef(friendId), { friends: arrayRemove(uid) })
  await batch.commit()
}

// ---------- Errors ----------

const ERROR_MESSAGES = {
  'permission-denied': "You don't have permission to do that.",
  unavailable: "Can't reach the server. Check your connection and try again.",
  'resource-exhausted': 'Too many requests. Wait a moment and try again.',
  'auth/popup-blocked':
    'The sign-in window was blocked. Allow pop-ups for this app and try again.',
  'auth/network-request-failed':
    "Can't reach Google. Check your connection and try again.",
}

export const describeError = (error, fallback = 'Something went wrong.') =>
  ERROR_MESSAGES[error?.code] || fallback
