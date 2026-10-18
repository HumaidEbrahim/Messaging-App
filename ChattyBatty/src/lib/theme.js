// Themes offered in the picker. Each must also be listed in index.css.
export const THEMES = [
  { name: 'dark', label: 'Dark' },
  { name: 'light', label: 'Light' },
  { name: 'night', label: 'Night' },
  { name: 'dim', label: 'Dim' },
  { name: 'abyss', label: 'Abyss' },
  { name: 'dracula', label: 'Dracula' },
  { name: 'synthwave', label: 'Synthwave' },
  { name: 'sunset', label: 'Sunset' },
  { name: 'forest', label: 'Forest' },
  { name: 'coffee', label: 'Coffee' },
  { name: 'aqua', label: 'Aqua' },
  { name: 'retro', label: 'Retro' },
  { name: 'cupcake', label: 'Cupcake' },
  { name: 'nord', label: 'Nord' },
]

export const DEFAULT_THEME = 'dark'
const STORAGE_KEY = 'theme'

export const getSavedTheme = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return THEMES.some((theme) => theme.name === saved) ? saved : DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

export const applyTheme = (name) => {
  document.documentElement.setAttribute('data-theme', name)
  try {
    localStorage.setItem(STORAGE_KEY, name)
  } catch {
    // Storage can be unavailable (private mode); the theme still applies.
  }
  window.dispatchEvent(new CustomEvent('themechange', { detail: name }))
}

/** 'dark' or 'light', read from the active daisyUI theme. */
export const currentColorScheme = () =>
  getComputedStyle(document.documentElement).colorScheme.includes('dark')
    ? 'dark'
    : 'light'
