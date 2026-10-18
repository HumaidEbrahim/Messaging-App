import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { LuSendHorizontal, LuSmile } from 'react-icons/lu'
import { useToast } from '../context/ToastContext'
import { describeError, sendMessage } from '../lib/chatApi'
import { MAX_MESSAGE_LENGTH } from '../lib/constants'
import { currentColorScheme } from '../lib/theme'

// The emoji picker is large, so it's only downloaded the first time it's opened.
const EmojiPicker = lazy(() => import('emoji-picker-react'))

// Unsent drafts survive switching between chats.
const drafts = new Map()

const Composer = ({ chatId, uid, onSent }) => {
  const toast = useToast()
  const [text, setText] = useState(() => drafts.get(chatId) ?? '')
  const [pickerOpen, setPickerOpen] = useState(false)
  const textareaRef = useRef(null)
  const pickerRef = useRef(null)

  useEffect(() => {
    drafts.set(chatId, text)
  }, [chatId, text])

  // Focus the box when a chat opens, except on touch screens where that
  // would pop up the keyboard unasked.
  useEffect(() => {
    if (window.matchMedia('(pointer: fine)').matches)
      textareaRef.current?.focus()
  }, [chatId])

  useEffect(() => {
    if (!pickerOpen) return
    const onPointerDown = (event) => {
      if (!pickerRef.current?.contains(event.target)) setPickerOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setPickerOpen(false)
        textareaRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [pickerOpen])

  const trimmed = text.trim()
  const tooLong = text.length > MAX_MESSAGE_LENGTH
  const canSend = trimmed.length > 0 && !tooLong

  const send = async () => {
    if (!canSend) return
    const outgoing = text
    // Clear right away so typing the next message feels instant.
    setText('')
    setPickerOpen(false)
    onSent?.()
    try {
      await sendMessage({ chatId, uid, text: outgoing })
    } catch (err) {
      setText((current) => current || outgoing)
      toast.error(describeError(err, "Your message wasn't sent. Try again."))
    }
  }

  const insertEmoji = ({ emoji }) => {
    const el = textareaRef.current
    const start = el?.selectionStart ?? text.length
    const end = el?.selectionEnd ?? text.length
    setText(text.slice(0, start) + emoji + text.slice(end))
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(start + emoji.length, start + emoji.length)
    })
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        send()
      }}
      className="relative shrink-0 px-3 sm:px-4 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-base-100"
    >
      <div ref={pickerRef}>
        {pickerOpen && (
          <div className="absolute bottom-full left-3 mb-2 z-20 shadow-2xl rounded-xl">
            <Suspense
              fallback={
                <div className="w-[350px] h-[450px] max-w-[calc(100vw-1.5rem)] grid place-items-center bg-base-200 rounded-xl">
                  <span className="loading loading-spinner" />
                </div>
              }
            >
              <EmojiPicker
                onEmojiClick={insertEmoji}
                theme={currentColorScheme()}
                emojiStyle="native"
                lazyLoadEmojis
                previewConfig={{ showPreview: false }}
                width={Math.min(350, window.innerWidth - 24)}
              />
            </Suspense>
          </div>
        )}

        <div
          className={`flex items-end gap-1 rounded-3xl bg-base-200 pl-1.5 pr-1.5 py-1.5 border ${
            tooLong
              ? 'border-error'
              : 'border-transparent focus-within:border-primary/50'
          }`}
        >
          <button
            type="button"
            className={`btn btn-ghost btn-sm btn-circle ${pickerOpen ? 'text-primary' : ''}`}
            onClick={() => setPickerOpen((open) => !open)}
            aria-label="Emoji"
            aria-expanded={pickerOpen}
            title="Emoji"
          >
            <LuSmile className="size-5" />
          </button>

          <TextareaAutosize
            ref={textareaRef}
            className="flex-1 resize-none bg-transparent outline-none px-1 py-1.5 leading-snug placeholder:text-base-content/45"
            placeholder="Write a message"
            aria-label="Message"
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              // Enter sends, Shift+Enter adds a line. Ignore Enter while an
              // input method (e.g. for Japanese or Chinese) is composing.
              if (
                event.key === 'Enter' &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault()
                send()
              }
            }}
            minRows={1}
            maxRows={6}
          />

          <button
            type="submit"
            className="btn btn-primary btn-sm btn-circle"
            disabled={!canSend}
            aria-label="Send message"
            title="Send (Enter)"
          >
            <LuSendHorizontal className="size-4" />
          </button>
        </div>
      </div>

      {text.length > MAX_MESSAGE_LENGTH - 200 && (
        <p
          className={`text-xs mt-1 text-right ${tooLong ? 'text-error' : 'text-base-content/55'}`}
          role={tooLong ? 'alert' : undefined}
        >
          {tooLong
            ? `${text.length - MAX_MESSAGE_LENGTH} characters over the limit`
            : `${MAX_MESSAGE_LENGTH - text.length} characters left`}
        </p>
      )}
    </form>
  )
}

export default Composer
