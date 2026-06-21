import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LoaderProps {
  onComplete: () => void;
}

const ART_QUOTES = [
  "To draw is to look, to look is to understand. — Sneha",
  "Learning to draw is actually learning to see — to see truly. — Kimon Nicolaïdes",
  "Drawing is taking a line for a walk. — Paul Klee",
  "Drawing is the honesty of the art. — Salvador Dalí"
];

export default function Loader({ onComplete }: LoaderProps) {
  const [progress, setProgress] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Cycle quotes
    const quoteInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % ART_QUOTES.length);
    }, 2000);

    // Progress counter
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            setIsVisible(false);
            setTimeout(onComplete, 600); // Wait for fade-out
          }, 500);
          return 100;
        }
        const next = prev + Math.floor(Math.random() * 10) + 5;
        return next > 100 ? 100 : next;
      });
    }, 60);

    return () => {
      clearInterval(quoteInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="global-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 selection:bg-transparent"
        >
          <div className="flex flex-col items-center max-w-md px-8 text-center space-y-10">
            {/* Minimalist Brand Logo */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="space-y-2"
            >
              <h1 className="font-serif text-2xl font-extralight tracking-[0.25em] text-stone-900 dark:text-stone-100 uppercase select-none mr-[-0.25em]">
                KALAKAAR SNEHA
              </h1>
              <p className="font-mono text-[9px] tracking-[0.3em] text-stone-400 dark:text-stone-500 uppercase select-none mr-[-0.3em]">
                ART ACADEMY
              </p>
            </motion.div>

            {/* Premium, ultra-sleek progress line indicator */}
            <div className="w-48 h-[1px] bg-stone-200/60 dark:bg-stone-800/40 rounded-full overflow-hidden relative">
              <motion.div
                className="h-full bg-stone-800 dark:bg-stone-200"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: 'linear' }}
              />
            </div>

            {/* Fine-art rotating quote */}
            <div className="h-12 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={quoteIndex}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="font-serif italic text-stone-500 dark:text-stone-400 text-xs md:text-sm tracking-wide leading-relaxed"
                >
                  "{ART_QUOTES[quoteIndex]}"
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

