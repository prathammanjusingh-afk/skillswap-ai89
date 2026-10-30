import { Navbar } from '@/components/site/navbar'
import { Hero } from '@/components/site/hero'
import { HowItWorks } from '@/components/site/how-it-works'
import { Features } from '@/components/site/features'
import { MatchPreview } from '@/components/site/match-preview'
import { CtaBanner } from '@/components/site/cta-banner'
import { Footer } from '@/components/site/footer'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <MatchPreview />
        <CtaBanner />
      </main>
      <Footer />
    </>
  )
}
