import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Loader from './components/Loader';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Achievements from './components/Achievements';
import Gallery from './components/Gallery';
import StudentShowcase from './components/StudentShowcase';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import NotFound from './components/NotFound';

export default function App() {
  const [loading, setLoading] = useState(true);

  const getRouteState = () => {
    const path = window.location.pathname;
    const isHome = path === '/' || path === '/index.html';
    const isAdmin = path === '/admin' || window.location.hash === '#admin';
    
    if (isAdmin) {
      return 'admin';
    } else if (isHome) {
      return 'home';
    } else {
      return '404';
    }
  };

  const [currentView, setCurrentView] = useState<'home' | 'admin' | '404'>(getRouteState());

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentView(getRouteState());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const handleReturnHome = () => {
    window.history.pushState({}, '', '/');
    setCurrentView('home');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'admin':
        return <AdminPanel />;
      case '404':
        return <NotFound onReturnHome={handleReturnHome} />;
      case 'home':
      default:
        return (
          <>
            {/* Header */}
            <Navbar />

            <main id="portfolio-content-root" className="overflow-hidden">
              {/* 1. Hero Cover Intro */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <Hero />
              </motion.div>

              {/* 2. Educational Philosophy & Journey */}
              <motion.div
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <About />
              </motion.div>

              {/* 2.5 Honors & Achievements */}
              <motion.div
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <Achievements />
              </motion.div>

              {/* 3. High-resolution Gallery of Sketches */}
              <motion.div
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <Gallery />
              </motion.div>

              {/* 3.5. Featured Student Showcase */}
              <motion.div
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <StudentShowcase />
              </motion.div>

              {/* 7. Dedicated Contact & Inquiry Form */}
              <motion.div
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <Contact />
              </motion.div>
            </main>

            {/* Concluding Footer */}
            <Footer />
          </>
        );
    }
  };

  return (
    <>
      {/* Decorative entrance animated drawing screen */}
      <Loader onComplete={() => setLoading(false)} />

      {!loading && (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-300 transition-colors duration-300 antialiased overflow-x-hidden selection:bg-stone-200 dark:selection:bg-stone-800">
          {renderContent()}
        </div>
      )}
    </>
  );
}

