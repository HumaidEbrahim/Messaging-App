import { useMemo, useState } from 'react'
import { LuSquarePen, LuUsersRound } from 'react-icons/lu'
import { useUsers } from '../hooks/useUsers'
import { chatIdentity, isUnread, otherParticipantId } from '../lib/chats'
import { formatListTime } from '../lib/format'
import Avatar from './Avatar'
import SearchBar from './SearchBar'
import NewChatDialog from './NewChatDialog'
import GroupDialog from './GroupDialog'

const preview = (chat, uid, usersById) => {
  const last = chat.lastMessage
  if (!last?.message) return chat.isGroup ? 'Group created' : 'Say hello 👋'
  if (last.sentBy === uid) return `You: ${last.message}`
  if (chat.isGroup) {
    const sender = usersById.get(last.sentBy)?.username?.split(' ')[0]
    return sender ? `${sender}: ${last.message}` : last.message
  }
  return last.message
}

const ChatListItem = ({ chat, uid, usersById, active, onSelect }) => {
  const { name, photo, isGroup } = chatIdentity(chat, uid, usersById)
  const unread = isUnread(chat, uid)

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(chat.id)}
        aria-current={active ? 'true' : undefined}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left transition-colors ${
          active ? 'bg-primary/15' : 'hover:bg-base-200'
        }`}
      >
        <Avatar src={photo} name={name} group={isGroup} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <p
              className={`flex-1 truncate ${unread ? 'font-bold' : 'font-medium'}`}
            >
              {name}
            </p>
            <time
              className={`text-xs shrink-0 ${unread ? 'text-primary font-semibold' : 'text-base-content/55'}`}
            >
              {formatListTime(chat.lastMessage?.sentAt)}
            </time>
          </div>
          <div className="flex items-center gap-2">
            <p
              className={`flex-1 text-sm truncate ${unread ? 'text-base-content' : 'text-base-content/60'}`}
            >
              {preview(chat, uid, usersById)}
            </p>
            {unread && (
              <span className="size-2.5 rounded-full bg-primary shrink-0">
                <span className="sr-only">Unread messages</span>
              </span>
            )}
          </div>
        </div>
      </button>
    </li>
  )
}

const ChatList = ({
  chats,
  loading,
  uid,
  selectedChatId,
  onSelectChat,
  onFindFriends,
}) => {
  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState(null)

  // People whose names we need: the other person in each direct chat, and
  // the latest sender in each group.
  const neededIds = useMemo(
    () =>
      chats.map((chat) =>
        chat.isGroup ? chat.lastMessage?.sentBy : otherParticipantId(chat, uid),
      ),
    [chats, uid],
  )
  const { byId: usersById } = useUsers(neededIds)

  const term = search.trim().toLowerCase()
  const visible = term
    ? chats.filter((chat) =>
        chatIdentity(chat, uid, usersById).name.toLowerCase().includes(term),
      )
    : chats

  return (
    <>
      <div className="flex items-center gap-1 px-3 pb-2">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search chats"
        />
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square"
          onClick={() => setDialog('chat')}
          aria-label="New chat"
          title="New chat"
        >
          <LuSquarePen className="size-5" />
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square"
          onClick={() => setDialog('group')}
          aria-label="New group"
          title="New group"
        >
          <LuUsersRound className="size-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {loading ? (
          <ul className="flex flex-col gap-1 p-1" aria-label="Loading chats">
            {[0, 1, 2, 3].map((i) => (
              <li key={i} className="flex items-center gap-3 px-2 py-2.5">
                <div className="skeleton size-10 rounded-full shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="skeleton h-3 w-2/3" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              </li>
            ))}
          </ul>
        ) : chats.length === 0 ? (
          <div className="flex flex-col items-center text-center gap-3 px-6 py-10">
            <p className="font-semibold text-lg">No chats yet</p>
            <p className="text-sm text-base-content/65">
              Start a conversation with a friend, or add friends by email first.
            </p>
            <div className="flex gap-2">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setDialog('chat')}
              >
                New chat
              </button>
              <button className="btn btn-ghost btn-sm" onClick={onFindFriends}>
                Add friends
              </button>
            </div>
          </div>
        ) : visible.length === 0 ? (
          <p className="text-sm text-base-content/60 text-center py-8 px-4">
            No chats match “{search}”.
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {visible.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                uid={uid}
                usersById={usersById}
                active={chat.id === selectedChatId}
                onSelect={onSelectChat}
              />
            ))}
          </ul>
        )}
      </div>

      <NewChatDialog
        open={dialog === 'chat'}
        onClose={() => setDialog(null)}
        uid={uid}
        chats={chats}
        onOpenChat={onSelectChat}
        onNewGroup={() => setDialog('group')}
        onFindFriends={() => {
          setDialog(null)
          onFindFriends()
        }}
      />
      <GroupDialog
        open={dialog === 'group'}
        onClose={() => setDialog(null)}
        uid={uid}
        onCreated={onSelectChat}
      />
    </>
  )
}

export default ChatList
