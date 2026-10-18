import { useState } from 'react'
import { LuCheck, LuPalette } from 'react-icons/lu'
import { THEMES, applyTheme, getSavedTheme } from '../lib/theme'

// Each option previews its own palette by rendering under that theme.
const Swatch = ({ name }) => (
  <span
    data-theme={name}
    className="flex gap-0.5 rounded-md bg-base-100 p-1 shadow-sm"
    aria-hidden="true"
  >
    <span className="size-2 rounded-full bg-primary" />
    <span className="size-2 rounded-full bg-secondary" />
    <span className="size-2 rounded-full bg-accent" />
  </span>
)

const ThemeSelector = ({ align = 'dropdown-end' }) => {
  const [theme, setTheme] = useState(getSavedTheme)

  const choose = (name) => {
    setTheme(name)
    applyTheme(name)
    document.activeElement?.blur()
  }

  return (
    <div className={`dropdown ${align} no-drag`}>
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-sm btn-square"
        aria-label="Change theme"
        title="Change theme"
      >
        <LuPalette className="size-5" />
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-200 rounded-box z-50 w-52 p-2 shadow-xl max-h-[70dvh] overflow-y-auto flex-nowrap"
        aria-label="Themes"
      >
        {THEMES.map(({ name, label }) => (
          <li key={name}>
            <button
              type="button"
              onClick={() => choose(name)}
              aria-pressed={theme === name}
              className={theme === name ? 'menu-active' : ''}
            >
              <Swatch name={name} />
              <span className="flex-1">{label}</span>
              {theme === name && <LuCheck aria-hidden="true" />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ThemeSelector
