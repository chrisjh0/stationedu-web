import { useState } from 'react'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Features from './components/Features'
import ForStudents from './components/ForStudents'
import ForSchools from './components/ForSchools'
import FounderQuote from './components/FounderQuote'
import FinalCTA from './components/FinalCTA'
import Footer from './components/Footer'
import DemoModal from './components/DemoModal'

export default function App() {
  const [demoOpen, setDemoOpen] = useState(false)

  return (
    <>
      <Nav onDemoClick={() => setDemoOpen(true)} />
      <main>
        <Hero onDemoClick={() => setDemoOpen(true)} />
        <Features />
        <ForStudents />
        <ForSchools />
        <FounderQuote />
        <FinalCTA onDemoClick={() => setDemoOpen(true)} />
      </main>
      <Footer />
      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </>
  )
}
