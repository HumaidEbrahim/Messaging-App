import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import { collection, limitToLast, orderBy, query } from 'firebase/firestore'
import { useCollection } from 'react-firebase-hooks/firestore'
import { LuArrowDown, LuArrowLeft, LuInfo } from 'react-icons/lu'
import { db } from '../firebaseConfig'
import { describeError, markChatRead } from '../lib/chatApi'
import { chatIdentity, isUnread, otherParticipantId } from '../lib/chats'
import { MESSAGE_PAGE_SIZE } from '../lib/constants'
import { isJumboEmoji } from '../lib/emoji'
import {
  formatDayHeading,
  nameColor,
  pluralize,
  toDay,
  toMillis,
} from '../lib/format'
import { useUsers } from '../hooks/useUsers'
import Avatar from './Avatar'
import Composer from './Composer'
import MessageText from './MessageText'

const ESTIMATE = { serverTimestamps: 'estimate' }
const GROUP_GAP_MS = 5 * 60 * 1000
const NEAR_BOTTOM_PX = 120

// Consecutive messages from one person within a few minutes form a group.
const sameGroup = (a, b) =>
  a &&
  b &&
  a.sentBy === b.sentBy &&
  Math.abs(toMillis(b.sentAt) - toMillis(a.sentAt)) < GROUP_GAP_MS &&
  toDay(a.sentAt)?.isSame(toDay(b.sentAt), 'day')

const useDocumentVisible = () =>
  useSyncExternalStore(
    (onChange) => {
      document.addEventListener('visibilitychange', onChange)
      window.addEventListener('focus', onChange)
      return () => {
        document.removeEventListener('visibilitychange', onChange)
        window.removeEventListener('focus', onChange)
      }
    },
    () => document.visibilityState === 'visible',
  )

const DaySeparator = ({ date }) => (
  <div className="flex items-center gap-3 my-5" role="separator">
    <div className="flex-1 h-px bg-base-content/10" />
    <span className="text-xs font-medium text-base-content/60">
      {formatDayHeading(date)}
    </span>
    <div className="flex-1 h-px bg-base-content/10" />
  </div>
)

const Message = ({ message, mine, sender, first, last, showSender, seen }) => {
  const time = toDay(message.sentAt)
  const jumbo = isJumboEmoji(message.message)

  // Bubbles in a group tuck their corners together on the sender's side.
  const corners = mine
    ? `${first ? '' : 'rounded-tr-md'} ${last ? '' : 'rounded-br-md'}`
    : `${first ? '' : 'rounded-tl-md'} ${last ? '' : 'rounded-bl-md'}`

  return (
    <div
      className={`flex gap-2 ${mine ? 'justify-end' : 'justify-start'} ${first ? 'mt-3' : 'mt-0.5'}`}
    >
      {!mine && (
        <div className="w-8 shrink-0">
          {first && (
            <Avatar src={sender?.photo} name={sender?.username} size="sm" />
          )}
        </div>
      )}

      <div
        className={`flex flex-col max-w-[min(36rem,78%)] ${mine ? 'items-end' : 'items-start'}`}
      >
        {first && (
          <div className="flex items-baseline gap-2 px-1 mb-1 text-xs">
            {showSender && (
              <span
                className={`font-semibold text-sm ${nameColor(message.sentBy)}`}
              >
                {sender?.username ?? 'Former member'}
              </span>
            )}
            <time
              className="text-base-content/50"
              dateTime={time?.toISOString()}
            >
              {time?.format('h:mm A')}
            </time>
          </div>
        )}

        <div
          title={time?.format('dddd, MMMM D, YYYY h:mm A')}
          className={
            jumbo
              ? 'text-5xl leading-tight py-0.5'
              : `px-3.5 py-2 rounded-2xl ${corners} whitespace-pre-wrap break-words leading-snug ${
                  mine
                    ? 'bg-primary text-primary-content'
                    : 'bg-base-100 text-base-content border border-base-300'
                } ${message.pending ? 'opacity-70' : ''}`
          }
        >
          <MessageText text={message.message} />
        </div>

        {mine && last && (message.pending || seen) && (
          <span className="text-[0.6875rem] text-base-content/50 px-1 mt-0.5">
            {message.pending ? 'Sending…' : 'Seen'}
          </span>
        )}
      </div>
    </div>
  )
}

const Chat = ({
  chat,
  participants,
  uid,
  onBack,
  detailsOpen,
  onToggleDetails,
}) => {
  const [pageSize, setPageSize] = useState(MESSAGE_PAGE_SIZE)

  const messagesQuery = useMemo(
    () =>
      query(
        collection(db, 'chat', chat.id, 'messages'),
        orderBy('sentAt', 'asc'),
        limitToLast(pageSize),
      ),
    [chat.id, pageSize],
  )
  const [snapshot, loading, error] = useCollection(messagesQuery, {
    // Also update when a sent message is confirmed, to clear "Sending…".
    snapshotListenOptions: { includeMetadataChanges: true },
  })

  // Keep showing the previous page while a bigger page loads.
  const [page, setPage] = useState({ messages: [], fromCache: true })
  useEffect(() => {
    if (!snapshot) return
    setPage({
      messages: snapshot.docs.map((d) => ({
        ...d.data(ESTIMATE),
        id: d.id,
        pending: d.metadata.hasPendingWrites,
      })),
      fromCache: snapshot.metadata.fromCache,
    })
  }, [snapshot])
  const { messages } = page

  // Senders who have since left a group still need a name and photo.
  const senderIds = useMemo(() => messages.map((m) => m.sentBy), [messages])
  const { byId: senders } = useUsers(senderIds)
  const userFor = (id) => participants.get(id) ?? senders.get(id)
  const hasMore = (snapshot?.docs.length ?? 0) >= pageSize
  const firstLoad = loading && messages.length === 0

  // ----- Scrolling
  const scrollRef = useRef(null)
  const stickToBottom = useRef(true)
  const olderAnchor = useRef(null)
  const lastSeenId = useRef(null)
  const [newBelow, setNewBelow] = useState(false)

  const scrollToBottom = useCallback((behavior = 'auto') => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior })
    stickToBottom.current = true
    setNewBelow(false)
  }, [])

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el || messages.length === 0) return

    const anchor = olderAnchor.current
    if (anchor) {
      if (messages[0].id !== anchor.firstId) {
        // Older messages were added above; keep the view where it was.
        el.scrollTop = el.scrollHeight - anchor.fromBottom
        olderAnchor.current = null
        return
      }
      // Same first message: the cache answered before the server, so keep
      // waiting, unless the server confirms there is nothing older.
      if (!page.fromCache) olderAnchor.current = null
    }

    const latest = messages[messages.length - 1]
    const isNew = latest.id !== lastSeenId.current
    lastSeenId.current = latest.id
    if (stickToBottom.current || (isNew && latest.sentBy === uid)) {
      scrollToBottom()
    } else if (isNew) {
      setNewBelow(true)
    }
  }, [messages, page.fromCache, uid, scrollToBottom])

  const loadOlder = () => {
    // olderAnchor is set while a bigger page is on its way.
    if (!hasMore || loading || olderAnchor.current !== null) return
    const el = scrollRef.current
    if (!el || messages.length === 0) return
    olderAnchor.current = {
      fromBottom: el.scrollHeight - el.scrollTop,
      firstId: messages[0].id,
    }
    setPageSize((size) => size + MESSAGE_PAGE_SIZE)
  }

  const onScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const nearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX
    stickToBottom.current = nearBottom
    if (nearBottom) setNewBelow(false)
    if (el.scrollTop < 80) loadOlder()
  }

  // ----- Read receipts
  const visible = useDocumentVisible()
  const markedAt = useRef(0)
  const lastSentAt = toMillis(chat.lastMessage?.sentAt)
  useEffect(() => {
    if (!visible || !isUnread(chat, uid) || markedAt.current >= lastSentAt)
      return
    markedAt.current = lastSentAt
    markChatRead(chat.id, uid).catch(() => {
      markedAt.current = 0
    })
  }, [chat, uid, visible, lastSentAt])

  // ----- Header
  const {
    name,
    photo,
    isGroup,
    user: otherUser,
  } = chatIdentity(chat, uid, participants)
  const subtitle = isGroup
    ? pluralize(chat.participants.length, 'member')
    : otherUser?.status || ''

  // "Seen" on my latest message in a direct chat, once the other person read it.
  const otherId = isGroup ? null : otherParticipantId(chat, uid)
  const myLatest = [...messages].reverse().find((m) => m.sentBy === uid)
  const seenByOther =
    otherId &&
    myLatest &&
    !myLatest.pending &&
    messages[messages.length - 1]?.id === myLatest.id &&
    toMillis(chat.readBy?.[otherId]) >= toMillis(myLatest.sentAt)

  return (
    <div className="flex flex-col h-full min-h-0 relative">
      <header className="flex items-center gap-3 px-3 sm:px-4 py-3 border-b border-base-300 shrink-0 draggable">
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-circle md:hidden"
          onClick={onBack}
          aria-label="Back to chats"
        >
          <LuArrowLeft className="size-5" />
        </button>
        <Avatar src={photo} name={name} group={isGroup} />
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-lg leading-tight truncate">{name}</h2>
          {subtitle && (
            <p className="text-sm text-base-content/60 truncate">{subtitle}</p>
          )}
        </div>
        <button
          type="button"
          className={`btn btn-sm btn-circle ${detailsOpen ? 'btn-primary btn-soft' : 'btn-ghost'}`}
          onClick={onToggleDetails}
          aria-label={isGroup ? 'Group details' : 'Contact details'}
          aria-pressed={detailsOpen}
          title="Details"
        >
          <LuInfo className="size-5" />
        </button>
      </header>

      <div
        ref={scrollRef}
        onScroll={onScroll}
        // Scroll position is managed here, so turn off the browser's own anchoring.
        className="flex-1 min-h-0 overflow-y-auto [overflow-anchor:none] px-3 sm:px-5 pb-4 bg-base-200"
        role="log"
        aria-label={`Messages with ${name}`}
        aria-busy={loading}
      >
        {hasMore && (
          <div className="flex justify-center pt-4">
            <button
              className="btn btn-ghost btn-xs"
              onClick={loadOlder}
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                'Load earlier messages'
              )}
            </button>
          </div>
        )}

        {error ? (
          <p className="text-center text-error py-10">
            {describeError(error, "Couldn't load messages.")}
          </p>
        ) : firstLoad ? (
          <div className="flex justify-center py-10">
            <span
              className="loading loading-dots"
              aria-label="Loading messages"
            />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-2 px-6">
            <Avatar src={photo} name={name} group={isGroup} size="xl" />
            <p className="text-xl font-bold mt-2">{name}</p>
            <p className="text-base-content/60">
              {isGroup
                ? 'This group is quiet so far. Say something to get it going.'
                : `This is the start of your chat with ${name}.`}
            </p>
          </div>
        ) : (
          messages.map((message, i) => {
            const prev = messages[i - 1]
            const next = messages[i + 1]
            const day = toDay(message.sentAt)
            const newDay =
              day && (!prev || !toDay(prev.sentAt)?.isSame(day, 'day'))
            const first = newDay || !sameGroup(prev, message)
            const last = !sameGroup(message, next)
            const mine = message.sentBy === uid

            return (
              <div key={message.id}>
                {newDay && <DaySeparator date={day} />}
                <Message
                  message={message}
                  mine={mine}
                  sender={userFor(message.sentBy)}
                  first={first}
                  last={last}
                  showSender={isGroup && !mine}
                  seen={seenByOther && message.id === myLatest.id}
                />
              </div>
            )
          })
        )}
      </div>

      {newBelow && (
        <button
          type="button"
          onClick={() => scrollToBottom('smooth')}
          className="btn btn-primary btn-sm rounded-full shadow-lg absolute left-1/2 -translate-x-1/2 bottom-24 z-10"
        >
          <LuArrowDown aria-hidden="true" />
          New messages
        </button>
      )}

      <Composer
        chatId={chat.id}
        uid={uid}
        onSent={() => (stickToBottom.current = true)}
      />
    </div>
  )
}

export default Chat
