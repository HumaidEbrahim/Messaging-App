import SearchBar from './SearchBar'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
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
  getDoc,
} from 'firebase/firestore'
import { db } from '../firebaseConfig'
import { BiSolidMessageAdd, BiUserPlus } from 'react-icons/bi'
import { useContext, useState } from 'react'
import { LuUsers, LuMessagesSquare } from 'react-icons/lu'
import { MdGroupAdd } from 'react-icons/md'
import { CgAddR } from 'react-icons/cg'
import FriendContext from '../FriendContext'
import Profile from './Profile'

dayjs.extend(relativeTime)

const ChatListItem = ({ chat, uid, setSelectedChat }) => {
  const friends = useContext(FriendContext)
  const friendId = chat.participants.find((p) => p !== uid)
  const friend = friends?.find((friend) => friend.id === friendId)

  if (!friend) {
    return (
      <li className="text-sm text-500 px-2">
        Friend not found or deleted.
      </li>
    )
  }
  

  const date = dayjs(chat?.lastMessage?.sentAt?.toDate())
  const now = dayjs()
    const formattedDate = date?.isSame(now, 'day')
      ? date?.format('h:mm A')
      : date?.isSame(now.subtract(1, 'day'), 'day')
        ? 'Yesterday'
        : date?.format('MM/DD/YY')

  return (
    <li onClick={() => setSelectedChat(chat)} className="pb-3 sm:pb-4">
      <div className="flex items-center">
        <div className="shrink-0 p-2">
          <img
            className="w-10 h-10  rounded-full object-cover"
            src={chat.isGroup ? chat.groupPhoto : friend.photo}
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-medium">
            {chat.isGroup ? chat.groupName : friend.username}
          </p>
          <p className="text-sm text-base-content/70 truncate max-w-full">
            {chat?.lastMessage?.message}
          </p>
        </div>
        <div className="inline-flex items-center pr-2 text-base-content/70 text-xs">
          {formattedDate}
        </div>
      </div>
    </li>
  )
}

const ChatList = ({ chats, uid, setSelectedChat }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const friends = useContext(FriendContext)

  const filteredChats = chats.filter((chat) => {
    const friendId = chat.participants.find((p) => p !== uid)

    const friend = friends?.find((friend) => friend.id === friendId)

    const name = chat.isGroup ? chat.groupName : friend?.username || ''
    return name.toLowerCase().includes(searchTerm.toLowerCase())
  })
  .sort((a, b)=> {
    const timeA =a.lastMessage?.sentAt?.toDate?.()||0
    const timeB =b.lastMessage?.sentAt?.toDate?.()||0
    return timeB - timeA
  })

  return (
    <div>
      <div className="flex flex-row">
        <SearchBar onSearch={setSearchTerm} />
        <NewChat chats={chats} setSelectedChat={setSelectedChat} uid={uid} />
        <NewGroupChat
          chats={chats}
          setSelectedChat={setSelectedChat}
          uid={uid}
        />
      </div>
      <ul>
        {filteredChats.map((chat) => (
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

const NewChatItem = ({ friend, setSelectedChat, chats, uid }) => {
  const chat = chats.find(
    (c) => c.participants.includes(friend.id) && !c.isGroup,
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

    const docSnap = await getDoc(chatRef)

    if (docSnap.exists()) {
      const chat = {
        id: chatRef.id,
        ...docSnap.data(),
      }

      setSelectedChat(chat)
    }
  }
  const selectChat = async () => {
    if (!chat) {
      await addChat()
    } else {
      setSelectedChat(chat)
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

const NewChat = ({ chats, setSelectedChat, uid }) => {
  const friends = useContext(FriendContext)

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

const NewGroupChatItem = ({ friend, setGroupMembers, groupMembers }) => {
  const isChecked = groupMembers.includes(friend.id)

  const selectMember = (event) => {
    if (event.currentTarget.checked)
      setGroupMembers([...groupMembers, friend.id])
    else setGroupMembers(groupMembers.filter((id) => id !== friend.id))
  }
  return (
    <li onClick={() => {}} className="border-b border-base-content/10 ">
      <div>
        <img
          className="w-10 h-10 rounded-full object-cover "
          src={friend.photo}
        />
        <div className="text-xs uppercase font-medium">{friend.username}</div>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={selectMember}
          className="checkbox checkbox-sm"
        />
      </div>
    </li>
  )
}

const NewGroupChat = ({ chats, setSelectedChat, uid }) => {
  const friends = useContext(FriendContext)
  const [groupMembers, setGroupMembers] = useState([uid])
  const [groupName, setGroupName] = useState('Group Chat')

  console.log('Members', groupMembers)

  const createGroup = async () => {
    const docRef = await addDoc(collection(db, 'chat'), {
      participants: groupMembers,
      lastMessage: {
        message: '',
        sentAt: null,
        sentBy: null,
      },
      groupName: groupName,
      isGroup: true,
      groupCreator: uid,
      groupPhoto:
        'https://static.vecteezy.com/system/resources/previews/026/019/617/non_2x/group-profile-avatar-icon-default-social-media-forum-profile-photo-vector.jpg',
      groupDesc: "This is a new group chat"
    })

    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const chat = {
        id: docRef.id,
        ...docSnap.data(),
      }

      setSelectedChat(chat)
    }
  }

  return (
    <div className="dropdown dropdown-bottom dropdown-end ">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-circle btn-primary m-1"
      >
        <MdGroupAdd size={20} />
      </div>
      <div className="dropdown-content menu bg-base-300 rounded-box z-1 w-52 p-2 shadow-2xl">
        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4 w-full">
          <legend className="fieldset-legend">Group Name?</legend>
          <div className="join">
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="input join-item"
              placeholder="Name"
            />
            <button onClick={createGroup} className="btn join-item">
              <CgAddR size={20} />
            </button>
          </div>
        </fieldset>
        <ul tabIndex={0}>
          {friends.map((friend) => (
            <NewGroupChatItem
              key={friend.id}
              friend={friend}
              setGroupMembers={setGroupMembers}
              groupMembers={groupMembers}
              chats={chats}
              uid={uid}
            />
          ))}
        </ul>
      </div>
    </div>
  )
}

// Friends

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

const FriendList = ({ uid }) => {
  const friends = useContext(FriendContext)
  const [searchTerm, setSearchTerm] = useState('')
  console.log('Original FRIENDS!!!!!!', friends)

  const filteredFriends = friends
    .filter((friend) =>
      friend.username.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) =>
      a.username.trim().toLowerCase().localeCompare(b.username.trim().toLowerCase())
    )
    console.log("FilteredFriends + SorterFriends: ", filteredFriends)

  return (
    <>
      <div className="flex flex-row">
        <SearchBar onSearch={setSearchTerm} />
        <NewFriend uid={uid} />
      </div>
      <div>
        <ul>
          {filteredFriends.map((friend) => (
            <FriendListItem key={friend.id} friend={friend} />
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

const SideBar = ({ chats, uid, setSelectedChat, user }) => {
  const [selectedSideBar, setSetlectedSideBar] = useState('chats')

  if (!chats) return 'No chats'

  console.log('chats', chats)

  return (
    <div className="flex flex-col h-full p-2">
      <div role="tablist" className="tabs tabs-lift p-1 shrink-0">
        <a
          role="tab"
          onClick={() => setSetlectedSideBar('chats')}
          className={`tab ${selectedSideBar === 'chats' ? 'tab-active' : ''} text-xl`}
        >
          <LuMessagesSquare />
          Chats
        </a>
        <a
          role="tab"
          onClick={() => setSetlectedSideBar('friends')}
          className={`tab ${selectedSideBar === 'friends' ? 'tab-active' : ''} text-xl`}
        >
          <LuUsers />
          Friends
        </a>
      </div>

      <div className="flex-1 overflow-y-auto">
        {selectedSideBar === 'chats' ? (
          <ChatList chats={chats} uid={uid} setSelectedChat={setSelectedChat} />
        ) : (
          <FriendList uid={uid} />
        )}
      </div>

      <div className="shrink-0 border-t border-base-200 pt-2">
        <Profile user={user} uid={uid} />
      </div>
    </div>
  )
}

export default SideBar
