import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Compass, Eye, Map, Award, HelpCircle, RefreshCw, Star } from 'lucide-react';
import { Lesson } from '../types';

const LESSONS_DATA: Lesson[] = [
  {
    id: 'lesson-1',
    title: 'Foundations of Sight',
    level: 'Beginner',
    duration: '12-Week Private Mentorship',
    price: 480,
    description: 'Rebuild your visual system. Learn to bypass mental assumptions and sketch precisely what is in front of you, with secure contours and basic structural value blocks.',
    curriculum: [
      'Proportional Triangulation & Plumb alignments',
      'Contour drawing & Hand-eye synchronization limits',
      'Understanding negative space boundaries',
      'The 9-step gray scale and charcoal value blocks',
      'Foundational 1-point and 2-point perspective laws'
    ]
  },
  {
    id: 'lesson-2',
    title: 'Classical Portraiture Mastery',
    level: 'Intermediate',
    price: 720,
    duration: '16-Week Immersive Critique',
    description: 'Anatomical analysis of the human facial architecture. Learn how to map muscular forms, direct strong lighting (chiaroscuro), and shade core values smoothly.',
    curriculum: [
      'The Loomis method & structural head planes',
      'Eye, nose, lip, and ear anatomical sub-structures',
      'Establishing core and cast shadow borders',
      'Edge hierarchy (Hard, Firm, Soft, and Lost boundaries)',
      'Subtle value gradient transitions using 6B and woodless graphite'
    ]
  },
  {
    id: 'lesson-3',
    title: 'Architectural & Masterwork Perspective',
    level: 'Advanced',
    price: 590,
    duration: '10-Week Master Masterclass',
    description: 'Explore grand perspectives and natural landscapes. Work with classical iron gall sepia ink and bamboo reeds, learning how to combine architectural precision with organic texture.',
    curriculum: [
      'Advanced 3-point and atmospheric perspective',
      'Complex building architectural hatching systems',
      'Draped linen study and complex texture rendering',
      'Landscape massing using soft charcoal and ink washes',
      'Analyzing and copying classical master drawings (Da Vinci, Michelangelo)'
    ]
  }
];

export default function Lessons() {
  const [selectedLessonId, setSelectedLessonId] = useState<string>('lesson-1');
  
  // Assessor State
  const [quizStep, setQuizStep] = useState<number>(0); // 0 = not started, 1, 2, 3 = steps, 4 = results
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});

  const quizQuestions = [
    {
      step: 1,
      title: 'What is your current relationship with drawing?',
      options: [
        { label: 'I draw stick figures or flat shapes, struggling with perspective/proportions.', value: 'beginner' },
        { label: 'I can sketch simple shapes, but my shading looks flat and hands/faces baffle me.', value: 'intermediate' },
        { label: 'I have drawn castings/anatomies but want to master complex ink, perspective, or master copies.', value: 'advanced' },
      ]
    },
    {
      step: 2,
      title: 'What is your primary drawing medium of interest?',
      options: [
        { label: 'Standard graphite pencils & charcoal willow sticks.', value: 'beginner-int' },
        { label: 'Heavy slate/matte carbon, chalk highlights, & textured dry paper.', value: 'intermediate' },
        { label: 'Steel dip ink nibs, sepia washes, or sand panels.', value: 'advanced' },
      ]
    },
    {
      step: 3,
      title: 'How do you prefer to handle structure in a drawing?',
      options: [
        { label: 'I usually guess or trace references, resulting in skewed alignments.', value: 'beginner' },
        { label: 'I lay down basic lines, but struggle with complex sphere planes or drapery curves.', value: 'intermediate' },
        { label: 'I know perspective basics but want to render atmospheric distance and complex structures.', value: 'advanced' },
      ]
    }
  ];

  const handleSelectQuizOption = (val: string) => {
    const nextAnswers = { ...quizAnswers, [quizStep]: val };
    setQuizAnswers(nextAnswers);

    if (quizStep < 3) {
      setQuizStep(quizStep + 1);
    } else {
      // Calculate output recommendation
      setQuizStep(4);
      
      // Determine lesson recommended based on tally
      const counts = Object.values(nextAnswers);
      const isAdvanced = counts.includes('advanced');
      const isIntermediate = counts.includes('intermediate');

      if (isAdvanced) {
        setSelectedLessonId('lesson-3');
      } else if (isIntermediate || counts.includes('beginner-int')) {
        setSelectedLessonId('lesson-2');
      } else {
        setSelectedLessonId('lesson-1');
      }
    }
  };

  const resetQuiz = () => {
    setQuizStep(0);
    setQuizAnswers({});
  };

  const getRecommendedLesson = () => {
    return LESSONS_DATA.find((l) => l.id === selectedLessonId) || LESSONS_DATA[0];
  };

  return (
    <section
      id="lessons"
      className="py-24 bg-stone-50 dark:bg-stone-950 border-t border-stone-200/50 dark:border-stone-800/50 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-20">
          <span className="font-mono text-xs text-wood font-semibold tracking-widest uppercase block">
            ACADEMIC CURRICULA
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-stone-900 dark:text-stone-100 tracking-tight">
            Comprehensive Training Classes
          </h2>
          <div className="h-[1px] w-12 bg-wood mx-auto" />
          <p className="text-stone-500 dark:text-stone-400 font-light text-sm">
            Discover a series of structured private courses designed to elevate your craft. 
            All classes include personalized video critiques, step-by-step master demonstrations, and homework assignments.
          </p>
        </div>

        {/* Layout: Assessor widget side-by-side with Course selection cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Left Column: Interactive Level Assessor (5 cols) */}
          <div className="lg:col-span-5 bg-stone-100 dark:bg-stone-900 border border-stone-200/50 dark:border-stone-800 p-6 rounded-lg flex flex-col justify-between text-left relative overflow-hidden">
            
            {/* Background absolute decor */}
            <div className="absolute right-0 top-0 opacity-[0.03] text-stone-500 transform translate-x-12 translate-y-[-10px] pointer-events-none">
              <Compass className="w-64 h-64" />
            </div>

            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-stone-700 dark:text-stone-300" />
                <h3 className="font-serif text-xl font-medium text-stone-900 dark:text-stone-50">
                  Interactive Course Assessor
                </h3>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed pr-2">
                Not sure where to begin your academic study? Complete our custom 3-step evaluator to instantly isolate your technical skill ceiling and reveal your curated syllabus.
              </p>

              <hr className="border-stone-250 dark:border-stone-800" />

              {/* Dynamic steps layout container */}
              <AnimatePresence mode="wait">
                {quizStep === 0 && (
                  <motion.div
                    key="step-start"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <p className="text-sm text-stone-650 dark:text-stone-300">
                      Our assessor reviews your geometric line alignment skills, anatomical familiarity, and medium interests to suggest the perfect starting point.
                    </p>
                    <button
                      onClick={() => setQuizStep(1)}
                      className="w-full py-3 bg-stone-950 hover:bg-stone-900 dark:bg-stone-50 dark:hover:bg-stone-100 text-white dark:text-stone-950 font-mono text-xs tracking-widest uppercase rounded-lg cursor-pointer text-center duration-300 transition-colors shadow-sm"
                    >
                      Begin Assessment
                    </button>
                  </motion.div>
                )}

                {quizStep >= 1 && quizStep <= 3 && (
                  <motion.div
                    key={`step-${quizStep}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {/* Progress tag */}
                    <span className="font-mono text-[9px] text-stone-400 tracking-wider block uppercase">
                      Question {quizStep} of 3
                    </span>
                    <h4 className="font-serif text-base text-stone-850 dark:text-stone-100 leading-snug">
                      {quizQuestions[quizStep - 1].title}
                    </h4>

                    {/* Question options */}
                    <div className="space-y-3 pt-2">
                      {quizQuestions[quizStep - 1].options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleSelectQuizOption(opt.value)}
                          className="w-full p-3 border border-stone-250 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 hover:bg-stone-150 dark:hover:bg-stone-900 rounded text-left text-xs text-stone-700 dark:text-stone-300 leading-normal cursor-pointer transition-colors"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {quizStep === 4 && (
                  <motion.div
                    key="step-completed"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4 text-center py-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-2 shadow-inner">
                      <Star className="w-5 h-5 fill-current" />
                    </div>
                    
                    <div className="space-y-1">
                      <span className="font-mono text-[9px] tracking-widest uppercase text-stone-400 block">
                        CALCULATION REVEALED
                      </span>
                      <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-50">
                        {getRecommendedLesson().title} Recommended
                      </h4>
                    </div>

                    <p className="text-xs text-stone-500 leading-relaxed max-w-sm mx-auto p-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded">
                      Based on your focus vectors, Sneha recommends beginning directly in the{' '}
                      <strong>{getRecommendedLesson().level}</strong> program. This course will cover the gaps in your shading and proportion alignments.
                    </p>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={resetQuiz}
                        className="py-2 px-3 border border-stone-300 dark:border-stone-800 text-stone-600 dark:text-stone-400 text-xs rounded font-mono uppercase flex items-center justify-center gap-1.5 hover:bg-stone-50 dark:hover:bg-stone-950 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retake</span>
                      </button>
                      <button
                        onClick={() => {
                          const element = document.getElementById('book');
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        className="flex-grow py-3 bg-stone-950 hover:bg-stone-900 dark:bg-stone-50 dark:hover:bg-stone-100 text-white dark:text-stone-950 text-xs font-semibold font-mono tracking-wider uppercase rounded-lg cursor-pointer text-center duration-300 transition-colors shadow-sm"
                      >
                        Enroll Now
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quote footnote */}
            <div className="mt-8 pt-4 border-t border-stone-250 dark:border-stone-800 font-serif italic text-[11px] text-stone-500 dark:text-stone-450 leading-relaxed">
              "We must understand our visual limits before we attempt to expand our drawing speed."
            </div>
          </div>

          {/* Right Column: Dynamic Course Details container & Tab List (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            
            {/* Horizontal Tabs selector for manual override */}
            <div className="grid grid-cols-3 gap-3">
              {LESSONS_DATA.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => {
                    setSelectedLessonId(lesson.id);
                    if (quizStep === 4) setQuizStep(0); // clear recommended screen if they override
                  }}
                  className={`py-3.5 rounded-lg border text-center transition-all cursor-pointer ${
                    selectedLessonId === lesson.id
                      ? 'bg-stone-950 text-white border-stone-950 dark:bg-stone-50 dark:text-stone-950 dark:border-stone-50 shadow-sm font-semibold'
                      : 'bg-stone-100/50 text-stone-550 border-stone-200 hover:bg-stone-200/50 dark:bg-stone-930 dark:text-stone-400 dark:border-stone-850 dark:hover:bg-stone-900'
                  }`}
                >
                  <span className="block text-xs font-mono tracking-widest uppercase font-semibold">
                    {lesson.level}
                  </span>
                  <span className="block text-[10px] opacity-75 font-serif mt-1 truncate">
                    {lesson.title.split(' ')[0]} Studies
                  </span>
                </button>
              ))}
            </div>

            {/* Display detail content block */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedLessonId}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="bg-stone-50 dark:bg-stone-950 p-6 md:p-8 rounded-lg border border-stone-200/80 dark:border-stone-850 flex-grow text-left space-y-6 flex flex-col justify-between"
              >
                <div className="space-y-6">
                  {/* Top line specs */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="font-mono text-[10px] tracking-widest bg-stone-200/60 dark:bg-stone-900 px-2.5 py-1 text-stone-800 dark:text-stone-200 rounded-full font-bold uppercase">
                        {getRecommendedLesson().duration}
                      </span>
                      <h3 className="font-serif text-2xl font-light text-stone-900 dark:text-stone-50 pt-1">
                        {getRecommendedLesson().title}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="font-serif text-3xl font-light text-stone-900 dark:text-stone-50">
                        ${getRecommendedLesson().price}
                      </span>
                      <span className="block font-mono text-[9px] text-stone-400 uppercase tracking-wider">
                        Tuition Cost / Course
                      </span>
                    </div>
                  </div>

                  <hr className="border-stone-200 dark:border-stone-850" />

                  <p className="text-stone-655 dark:text-stone-300 text-sm leading-relaxed font-light">
                    {getRecommendedLesson().description}
                  </p>

                  {/* Core curriculum checklist */}
                  <div className="space-y-3">
                    <span className="font-mono text-[10px] tracking-widest text-stone-400 block uppercase font-bold">
                      SYLLABUS SPECIFICATIONS INCLUDED:
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-6">
                      {getRecommendedLesson().curriculum.map((item, idx) => (
                        <li
                          key={idx}
                           className="flex items-start gap-2.5 text-xs text-stone-600 dark:text-stone-400"
                        >
                          <span className="w-4 h-4 rounded-full bg-wood/10 border border-wood/20 text-wood flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5" />
                          </span>
                          <span className="leading-tight">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t border-stone-200 dark:border-stone-850 flex flex-wrap items-center justify-between gap-4">
                  <span className="text-[11px] font-mono text-stone-450 dark:text-stone-500 flex items-center gap-1.5 uppercase leading-none">
                    <Award className="w-3.5 h-3.5" /> Includes certificate of Academic Fine Art
                  </span>
                  
                  <button
                    onClick={() => {
                      const bookForm = document.getElementById('book');
                      if (bookForm) {
                        // Prefill some fields if possible, zoom down
                        bookForm.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="px-6 py-3 bg-stone-950 hover:bg-stone-900 dark:bg-stone-50 dark:hover:bg-stone-100 text-white dark:text-stone-950 font-mono text-xs tracking-widest uppercase rounded-lg cursor-pointer font-bold transition-all duration-300 shadow-sm"
                  >
                    Select This Class
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>

          </div>

        </div>

      </div>
    </section>
  );
}
