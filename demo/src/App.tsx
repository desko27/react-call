import {
  YourDialog,
  YourToast,
  YourNested,
  YourChain,
  YourUnlocked,
  YourBubbles,
  YourLazy,
} from './CallableScenes'
import { HeroSection } from './HeroSection'

export function App() {
  return (
    <>
      <HeroSection />
      <YourDialog.Root />
      <YourToast.Root />
      <YourNested.Root />
      <YourChain.Root />
      <YourUnlocked.Root />
      <YourBubbles.Root />
      <YourLazy.Root />
    </>
  )
}
