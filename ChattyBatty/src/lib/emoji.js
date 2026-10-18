const segmenter =
  typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter() : null

// Emoji_Component covers joiners, variation selectors and skin tones.
const EMOJI_ONLY = /^(?:\p{Extended_Pictographic}|\p{Emoji_Component}|\s)+$/u
// Digits, '#' and '*' are Emoji_Components too, but on their own aren't emoji.
const PLAIN_SYMBOLS = /^[\d\s#*]+$/

/** True for short emoji-only messages, which are shown large without a bubble. */
export const isJumboEmoji = (text) => {
  if (!segmenter || !EMOJI_ONLY.test(text) || PLAIN_SYMBOLS.test(text))
    return false
  const graphemes = [...segmenter.segment(text.replace(/\s/g, ''))]
  return graphemes.length > 0 && graphemes.length <= 3
}
