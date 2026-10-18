import { useState } from 'react'
import { LuLogOut } from 'react-icons/lu'
import { useToast } from '../context/ToastContext'
import { logout } from '../lib/auth'
import { describeError, updateStatus } from '../lib/chatApi'
import { MAX_STATUS_LENGTH } from '../lib/constants'
import { formatMemberSince } from '../lib/format'
import Avatar from './Avatar'
import Modal from './Modal'

const StatusForm = ({ user, uid }) => {
  const toast = useToast()
  const [status, setStatus] = useState(user.status || '')
  const [saving, setSaving] = useState(false)
  const unchanged = status.trim() === (user.status || '').trim()

  const save = async (event) => {
    event.preventDefault()
    if (unchanged) return
    setSaving(true)
    try {
      await updateStatus(uid, status)
      toast.success('Status updated.')
    } catch (err) {
      toast.error(describeError(err, "Couldn't update your status."))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-1 w-full">
      <label htmlFor="status-input" className="text-sm font-medium">
        Status
      </label>
      <div className="join w-full">
        <input
          id="status-input"
          className="input join-item flex-1"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          maxLength={MAX_STATUS_LENGTH}
          placeholder="What are you up to?"
        />
        <button
          className="btn btn-primary join-item"
          disabled={unchanged || saving}
        >
          {saving ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            'Save'
          )}
        </button>
      </div>
      <span className="text-xs text-base-content/55 self-end">
        {status.length}/{MAX_STATUS_LENGTH}
      </span>
    </form>
  )
}

const Profile = ({ user, uid }) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-base-200 text-left"
        aria-label="Your profile"
      >
        <Avatar src={user.photo} name={user.username} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{user.username}</p>
          <p className="text-sm text-base-content/60 truncate">{user.status}</p>
        </div>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Your profile">
        <div className="flex flex-col items-center gap-3 pt-2">
          <Avatar src={user.photo} name={user.username} size="xl" />
          <div className="text-center">
            <p className="text-2xl font-bold tracking-tight">{user.username}</p>
            <p className="text-base-content/65">{user.email}</p>
            {user.creationDate && (
              <p className="text-sm text-base-content/55 mt-1">
                Member since {formatMemberSince(user.creationDate)}
              </p>
            )}
          </div>
          <StatusForm user={user} uid={uid} />
          <button
            className="btn btn-ghost text-error w-full mt-2"
            onClick={logout}
          >
            <LuLogOut aria-hidden="true" />
            Sign out
          </button>
        </div>
      </Modal>
    </>
  )
}

export default Profile
