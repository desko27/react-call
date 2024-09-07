import { clsx } from 'clsx'

export function Footer(): JSX.Element {
  return (
    <footer
      className={clsx(
        'p-6 flex justify-between items-center gap-3 text-slate-400',
        'animate-fade-in-up animate-delay-1000',
      )}
    >
      <a
        className="hover:text-slate-300 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
        href="https://tailwindcss-animations.vercel.app/"
      >
        Get animations
      </a>
      <span className="flex items-center gap-2">
        <strong className="text-xl">𝕏</strong>
        <a
          className="hover:text-slate-300 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
          href="https://x.com/desko27"
        >
          @desko27
        </a>
      </span>
    </footer>
  )
}
