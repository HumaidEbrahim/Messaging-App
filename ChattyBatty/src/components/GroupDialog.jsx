import { useState } from 'react'
import { useFriends } from '../context/FriendContext'
import { useToast } from '../context/ToastContext'
import { createGroup, describeError } from '../lib/chatApi'
import {
  MAX_GROUP_DESC_LENGTH,
  MAX_GROUP_NAME_LENGTH,
  MAX_GROUP_SIZE,
} from '../lib/constants'
import { pluralize } from '../lib/format'
import Modal from './Modal'
import MemberPicker from './MemberPicker'

const GroupForm = ({ uid, onClose, onCreated }) => {
  const { friends } = useFriends()
  const toast = useToast()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [members, setMembers] = useState(() => new Set())
  const [busy, setBusy] = useState(false)

  const toggle = (id) =>
    setMembers((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else if (next.size < MAX_GROUP_SIZE - 1) next.add(id)
      return next
    })

  const canCreate = name.trim().length > 0 && members.size > 0 && !busy

  const submit = async (event) => {
    event.preventDefault()
    if (!canCreate) return
    setBusy(true)
    try {
      const id = await createGroup({
        uid,
        name,
        description,
        memberIds: [...members],
      })
      toast.success(`Created ${name.trim()}.`)
      onCreated(id)
      onClose()
    } catch (err) {
      toast.error(describeError(err, "Couldn't create the group."))
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" id="group-form">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Name</span>
        <input
          className="input w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={MAX_GROUP_NAME_LENGTH}
          placeholder="Weekend plans"
          required
          autoFocus
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">
          Description{' '}
          <span className="text-base-content/55 font-normal">(optional)</span>
        </span>
        <textarea
          className="textarea w-full"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={MAX_GROUP_DESC_LENGTH}
          placeholder="What's this group for?"
        />
      </label>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">
          Members{' '}
          <span className="text-base-content/55 font-normal">
            {members.size > 0
              ? `${pluralize(members.size, 'friend')} selected`
              : '(pick at least one)'}
          </span>
        </span>
        <MemberPicker
          people={friends}
          selected={members}
          onToggle={toggle}
          emptyText="Add some friends first, then you can make a group with them."
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={!canCreate}>
          {busy && <span className="loading loading-spinner loading-xs" />}
          Create group
        </button>
      </div>
    </form>
  )
}

const GroupDialog = ({ open, onClose, uid, onCreated }) => (
  <Modal open={open} onClose={onClose} title="New group">
    {/* Remounts on every open, so the form starts empty. */}
    {open && <GroupForm uid={uid} onClose={onClose} onCreated={onCreated} />}
  </Modal>
)

export default GroupDialog
