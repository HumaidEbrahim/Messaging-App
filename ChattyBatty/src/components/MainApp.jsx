import { useEffect, useMemo, useRef, useState } from 'react'
import { useDocumentData, useCollection } from 'react-firebase-hooks/firestore'
import { doc, collection, query, where } from 'firebase/firestore'
import { db } from '../firebaseConfig'
import { FriendProvider } from '../context/FriendContext'
import { useToast } from '../context/ToastContext'
import { ensureUserProfile, logout } from '../lib/auth'
import { describeError } from '../lib/chatApi'
import { chatActivity, isUnread } from '../lib/chats'
import { useUsers } from '../hooks/useUsers'
import { useMediaQuery } from '../hooks/useMediaQuery'
import SideBar from './SideBar'
import Chat from './Chat'
import DetailBar from './DetailBar'
import BlankChat from './BlankChat'
import Logo from './Logo'

const ESTIMATE = { serverTimestamps: 'estimate' }

const MainApp = ({ authUser }) => {
  const uid = authUser.uid
  const toast = useToast()

  // ----- Profile
  const userRef = useMemo(() => doc(db, 'users', uid), [uid])
  const [user, userLoading, userError] = useDocumentData(userRef)

  const creatingProfile = useRef(false)
  useEffect(() => {
    if (userLoading || user || userError || creatingProfile.current) return
    creatingProfile.current = true
    ensureUserProfile(authUser).catch((err) => {
      creatingProfile.current = false
      toast.error(describeError(err, "Couldn't set up your profile."))
    })
  }, [authUser, user, userLoading, userError, toast])

  // ----- Chats
  const chatQuery = useMemo(
    () =>
      query(
        collection(db, 'chat'),
        where('participants', 'array-contains', uid),
      ),
    [uid],
  )
  const [chatSnapshot, chatsLoading, chatsError] = useCollection(chatQuery)

  const chats = useMemo(
    () =>
      chatSnapshot?.docs
        .map((d) => ({ ...d.data(ESTIMATE), id: d.id }))
        .sort((a, b) => chatActivity(b) - chatActivity(a)) ?? [],
    [chatSnapshot],
  )

  const [selectedChatId, setSelectedChatId] = useState(null)
  const selectedChat = chats.find((chat) => chat.id === selectedChatId) ?? null

  // If the open chat disappears (deleted, or you were removed), close it.
  useEffect(() => {
    if (selectedChatId && chatSnapshot && !selectedChat) {
      setSelectedChatId(null)
    }
  }, [selectedChatId, chatSnapshot, selectedChat])

  const participants = useUsers(selectedChat?.participants)

  // ----- Details panel: docked on wide screens, an overlay elsewhere
  const isWide = useMediaQuery('(min-width: 80rem)')
  const [detailsOpen, setDetailsOpen] = useState(isWide)
  useEffect(() => setDetailsOpen(isWide), [isWide])

  // ----- Unread count in the window title
  const unreadCount = chats.filter((chat) => isUnread(chat, uid)).length
  useEffect(() => {
    document.title = unreadCount
      ? `(${unreadCount}) ChattyBatty`
      : 'ChattyBatty'
  }, [unreadCount])

  useEffect(() => {
    if (chatsError)
      toast.error(describeError(chatsError, "Couldn't load your chats."))
  }, [chatsError, toast])

  if (userError) {
    return (
      <div className="min-h-dvh grid place-items-center bg-base-200 p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-2xl font-bold">Couldn't load your profile</h1>
          <p className="text-base-content/70">{describeError(userError)}</p>
          <button className="btn" onClick={logout}>
            Sign out
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-dvh grid place-items-center bg-base-200">
        <Logo
          size={72}
          className="text-primary animate-pulse"
          title="Loading"
        />
      </div>
    )
  }

  const selectChat = (id) => setSelectedChatId(id)

  return (
    <FriendProvider user={user}>
      <div className="h-dvh flex flex-col bg-base-300 md:p-3 md:pt-7 draggable">
        <div className="flex-1 min-h-0 flex md:rounded-3xl overflow-hidden md:shadow-xl bg-base-100 no-drag">
          {/* Sidebar: the whole screen on phones until a chat is opened */}
          <aside
            className={`${selectedChat ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-88 shrink-0 flex-col border-r border-base-300 min-h-0`}
          >
            <SideBar
              chats={chats}
              chatsLoading={chatsLoading}
              uid={uid}
              user={user}
              selectedChatId={selectedChatId}
              onSelectChat={selectChat}
            />
          </aside>

          {/* Conversation */}
          <main
            className={`${selectedChat ? 'flex' : 'hidden md:flex'} flex-1 min-w-0 flex-col min-h-0`}
          >
            {selectedChat ? (
              <Chat
                key={selectedChat.id}
                chat={selectedChat}
                participants={participants.byId}
                uid={uid}
                onBack={() => setSelectedChatId(null)}
                detailsOpen={detailsOpen}
                onToggleDetails={() => setDetailsOpen((open) => !open)}
              />
            ) : (
              <BlankChat hasChats={chats.length > 0} />
            )}
          </main>

          {/* Details */}
          {selectedChat && detailsOpen && (
            <>
              {!isWide && (
                <div
                  className="fixed inset-0 z-30 bg-black/40"
                  onClick={() => setDetailsOpen(false)}
                  aria-hidden="true"
                />
              )}
              <aside
                className={`${
                  isWide
                    ? 'w-80 shrink-0 border-l border-base-300'
                    : 'fixed inset-y-0 right-0 z-40 w-full max-w-sm shadow-2xl'
                } bg-base-100 overflow-y-auto`}
                aria-label="Chat details"
              >
                <DetailBar
                  chat={selectedChat}
                  participants={participants.byId}
                  uid={uid}
                  onClose={() => setDetailsOpen(false)}
                  showClose={!isWide}
                />
              </aside>
            </>
          )}
        </div>
      </div>
    </FriendProvider>
  )
}

export default MainApp
