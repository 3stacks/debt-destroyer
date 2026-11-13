import { About } from '@/components/About'
import { Download } from '@/components/Download'
import { Features } from '@/components/Features'
import { Footer } from '@/components/Footer'
import { Hero } from '@/components/Hero'
import { HowItWorks } from '@/components/HowItWorks'
import { Introduction } from '@/components/Introduction'
import { NavBar } from '@/components/NavBar'

export default function Home() {
  return (
    <>
      <Hero />
      <Introduction />
      <NavBar />
      <HowItWorks />
      <Features />
      <Download />
      <About />
      <Footer />
    </>
  )
}
