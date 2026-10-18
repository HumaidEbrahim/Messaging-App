import { useState } from 'react'
import { LuUsersRound } from 'react-icons/lu'
import { useFriends } from '../context/FriendContext'
import { useToast } from '../context/ToastContext'
import { describeError, openDirectChat } from '../lib/chatApi'
import Modal from './Modal'
import MemberPicker from './MemberPicker'

const NewChatDialog = ({
  open,
  onClose,
  uid,
  chats,
  onOpenChat,
  onNewGroup,
  onFindFriends,
}) => {
  const { friends } = useFriends()
  const toast = useToast()
  const [busy, setBusy] = useState(false)

  const pick = async (friend) => {
    if (busy) return
    setBusy(true)
    try {
      const id = await openDirectChat({ chats, uid, friendId: friend.id })
      onOpenChat(id)
      onClose()
    } catch (err) {
      toast.error(
        describeError(err, `Couldn't open a chat with ${friend.username}.`),
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New chat">
      <button
        type="button"
        className="w-full flex items-center gap-3 px-2 py-2 -mx-2 mb-2 rounded-xl hover:bg-base-200 text-left"
        onClick={onNewGroup}
      >
        <span className="size-8 rounded-full bg-primary text-primary-content grid place-items-center">
          <LuUsersRound aria-hidden="true" />
        </span>
        <span className="font-medium">New group</span>
      </button>
      <div className="divider my-1" />
      {friends.length === 0 ? (
        <div className="flex flex-col items-start gap-3 py-2">
          <p className="text-sm text-base-content/65">
            You don't have any friends here yet. Add someone by email to start
            chatting.
          </p>
          <button className="btn btn-primary btn-sm" onClick={onFindFriends}>
            Add friends
          </button>
        </div>
      ) : (
        <div aria-busy={busy}>
          <MemberPicker people={friends} onPick={pick} />
        </div>
      )}
    </Modal>
  )
}

export default NewChatDialog
