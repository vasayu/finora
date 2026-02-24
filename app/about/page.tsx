import About from '@/Components/About/About'
import Footer from '@/Components/About/Footer'
import Heading from '@/Components/About/Heading'
import Vision from '@/Components/About/Vision'
import React from 'react'


const AboutPage = () => {
  return (
    <section className=''>
      <Heading />
      <About />
      <Vision />
      {/* <Footer /> */}
    </section>
  )
}

export default AboutPage