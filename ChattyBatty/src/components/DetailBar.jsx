import { useState } from 'react'
import {
  LuCrown,
  LuDoorOpen,
  LuPencil,
  LuTrash2,
  LuUserMinus,
  LuUserPlus,
  LuX,
} from 'react-icons/lu'
import { useFriends } from '../context/FriendContext'
import { useToast } from '../context/ToastContext'
import {
  addGroupMembers,
  deleteGroup,
  describeError,
  leaveGroup,
  removeFriend,
  removeGroupMember,
  updateGroupDetails,
} from '../lib/chatApi'
import { chatIdentity } from '../lib/chats'
import {
  MAX_GROUP_DESC_LENGTH,
  MAX_GROUP_NAME_LENGTH,
  MAX_GROUP_SIZE,
} from '../lib/constants'
import { formatMemberSince, pluralize } from '../lib/format'
import Avatar from './Avatar'
import Modal from './Modal'
import MemberPicker from './MemberPicker'

// A confirmation step for anything destructive.
const ConfirmDialog = ({ confirm, onClose }) => {
  const toast = useToast()
  const [busy, setBusy] = useState(false)

  const run = async () => {
    setBusy(true)
    try {
      await confirm.action()
      if (confirm.success) toast.success(confirm.success)
      onClose()
    } catch (err) {
      toast.error(describeError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={!!confirm}
      onClose={busy ? () => {} : onClose}
      title={confirm?.title}
      actions={
        <>
          <button className="btn btn-ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button className="btn btn-error" onClick={run} disabled={busy}>
            {busy && <span className="loading loading-spinner loading-xs" />}
            {confirm?.confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-base-content/75">{confirm?.body}</p>
    </Modal>
  )
}

const EditGroupForm = ({ chat, onDone }) => {
  const toast = useToast()
  const [name, setName] = useState(chat.groupName || '')
  const [description, setDescription] = useState(chat.groupDesc || '')
  const [busy, setBusy] = useState(false)

  const save = async (event) => {
    event.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    try {
      await updateGroupDetails(chat.id, { name, description })
      toast.success('Group updated.')
      onDone()
    } catch (err) {
      toast.error(describeError(err, "Couldn't update the group."))
      setBusy(false)
    }
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-3 w-full">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Name</span>
        <input
          className="input w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={MAX_GROUP_NAME_LENGTH}
          required
          autoFocus
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Description</span>
        <textarea
          className="textarea w-full"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={MAX_GROUP_DESC_LENGTH}
        />
      </label>
      <div className="flex justify-end gap-2">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onDone}>
          Cancel
        </button>
        <button
          className="btn btn-primary btn-sm"
          disabled={busy || !name.trim()}
        >
          Save
        </button>
      </div>
    </form>
  )
}

const AddMembersForm = ({ chat, onClose }) => {
  const { friends } = useFriends()
  const toast = useToast()
  const [selected, setSelected] = useState(() => new Set())
  const [busy, setBusy] = useState(false)
  const candidates = friends.filter(
    (friend) => !chat.participants.includes(friend.id),
  )
  const room = MAX_GROUP_SIZE - chat.participants.length

  const toggle = (id) =>
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else if (next.size < room) next.add(id)
      return next
    })

  const add = async () => {
    setBusy(true)
    try {
      await addGroupMembers(chat.id, [...selected])
      toast.success(`Added ${pluralize(selected.size, 'member')}.`)
      onClose()
    } catch (err) {
      toast.error(describeError(err, "Couldn't add members."))
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <MemberPicker
        people={candidates}
        selected={selected}
        onToggle={toggle}
        emptyText="All of your friends are already in this group."
      />
      <div className="flex justify-end gap-2">
        <button className="btn btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={add}
          disabled={busy || selected.size === 0}
        >
          Add{' '}
          {selected.size > 0 ? pluralize(selected.size, 'member') : 'members'}
        </button>
      </div>
    </div>
  )
}

const Section = ({ title, action, children }) => (
  <section className="w-full">
    <div className="flex items-center justify-between mb-2 min-h-8">
      <h3 className="text-sm font-semibold text-base-content/70">{title}</h3>
      {action}
    </div>
    {children}
  </section>
)

const GroupDetails = ({ chat, participants, uid, onConfirm }) => {
  const [editing, setEditing] = useState(false)
  const [adding, setAdding] = useState(false)
  const isAdmin = chat.groupCreator === uid

  const members = chat.participants
    .map((id) => participants.get(id) ?? { id, username: 'Loading…' })
    .sort((a, b) =>
      a.id === chat.groupCreator
        ? -1
        : b.id === chat.groupCreator
          ? 1
          : (a.username || '').localeCompare(b.username || ''),
    )

  return (
    <>
      {editing ? (
        <EditGroupForm chat={chat} onDone={() => setEditing(false)} />
      ) : (
        <Section
          title="About"
          action={
            isAdmin && (
              <button
                className="btn btn-ghost btn-xs"
                onClick={() => setEditing(true)}
              >
                <LuPencil aria-hidden="true" /> Edit
              </button>
            )
          }
        >
          <p className="text-base-content/80 whitespace-pre-wrap break-words">
            {chat.groupDesc || (
              <span className="text-base-content/50">No description.</span>
            )}
          </p>
        </Section>
      )}

      <Section
        title={pluralize(chat.participants.length, 'member')}
        action={
          isAdmin && (
            <button
              className="btn btn-ghost btn-xs"
              onClick={() => setAdding(true)}
              disabled={chat.participants.length >= MAX_GROUP_SIZE}
            >
              <LuUserPlus aria-hidden="true" /> Add
            </button>
          )
        }
      >
        <ul className="flex flex-col gap-0.5 -mx-2">
          {members.map((member) => (
            <li
              key={member.id}
              className="group flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-base-200"
            >
              <Avatar src={member.photo} name={member.username} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {member.username}
                  {member.id === uid && (
                    <span className="text-base-content/50"> (you)</span>
                  )}
                </p>
                {member.id === chat.groupCreator && (
                  <p className="text-xs text-primary flex items-center gap-1">
                    <LuCrown aria-hidden="true" /> Admin
                  </p>
                )}
              </div>
              {isAdmin && member.id !== uid && (
                <button
                  className="btn btn-ghost btn-xs btn-circle opacity-60 hover:opacity-100 focus:opacity-100"
                  aria-label={`Remove ${member.username}`}
                  title="Remove from group"
                  onClick={() =>
                    onConfirm({
                      title: `Remove ${member.username}?`,
                      body: `${member.username} will no longer see new messages in ${chat.groupName}.`,
                      confirmLabel: 'Remove',
                      success: `Removed ${member.username}.`,
                      action: () => removeGroupMember(chat.id, member.id),
                    })
                  }
                >
                  <LuX />
                </button>
              )}
            </li>
          ))}
        </ul>
      </Section>

      <div className="w-full flex flex-col gap-2 pt-2">
        {isAdmin ? (
          <button
            className="btn btn-error btn-soft w-full"
            onClick={() =>
              onConfirm({
                title: `Delete ${chat.groupName}?`,
                body: 'This deletes the group and all of its messages for everyone. It can’t be undone.',
                confirmLabel: 'Delete group',
                success: 'Group deleted.',
                action: () => deleteGroup(chat.id),
              })
            }
          >
            <LuTrash2 aria-hidden="true" /> Delete group
          </button>
        ) : (
          <button
            className="btn btn-error btn-soft w-full"
            onClick={() =>
              onConfirm({
                title: `Leave ${chat.groupName}?`,
                body: 'You’ll stop getting messages from this group. An admin would have to add you back.',
                confirmLabel: 'Leave group',
                success: `You left ${chat.groupName}.`,
                action: () => leaveGroup(chat.id, uid),
              })
            }
          >
            <LuDoorOpen aria-hidden="true" /> Leave group
          </button>
        )}
      </div>

      <Modal open={adding} onClose={() => setAdding(false)} title="Add members">
        <AddMembersForm chat={chat} onClose={() => setAdding(false)} />
      </Modal>
    </>
  )
}

const PersonDetails = ({ person, uid, onConfirm }) => {
  const { friendIds } = useFriends()
  if (!person) return null
  const isFriend = friendIds.has(person.id)

  return (
    <>
      <Section title="Status">
        <p className="text-base-content/80 break-words">
          {person.status || '—'}
        </p>
      </Section>
      {person.email && (
        <Section title="Email">
          <a
            className="link link-hover break-all"
            href={`mailto:${person.email}`}
          >
            {person.email}
          </a>
        </Section>
      )}
      {person.creationDate && (
        <Section title="Member since">
          <p className="text-base-content/80">
            {formatMemberSince(person.creationDate)}
          </p>
        </Section>
      )}
      {isFriend && (
        <button
          className="btn btn-error btn-soft w-full mt-2"
          onClick={() =>
            onConfirm({
              title: `Remove ${person.username} as a friend?`,
              body: 'Your chat history stays, but you’ll need to send a new friend request to start new chats or groups with them.',
              confirmLabel: 'Remove friend',
              success: `Removed ${person.username} from your friends.`,
              action: () => removeFriend(uid, person.id),
            })
          }
        >
          <LuUserMinus aria-hidden="true" /> Remove friend
        </button>
      )}
    </>
  )
}

const DetailBar = ({ chat, participants, uid, onClose, showClose }) => {
  const [confirm, setConfirm] = useState(null)
  const { name, photo, isGroup, user } = chatIdentity(chat, uid, participants)

  return (
    <div className="flex flex-col items-center gap-5 p-6">
      {showClose && (
        <button
          className="btn btn-ghost btn-sm btn-circle self-end -mb-4"
          onClick={onClose}
          aria-label="Close details"
        >
          <LuX className="size-5" />
        </button>
      )}

      <div className="flex flex-col items-center gap-3 text-center">
        <Avatar src={photo} name={name} group={isGroup} size="xl" />
        <h2 className="text-2xl font-bold tracking-tight break-words">
          {name}
        </h2>
      </div>

      {isGroup ? (
        <GroupDetails
          chat={chat}
          participants={participants}
          uid={uid}
          onConfirm={setConfirm}
        />
      ) : (
        <PersonDetails person={user} uid={uid} onConfirm={setConfirm} />
      )}

      <ConfirmDialog confirm={confirm} onClose={() => setConfirm(null)} />
    </div>
  )
}

export default DetailBar
