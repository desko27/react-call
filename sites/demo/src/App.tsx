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
      <YourDialog />
      <YourToast />
      <YourNested />
      <YourChain />
      <YourUnlocked />
      <YourBubbles />
    </>
  )
}
