import { useEffect, useId, useRef } from 'react'
import { LuX } from 'react-icons/lu'

/**
 * Accessible dialog built on the native <dialog> element: focus is trapped,
 * Escape closes it, and clicking the backdrop dismisses it.
 */
const Modal = ({
  open,
  onClose,
  title,
  children,
  actions,
  size = 'max-w-md',
}) => {
  const ref = useRef(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="modal modal-bottom sm:modal-middle"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      {open && (
        <div className={`modal-box ${size} p-0 flex flex-col max-h-[85dvh]`}>
          <div className="flex items-center justify-between gap-4 px-6 pt-5 pb-3">
            <h2 id={titleId} className="text-xl font-bold tracking-tight">
              {title}
            </h2>
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-circle"
              onClick={onClose}
              aria-label="Close"
            >
              <LuX className="size-5" />
            </button>
          </div>
          <div className="px-6 pb-4 overflow-y-auto">{children}</div>
          {actions && (
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-base-300">
              {actions}
            </div>
          )}
        </div>
      )}
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose} tabIndex={-1}>
          Close
        </button>
      </form>
    </dialog>
  )
}

export default Modal
