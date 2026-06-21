import { useState, useEffect } from 'react';
import Loader from './components/Loader';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Gallery from './components/Gallery';
import StudentShowcase from './components/StudentShowcase';
import Lessons from './components/Lessons';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isAdminRoute, setIsAdminRoute] = useState(
    window.location.pathname === '/admin' || window.location.hash === '#admin'
  );

  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdminRoute(window.location.pathname === '/admin' || window.location.hash === '#admin');
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  return (
    <>
      {/* Decorative entrance animated drawing screen */}
      <Loader onComplete={() => setLoading(false)} />

      {!loading && (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-300 transition-colors duration-300 antialiased overflow-x-hidden selection:bg-stone-200 dark:selection:bg-stone-800">
          {isAdminRoute ? (
            <AdminPanel />
          ) : (
            <>
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

                {/* 5. Course Syllabus details & Quiz assessor */}
                <Lessons />

                {/* 6. Growth Testimonial morphing image sliders */}
                <Testimonials />

                {/* 7. Dedicated Contact & Inquiry Form */}
                <Contact />
              </main>

              {/* Concluding Footer */}
              <Footer />
            </>
          )}
        </div>
      )}
    </>
  );
}
