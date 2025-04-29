import { useState } from "react";

const ThemeSelector = () => {
  const [theme, setTheme] = useState('dark')

  const handleThemeChange = (e) => {
    const selectedTheme = e.target.value
    setTheme(selectedTheme)
    document.documentElement.setAttribute("data-theme", selectedTheme)
  }

  const themes = [
    { name: "dark", emoji: "🌑" },
    { name: "retro", emoji: "☎️" },
    { name: "cyberpunk", emoji: "😎" },
    { name: "night", emoji: "🌙" },
    { name: "coffee", emoji: "☕" },
    { name: "aqua", emoji: "🌊" },
    { name: "sunset", emoji: "🌄" },
  ];
  

  const ListItem = ({ name, emoji }) => (
    <li>
    <input
      type="radio"
      name="theme-dropdown"
      className="theme-controller w-full btn btn-sm btn-block btn-ghost justify-start"
      aria-label={name + emoji}
      value={name} />
  </li>
  )

  return (
    <div className="dropdown mb-2">
    <div tabIndex={0} role="button" className="btn m-1">
      Theme
      <svg
        width="12px"
        height="12px"
        className="inline-block h-2 w-2 fill-current opacity-60"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 2048 2048">
        <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
      </svg>
    </div>
    <ul tabIndex={0} className="dropdown-content bg-base-300 rounded-box z-1 w-52 p-2 shadow-2xl">
     {themes.map(theme => <ListItem name={theme.name} emoji={theme.emoji}/>)}
    </ul>
  </div>
  )
}

export default ThemeSelector;
