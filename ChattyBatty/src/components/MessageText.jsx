const URL_PATTERN = /(https?:\/\/[^\s<]+)/g
const TRAILING_PUNCTUATION = /[.,!?;:)\]'"]+$/

/** Message text with http(s) links made clickable. Everything else stays plain text. */
const MessageText = ({ text }) =>
  text.split(URL_PATTERN).map((part, i) => {
    if (i % 2 === 0) return part
    const trailing = part.match(TRAILING_PUNCTUATION)?.[0] ?? ''
    const url = trailing ? part.slice(0, -trailing.length) : part
    return (
      <span key={i}>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 break-all"
        >
          {url}
        </a>
        {trailing}
      </span>
    )
  })

export default MessageText
