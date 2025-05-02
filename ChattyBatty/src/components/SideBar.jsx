import SearchBar from './SearchBar'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useFriends } from '../FriendContext' 
import Chat from './Chat'

dayjs.extend(relativeTime)

const ChatListItem = ({ chat, uid, setSelectedChat}) => {
  
  const friends = useFriends()
  const friendId = chat.participants.find(p => p !== uid)
  const friend = friends?.find(friend => friend.id === friendId)

  return (
    <li onClick={() => setSelectedChat({chatId : chat.id, friend:friend})}class="pb-3 sm:pb-4">

      <div class="flex items-center">
        <div class="shrink-0">
          <img
            class="w-8 h-8 rounded-full object-cover"
            src={friend.photo}
          />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm">
            {friend.username}
          </p>
          <p class="text-sm">
            {chat.lastMessage.message}
          </p>
        </div>
        <div class="inline-flex items-center">
          {dayjs(chat.lastMessage.sentAt.toDate()).fromNow()}
        </div>
      </div>
    </li>
  )
}

const SideBar = ({ chats, uid, setSelectedChat }) => {
  
  if (!chats) return 'No chats'

  console.log("chats",chats)

  return (
      <div className='flex overflow-y-auto bg-base-200 w-80'>
        <ul className="menu  ">
          <h1 className="text-xl"> Chats </h1>
          <SearchBar />

          {chats.map((chat) => (
            <ChatListItem key={chat.id} chat={chat} uid={uid} setSelectedChat={setSelectedChat} />
          ))}
        </ul>
      </div>
  
  )
}

export default SideBar
