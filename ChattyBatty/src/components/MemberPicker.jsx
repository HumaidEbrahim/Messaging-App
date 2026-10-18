import { useState } from 'react'
import Avatar from './Avatar'
import SearchBar from './SearchBar'

/**
 * Searchable list of people. With `selected` + `onToggle` it's a multi-select
 * checklist; with `onPick` each row is a single-choice button.
 */
const MemberPicker = ({ people, selected, onToggle, onPick, emptyText }) => {
  const [search, setSearch] = useState('')
  const term = search.trim().toLowerCase()
  const visible = term
    ? people.filter((person) => person.username?.toLowerCase().includes(term))
    : people

  if (people.length === 0) {
    return <p className="text-sm text-base-content/65 py-4">{emptyText}</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {people.length > 6 && (
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search friends"
        />
      )}
      <ul className="flex flex-col gap-0.5 max-h-72 overflow-y-auto -mx-2">
        {visible.map((person) => {
          const row = (
            <>
              <Avatar src={person.photo} name={person.username} size="sm" />
              <span className="flex-1 min-w-0">
                <span className="block truncate font-medium">
                  {person.username}
                </span>
                <span className="block truncate text-xs text-base-content/60">
                  {person.status}
                </span>
              </span>
            </>
          )
          const rowClass =
            'w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-base-200 text-left cursor-pointer'

          return (
            <li key={person.id}>
              {onPick ? (
                <button
                  type="button"
                  className={rowClass}
                  onClick={() => onPick(person)}
                >
                  {row}
                </button>
              ) : (
                <label className={rowClass}>
                  {row}
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-sm"
                    checked={selected.has(person.id)}
                    onChange={() => onToggle(person.id)}
                  />
                </label>
              )}
            </li>
          )
        })}
        {visible.length === 0 && (
          <li className="text-sm text-base-content/60 px-2 py-3">
            Nobody matches “{search}”.
          </li>
        )}
      </ul>
    </div>
  )
}

export default MemberPicker
