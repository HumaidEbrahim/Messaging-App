import Logo from './Logo'

const BlankChat = ({ hasChats }) => (
  <div className="flex flex-col h-full w-full items-center justify-center gap-4 p-8 text-center bg-base-200/50">
    <Logo size={160} className="text-base-content/15" />
    <p className="text-2xl font-bold tracking-tight text-base-content/70">
      {hasChats ? 'Pick a conversation' : 'Nothing here yet'}
    </p>
    <p className="text-base-content/55 max-w-[36ch]">
      {hasChats
        ? 'Choose a chat from the list, or start a new one with the pencil button.'
        : 'Add a friend from the Friends tab, then start a chat with them.'}
    </p>
  </div>
)

export default BlankChat
