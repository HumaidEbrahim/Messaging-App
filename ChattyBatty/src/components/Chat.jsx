import { db } from '../firebaseConfig'
import { doc, collection, query, where, orderBy } from 'firebase/firestore'
import { useCollection } from 'react-firebase-hooks/firestore'


const ChatHeader = () => {
  return(
    <div className="navbar  ">
      
      </div>
  )
}

const Message = ({ photo }) => {
  return (
    <div> 

        <div className=" avatar w-10 h-10 rounded-full object-cover">
          <img
            alt="Tailwind CSS chat bubble component"
            src={photo}
          />
        </div>
     
      <div className="chat-header">
        Obi-Wan Kenobi
        <time className="text-xs opacity-50">12:45</time>
      </div>
      <div className="chat-bubble">You were the Chosen One!</div>
      <div className="chat-footer opacity-50">Delivered</div>
      </div>
      
        
    
  )
}
const Chat = ({selectedChat}) => {

  const q = selectedChat?
   query(collection(doc(db, 'chat', selectedChat.chatId), 'messages'))
   :null

  const [snapshot, error] = useCollection(q)

  const messages = snapshot?.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
  })) 

  console.log("messages",messages)

  if(!selectedChat)
    return <div>no chat selected </div>

  const friend = selectedChat.friend
  return (
    <div className="flex flex-col h-full">
      {friend.username}
      {/* Message list area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <Message photo={friend.photo}/>
        <Message />
        <Message />
      </div>

      <div className="p-4 border-t">
       <input placeholder="Enter a message" />
      </div>
    </div>
  );
};


export default Chat
