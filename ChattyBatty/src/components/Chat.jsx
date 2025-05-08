import { db } from '../firebaseConfig'
import {
  doc,
  addDoc,
  collection,
  query,
  orderBy,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore'
import { useCollection } from 'react-firebase-hooks/firestore'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useRef, useState, useEffect } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { IoIosSend } from "react-icons/io"
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react'
import { FaSmile } from "react-icons/fa"
import { IoMdAttach } from "react-icons/io"

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
      <div className="w-10 h-10 rounded-full overflow-hidden">
        <img
          src={friend.photo}
          alt={`${friend.username}'s avatar`}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex flex-col space-y-1">
        <div className="flex items-center space-x-2 text-sm text-gray-700">
          <span className="font-medium">{friend.username}</span>
          <time className="text-xs text-gray-400">
            {dayjs(message.sentAt.toDate()).fromNow()}
          </time>
        </div>
        <div className="chat-bubble bg-secondary text-black p-3 rounded-lg max-w-[100%] break-words whitespace-pre-wrap">
          {message.message}
        </div>
        <div className="text-xs text-gray-400">Delivered</div>
      </div>
    </div>
  )
}

const MessageSent = ({ message }) => {
  return (
    <div className="flex justify-end">
      <div className="flex flex-col space-y-1">
        <div className="flex items-center space-x-2 text-sm text-gray-700">
          <span className="font-medium">You</span>
          <time className="text-xs text-gray-400">
            {message?.sentAt?.toDate
              ? dayjs(message.sentAt.toDate()).fromNow()
              : 'Sending...'}
          </time>
        </div>
        <div className="chat-bubble bg-primary text-black p-3 rounded-lg max-w-[100%] break-words whitespace-pre-wrap">
          {message.message}
        </div>
        <div className="text-xs text-gray-400">Delivered</div>
      </div>
    </div>
  )
}

const Chat = ({ selectedChat, uid }) => {
  const [newMessage, setNewMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef(null)

  const sendMessage = async (event) => {
    event.preventDefault()

    if (!newMessage.trim()) return

    const docRef = await addDoc(
      collection(db, 'chat', selectedChat.chatId, 'messages'),
      {
        message: newMessage,
        sentBy: uid,
        sentAt: serverTimestamp(),
      }
    )

    await updateDoc(doc(db, 'chat', selectedChat.chatId), {
      lastMessage: {
        message: newMessage,
        sentBy: uid,
        sentAt: serverTimestamp()
      }
    })

    setNewMessage('')
    setShowEmojiPicker(false)
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const q = selectedChat
    ? query(
        collection(doc(db, 'chat', selectedChat.chatId), 'messages'),
        orderBy('sentAt', 'asc')
      )
    : null

  const [snapshot] = useCollection(q)

  const messages = snapshot?.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }))

  const onEmojiClick = (emojiData) => {
    setNewMessage((prev) => prev + emojiData.emoji)
    setShowEmojiPicker(false) // Hide picker after selection
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!selectedChat) return <BlankChat />

  const friend = selectedChat.friend

  if (!messages) return <div>Akward Silence</div>

  return (
    <div className="flex flex-col h-full w-full max-h-screen relative">
      <div className="p-4 font-bold border-b border-base-content/50 shrink-0 bg-base-100 z-10">
        # {friend.username}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 bg-base-200">
        {messages.map((message) =>
          message.sentBy === friend.id ? (
            <MessageReceived
              key={message.id}
              message={message}
              friend={friend}
            />
          ) : (
            <MessageSent key={message.id} message={message} />
          )
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Picker - absolutely positioned */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 left-4 z-50">
          <EmojiPicker
            onEmojiClick={onEmojiClick}
            theme="dark"
            autoFocusSearch={false}
            emojiStyle={EmojiStyle.NATIVE}
          />
        </div>
      )}

      {/* Input form */}
      <form
        onSubmit={sendMessage}
        className="w-full px-4 py-2 bg-base-100 border-t border-base-content/50"
      >
        <div className="flex items-center gap-2 bg-base-200 rounded-full px-3 py-2">
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-base-300 text-xl"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
          >
            <FaSmile />
          </button>

          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-base-300 text-xl"
          >
            <IoMdAttach />
          </button>

          <TextareaAutosize
            className="flex-1 resize-none bg-transparent outline-none text-base px-2"
            placeholder="Type a message"
            value={newMessage}
            onChange={(event) => setNewMessage(event.target.value)}
            minRows={1}
            maxRows={6}
          />

          <button
            type="submit"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary/80"
          >
            <IoIosSend className="text-lg" />
          </button>
        </div>
      </form>
    </div>
  )
}

export default Chat
