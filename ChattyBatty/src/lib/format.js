import dayjs from 'dayjs'

/** Converts a Firestore Timestamp (or null) to a dayjs instance (or null). */
export const toDay = (timestamp) =>
  timestamp?.toDate ? dayjs(timestamp.toDate()) : null

export const toMillis = (timestamp) => timestamp?.toMillis?.() ?? 0

/** Short timestamp for the chat list: time today, "Yesterday", weekday, or date. */
export const formatListTime = (timestamp) => {
  const date = toDay(timestamp)
  if (!date) return ''
  const now = dayjs()
  if (date.isSame(now, 'day')) return date.format('h:mm A')
  if (date.isSame(now.subtract(1, 'day'), 'day')) return 'Yesterday'
  if (date.isAfter(now.subtract(6, 'day'), 'day')) return date.format('ddd')
  if (date.isSame(now, 'year')) return date.format('MMM D')
  return date.format('M/D/YY')
}

export const formatDayHeading = (date) => {
  const now = dayjs()
  if (date.isSame(now, 'day')) return 'Today'
  if (date.isSame(now.subtract(1, 'day'), 'day')) return 'Yesterday'
  if (date.isSame(now, 'year')) return date.format('dddd, MMMM D')
  return date.format('MMMM D, YYYY')
}

export const formatMemberSince = (timestamp) =>
  toDay(timestamp)?.format('MMMM YYYY') ?? ''

export const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '?'

// Defined in index.css; each is readable on every theme.
const NAME_COLOR_COUNT = 6

/** A stable theme colour per user id, so each person keeps the same colour. */
export const nameColor = (id = '') => {
  let hash = 0
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) | 0
  return `name-color-${Math.abs(hash) % NAME_COLOR_COUNT}`
}

export const pluralize = (count, word, plural = `${word}s`) =>
  `${count} ${count === 1 ? word : plural}`
