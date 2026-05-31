import { useEffect, useRef, useState } from 'react'
import { createCallable } from 'react-call'

export interface WizardResult {
  name: string
  email: string
  plan: 'free' | 'pro' | 'team'
}

// text-base (16px) on mobile stops iOS Safari from auto-zooming when a
// step input autofocuses; md:text-sm restores the compact size on desktop.
const INPUT_CLASS =
  'w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-2 text-base text-[var(--color-fg)] focus:border-[var(--color-accent)] focus:outline-none md:text-sm'

export const Wizard = createCallable<void, WizardResult | null>(({ call }) => {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [plan, setPlan] = useState<WizardResult['plan']>('free')
  const nameInputRef = useRef<HTMLInputElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (step === 0) nameInputRef.current?.focus()
    if (step === 1) emailInputRef.current?.focus()
  }, [step])

  const next = () => setStep((s) => s + 1)
  const back = () => setStep((s) => s - 1)
  const cancel = () => call.end(null)
  const finish = () => call.end({ name, email, plan })

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Wizard"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-2xl">
        <div className="mb-5 flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={
                i <= step
                  ? 'h-1 flex-1 rounded-full bg-[var(--color-accent)]'
                  : 'h-1 flex-1 rounded-full bg-[var(--color-bg-muted)]'
              }
            />
          ))}
        </div>

        {step === 0 && (
          <Step title="Your name" hint={`Step 1 of 3`}>
            <input
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ada Lovelace"
              className={INPUT_CLASS}
            />
          </Step>
        )}

        {step === 1 && (
          <Step title="Your email" hint="Step 2 of 3">
            <input
              ref={emailInputRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ada@example.com"
              className={INPUT_CLASS}
            />
          </Step>
        )}

        {step === 2 && (
          <Step title="Pick a plan" hint="Step 3 of 3">
            <div className="grid grid-cols-3 gap-2">
              {(['free', 'pro', 'team'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlan(p)}
                  className={
                    p === plan
                      ? 'rounded-md border border-[var(--color-accent)] bg-[var(--color-bg-subtle)] px-3 py-2 text-sm font-medium text-[var(--color-accent)]'
                      : 'rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-2 text-sm text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]'
                  }
                >
                  {p}
                </button>
              ))}
            </div>
          </Step>
        )}

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={cancel}
            className="text-sm text-[var(--color-fg-subtle)] hover:text-[var(--color-fg-muted)]"
          >
            Cancel
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={back}
                className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]"
              >
                Back
              </button>
            )}
            {step < 2 ? (
              <button
                type="button"
                onClick={next}
                disabled={
                  (step === 0 && !name.trim()) || (step === 1 && !email.trim())
                }
                className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={finish}
                className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)]"
              >
                Finish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})
Wizard.displayName = 'Wizard'

interface StepProps {
  title: string
  hint: string
  children: React.ReactNode
}

const Step = ({ title, hint, children }: StepProps) => (
  <>
    <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">
      {hint}
    </p>
    <p className="mt-1 text-base font-medium text-[var(--color-fg)]">{title}</p>
    <div className="mt-4">{children}</div>
  </>
)
