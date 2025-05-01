import SearchBar from './SearchBar'
import { db } from '../firebaseConfig'
import { collection, query, where, orderBy } from 'firebase/firestore'
import { useCollection } from 'react-firebase-hooks/firestore'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useFriends } from '../FriendContext' 

dayjs.extend(relativeTime)

const Chat = ({ chat, uid }) => {
  const friends = useFriends()
  const friendId = chat.participants.find(p => p !== uid)
  const friend = friends.find(friend => friend.id === friendId)

  return (
    <li class="pb-3 sm:pb-4">
      <div class="flex items-center space-x-4 rtl:space-x-reverse">
        <div class="shrink-0">
          <img
            class="w-8 h-8 rounded-full"
            src={friend.photo}
          />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate dark:text-white">
            {friend.username}
          </p>
          <p class="text-sm text-gray-500 truncate dark:text-gray-400">
            {chat.lastMessage.message}
          </p>
        </div>
        <div class="inline-flex items-center   text-gray-900 dark:text-white">
          {dayjs(chat.lastMessage.sentAt.toDate()).fromNow()}
        </div>
      </div>
    </li>
  )
}

const SideBar = ({ uid }) => {
  const q = query(
    collection(db, 'chat'),
    where('participants', 'array-contains', uid),
  )

  const [snapshot, error] = useCollection(q)

  const chats = snapshot?.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
  })) 

  if (error) console.log(error.message)
  if (!chats) return 'No chats'


  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col items-center justify-left">
        <label
          htmlFor="my-drawer-2"
          className="btn btn-primary drawer-button lg:hidden"
        >
          Open drawer
        </label>
      </div>
      <div className="drawer-side">
        <label
          htmlFor="my-drawer-2"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>

        <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
          <h1 className="text-xl"> Chats </h1>
          <SearchBar />

          {chats.map((chat) => (
            <Chat key={chat.id} chat={chat} uid={uid} />
          ))}
        </ul>
      </div>
    </div>
  )
}

export default SideBar
