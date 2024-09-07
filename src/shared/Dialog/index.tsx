import { clsx } from 'clsx'

import type { Props, Color } from './types'

const SURFACE_COLOR = {
  emerald: 'from-emerald-500/10 to-emerald-600/10',
  pink: 'from-pink-500/10 to-pink-600/10',
  blue: 'from-blue-500/10 to-blue-600/10',
  red: 'from-red-500/10 to-red-600/10',
  violet: 'from-violet-500/10 to-violet-600/10',
  yellow: 'from-yellow-500/10 to-yellow-600/10',
}

const BUTTON_COLOR = {
  emerald: 'bg-emerald-700/30',
  pink: 'bg-pink-700/30',
  blue: 'bg-blue-700/30',
  red: 'bg-red-700/30',
  violet: 'bg-violet-700/30',
  yellow: 'bg-yellow-700/30',
}

const BUTTON_HOVER_COLOR = {
  emerald: 'hover:bg-emerald-700',
  pink: 'hover:bg-pink-700',
  blue: 'hover:bg-blue-700',
  red: 'hover:bg-red-700',
  violet: 'hover:bg-violet-700',
  yellow: 'hover:bg-yellow-700',
}

export function Dialog({ children, color, ended }: Props) {
  return (
    <>
      <div
        className={clsx(
          'fixed inset-0 z-10 bg-black/50',
          `animate-duration-300 ${ended ? 'animate-fade-out pointer-events-none' : 'animate-fade-in'}`,
        )}
      />
      <div
        className={clsx(
          'fixed inset-0 z-10 overflow-y-auto',
          ended && 'pointer-events-none',
        )}
      >
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className={clsx(
              'space-y-2 w-full max-w-md rounded-xl p-6 backdrop-blur-2xl',
              `bg-gradient-to-br ${SURFACE_COLOR[color]}`,
              `animate-duration-300 ${ended ? 'animate-zoom-out' : 'animate-zoom-in'}`,
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

function DialogTitle({ children }: React.PropsWithChildren) {
  return <h3 className="text-base/7 font-medium text-white">{children}</h3>
}

function DialogText({ children }: React.PropsWithChildren) {
  return <p className="text-sm/6 text-white/75">{children}</p>
}

function DialogActions({ children }: React.PropsWithChildren) {
  return <div className="pt-2 flex gap-4">{children}</div>
}

function DialogButton({
  children,
  onClick,
  color,
  hoverColor,
  type = 'button',
  shrink = false,
}: React.PropsWithChildren<{
  onClick?: React.DOMAttributes<HTMLButtonElement>['onClick']
  color: Color
  hoverColor?: Color
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>['type']
  shrink?: boolean
}>) {
  return (
    <button
      className={clsx(
        'transition-colors duration-300 rounded-md py-1.5 px-3 text-sm/6 font-semibold text-white',
        `${BUTTON_COLOR[color]} ${BUTTON_HOVER_COLOR[hoverColor || color]}`,
        'focus:outline-none focus:outline-1 focus:outline-white select-none',
        shrink &&
          'flex-shrink min-w-0 overflow-hidden overflow-ellipsis whitespace-nowrap',
      )}
      type={type}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

Dialog.Title = DialogTitle
Dialog.Text = DialogText
Dialog.Actions = DialogActions
Dialog.Button = DialogButton
