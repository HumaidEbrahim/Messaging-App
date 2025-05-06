import { db } from '../firebaseConfig'
import {
  doc,
  addDoc,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore'
import { useCollection } from 'react-firebase-hooks/firestore'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useRef,useState,useEffect } from 'react' //Added UseRef and UseEffect for Scroll 

dayjs.extend(relativeTime)

const BlankChat = () => {
  return (
    <div className="flex flex-col h-full w-full ">
      <div className="flex flex-1 justify-center items-center">
        <p className="text-3xl text-base-300 font-semibold "> ChattyBatty </p>
      </div>
    </div>
  )
}

const ChatHeader = () => {
  return <div className="navbar  "></div>
}

const MessageReceived = ({ message, friend }) => {
  return (
    <div className="flex items-start space-x-3">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full overflow-hidden">
        <img
          src={friend.photo}
          alt={`${friend.username}'s avatar`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Message Content */}
      <div className="flex flex-col space-y-1">
        {/* Header */}
        <div className="flex items-center space-x-2 text-sm text-gray-700">
          <span className="font-medium">{friend.username}</span>
          <time className="text-xs text-gray-400">
            {' '}
            {dayjs(message.sentAt.toDate()).fromNow()}
          </time>
        </div>

        {/* Chat Bubble */}
        <div className="chat-bubble bg-secondary text-black p-2 rounded-lg max-w-xs">
          {message.message}
        </div>

        {/* Footer */}
        <div className="text-xs text-gray-400">Delivered</div>
      </div>
    </div>
  )
}

const MessageSent = ({ message }) => {
  return (
    <div className="flex justify-end">
      <div className="flex flex-col items-end space-y-1 max-w-xs pr-8">
        {/* Header */}
        <div className="flex items-center space-x-2 text-sm text-gray-700">
          <span className="font-medium">You</span>
          <time className="text-xs text-gray-400">
            {message?.sentAt?.toDate
              ? dayjs(message.sentAt.toDate()).fromNow()
              : 'Sending...'}
          </time>
        </div>

        {/* Chat Bubble */}
        <div className="chat-bubble bg-primary text-white p-2 rounded-lg">
          {message.message}
        </div>

        {/* Footer */}
        <div className="text-xs text-gray-400">Delivered</div>
      </div>
    </div>
  )
}

const Chat = ({ selectedChat, uid }) => {
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef(null)

  const sendMessage = async (event) => {
    event.preventDefault()
    
    // send message
    const docRef = await addDoc(
      collection(db, 'chat', selectedChat.chatId, 'messages'),
      {
        message: newMessage,
        sentBy: uid,
        sentAt: serverTimestamp(),
      },
    )

    // update lastMessage 
    await updateDoc(doc(db, 'chat', selectedChat.chatId),
  {
    lastMessage: {
      message: newMessage,
      sentBy: uid,
      sentAt: serverTimestamp()
    }
  })

    console.log('newMessage', docRef)
  }

  const q = selectedChat
    ? query(
        collection(doc(db, 'chat', selectedChat.chatId), 'messages'),
        orderBy('sentAt', 'asc'),
      )
    : null

  const [snapshot, error] = useCollection(q)

  const messages = snapshot?.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }))

  /*
  //Suli Added this (Testing Scroll into Effect) This broke everything
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  */
  

  console.log('messages', messages)

  if (!selectedChat) return <BlankChat />

  const friend = selectedChat.friend

  if (!messages) return <div>Akward Silence</div>

  return (
    <div className="flex flex-col h-screen w-full ">
      {/* Header */}
      <div className="p-4 font-bold border-b shrink-0 bg-base-100 z-10"># {friend.username}</div>
      <div className="flex-1  overflow-y-auto px-4 py-2 space-y-2 bg-base-200">
        {messages.map((message) =>
          message.sentBy === friend.id ? (
            <MessageReceived
              key={message.id}
              message={message}
              friend={friend}
            />
          ) : (
            <MessageSent key={message.id} message={message} />
          ),
        )}
    <div ref={messagesEndRef} />

      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className=" flex p-4 gap-2 border-t bg-base-100 shrink-0 ">
        <input
          className="flex-1 input p-6 border rounded"
          placeholder="Enter a message"
          value={newMessage}
          onChange={(event) => setNewMessage(event.target.value)}
        />
        <button className="btn btn-primary px-4 py-2" type="submit">
          Send
        </button>
      </form>
    </div>
  )
}

export default Chat