import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial preference from localStorage or default to light mode
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <button
      id="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label="Toggle theme mode"
      className="relative w-14 h-8 bg-stone-200 dark:bg-stone-800 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 hover:ring-2 hover:ring-wood/50 focus:outline-none"
    >
      {/* Absolute indicators in background */}
      <div className="absolute left-1.5 text-stone-500 dark:text-stone-400">
        <Sun className="w-3.5 h-3.5" />
      </div>
      <div className="absolute right-1.5 text-stone-500 dark:text-stone-400">
        <Moon className="w-3.5 h-3.5" />
      </div>

      {/* Sliding Toggle handle indicator */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 450, damping: 25 }}
        className="relative z-10 w-6 h-6 bg-white dark:bg-stone-200 rounded-full shadow-md flex items-center justify-center"
        style={{
          marginLeft: isDark ? 'auto' : '0'
        }}
      >
        <motion.div
          animate={{ rotate: isDark ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isDark ? (
            <Moon className="w-3.5 h-3.5 text-stone-900" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-wood" />
          )}
        </motion.div>
      </motion.div>
    </button>
  );
}
