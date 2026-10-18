import { useState } from 'react'
import { LuMail } from 'react-icons/lu'
import { useToast } from '../context/ToastContext'
import { useUsers } from '../hooks/useUsers'
import {
  acceptFriendRequest,
  cancelFriendRequest,
  describeError,
  findUserByEmail,
  sendFriendRequest,
} from '../lib/chatApi'
import { formatMemberSince } from '../lib/format'
import Avatar from './Avatar'
import Modal from './Modal'

// What we can do with the person we found, given both profiles.
const relationship = (me, them) => {
  if (them.id === me.id) return 'self'
  if (me.friends?.includes(them.id)) return 'friends'
  if (me.incomingRequests?.includes(them.id)) return 'they-asked'
  if (them.incomingRequests?.includes(me.id)) return 'requested'
  return 'none'
}

const AddFriendForm = ({ user }) => {
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [searching, setSearching] = useState(false)
  const [foundId, setFoundId] = useState(null)
  const [notFound, setNotFound] = useState('')
  const [busy, setBusy] = useState(false)

  // Keep the found profile live so the button reflects the current state.
  const { byId } = useUsers(foundId ? [foundId] : [])
  const found = foundId ? byId.get(foundId) : null

  const search = async (event) => {
    event.preventDefault()
    setNotFound('')
    setFoundId(null)
    setSearching(true)
    try {
      const result = await findUserByEmail(email)
      if (result) setFoundId(result.id)
      else setNotFound(email.trim())
    } catch (err) {
      toast.error(describeError(err, "Couldn't search right now."))
    } finally {
      setSearching(false)
    }
  }

  const run = async (action, success) => {
    setBusy(true)
    try {
      await action()
      if (success) toast.success(success)
    } catch (err) {
      toast.error(describeError(err))
    } finally {
      setBusy(false)
    }
  }

  const state = found ? relationship(user, found) : null

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={search} className="join w-full">
        <label className="input join-item flex-1">
          <LuMail className="opacity-50" aria-hidden="true" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="friend@example.com"
            aria-label="Friend's email address"
            autoComplete="off"
            required
            autoFocus
          />
        </label>
        <button className="btn btn-primary join-item" disabled={searching}>
          {searching ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            'Find'
          )}
        </button>
      </form>

      {notFound && (
        <p className="text-sm text-base-content/70" role="status">
          Nobody with <span className="font-medium">{notFound}</span> has signed
          in to ChattyBatty yet. Ask them to sign in once, then search again.
        </p>
      )}

      {found && (
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-base-200">
          <Avatar src={found.photo} name={found.username} size="lg" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{found.username}</p>
            <p className="text-sm text-base-content/65 truncate">
              {found.status}
            </p>
            {found.creationDate && (
              <p className="text-xs text-base-content/55">
                Joined {formatMemberSince(found.creationDate)}
              </p>
            )}
          </div>
          {state === 'self' && (
            <span className="text-sm text-base-content/60">That's you</span>
          )}
          {state === 'friends' && (
            <span className="badge badge-success badge-soft">Friends</span>
          )}
          {state === 'none' && (
            <button
              className="btn btn-primary btn-sm"
              disabled={busy}
              onClick={() =>
                run(
                  () => sendFriendRequest(user.id, found.id),
                  `Request sent to ${found.username}.`,
                )
              }
            >
              Send request
            </button>
          )}
          {state === 'requested' && (
            <button
              className="btn btn-ghost btn-sm"
              disabled={busy}
              onClick={() =>
                run(
                  () => cancelFriendRequest(user.id, found.id),
                  'Request cancelled.',
                )
              }
            >
              Cancel request
            </button>
          )}
          {state === 'they-asked' && (
            <button
              className="btn btn-primary btn-sm"
              disabled={busy}
              onClick={() =>
                run(
                  () => acceptFriendRequest(user.id, found.id),
                  `You and ${found.username} are now friends.`,
                )
              }
            >
              Accept
            </button>
          )}
        </div>
      )}
    </div>
  )
}

const AddFriendDialog = ({ open, onClose, user }) => (
  <Modal open={open} onClose={onClose} title="Add a friend">
    <p className="text-sm text-base-content/70 mb-4">
      Search by the email they use to sign in. They'll get a request to accept.
    </p>
    <AddFriendForm user={user} />
  </Modal>
)

export default AddFriendDialog
