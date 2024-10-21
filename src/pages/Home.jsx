import React, { useEffect } from 'react';
import Navbar from '../components/Navbar'
import Area from '../components/Area'
import Atas from '../components/Atas'
import Start from '../components/Start'
import Bawah from '../components/Bawah'
import AOS from 'aos';
import 'aos/dist/aos.css';

import { AreaSection, AreaList } from '../data/AreaSection'
import { StartSection, StartList } from '../data/StartSection'

import parse from 'html-react-parser'
import '../style/Home.css'
import Visit from '../components/Visit';

function Home() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
      offset: 120,
      easing: 'ease-in-out',
    });
  }, []);

  return (
    <>
      <Navbar />
      <Atas />
     
      <section id='Area'>
        <div className='tengah' data-aos="fade-up">
          <div className='kolom' data-aos="fade-right" data-aos-delay="200">
            {parse(AreaSection.Area)}
          </div>
          <Area AreaList={AreaList}/>
        </div>
      </section>
      <Visit />
      <section id='Start'>
        <div className='atas' data-aos="fade-up">
          <div className='bawah' data-aos="fade-left" data-aos-delay="200">
            {parse(StartSection.Start)}
          </div>
          <Start StartList={StartList} />
        </div>
      </section>
      <div data-aos="fade-up">
      <Bawah />
      </div>
    </>
  )
}

export default Home