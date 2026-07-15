import Nav from './components/Nav'
import Hero from './components/Hero'
import Features from './components/Features'
import ForStudents from './components/ForStudents'
import ForSchools from './components/ForSchools'
import FounderQuote from './components/FounderQuote'
import FinalCTA from './components/FinalCTA'
import Footer from './components/Footer'

const openDemoEmail = () => {
  window.location.href = `mailto:31christopherho@gmail.com?subject=${encodeURIComponent('Demo Request — Station')}`
}

export default function App() {
  return (
    <>
      <Nav onDemoClick={openDemoEmail} />
      <main>
        <Hero onDemoClick={openDemoEmail} />
        <Features />
        <ForStudents />
        <ForSchools />
        <FounderQuote />
        <FinalCTA onDemoClick={openDemoEmail} />
      </main>
      <Footer />
    </>
  )
}
