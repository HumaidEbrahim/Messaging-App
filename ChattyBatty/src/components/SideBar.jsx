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
        <div className="shrink-0 p-2">
          <img
            className="w-10 h-10  rounded-full object-cover"
            src={friend.photo}
          />
        </div>
        <div  className="flex-1 min-w-0">
          <p  className="text-base font-medium">
            {friend.username}
          </p>
          <p  className="text-sm text-base-content/70 ">
            {chat.lastMessage.message}
          </p>
        </div>
        <div  className="inline-flex items-center pr-2 text-base-content/70 text-sm">
          {chat?.lastMessage?.sentAt ?  dayjs(chat?.lastMessage?.sentAt?.toDate()).fromNow()
         : 'Sending...' }
  
        </div>
      </div>
    </li>
  )
}

const NewChat = () => {

  const friends = useFriends()

  return (
    <div className="dropdown dropdown-right ">
    <div tabIndex={0} role="button" className="btn btn-circle btn-primary m-1">+</div>
    <ul tabIndex={0} className="dropdown-content menu bg-base-200 rounded-box z-1 w-52 p-2 shadow-sm">
     {friends.map(friend =>  (<NewChatItem friend={friend} />))}
    </ul>
  </div>
  )
}
const NewChatItem = ({friend}) => {
  return (
    <li className="border-b">
      <div>
        <img className="w-10 h-10 rounded-full object-cover " src={friend.photo} />
        <div className="text-xs uppercase font-medium">
        {friend.username}
        </div>
      </div>
    </li>
  )
}

const SideBar = ({ chats, uid, setSelectedChat }) => {
  
  if (!chats) return 'No chats'

  console.log("chats",chats)

  return (
      <div className='p-2'>
         <div role="tablist" className="tabs tabs-lift p-1">
  <a role="tab" className="tab tab-active text-xl">Chats</a>
  <a role="tab" className="tab text-xl">Friends</a>
</div>  
        <div className='flex flex-row'> 
        <SearchBar />

        <NewChat />
       
        </div>
        <ul className=" ">

          {chats.map((chat) => (
            <ChatListItem key={chat.id} chat={chat} uid={uid} setSelectedChat={setSelectedChat} />
          ))}
        </ul>
      </div>
  
  )
}

export default SideBar
