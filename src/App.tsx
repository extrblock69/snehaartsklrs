import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Loader from './components/Loader';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Achievements from './components/Achievements';
import Gallery from './components/Gallery';
import CoursesAndWorkshops from './components/CoursesAndWorkshops';
import StudentShowcase from './components/StudentShowcase';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import AnalyticsPanel from './components/AnalyticsPanel';
import NotFound from './components/NotFound';

const API_BASE_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

export default function App() {
  const [loading, setLoading] = useState(true);

  const getRouteState = () => {
    const path = window.location.pathname;
    const isHome = path === '/' || path === '/index.html';
    const isAdmin = path === '/admin' || window.location.hash === '#admin';
    const isAnalytics = path === '/analytics' || window.location.hash === '#analytics';
    
    if (isAdmin) {
      return 'admin';
    } else if (isAnalytics) {
      return 'analytics';
    } else if (isHome) {
      return 'home';
    } else {
      return '404';
    }
  };

  const [currentView, setCurrentView] = useState<'home' | 'admin' | 'analytics' | '404'>(getRouteState());

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

  // Track visitor views when mounting or navigating to 'home'
  useEffect(() => {
    if (currentView === 'home' && !loading) {
      // Gather extremely detailed client specifications and browser dimensions
      const screenResolution = `${window.screen.width}x${window.screen.height}`;
      const windowSize = `${window.innerWidth}x${window.innerHeight}`;
      const timezoneBrowser = (() => {
        try {
          return Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch (e) {
          return 'Unknown';
        }
      })();
      const platform = navigator.platform || 'Unknown';
      const cores = navigator.hardwareConcurrency || 0;
      const memory = (navigator as any).deviceMemory || 0;
      const connection = (navigator as any).connection?.effectiveType || 'N/A';
      const touchSupported = ('ontouchstart' in window || navigator.maxTouchPoints > 0) ? 'Yes' : 'No';
      const cookieEnabled = navigator.cookieEnabled ? 'Yes' : 'No';
      const colorDepth = `${window.screen.colorDepth || 0}-bit`;

      fetch(`${API_BASE_URL}/api/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pathname: window.location.pathname + window.location.hash,
          referrer: document.referrer || 'Direct / Bookmark',
          screen: windowSize,
          language: navigator.language || 'en-US',
          screenResolution,
          windowSize,
          timezoneBrowser,
          platform,
          cores,
          memory,
          connection,
          touchSupported,
          cookieEnabled,
          colorDepth
        }),
      }).catch(err => {
        console.warn('Analytics tracking not processed offline:', err);
      });
    }
  }, [currentView, loading]);

  const handleReturnHome = () => {
    window.history.pushState({}, '', '/');
    setCurrentView('home');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'admin':
        return <AdminPanel />;
      case 'analytics':
        return <AnalyticsPanel />;
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

              {/* 3.25. Courses & Workshops Section */}
              <motion.div
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <CoursesAndWorkshops />
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

