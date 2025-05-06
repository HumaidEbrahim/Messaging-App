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

  if(!friend)
    return (<div>error</div>)

  return (
    <li onClick={() => setSelectedChat({chatId : chat.id, friend:friend})}className="pb-3 sm:pb-4">

      <div className="flex items-center">
        <div className="shrink-0">
          <img
            className="w-8 h-8 rounded-full object-cover"
            src={friend.photo}
          />
        </div>
        <div  className="flex-1 min-w-0">
          <p  className="text-sm">
            {friend.username}
          </p>
          <p  className="text-sm">
            {chat.lastMessage.message}
          </p>
        </div>
        <div  className="inline-flex items-center">
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
      <div className='p-1'>
         <div role="tablist" className="tabs tabs-lift p-1">
  <a role="tab" className="tab tab-active text-xl">Chats</a>
  <a role="tab" className="tab text-xl">Friends</a>
</div>
        <ul className=" ">
         
          <SearchBar />

          {chats.map((chat) => (
            <ChatListItem key={chat.id} chat={chat} uid={uid} setSelectedChat={setSelectedChat} />
          ))}
        </ul>
      </div>
  
  )
}

export default SideBar
