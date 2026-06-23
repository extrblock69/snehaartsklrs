import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Image, Sparkles, Pencil, GraduationCap, Heart, Mail, Clock } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { KalakarSnehaLogo } from './KalakarSnehaAssets';
import { useContent } from '../context/ContentContext';

export default function Navbar() {
  const { content } = useContent();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Track scrolling to apply blur backgrounds or set active section
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      // Simple active link tracker
      const sections = ['home', 'about', 'achievements', 'gallery', 'student-showcase', 'contact'];
      const scrollPos = window.scrollY + 120;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          if (scrollPos >= offsetTop && scrollPos < offsetTop + offsetHeight) {
            setActiveSection(section);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToSection = (id: string) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.offsetTop - 80; // height of fixed navbar
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      });
    }
  };

  const navLinks = [
    { label: 'About', id: 'about' },
    { label: 'Achievements', id: 'achievements' },
    { label: 'Gallery', id: 'gallery' },
    { label: 'Student Showcase', id: 'student-showcase' },
    { label: 'Contact', id: 'contact' },
  ];

  return (
    <nav
      id="main-navigation"
      className={`fixed top-0 left-0 right-0 z-45 transition-all duration-300 border-b ${
          scrolled
            ? 'bg-stone-50/80 dark:bg-stone-950/80 backdrop-blur-md py-4 border-stone-200/50 dark:border-stone-800/50 shadow-sm'
            : 'bg-transparent py-6 border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => scrollToSection('home')}
            className="flex items-center gap-1.5 group cursor-pointer focus:outline-none"
            id="navbar-logo"
          >
            <KalakarSnehaLogo className="h-10 sm:h-12 w-auto group-hover:scale-[1.03] transition-all duration-300" />
          </button>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          <div className="flex items-center gap-7">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`relative text-xs font-semibold tracking-widest uppercase px-3.5 py-2 rounded-lg transition-all duration-300 cursor-pointer focus:outline-none ${
                  activeSection === link.id
                    ? 'text-stone-950 dark:text-stone-50 bg-stone-150/80 dark:bg-stone-900/60'
                    : 'text-stone-550 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-50 hover:bg-stone-100/40 dark:hover:bg-stone-900/30'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="h-6 w-[1.5px] bg-stone-200 dark:bg-stone-800" />

          {/* Theme switch */}
          <div className="flex items-center gap-5">
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-3 lg:hidden">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-stone-100/60 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-850/60 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-900/55 transition-all duration-300 focus:outline-none cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <div className="w-5 h-5 relative flex items-center justify-center">
              <span
                className={`block absolute h-0.5 w-5 bg-current rounded-full transform transition-all duration-300 ease-in-out ${
                  isOpen ? 'rotate-45' : '-translate-y-1.5'
                }`}
              />
              <span
                className={`block absolute h-0.5 w-5 bg-current rounded-full transform transition-all duration-200 ease-in-out ${
                  isOpen ? 'opacity-0 scale-x-0' : ''
                }`}
              />
              <span
                className={`block absolute h-0.5 w-5 bg-current rounded-full transform transition-all duration-300 ease-in-out ${
                  isOpen ? '-rotate-45' : 'translate-y-1.5'
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-stone-950/95 backdrop-blur-xl border-b border-stone-200/60 dark:border-stone-850/60 px-8 py-9 flex flex-col gap-5 shadow-2xl max-h-[85vh] overflow-y-auto"
          >
            {/* Minimalist Stack of Links */}
            <div className="flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <motion.button
                  key={link.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.35, ease: 'easeOut' }}
                  onClick={() => {
                    setIsOpen(false);
                    scrollToSection(link.id);
                  }}
                  className={`text-left text-[11px] font-sans font-medium tracking-[0.2em] uppercase py-3.5 border-b border-stone-200/30 dark:border-stone-850/30 transition-all duration-300 cursor-pointer focus:outline-none flex items-center justify-between group ${
                    activeSection === link.id
                      ? 'text-stone-950 dark:text-stone-50 font-bold border-stone-300 dark:border-stone-750'
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-50 hover:pl-1'
                  }`}
                >
                  <span className="transition-transform duration-300 group-hover:translate-x-0.5">{link.label}</span>
                  <span className={`w-1.5 h-1.5 rounded-full bg-wood transition-transform duration-300 ${
                    activeSection === link.id ? 'scale-100' : 'scale-0 group-hover:scale-100'
                  }`} />
                </motion.button>
              ))}
            </div>

            {/* Empty Spacer Line for Aesthetic Brevity */}
            <div className="h-[1px] bg-stone-200/50 dark:bg-stone-850/50 my-1" />

            {/* Drawer Action buttons with elegant minimal style and beautiful rounded corners */}
            <div className="flex flex-col gap-3 pt-1">
              {/* Contact Button */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  const link = content.globalButtons?.navbarContactLink;
                  if (link) {
                    if (link.startsWith('#')) {
                      const el = document.getElementById(link.substring(1));
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      window.open(link, '_blank', 'noopener,noreferrer');
                    }
                  } else {
                    const el = document.getElementById('contact');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                }}
                className="w-full py-3 px-6 bg-stone-950 hover:bg-stone-900 border border-stone-950 dark:bg-stone-50 dark:hover:bg-white text-white dark:text-stone-950 text-xs font-semibold tracking-wider rounded-xl transition-all duration-300 uppercase cursor-pointer text-center h-11 flex items-center justify-center shadow-md font-sans"
              >
                <span>Contact Teacher</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
