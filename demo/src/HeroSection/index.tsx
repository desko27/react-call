import { Header } from './Header'
import { Main } from './Main'
import { Footer } from './Footer'

export function HeroSection() {
  return (
    <div className="min-h-dvh bg-linear-to-br from-slate-800 to-slate-900 flex flex-col gap-y-2">
      <Header />
      <Main />
      <Footer />
    </div>
  )
}
