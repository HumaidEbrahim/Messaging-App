import SearchBar from './SearchBar'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useFriends } from '../FriendContext'
import Chat from './Chat'

dayjs.extend(relativeTime)

const ChatListItem = ({ chat, uid, setSelectedChat }) => {


  const friends = useFriends()
  const friendId = chat.participants.find((p) => p !== uid)
  const friend = friends?.find((friend) => friend.id === friendId)
 

  if (!friend) return <div>error</div>

  return (
    <li
      onClick={() => setSelectedChat({ chatId: chat.id, friend: friend, chatType:chat.type})}
      className=" sm:pb-4"
    >
      <div className="flex items-center ">
        <div className="pr-3">
          <img
            className="w-10 h-10 rounded-full object-cover"
            src={chat.type === 'group'?
              chat.photo
            :friend.photo}
          />
        </div>
        <div className="flex-1 min-w-0 p-1">
          <p className="text-sm">{chat.type === 'group'?
          chat.GroupName
        :friend.username}</p>
          <p className="text-sm">{chat.lastMessage.message}</p>
        </div>
        <div className="inline-flex items-center text-xs">
          {dayjs(chat.lastMessage.sentAt.toDate()).fromNow()}
        </div>
      </div>
    </li>
  )
}

const SideBar = ({ chats, uid, setSelectedChat }) => {
  if (!chats) return 'No chats'

  console.log('chats', chats)

  return (
    <div className="p-2">
      <div role="tablist" className="tabs tabs-lift ">
        <a role="tab" className="tab tab-active text-xl">
          Chats
        </a>
        <a role="tab" className="tab text-xl">
          Friends
        </a>
      </div>

      <div className='pt-4 pb-4' > 
      <SearchBar />
      </div>

      <ul className=" ">
        {chats.map((chat) => (
          <ChatListItem
            key={chat.id}
            chat={chat}
            uid={uid}
            setSelectedChat={setSelectedChat}
          />
        ))}
      </ul>
    </div>
  )
}

export default SideBar
