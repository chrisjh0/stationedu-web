import { useState } from 'react'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Features from './components/Features'
import ForStudents from './components/ForStudents'
import ForSchools from './components/ForSchools'
import FounderQuote from './components/FounderQuote'
import FinalCTA from './components/FinalCTA'
import Footer from './components/Footer'
import EmailClientPicker from './components/EmailClientPicker'

export default function App() {
  const [pickerOpen, setPickerOpen] = useState(false)

  return (
    <>
      <Nav onDemoClick={() => setPickerOpen(true)} />
      <main>
        <Hero onDemoClick={() => setPickerOpen(true)} />
        <Features />
        <ForStudents />
        <ForSchools />
        <FounderQuote />
        <FinalCTA onDemoClick={() => setPickerOpen(true)} />
      </main>
      <Footer />
      <EmailClientPicker open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </>
  )
}
