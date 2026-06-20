import { useState, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quote, Star, ArrowLeftRight, Award, Plus } from 'lucide-react';
import { Testimonial } from '../types';

const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: 'test-1',
    studentName: 'Marcus Finch',
    courseTaken: 'Classical Portraiture Mastery',
    reviewText: 'Before working with Sneha, my drawings felt like flat cartoon outlines. She completely rewired how I analyze lighting. By understanding where the terminator shadows meet bouncing ambient light, I can finally draw realistic, three-dimensional faces that look alive. Her program is legendary!',
    rating: 5,
    beforeImage: 'https://images.unsplash.com/photo-1582201942988-13e60e4556ee?auto=format&fit=crop&q=80&w=500',
    afterImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=500'
  },
  {
    id: 'test-2',
    studentName: 'Sophia Chen',
    courseTaken: 'Architectural & Masterwork',
    reviewText: 'I used to struggle intensely with structural perspective. Alignment lines never seemed to match. Sneha taught me classical academic triangulation tricks and 2-point horizon guides. My sketchbooks are now filled with beautiful, structured heritage landmark drawings. Absolutely flawless tutoring.',
    rating: 5,
    beforeImage: 'https://images.unsplash.com/photo-1576016770956-debb63d900ef?auto=format&fit=crop&q=80&w=500',
    afterImage: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&q=80&w=500'
  },
  {
    id: 'test-3',
    studentName: 'Aiden Gallagher',
    courseTaken: 'Foundations of Sight',
    reviewText: 'I thought realism required an innate genetic talent. Sneha showed me that drawing is simply 95% active, focused seeing. Learning to isolate shapes using negative space and values removed my creative blocks entirely. Highly encourage this for anyone starting out with pencil drawing.',
    rating: 5,
    beforeImage: 'https://images.unsplash.com/photo-1549887534-1541e9326642?auto=format&fit=crop&q=80&w=500',
    afterImage: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=500'
  }
];

export default function Testimonials() {
  const [activeId, setActiveId] = useState<string>('test-1');
  const [sliderPos, setSliderPos] = useState<number>(45); // percent 0 - 100

  const getActiveTestimonial = () => {
    return TESTIMONIALS_DATA.find((t) => t.id === activeId) || TESTIMONIALS_DATA[0];
  };

  const handleSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSliderPos(parseInt(e.target.value));
  };

  return (
    <section
      id="testimonials"
      className="py-24 bg-stone-150 dark:bg-stone-900 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Elements */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-20">
          <span className="font-mono text-xs text-wood font-semibold tracking-widest uppercase block">
            STUDENT SUCCESS
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-stone-900 dark:text-stone-100 tracking-tight text-center">
            The Proof is in the Drawing
          </h2>
          <div className="h-[1px] w-12 bg-wood mx-auto" />
          <p className="text-stone-550 dark:text-stone-400 font-light text-sm">
            Observe the authentic transformation of actual students. Slide the scrollbar divider on the right 
            to directly compare progress drawings from early Week 1 blocks versus final Week 12 academic graduation drawings.
          </p>
        </div>

        {/* Testimonials Side-by-Side block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Selected review text & slider tabs (5 cols) */}
          <div className="lg:col-span-6 text-left space-y-6">
            
            {/* Student selection Tab Buttons */}
            <div className="flex border-b border-stone-250 dark:border-stone-850 pb-2 gap-4">
              {TESTIMONIALS_DATA.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveId(t.id);
                    setSliderPos(45); // reset comparison slider
                  }}
                  className={`text-sm font-medium pb-2 relative cursor-pointer focus:outline-none transition-colors ${
                    activeId === t.id
                      ? 'text-stone-900 dark:text-stone-100 font-bold'
                      : 'text-stone-400 dark:text-stone-500 hover:text-stone-700'
                  }`}
                >
                  {t.studentName}
                  {activeId === t.id && (
                    <motion.div
                      layoutId="activeTestUnderline"
                      className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-stone-950 dark:bg-stone-50"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Testimonial Quote details */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-1">
                  {[...Array(getActiveTestimonial().rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-wood fill-current" />
                  ))}
                </div>

                <div className="relative">
                  <Quote className="absolute top-0 left-0 w-8 h-8 text-stone-200 dark:text-stone-800 -translate-x-3 -translate-y-4 -z-10 opacity-60" />
                  <p className="font-serif text-lg text-stone-700 dark:text-stone-300 italic leading-relaxed pl-5">
                    "{getActiveTestimonial().reviewText}"
                  </p>
                </div>

                {/* Course credit tag */}
                <div className="pl-5 pt-2 flex items-center justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-stone-900 dark:text-stone-100">
                      {getActiveTestimonial().studentName}
                    </h4>
                    <p className="text-[11px] font-mono tracking-wider text-stone-500 dark:text-stone-400 mt-1 uppercase">
                      Class Level: {getActiveTestimonial().courseTaken}
                    </p>
                  </div>
                  
                  <span className="text-[10px] bg-stone-200/50 dark:bg-stone-805 text-stone-750 dark:text-stone-350 px-2.5 py-1 rounded font-mono font-medium flex items-center gap-1.5 uppercase">
                    <Award className="w-3.5 h-3.5" /> Graduate
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: The Interactive Comparison Morph Splitter Card (7 cols) */}
          <div className="lg:col-span-6 flex flex-col items-center">
            
            <div className="relative w-full max-w-lg aspect-[4/3] bg-stone-200 dark:bg-stone-950 rounded-lg overflow-hidden border border-stone-250 dark:border-stone-800 shadow-xl select-none group">
              
              {/* Backing standard Before photo */}
              <div className="absolute inset-0 w-full h-full">
                <img
                  src={getActiveTestimonial().beforeImage}
                  alt={`${getActiveTestimonial().studentName} Week 1 Attempt`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                
                {/* Float Left Label */}
                <div className="absolute bottom-4 left-4 bg-stone-900/80 backdrop-blur-sm text-stone-50 text-[10px] font-mono tracking-widest px-2.5 py-1 rounded z-10 select-none uppercase">
                  Week 1 Attempt
                </div>
              </div>

              {/* Overlay cropping Morph After photo on top */}
              <div
                className="absolute inset-y-0 left-0 overflow-hidden border-r border-stone-300 dark:border-stone-700 z-20"
                style={{ width: `${sliderPos}%` }}
              >
                <div className="absolute inset-y-0 left-0 w-[448px] h-full sm:w-[500px]">
                  <img
                    src={getActiveTestimonial().afterImage}
                    alt={`${getActiveTestimonial().studentName} Week 12 Final`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Float Right Label inside cropped div */}
                <div className="absolute bottom-4 left-4 bg-stone-50/90 text-stone-900 text-[10px] font-mono tracking-widest px-2.5 py-1 rounded z-10 select-none font-bold uppercase whitespace-nowrap">
                  Week 12 Final
                </div>
              </div>

              {/* Custom interactive sliding handle */}
              <div
                className="absolute inset-y-0 z-30 pointer-events-none flex flex-col justify-center items-center"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="w-[1.5px] h-full bg-white shadow-md relative" />
                
                {/* Floating Round Dragger Handle node */}
                <div className="absolute w-8 h-8 rounded-full bg-stone-950 dark:bg-stone-50 border border-stone-200 dark:border-stone-800 text-white dark:text-stone-950 flex items-center justify-center shadow-lg transform -translate-x-1/2">
                  <ArrowLeftRight className="w-4 h-4 stroke-[2]" />
                </div>
              </div>

              {/* Transparent background slider trigger overlay element */}
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPos}
                onChange={handleSliderChange}
                aria-label="Drag before / after comparisons"
                className="absolute inset-0 w-full h-full opacity-0 z-40 cursor-ew-resize"
              />
            </div>

            {/* Slider suggestion footnote */}
            <p className="mt-4 text-[10px] text-stone-400 dark:text-stone-500 font-mono tracking-widest flex items-center gap-1.5 uppercase select-none">
              <ArrowLeftRight className="w-3.5 h-3.5 animate-pulse" /> DRAG THE IMAGE SLIDER TO OBSERVE GROWTH
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
