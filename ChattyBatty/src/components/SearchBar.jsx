import { LuSearch, LuX } from 'react-icons/lu'

const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search',
  label = 'Search',
}) => (
  <label className="input input-sm flex-1 min-w-0 rounded-full">
    <LuSearch className="opacity-50 shrink-0" aria-hidden="true" />
    <input
      type="search"
      value={value}
      placeholder={placeholder}
      aria-label={label}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => event.key === 'Escape' && onChange('')}
    />
    {value && (
      <button
        type="button"
        className="opacity-60 hover:opacity-100"
        onClick={() => onChange('')}
        aria-label="Clear search"
      >
        <LuX />
      </button>
    )}
  </label>
)

export default SearchBar
