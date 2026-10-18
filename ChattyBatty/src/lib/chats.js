import { toMillis } from './format'

export const otherParticipantId = (chat, uid) =>
  chat.participants?.find((id) => id !== uid) ?? null

export const isUnread = (chat, uid) => {
  const last = chat.lastMessage
  if (!last?.sentAt || !last.sentBy || last.sentBy === uid) return false
  return toMillis(last.sentAt) > toMillis(chat.readBy?.[uid])
}

export const chatActivity = (chat) =>
  toMillis(chat.lastMessage?.sentAt) || toMillis(chat.createdAt)

/** Display name and photo for a chat, from the viewer's point of view. */
export const chatIdentity = (chat, uid, usersById) => {
  if (chat.isGroup) {
    return {
      name: chat.groupName || 'Group chat',
      photo: chat.groupPhoto || null,
      isGroup: true,
    }
  }
  const other = usersById.get(otherParticipantId(chat, uid))
  return {
    name: other?.username || 'Unknown user',
    photo: other?.photo || null,
    isGroup: false,
    user: other,
  }
}
