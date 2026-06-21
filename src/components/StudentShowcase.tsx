import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Maximize2, BookOpen, Award, Clock, ArrowRight, X, Layers, User, ShieldAlert } from 'lucide-react';
import { StudentProject, LessonLevel } from '../types';
import { useContent } from '../context/ContentContext';

const SHOWCASE_DATA: StudentProject[] = [
  {
    id: 'proj-1',
    title: 'Bargue Profile of Dante',
    studentName: 'Clarissa Montgomery',
    durationInAcademy: '6 Weeks of Training',
    level: 'Beginner',
    medium: 'Academic Graphite (HB, 2B, 4B) on Strathmore heavy paper',
    imageUrl: 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?auto=format&fit=crop&q=80&w=800',
    description: 'A dedicated study in line-weight control and outline exactness, practicing Charles Bargue\'s Sight-Size classical methodology of geometric simplification.',
    teacherMentorshipNotes: 'Clarissa started with zero formal drawing experience. By teaching her to squint and simplify complex contours into straight, angled vectors first, she overcame the fear of free-hand portraiture. Her precision in the forehead slope and nose contour is exceptional.'
  },
  {
    id: 'proj-2',
    title: 'Michelangelo\'s David Eye Plaster',
    studentName: 'Julian Vance',
    durationInAcademy: '12 Weeks of Training',
    level: 'Intermediate',
    medium: 'Compressed Charcoal, Willow Sticks, and Kneaded Eraser on Canson Rag',
    imageUrl: 'https://images.unsplash.com/photo-1579783921570-07520420d44a?auto=format&fit=crop&q=80&w=800',
    description: 'Detailed classical cast study analyzing the dramatic three-dimensional light wrapping around the eye socket, eyelid fold, and brow structure.',
    teacherMentorshipNotes: 'An incredible study in light mechanics. Julian\'s rendering of the iris hollow and the cast-shadow from the brow projection is perfectly aligned with real light rays. The intermediate stage focuses heavily on translating spheres and cylinders.'
  },
  {
    id: 'proj-3',
    title: 'Anatomical Grip & Foreshortened Wrist',
    studentName: 'Evelyn Zhao',
    durationInAcademy: '5 Months of Training',
    level: 'Advanced',
    medium: 'Stumped Charcoal, Carbon Dust, and Raw Graphite 6B highlights on Tinted Ingres Paper',
    imageUrl: 'https://images.unsplash.com/photo-1576016770956-debb63d900ef?auto=format&fit=crop&q=80&w=800',
    description: 'An advanced inquiry of active hand bone landmarks, tendon strains, and complex overlapping fingers receding in deeply foreshortened space.',
    teacherMentorshipNotes: 'Hands are notoriously difficult because our minds tend to draw symbols instead of actual shapes. Evelyn analyzed the skeletal structure underneath first. Note how her highlights follow the tendon lines, giving the drawing vibrant muscular realism.'
  },
  {
    id: 'proj-4',
    title: 'Hellenistic Senator Bust Study',
    studentName: 'Mateo Rossi',
    durationInAcademy: '8 Months of Training',
    level: 'Advanced',
    medium: 'Nitram High-Carbon Charcoal and Wet-Sanded Canson Board',
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800',
    description: 'A monumental render focusing on deep, atmospheric dark-field contrast and extremely soft, turned edge transitions on stone textures.',
    teacherMentorshipNotes: 'Mateo has reached a professional-apprentice grade of master craftsmanship. To achieve this ambient depth, he built up dense layers of high-carbon charcoal, softened them with a sweeping badger brush, and pulled out highlight planes using a crumbly dough eraser. Truly exhibition-quality.'
  },
  {
    id: 'proj-5',
    title: 'Ancient Ceramic Still Life',
    studentName: 'Sophia Moretti',
    durationInAcademy: '8 Weeks of Training',
    level: 'Intermediate',
    medium: 'Conté à Paris Sepia Crayons and White Chalk highlights on Warm Toned Paper',
    imageUrl: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&q=80&w=800',
    description: 'An exploration of pottery shadows, textures, highlight points of ceramic glaze, and shadows cast upon rustic wooden planks.',
    teacherMentorshipNotes: 'Sophia struggled initially with symmetrical ovals and spatial vanishing points. We spent three focused lessons drawing concentric ellipses at different heights. Her reward is here: perfectly balanced ceramic openings and a weightiness that feels permanent.'
  },
  {
    id: 'proj-6',
    title: 'Classic Study of Hand and Drapery Fold',
    studentName: 'Dominic Thorne',
    durationInAcademy: '4 Weeks of Training',
    level: 'Beginner',
    medium: 'Hard Drawing Graphite (H, HB, B) on Bleached Cotton Paper',
    imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=800',
    description: 'Analyzing fold structures of heavy linen cloth wrapping around a wooden cylinder, isolating light-halves and shadow-shapes.',
    teacherMentorshipNotes: 'Dominic is a beginner whose main struggle was separating the light side from the shadow side. By blocking in shadows with a flat, uniform tone first, he easily maintained clear division. This process establishes critical light-hierarchy.'
  }
];

export default function StudentShowcase() {
  const { content } = useContent();
  const [selectedLevel, setSelectedLevel] = useState<LessonLevel | 'All'>('All');
  const [activeProject, setActiveProject] = useState<StudentProject | null>(null);

  const filteredProjects = (content.studentShowcase || []).filter(
    (proj) => selectedLevel === 'All' || proj.level === selectedLevel
  );

  const handleBookRedirect = () => {
    setActiveProject(null);
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="student-showcase"
      className="py-24 bg-stone-100 dark:bg-stone-900 border-t border-b border-stone-200/50 dark:border-stone-800/50 transition-colors duration-300 relative overflow-hidden"
    >
      {/* Decorative subtle classical layout accents */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-stone-200/20 dark:bg-stone-800/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-stone-200/30 dark:bg-stone-800/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-wood/10 text-wood font-semibold rounded-full text-[10px] font-mono tracking-widest uppercase border border-wood/20">
            <Award className="w-3.5 h-3.5" />
            <span>ALUMNI ACCOMPLISHMENTS</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-stone-900 dark:text-stone-100 tracking-tight">
            Featured Student Showcase
          </h2>
          <div className="h-[1px] w-12 bg-wood mx-auto" />
          <p className="text-stone-550 dark:text-stone-400 font-light text-sm md:text-base leading-relaxed">
            Witness the transformational power of classical academy training. 
            These draftsmanship exercises and final drawings were created by actual studio alumni, 
            ranging from complete beginners to advanced artists.
          </p>
        </div>

        {/* Level Filters */}
        <div className="flex flex-wrap justify-center items-center gap-2 mb-12">
          {['All', 'Beginner', 'Intermediate', 'Advanced'].map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level as LessonLevel | 'All')}
              className={`px-4 py-1.5 text-[11px] font-mono tracking-widest uppercase rounded-full cursor-pointer transition-all border duration-300 ${
                selectedLevel === level
                  ? 'bg-stone-950 text-white border-stone-950 dark:bg-stone-50 dark:text-stone-950 dark:border-stone-50 font-semibold shadow-sm'
                  : 'bg-white/60 text-stone-500 border-stone-200 hover:bg-stone-50 hover:text-stone-900 dark:bg-stone-850 dark:text-stone-400 dark:border-stone-800 dark:hover:bg-stone-800 dark:hover:text-stone-100'
              }`}
            >
              {level === 'All' ? 'All Milestones' : `${level} Level`}
            </button>
          ))}
        </div>

        {/* Art Gallery Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((proj) => (
              <motion.div
                layout
                key={proj.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="group bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-850 p-4 rounded-xl flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-stone-300 dark:hover:border-stone-750 transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Thumbnail Wrapper */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-stone-100 dark:bg-stone-900">
                  <img
                    src={proj.imageUrl}
                    alt={proj.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  
                  {/* Subtle hover zoom/info button */}
                  <div className="absolute inset-0 bg-stone-950/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button
                      onClick={() => setActiveProject(proj)}
                      className="px-4 py-2 bg-stone-50 hover:bg-stone-100 text-stone-900 text-xs font-mono tracking-widest uppercase rounded shadow-lg flex items-center gap-1.5 cursor-pointer transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300 font-bold"
                    >
                      <Maximize2 className="w-3.5 h-3.5 stroke-[2]" />
                      <span>Inspect Critique</span>
                    </button>
                  </div>

                  {/* Level Badge */}
                  <div className={`absolute top-3 left-3 px-2 py-0.5 text-[9px] font-mono tracking-widest text-white rounded uppercase shadow border-none ${
                    proj.level === 'Beginner'
                      ? 'bg-wood font-semibold'
                      : proj.level === 'Intermediate'
                      ? 'bg-stone-700 font-semibold'
                      : 'bg-wood-dark font-semibold'
                  }`}>
                    {proj.level}
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute bottom-3 right-3 bg-stone-950/80 backdrop-blur-sm px-2 py-0.5 text-[8px] font-mono tracking-wider text-stone-200 rounded uppercase border border-white/5">
                    {proj.durationInAcademy}
                  </div>
                </div>

                {/* Content Block */}
                <div className="pt-5 flex flex-col justify-between flex-grow text-left">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-stone-400" />
                      <span className="font-mono text-xs text-stone-500 dark:text-stone-400 font-medium">
                        {proj.studentName}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-medium text-stone-900 dark:text-stone-100 group-hover:text-stone-700 dark:group-hover:text-stone-200 transition-colors pointer-events-none line-clamp-1">
                      {proj.title}
                    </h3>

                    <p className="font-mono text-[10px] text-stone-400 dark:text-stone-500 tracking-wide line-clamp-1">
                      {proj.medium}
                    </p>

                    <p className="text-stone-600 dark:text-stone-305 text-xs font-light leading-relaxed line-clamp-2 pt-1 h-9">
                      {proj.description}
                    </p>
                  </div>

                  {/* CTA action bottom margin block */}
                  <div className="pt-4 border-t border-stone-100 dark:border-stone-900 mt-4 flex items-center justify-between">
                    <button
                      onClick={() => setActiveProject(proj)}
                      className="text-stone-900 dark:text-stone-200 hover:text-wood dark:hover:text-wood text-xs font-mono tracking-widest uppercase flex items-center gap-1.5 transition-colors cursor-pointer group-hover:translate-x-0.5"
                    >
                      <span>Study critique</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </button>
                    
                    <span className="font-mono text-[9px] text-stone-400 uppercase tracking-widest">
                      ACADEMY FILE
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Extra showcase trust block */}
        <div className="mt-16 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 p-6 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-6 text-left max-w-4xl mx-auto">
          <div className="space-y-1.5">
            <h4 className="font-serif text-lg font-medium text-stone-950 dark:text-stone-50">
              Want your drawing in this showcase?
            </h4>
            <p className="text-stone-550 dark:text-stone-400 text-xs font-light max-w-xl">
              Sneha's rigorous pedagogical drawing program guarantees rapid development in accuracy. 
              Our graduation rate boasts full-portfolio masteries across students of all backgrounds.
            </p>
          </div>
          <a
            href="#lessons"
            className="px-5 py-2.5 bg-stone-950 hover:bg-stone-900 dark:bg-stone-50 dark:hover:bg-stone-100 text-white dark:text-stone-950 text-xs font-mono tracking-widest rounded-lg uppercase whitespace-nowrap transition-all duration-300 cursor-pointer"
          >
            Explore curriculum
          </a>
        </div>

        {/* Showcase Lightbox Modal */}
        <AnimatePresence>
          {activeProject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4 md:p-6"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.4 }}
                className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col md:flex-row text-left"
              >
                {/* Image Section */}
                <div className="md:w-3/5 bg-stone-100 dark:bg-stone-950 relative flex items-center justify-center p-4 border-b md:border-b-0 md:border-r border-stone-200 dark:border-stone-800">
                  <img
                    src={activeProject.imageUrl}
                    alt={activeProject.title}
                    referrerPolicy="no-referrer"
                    className="w-full max-h-[45vh] md:max-h-[72vh] object-contain shadow-md rounded-lg"
                  />
                  
                  {/* Floating level badge inside modal */}
                  <div className={`absolute top-4 left-4 px-3 py-1 text-[10px] font-mono tracking-widest text-[stone-50] text-stone-50 rounded-md border-none shadow ${
                    activeProject.level === 'Beginner'
                      ? 'bg-amber-750 font-bold'
                      : activeProject.level === 'Intermediate'
                      ? 'bg-emerald-750 font-bold'
                      : 'bg-indigo-750 font-bold'
                  }`}>
                    {activeProject.level} Project
                  </div>
                </div>

                {/* Info & Pedagogical Notes Section */}
                <div className="md:w-2/5 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
                  <div className="space-y-5">
                    
                    {/* Header block */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="font-mono text-[9px] tracking-widest text-stone-450 dark:text-stone-400 block uppercase">
                          STUDENT EXPOSITION &bull; {activeProject.durationInAcademy}
                        </span>
                        <h3 className="font-serif text-2xl font-light text-stone-900 dark:text-stone-50 leading-tight">
                          {activeProject.title}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-stone-500 font-mono">
                          <span>By</span>
                          <span className="font-semibold text-stone-700 dark:text-stone-300">
                            {activeProject.studentName}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveProject(null)}
                        aria-label="Close details modal"
                        className="p-1.5 border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-850 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 rounded-full cursor-pointer transition-colors duration-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <hr className="border-stone-200 dark:border-stone-800" />

                    {/* Specifications List */}
                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="font-mono text-[9px] text-stone-400 uppercase tracking-widest block mb-0.5">
                          Medium & Materials
                        </span>
                        <span className="text-stone-700 dark:text-stone-200 font-light font-mono text-[11px]">
                          {activeProject.medium}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="font-mono text-[9px] text-stone-400 uppercase tracking-widest block mb-0.5">
                            Status Rank
                          </span>
                          <span className="text-stone-700 dark:text-stone-200 font-medium">
                            {activeProject.level} Grade
                          </span>
                        </div>
                        <div>
                          <span className="font-mono text-[9px] text-stone-400 uppercase tracking-widest block mb-0.5">
                            Academy Tenure
                          </span>
                          <span className="text-stone-700 dark:text-stone-200 font-medium">
                            {activeProject.durationInAcademy}
                          </span>
                        </div>
                      </div>
                    </div>

                    <hr className="border-stone-200 dark:border-stone-800" />

                    {/* Brief desc */}
                    <div>
                      <span className="font-mono text-[9px] text-stone-400 uppercase tracking-widest block mb-1">
                        Artwork Statement
                      </span>
                      <p className="text-stone-600 dark:text-stone-305 text-xs font-light font-mono leading-relaxed">
                        {activeProject.description}
                      </p>
                    </div>

                    <hr className="border-stone-200/60 dark:border-stone-800/60" />

                    {/* Handwritten-styled teacher critique */}
                    <div className="p-4 bg-amber-50/50 dark:bg-stone-950/60 border border-amber-100/50 dark:border-stone-850 rounded-lg space-y-2">
                      <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-widest text-amber-800 dark:text-stone-400 uppercase">
                        <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-stone-500" />
                        <span>Teacher Pedagogy Critique</span>
                      </div>
                      <p className="text-stone-700 dark:text-stone-300 font-serif text-xs italic leading-relaxed">
                        "{activeProject.teacherMentorshipNotes}"
                      </p>
                      <div className="pt-1.5 text-right">
                        <span className="font-serif italic text-[10px] text-stone-500 dark:text-stone-400">
                          &mdash; Sneha, Fine Art Tutor
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Enroll CTA */}
                  <div className="pt-4 border-t border-stone-200 dark:border-stone-800 mt-6 flex justify-between gap-3">
                    <button
                      onClick={handleBookRedirect}
                      className="flex-1 py-2.5 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-stone-50 dark:text-stone-950 font-mono text-[11px] tracking-widest uppercase text-center rounded-lg transition-colors cursor-pointer"
                    >
                      Achieve This Precision
                    </button>
                  </div>

                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
