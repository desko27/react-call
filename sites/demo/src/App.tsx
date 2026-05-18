import {
  YourDialog,
  YourToast,
  YourNested,
  YourChain,
  YourUnlocked,
  YourBubbles,
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
    </>
  )
}
