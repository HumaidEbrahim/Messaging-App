import SearchBar from './SearchBar'
import { db } from '../firebaseConfig'
import { collection, query, where, orderBy } from 'firebase/firestore'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const Chat = ({ chat }) => {
  return (
    <li>
      {' '}
      {chat.lastMessage.message}{' '}
      {dayjs(chat.lastMessage.sentAt.toDate()).fromNow()}{' '}
    </li>
  )
}

const SideBar = ({ uid }) => {
  const q = query(
    collection(db, 'chat'),
    where('participants', 'array-contains', uid),
  )
  const [chats, error] = useCollectionData(q, { idField: 'id' })

  console.log(chats)

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
            <Chat key={chat.id} chat={chat} />
          ))}
        </ul>
      </div>
    </div>
  )
}

export default SideBar
