import { useState } from 'react'
import { LuMessagesSquare, LuUsers } from 'react-icons/lu'
import { useFriends } from '../context/FriendContext'
import { isUnread } from '../lib/chats'
import ChatList from './ChatList'
import FriendList from './FriendList'
import Profile from './Profile'
import ThemeSelector from './ThemeSelector'
import Logo from './Logo'

const Tab = ({ active, onClick, icon, label, badge }) => (
  <button
    type="button"
    role="tab"
    aria-selected={active}
    onClick={onClick}
    className={`tab gap-2 flex-1 ${active ? 'tab-active' : ''}`}
  >
    {icon}
    {label}
    {badge > 0 && (
      <span
        className="badge badge-primary badge-xs"
        aria-label={`${badge} new`}
      >
        {badge}
      </span>
    )}
  </button>
)

const SideBar = ({
  chats,
  chatsLoading,
  uid,
  user,
  selectedChatId,
  onSelectChat,
}) => {
  const [tab, setTab] = useState('chats')
  const { requests } = useFriends()
  const unread = chats.filter((chat) => isUnread(chat, uid)).length

  const openChat = (id) => {
    setTab('chats')
    onSelectChat(id)
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <header className="flex items-center gap-2 px-4 pt-4 pb-2 draggable">
        <Logo size={32} className="text-primary" />
        <span className="text-xl font-extrabold tracking-tight flex-1">
          ChattyBatty
        </span>
        <ThemeSelector />
      </header>

      <div role="tablist" className="tabs tabs-box mx-3 my-2 bg-base-200">
        <Tab
          active={tab === 'chats'}
          onClick={() => setTab('chats')}
          icon={<LuMessagesSquare className="size-4" aria-hidden="true" />}
          label="Chats"
          badge={unread}
        />
        <Tab
          active={tab === 'friends'}
          onClick={() => setTab('friends')}
          icon={<LuUsers className="size-4" aria-hidden="true" />}
          label="Friends"
          badge={requests.length}
        />
      </div>

      <div className="flex-1 min-h-0 flex flex-col" role="tabpanel">
        {tab === 'chats' ? (
          <ChatList
            chats={chats}
            loading={chatsLoading}
            uid={uid}
            selectedChatId={selectedChatId}
            onSelectChat={onSelectChat}
            onFindFriends={() => setTab('friends')}
          />
        ) : (
          <FriendList
            uid={uid}
            user={user}
            chats={chats}
            onOpenChat={openChat}
          />
        )}
      </div>

      <div className="shrink-0 border-t border-base-300 p-2">
        <Profile user={user} uid={uid} />
      </div>
    </div>
  )
}

export default SideBar
