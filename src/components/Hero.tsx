import { motion } from 'motion/react';
import { ArrowDown, Award, Users } from 'lucide-react';
import { KalakarSnehaPhoto } from './KalakarSnehaAssets';

export default function Hero() {
  const handleScrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-16 bg-stone-50 dark:bg-stone-950 transition-colors duration-300 overflow-hidden"
    >
      {/* Decorative Blueprint/Grid lines to accentuate drawing/perspective mood */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] pointer-events-none">
        <div className="w-full h-full bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:30px_30px]" />
      </div>

      {/* Decorative sketching perspective lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10 dark:opacity-20 pointer-events-none z-0 text-stone-300 dark:text-stone-800" xmlns="http://www.w3.org/2000/svg">
        <line x1="10%" y1="10%" x2="90%" y2="90%" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3By" />
        <line x1="90%" y1="10%" x2="10%" y2="90%" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
        <circle cx="50%" cy="50%" r="20%" stroke="currentColor" strokeWidth="0.5" strokeDasharray="10 5" fill="none" />
      </svg>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 w-full">
        {/* Left column: Text details */}
        <div className="lg:col-span-7 text-left space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-stone-200/60 dark:bg-stone-900/60 text-stone-800 dark:text-stone-200 border border-stone-300/40 dark:border-stone-800/40 rounded-full font-mono text-[11px] tracking-widest uppercase"
          >
            <Award className="w-3.5 h-3.5 text-stone-700 dark:text-stone-300" />
            <span>FINE ART ACADEMY CERTIFIED TUTOR</span>
          </motion.div>

          {/* Main heading displaying expressive fine-art lettering */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-serif text-4xl sm:text-5xl md:text-6xl font-light text-stone-900 dark:text-stone-50 leading-[1.1] tracking-tight"
          >
            Unlock the <span className="italic relative font-normal text-stone-850 dark:text-stone-50">
              soul of your pencil
              {/* Artistic smudge stroke under words */}
              <span className="absolute bottom-1.5 left-0 right-0 h-[6px] bg-wood/25 dark:bg-wood/20 rounded-full -z-10" />
            </span>
            {' '}and learn to see truly.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-stone-600 dark:text-stone-300 text-base md:text-lg font-light leading-relaxed max-w-xl"
          >
            Sneha teaches classical drawing techniques, from direct charcoal portraiture
            to complex architectural line perspective, guiding students from tentative markings to confident, beautiful fine artistry.
          </motion.p>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 pt-4"
          >
            <button
              onClick={() => handleScrollToSection('book')}
              className="px-6 py-3.5 bg-stone-950 hover:bg-stone-900 dark:bg-stone-50 dark:hover:bg-stone-100 text-white dark:text-stone-950 text-xs font-semibold tracking-widest uppercase rounded-lg border border-stone-950 dark:border-stone-50 cursor-pointer shadow-sm transition-all duration-300 hover:translate-y-[-1px]"
            >
              Enroll Now
            </button>
            <button
              onClick={() => handleScrollToSection('gallery')}
              className="px-6 py-3.5 border border-stone-300 hover:border-stone-400 dark:border-stone-800 dark:hover:border-stone-700 text-stone-850 dark:text-stone-200 hover:bg-stone-100/40 dark:hover:bg-stone-900/30 text-xs font-semibold tracking-widest uppercase rounded-lg cursor-pointer transition-all duration-300"
            >
              View Portfolio
            </button>
          </motion.div>

          {/* Core Metric Pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="grid grid-cols-2 gap-4 pt-10 border-t border-stone-200 dark:border-stone-900 max-w-lg"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-stone-900 dark:text-stone-100 font-serif text-2xl font-semibold">
                <Award className="w-5 h-5 stroke-[1.5] text-wood" />
                <span>5</span>
              </div>
              <p className="text-[11px] font-mono tracking-wider text-stone-500 dark:text-stone-400 uppercase">
                Years Academics
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-stone-900 dark:text-stone-100 font-serif text-2xl font-semibold">
                <Users className="w-5 h-5 stroke-[1.5] text-wood" />
                <span>100+</span>
              </div>
              <p className="text-[11px] font-mono tracking-wider text-stone-500 dark:text-stone-400 uppercase">
                Active Pupils
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right column: Artistic Floating Image Mockups */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          {/* Main Teacher Presentation Card with beautiful shadow depth */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, type: 'spring' }}
            className="relative w-72 sm:w-80 md:w-96 aspect-[3/4] bg-stone-100 dark:bg-stone-900 p-3 rounded-lg shadow-xl border border-stone-200/60 dark:border-stone-800/65 group overflow-hidden"
          >
            {/* Soft grid background container inside frame */}
            <div className="absolute inset-0 bg-stone-50 dark:bg-stone-950 pointer-events-none -z-10" />

            <div className="relative w-full h-[82%] overflow-hidden rounded-md bg-stone-200 dark:bg-stone-800">
              <KalakarSnehaPhoto className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(0,0,0,0.1),transparent)] pointer-events-none" />

              {/* Float drawing paper tag */}
              <div className="absolute bottom-4 left-4 bg-stone-900/85 backdrop-blur-sm text-stone-50 px-3 py-1 rounded text-[10px] font-mono tracking-widest uppercase">
                Sneha, Studio Profile
              </div>
            </div>

            {/* Title / signature at the bottom of the photo display */}
            <div className="pt-4 px-1 pb-1 flex justify-between items-end">
              <div>
                <p className="font-serif italic text-base text-stone-850 dark:text-stone-100 font-medium">
                  "See, Shaded, Sculpted"
                </p>
                <p className="text-[10px] font-mono text-stone-500 dark:text-stone-400 tracking-wider">
                  Traditional Medium, Studio 12
                </p>
              </div>

              {/* Artistic pencil sketch signature look-alike */}
              <div className="font-serif italic text-xs text-stone-400 dark:text-stone-500 pr-1">
                Sneha
              </div>
            </div>
          </motion.div>

          {/* Underlay canvas sketch overlay floating decorative card */}
          <motion.div
            initial={{ opacity: 0, x: 40, rotate: -6 }}
            animate={{ opacity: 0.85, x: 20, rotate: -4 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="absolute -bottom-8 -right-4 w-44 aspect-[4/5] bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-2 rounded-md shadow-lg pointer-events-none z-[-5] hidden sm:block"
          >
            <div className="w-full h-[80%] overflow-hidden rounded bg-stone-200 dark:bg-stone-800">
              <img
                src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=400"
                alt="Portrait charcoal sketch"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="pt-2 text-[9px] font-mono text-stone-400 uppercase tracking-widest text-center">
              Student Study #108
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Scroll mouse suggestion indicator at bottom center */}
      <button
        onClick={() => handleScrollToSection('about')}
        aria-label="Scroll down to About section"
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1.5 focus:outline-none text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer transition-colors"
      >
        <span className="font-mono text-[9px] tracking-widest uppercase">DISCOVER PHILOSOPHY</span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          <ArrowDown className="w-4 h-4 stroke-[1.5]" />
        </motion.div>
      </button>
    </section>
  );
}
