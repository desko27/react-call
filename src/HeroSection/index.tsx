import { Header } from './Header'
import { Main } from './Main'
import { Footer } from './Footer'

export function HeroSection(): JSX.Element {
  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col gap-y-10">
      <Header />
      <Main />
      <Footer />
    </div>
  )
}
