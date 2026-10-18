import { useState } from 'react'
import { LuCheck, LuUserPlus, LuX } from 'react-icons/lu'
import { useFriends } from '../context/FriendContext'
import { useToast } from '../context/ToastContext'
import {
  acceptFriendRequest,
  declineFriendRequest,
  describeError,
  openDirectChat,
} from '../lib/chatApi'
import Avatar from './Avatar'
import SearchBar from './SearchBar'
import AddFriendDialog from './AddFriendDialog'

const RequestItem = ({ person, uid }) => {
  const toast = useToast()
  const [busy, setBusy] = useState(false)

  const respond = async (accept) => {
    setBusy(true)
    try {
      if (accept) {
        await acceptFriendRequest(uid, person.id)
        toast.success(`You and ${person.username} are now friends.`)
      } else {
        await declineFriendRequest(uid, person.id)
      }
    } catch (err) {
      toast.error(describeError(err))
      setBusy(false)
    }
  }

  return (
    <li className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-base-200">
      <Avatar src={person.photo} name={person.username} />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{person.username}</p>
        <p className="text-xs text-base-content/60">Wants to be friends</p>
      </div>
      <button
        className="btn btn-primary btn-sm btn-circle"
        onClick={() => respond(true)}
        disabled={busy}
        aria-label={`Accept ${person.username}`}
        title="Accept"
      >
        <LuCheck />
      </button>
      <button
        className="btn btn-ghost btn-sm btn-circle"
        onClick={() => respond(false)}
        disabled={busy}
        aria-label={`Decline ${person.username}`}
        title="Decline"
      >
        <LuX />
      </button>
    </li>
  )
}

const FriendItem = ({ friend, onOpen }) => (
  <li>
    <button
      type="button"
      onClick={() => onOpen(friend)}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-base-200 text-left"
      title={`Message ${friend.username}`}
    >
      <Avatar src={friend.photo} name={friend.username} />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{friend.username}</p>
        <p className="text-sm text-base-content/60 truncate">{friend.status}</p>
      </div>
    </button>
  </li>
)

const FriendList = ({ uid, user, chats, onOpenChat }) => {
  const { friends, requests, loading } = useFriends()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [adding, setAdding] = useState(false)

  const term = search.trim().toLowerCase()
  const visible = term
    ? friends.filter((friend) => friend.username?.toLowerCase().includes(term))
    : friends

  const openChat = async (friend) => {
    try {
      onOpenChat(await openDirectChat({ chats, uid, friendId: friend.id }))
    } catch (err) {
      toast.error(
        describeError(err, `Couldn't open a chat with ${friend.username}.`),
      )
    }
  }

  return (
    <>
      <div className="flex items-center gap-1 px-3 pb-2">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search friends"
        />
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square"
          onClick={() => setAdding(true)}
          aria-label="Add a friend"
          title="Add a friend"
        >
          <LuUserPlus className="size-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {requests.length > 0 && (
          <section className="mb-3" aria-labelledby="requests-heading">
            <h3
              id="requests-heading"
              className="text-sm font-semibold px-3 py-1 text-base-content/70"
            >
              Friend requests
            </h3>
            <ul className="flex flex-col gap-1">
              {requests.map((person) => (
                <RequestItem key={person.id} person={person} uid={uid} />
              ))}
            </ul>
          </section>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <span
              className="loading loading-dots"
              aria-label="Loading friends"
            />
          </div>
        ) : friends.length === 0 ? (
          <div className="flex flex-col items-center text-center gap-3 px-6 py-10">
            <p className="font-semibold text-lg">No friends yet</p>
            <p className="text-sm text-base-content/65">
              Add someone by the email they use to sign in.
            </p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setAdding(true)}
            >
              Add a friend
            </button>
          </div>
        ) : (
          <>
            {requests.length > 0 && (
              <h3 className="text-sm font-semibold px-3 py-1 text-base-content/70">
                Friends
              </h3>
            )}
            <ul className="flex flex-col gap-0.5">
              {visible.map((friend) => (
                <FriendItem key={friend.id} friend={friend} onOpen={openChat} />
              ))}
            </ul>
            {visible.length === 0 && (
              <p className="text-sm text-base-content/60 text-center py-8">
                No friends match “{search}”.
              </p>
            )}
          </>
        )}
      </div>

      <AddFriendDialog
        open={adding}
        onClose={() => setAdding(false)}
        user={{ ...user, id: uid }}
      />
    </>
  )
}

export default FriendList
