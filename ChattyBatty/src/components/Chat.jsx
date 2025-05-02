import { db } from '../firebaseConfig'
import { doc, addDoc,collection, query, where, orderBy, serverTimestamp } from 'firebase/firestore'
import { useCollection } from 'react-firebase-hooks/firestore'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useState } from 'react'

dayjs.extend(relativeTime)

const BlankChat = () => {
 return( <div className="flex flex-col h-full">

    <div className='justify-center '> 
      <p className='text-9xl'> Start Chatting </p>
    </div>

    </div>)
}

const ChatHeader = () => {
  return(
    <div className="navbar  ">
      
      </div>
  )
}

const MessageReceived = ({  message, friend }) => {
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
        <time className="text-xs text-gray-400"> {dayjs(message.sentAt.toDate()).fromNow()}</time>
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
      <div className="flex flex-col items-end space-y-1 max-w-xs">
        {/* Header */}
        <div className="flex items-center space-x-2 text-sm text-gray-700">
          <span className="font-medium">You</span>
          <time className="text-xs text-gray-400">{message?.sentAt?.toDate ? dayjs(message.sentAt.toDate()).fromNow() : 'Sending...'}</time>
        </div>

        {/* Chat Bubble */}
        <div className="chat-bubble bg-primary text-white p-2 rounded-lg">
          {message.message}
        </div>

        {/* Footer */}
        <div className="text-xs text-gray-400">Delivered</div>
      </div>
    </div>
  );
};


const Chat = ({selectedChat, uid}) => {

  const[newMessage, setNewMessage] = useState()

  const sendMessage = async (event) => {
    event.preventDefault()
    const docRef = await addDoc(collection(db, 'chat', selectedChat.chatId, 'messages'), {
      message: newMessage,
      sentBy: uid,
      sentAt: serverTimestamp()

    })
    console.log("newMessage",docRef)
  }

  const q = selectedChat?
   query(collection(doc(db, 'chat', selectedChat.chatId), 'messages'), orderBy('sentAt', 'asc'))
   :null

  const [snapshot, error] = useCollection(q)

  const messages = snapshot?.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
  })) 

  console.log("messages",messages)

  if(!selectedChat)
    return <BlankChat />

  const friend = selectedChat.friend

  if(!messages)
    return <div>Akward Silence</div>
  return (
    <div className="flex flex-col  w-full">

      <div className="p-4 font-bold border-b">{friend.username}</div>
  
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map(message =>
          message.sentBy === friend.id ? (
            <MessageReceived key={message.id} message={message} friend={friend} />
          ) : (
            <MessageSent key={message.id} message={message} />
          )
        )}
      </div>
  
 
      <form onSubmit={sendMessage} className="flex p-8 gap-2">
        <input
          className="flex-1 input p-8 border rounded"
          placeholder="Enter a message"
          value={newMessage}
          onChange={event => setNewMessage(event.target.value)}
        />
        <button className="btn btn-primary px-4 py-8" type="submit">
          Send
        </button>
      </form>
    </div>
  );
  
};


export default Chat
