import { motion } from 'motion/react';
import { MoveLeft } from 'lucide-react';

interface NotFoundProps {
  onReturnHome: () => void;
}

export default function NotFound({ onReturnHome }: NotFoundProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-950 px-6 py-12 text-stone-900 dark:text-stone-300 selection:bg-stone-200 dark:selection:bg-stone-800 transition-colors duration-300">
      <div className="max-w-md w-full text-center space-y-8 relative">
        {/* Dynamic circular drawing path decoration behind text */}
        <div className="absolute inset-0 flex items-center justify-center -z-10 opacity-10 pointer-events-none">
          <svg className="w-80 h-80 text-stone-900 dark:text-stone-100" viewBox="0 0 100 100">
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeDasharray="2 4"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 45, ease: 'linear' }}
            />
          </svg>
        </div>

        {/* Unique design: Unfinished visual border resembling a raw frame/canvas sheet */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
          className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 p-10 rounded-2xl shadow-sm space-y-6 relative overflow-hidden"
        >
          {/* Subtle accent corner marks like a real draft sheet */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-stone-300 dark:border-stone-700"></div>
          <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-stone-300 dark:border-stone-700"></div>
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-stone-300 dark:border-stone-700"></div>
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-stone-300 dark:border-stone-700"></div>

          <div className="space-y-4">
            <span className="font-mono text-[10px] text-amber-700 dark:text-amber-500 font-semibold tracking-widest uppercase block">
              EMPTY CANVAS • ERROR 404
            </span>
            <h1 className="font-serif text-6xl sm:text-7xl font-extralight text-stone-800 dark:text-stone-100 tracking-tighter">
              404
            </h1>
            <div className="h-[1px] w-12 bg-amber-700 dark:bg-amber-500 mx-auto my-3"></div>
            <p className="font-serif text-base text-stone-800 dark:text-stone-205 font-light italic select-none">
              "This outline has not yet been drawn."
            </p>
            <p className="text-stone-500 dark:text-stone-400 font-light text-xs leading-relaxed max-w-sm mx-auto">
              The coordinates you followed led to an unrealized space in the academy's portfolio. No lines, graphite shading, or watercolor washes exist on this canvas.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onReturnHome}
            className="w-full mt-2 py-3 bg-stone-950 hover:bg-stone-900 dark:bg-stone-50 dark:hover:bg-stone-100 text-white dark:text-stone-950 font-mono text-[11px] tracking-widest uppercase rounded-lg cursor-pointer flex items-center justify-center gap-2 duration-300 transition-colors shadow-sm group"
          >
            <MoveLeft className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
            <span>Return to Studio</span>
          </motion.button>
        </motion.div>

        <p className="font-mono text-[9px] tracking-widest text-stone-400 dark:text-stone-500 uppercase select-none">
          Kalakaar Sneha Art Academy
        </p>
      </div>
    </div>
  );
}
