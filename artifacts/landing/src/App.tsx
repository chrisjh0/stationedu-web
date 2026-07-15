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

const MAILTO = `mailto:31christopherho@gmail.com?subject=${encodeURIComponent('Demo Request — Station')}`

const isMobile = () =>
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

export default function App() {
  const [pickerOpen, setPickerOpen] = useState(false)

  const handleDemoClick = () => {
    if (isMobile()) {
      window.location.href = MAILTO
    } else {
      setPickerOpen(true)
    }
  }

  return (
    <>
      <Nav onDemoClick={handleDemoClick} />
      <main>
        <Hero onDemoClick={handleDemoClick} />
        <Features />
        <ForStudents />
        <ForSchools />
        <FounderQuote />
        <FinalCTA onDemoClick={handleDemoClick} />
      </main>
      <Footer />
      <EmailClientPicker open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </>
  )
}
