import { useState } from 'react'
import { LuUsers } from 'react-icons/lu'
import { initials } from '../lib/format'

const SIZES = {
  xs: 'size-6 text-[0.625rem]',
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-14 text-lg',
  xl: 'size-24 text-3xl',
}

/**
 * Round profile picture with an initials fallback for missing or broken images.
 * `group` shows a people icon instead of initials when there's no photo.
 */
const Avatar = ({
  src,
  name = '',
  size = 'md',
  group = false,
  className = '',
}) => {
  const [failedSrc, setFailedSrc] = useState(null)
  const showImage = src && failedSrc !== src

  return (
    <div
      className={`${SIZES[size]} shrink-0 rounded-full overflow-hidden bg-neutral text-neutral-content grid place-items-center font-semibold select-none ${className}`}
      aria-hidden="true"
    >
      {showImage ? (
        <img
          src={src}
          alt=""
          className="size-full object-cover"
          // Google profile photos refuse requests that carry a referrer.
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setFailedSrc(src)}
        />
      ) : group ? (
        <LuUsers className="size-1/2" />
      ) : (
        <span>{initials(name)}</span>
      )}
    </div>
  )
}

export default Avatar
