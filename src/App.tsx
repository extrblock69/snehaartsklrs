import { useState } from 'react';
import Loader from './components/Loader';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Gallery from './components/Gallery';
import StudentShowcase from './components/StudentShowcase';
import Sketchpad from './components/Sketchpad';
import Lessons from './components/Lessons';
import Testimonials from './components/Testimonials';
import Booking from './components/Booking';
import Footer from './components/Footer';

export default function App() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {/* Decorative entrance animated drawing screen */}
      <Loader onComplete={() => setLoading(false)} />

      {!loading && (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-300 transition-colors duration-300 antialiased overflow-x-hidden selection:bg-stone-200 dark:selection:bg-stone-800">
          {/* Header */}
          <Navbar />

          <main id="portfolio-content-root">
            {/* 1. Hero Cover Intro */}
            <Hero />

            {/* 2. Educational Philosophy & Journey */}
            <About />

            {/* 3. High-resolution Gallery of Sketches */}
            <Gallery />

            {/* 3.5. Featured Student Showcase */}
            <StudentShowcase />

            {/* 4. Interactive practice Drawing Canvas */}
            <Sketchpad />

            {/* 5. Course Syllabus details & Quiz assessor */}
            <Lessons />

            {/* 6. Growth Testimonial morphing image sliders */}
            <Testimonials />

            {/* 7. Class Schedulers reservation form */}
            <Booking />
          </main>

          {/* Concluding Footer */}
          <Footer />
        </div>
      )}
    </>
  );
}
