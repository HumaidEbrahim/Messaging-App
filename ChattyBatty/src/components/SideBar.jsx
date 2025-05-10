import SearchBar from './SearchBar'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useFriends } from '../FriendContext'
import Chat from './Chat'
import {
  doc,
  addDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  arrayUnion,
} from 'firebase/firestore'
import { db } from '../firebaseConfig'
import { BiSolidMessageAdd, BiUserPlus } from 'react-icons/bi'
import { useState } from 'react'

dayjs.extend(relativeTime)

const ChatListItem = ({ chat, uid, setSelectedChat }) => {
  const friends = useFriends()
  const friendId = chat.participants.find((p) => p !== uid)
  const friend = friends?.find((friend) => friend.id === friendId)

  if (!friend) return <div>error</div>

  return (
    <li
      onClick={() => setSelectedChat(chat)}
      className="pb-3 sm:pb-4"
    >
      <div className="flex items-center">
        <div className="shrink-0 p-2">
          <img
            className="w-10 h-10  rounded-full object-cover"
            src={chat.isGroup? chat.groupPhoto : friend.photo}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-medium">{chat.isGroup? chat.groupName : friend.username}</p>
          <p className="text-sm text-base-content/70 truncate max-w-full">
            {chat?.lastMessage?.message}
          </p>
        </div>
        <div className="inline-flex items-center pr-2 text-base-content/70 text-sm">
          {chat?.lastMessage?.sentAt
            ? dayjs(chat?.lastMessage?.sentAt?.toDate()).fromNow()
            : ''}
        </div>
      </div>
    </li>
  )
}

const NewChat = ({ chats, setSelectedChat, uid }) => {
  const friends = useFriends()

  return (
    <div className="dropdown dropdown-bottom dropdown-end ">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-circle btn-primary m-1"
      >
        <BiSolidMessageAdd size={20} />
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-300 rounded-box z-1 w-52 p-2 shadow-2xl"
      >
        {friends.map((friend) => (
          <NewChatItem
            key={friend.id}
            friend={friend}
            setSelectedChat={setSelectedChat}
            chats={chats}
            uid={uid}
          />
        ))}
      </ul>
    </div>
  )
}

const NewFriend = ({ uid }) => {
  const [newFriendEmail, setNewFriendEmail] = useState('')
  const [newFriend, setNewFriend] = useState(null)

  const searchFriend = async (event) => {
    event.preventDefault()

    const q = query(
      collection(db, 'users'),
      where('email', '==', newFriendEmail),
    )
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      setNewFriend({ uid: doc.id, ...doc.data() })
    } else setNewFriend(null)

    setNewFriendEmail('')
  }

  const addFriend = async () => {
    const ids = [uid, newFriend.uid]
    const addPromises = ids.map((id, i) =>
      updateDoc(doc(db, 'users', id), { friends: arrayUnion(ids[1 - i]) }),
    )
    await Promise.all(addPromises)
  }

  return (
    <div className="dropdown dropdown-bottom dropdown-end ">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-circle btn-primary m-1"
      >
        <BiUserPlus size={20} />
      </div>
      <div
        tabIndex={0}
        className="dropdown-content menu bg-base-300 rounded-box z-1 w-52 p-2 shadow-2xl"
      >
        <label className="input validator">
          <svg
            className="h-[1em] opacity-50"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <g
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth="2.5"
              fill="none"
              stroke="currentColor"
            >
              <rect width="20" height="16" x="2" y="4" rx="2"></rect>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
            </g>
          </svg>
          <form onSubmit={searchFriend}>
            <input
              type="email"
              onChange={(event) => setNewFriendEmail(event.target.value)}
              placeholder="@gmail.com"
              required
            />
          </form>
        </label>
        <div className="validator-hint hidden">Enter valid email address</div>
        {newFriend && (
          <div className="flex flex-col gap-2 p-2">
            <div className="flex items-center gap-4">
              <img
                className="w-10 h-10 rounded-full object-cover"
                src={newFriend.photo}
                alt="Profile"
              />
              <p className="text-base font-medium">{newFriend.username}</p>
            </div>

            <div>
              <span className="text-xs text-base-content/60">
                Member Since:
              </span>
              <p className="text-sm text-base-content/70">
                {dayjs(newFriend?.creationDate?.toDate()).format('D MMMM YYYY')}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={addFriend}
                className="btn btn-link whitespace-nowrap"
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const NewChatItem = ({ friend, setSelectedChat, chats, uid }) => {
  const chat = chats.find(
    (c) => c.participants.includes(friend.id) && c.participants.length === 2,
  )

  const addChat = async () => {
    const chatRef = await addDoc(collection(db, 'chat'), {
      participants: [friend.id, uid],
      lastMessage: {
        message: '',
        sentAt: null,
        sentBy: null,
      },
    })

    return chatRef.id
  }
  const selectChat = async () => {
    if (!chat) {
      const chatId = await addChat()
      setSelectedChat({ chatId: chatId, friend: friend })
    } else {
      setSelectedChat({ chatId: chat.id, friend: friend })
    }
  }

  return (
    <li onClick={selectChat} className="border-b border-base-content/10 ">
      <div>
        <img
          className="w-10 h-10 rounded-full object-cover "
          src={friend.photo}
        />
        <div className="text-xs uppercase font-medium">{friend.username}</div>
      </div>
    </li>
  )
}

const ChatList = ({ chats, uid, setSelectedChat }) => {
  return (
    <div>
      <div className="flex flex-row">
        <SearchBar />

        <NewChat chats={chats} setSelectedChat={setSelectedChat} uid={uid} />
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

const FriendList = ({ uid }) => {
  const friends = useFriends()

  return (
    <>
      <div className="flex flex-row">
        <SearchBar />
        <NewFriend uid={uid} />
      </div>
      <div>
        <ul>
          {friends.map((friend) => (
            <FriendListItem friend={friend} />
          ))}
        </ul>
      </div>
    </>
  )
}

const FriendListItem = ({ friend }) => {
  return (
    <li className="pb-3 sm:pb-4">
      <div className="flex items-center">
        <div className="shrink-0 p-2">
          <img
            className="w-10 h-10  rounded-full object-cover"
            src={friend.photo}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-medium">{friend.username}</p>
          <p className="text-sm text-base-content/70 truncate max-w-full">
            {friend.status}
          </p>
        </div>
      </div>
    </li>
  )
}

const SideBar = ({ chats, uid, setSelectedChat }) => {
  const [selectedSideBar, setSetlectedSideBar] = useState('chats')

  if (!chats) return 'No chats'

  console.log('chats', chats)

  return (
    <div className="p-2">
      <div role="tablist" className="tabs tabs-lift p-1">
        <a
          role="tab"
          onClick={() => setSetlectedSideBar('chats')}
          className={`tab ${selectedSideBar === 'chats' ? 'tab-active' : ''} text-xl`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
            />
          </svg>
          Chats
        </a>

        <a
          role="tab"
          onClick={() => setSetlectedSideBar('friends')}
          className={`tab ${selectedSideBar === 'friends' ? 'tab-active' : ''} text-xl`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
            />
          </svg>
          Friends
        </a>
      </div>

      {selectedSideBar === 'chats' ? (
        <ChatList chats={chats} uid={uid} setSelectedChat={setSelectedChat} />
      ) : (
        <FriendList uid={uid} />
      )}
    </div>
  )
}

export default SideBar
