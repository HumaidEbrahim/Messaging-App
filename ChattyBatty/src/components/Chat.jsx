const ChatHeader = () => {
  return(
    <div className="navbar  ">
      Hey
      </div>
  )
}

const Message = () => {
  return (
    <div> 
        <div className="chat-image avatar w-10 rounded-full">
          <img
            alt="Tailwind CSS chat bubble component"
            src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
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
const Chat = () => {
  return (
    <div className="flex flex-col h-full">
      {/* Message list area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <Message />
        <Message />
        <Message />
      </div>

      {/* Send message input */}
      <div className="p-4 border-t">
        Send Message
      </div>
    </div>
  );
};


export default Chat
