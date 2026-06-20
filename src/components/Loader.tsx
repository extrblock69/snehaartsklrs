import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface LoaderProps {
  onComplete: () => void;
}

const ART_QUOTES = [
  "Drawing is taking a line for a walk. — Paul Klee",
  "To draw is to look, to look is to understand. — Sneha",
  "Drawing is the honesty of the art. There is no possibility of cheating. — Salvador Dalí",
  "Learning to draw is actually learning to see — to see truly. — Kimon Nicolaïdes"
];

export default function Loader({ onComplete }: LoaderProps) {
  const [progress, setProgress] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Cycle quotes
    const quoteInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % ART_QUOTES.length);
    }, 1800);

    // Progress counter
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            setIsVisible(false);
            setTimeout(onComplete, 500); // Wait for fade-out
          }, 400);
          return 100;
        }
        // Increment with a slight artistic randomness
        const next = prev + Math.floor(Math.random() * 8) + 4;
        return next > 100 ? 100 : next;
      });
    }, 70);

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
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100"
        >
          {/* Main loader drawing frame */}
          <div className="relative w-80 h-80 flex items-center justify-center">
            {/* Ambient glowing accent */}
            <div className="absolute inset-0 bg-stone-200/40 dark:bg-stone-800/20 rounded-full filter blur-xl pulse-slow"></div>

            {/* Simulated Canvas with Pencil Trace SVG */}
            <svg className="w-64 h-64 relative z-10" viewBox="0 0 100 100">
              {/* Background circular guide line */}
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-stone-200 dark:stroke-stone-800 fill-none"
                strokeWidth="0.5"
                strokeDasharray="4 4"
              />

              {/* Simulated pencil sketching paths */}
              <motion.path
                d="M 50 10 C 72 10, 90 28, 90 50 C 90 72, 72 90, 50 90 C 28 90, 10 72, 10 50 C 10 28, 28 10, 50 10 Z"
                className="stroke-stone-400 dark:stroke-stone-600 fill-none pencil-draw-path"
                strokeWidth="1.5"
                strokeLinecap="round"
              />

              <motion.path
                d="M 25 50 Q 50 20 75 50"
                className="stroke-stone-300 dark:stroke-stone-700 fill-none"
                strokeWidth="1"
                animate={{
                  strokeDasharray: ["0, 100", "100, 0"],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                }}
              />

              {/* Central Artist initial */}
              <text
                x="50"
                y="54"
                textAnchor="middle"
                className="font-serif text-3xl font-light tracking-widest fill-stone-800 dark:fill-stone-200"
              >
                E R
              </text>
            </svg>

            {/* Graphite dust indicator */}
            <div className="absolute bottom-6 flex items-center gap-1.5 text-xs text-stone-400 dark:text-stone-500 font-mono tracking-widest">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>SHADING CANVAS...</span>
            </div>
          </div>

          {/* Progress indicators & Fine-art quotes */}
          <div className="max-w-md px-6 text-center -mt-4 relative z-10">
            <motion.div
              key={quoteIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="font-serif italic text-stone-600 dark:text-stone-400 text-sm md:text-base leading-relaxed h-12 flex items-center justify-center"
            >
              "{ART_QUOTES[quoteIndex]}"
            </motion.div>

            {/* Custom high-end loading bar */}
            <div className="mt-8 w-60 h-[3px] bg-stone-200 dark:bg-stone-800 rounded-full mx-auto overflow-hidden">
              <motion.div
                className="h-full bg-wood"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            <div className="mt-2 text-xs font-mono text-stone-400 dark:text-stone-500 tracking-wider">
              {progress}% RENDERED
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
