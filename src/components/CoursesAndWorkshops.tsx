import { motion } from 'motion/react';
import { Calendar, Clock, MapPin, Sparkles, BookOpen, ArrowRight, UserCheck } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { CourseOrWorkshop } from '../types';

export default function CoursesAndWorkshops() {
  const { content } = useContent();

  const sectionData = content.coursesAndWorkshops || {
    badgeText: "UPCOMING PROGRAMS & EVENTS",
    title: "Masterclasses & Workshops",
    description: "Engage in highly structured, immersive dry-media sessions. Learn classical drawing triangulation, form carving, and tonal anatomy directly from Sneha Bansal.",
    items: []
  };

  // Filter only active courses/workshops
  const activeItems = (sectionData.items || []).filter(item => item.isActive);

  const handleInquire = (item: CourseOrWorkshop) => {
    // Dispatch custom event to prefill the contact form
    const messageText = `Hi Sneha,\n\nI would like to inquire about the upcoming ${item.type}: "${item.title}" scheduled for ${item.dateOrDuration}. Please provide more details on registration and requirements.\n\nThank you!`;
    const inquiryType = item.type === 'Workshop' ? 'School/Institutional Workshop' : 'Online Group Classes';
    
    const event = new CustomEvent('prefill-inquiry', {
      detail: {
        message: messageText,
        inquiryType: inquiryType
      }
    });
    window.dispatchEvent(event);

    // Scroll smoothly to contact form
    const element = document.getElementById('contact');
    if (element) {
      const offsetTop = element.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="courses-workshops" className="py-24 bg-stone-50 dark:bg-stone-950/40 border-b border-stone-200/55 dark:border-stone-900/60 relative overflow-hidden transition-colors duration-300">
      {/* Decorative subtle grid background */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 bg-[#B38F4D]/10 text-[#B38F4D] dark:text-[#D4AF37] border border-[#B38F4D]/20 font-mono text-[10px] font-bold px-3.5 py-1 rounded-full uppercase tracking-widest"
          >
            <Sparkles className="w-3 h-3 animate-pulse" />
            {sectionData.badgeText || "ACADEMIC PROGRAMS"}
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-serif font-semibold text-stone-900 dark:text-stone-100 tracking-tight leading-tight"
          >
            {sectionData.title || "Courses & Masterclasses"}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-stone-500 dark:text-stone-400 font-light text-sm sm:text-base leading-relaxed"
          >
            {sectionData.description}
          </motion.p>
        </div>

        {/* Content Section */}
        {activeItems.length === 0 ? (
          /* Elegant Empty State Placeholder */
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-xl mx-auto text-center bg-white dark:bg-stone-900/60 border border-stone-200/60 dark:border-stone-850 p-10 rounded-2xl shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-stone-200 via-[#B38F4D]/40 to-stone-200 dark:from-stone-800 dark:via-[#B38F4D]/30 dark:to-stone-800" />
            
            <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800/80 border border-stone-200/50 dark:border-stone-700/50 flex items-center justify-center text-stone-400 dark:text-stone-500 mx-auto mb-6">
              <BookOpen className="w-8 h-8 stroke-[1.2]" />
            </div>

            <h3 className="text-xl font-serif font-medium text-stone-800 dark:text-stone-200 mb-2">
              No active courses or workshops
            </h3>
            
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-light mb-6">
              New academic drawing curricula are currently being meticulously hand-drafted. Join our mailing newsletter or write directly to be notified the exact moment seat applications unlock.
            </p>

            <button
              onClick={() => {
                const element = document.getElementById('contact');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#B38F4D] dark:text-[#D4AF37] tracking-widest uppercase hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
            >
              Get Notified First <ArrowRight className="w-4.5 h-4.5" />
            </button>
          </motion.div>
        ) : (
          /* Grid of beautiful Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {activeItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group bg-white dark:bg-stone-900 border border-stone-200/70 dark:border-stone-850/80 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                {/* Image & Type Header */}
                <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-stone-100 dark:bg-stone-950">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                  />
                  {/* Subtle vignette layer */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-80" />
                  
                  {/* Type Badge */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className={`text-[9px] font-mono font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm ${
                      item.type === 'Workshop'
                        ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-900/50'
                        : 'bg-stone-900 text-stone-50 border-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:border-stone-200'
                    }`}>
                      {item.type}
                    </span>
                    {item.spotsLeft !== undefined && item.spotsLeft > 0 && (
                      <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/80 dark:text-red-200 dark:border-red-900/50 animate-pulse">
                        Only {item.spotsLeft} Spots Left!
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Content */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xl sm:text-2xl font-serif font-semibold text-stone-900 dark:text-stone-50 group-hover:text-[#B38F4D] dark:group-hover:text-[#D4AF37] transition-colors duration-300 leading-tight">
                      {item.title}
                    </h3>
                    
                    <p className="text-xs sm:text-sm text-stone-550 dark:text-stone-400 font-light leading-relaxed">
                      {item.description}
                    </p>

                    {/* Metadata indicators */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-stone-100 dark:border-stone-850">
                      <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                        <Calendar className="w-4 h-4 text-[#B38F4D] shrink-0 stroke-[1.5]" />
                        <span className="font-mono text-xs font-medium">{item.dateOrDuration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                        <Clock className="w-4 h-4 text-[#B38F4D] shrink-0 stroke-[1.5]" />
                        <span className="font-mono text-xs font-medium">{item.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                        <MapPin className="w-4 h-4 text-[#B38F4D] shrink-0 stroke-[1.5]" />
                        <span className="font-mono text-xs font-medium truncate">{item.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                        <BookOpen className="w-4 h-4 text-[#B38F4D] shrink-0 stroke-[1.5]" />
                        <span className="font-mono text-xs font-medium">Syllabus Included</span>
                      </div>
                    </div>

                    {/* Syllabus/Bullets detail expansion */}
                    {item.syllabusOrDetails && item.syllabusOrDetails.length > 0 && (
                      <div className="pt-4 space-y-2">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 block">
                          Syllabus highlights & key milestones:
                        </span>
                        <ul className="space-y-2">
                          {item.syllabusOrDetails.map((bullet, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-stone-600 dark:text-stone-400 font-light">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#B38F4D]/70 dark:bg-[#D4AF37]/70 mt-1.5 shrink-0" />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Pricing & CTA */}
                  <div className="pt-6 border-t border-stone-100 dark:border-stone-850 flex items-center justify-between gap-4">
                    <div>
                      <span className="block text-[8px] font-mono text-stone-400 dark:text-stone-500 uppercase tracking-widest">TUITION INVESTMENT</span>
                      <span className="text-xl font-mono font-bold text-stone-900 dark:text-stone-100">
                        ₹{item.price.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleInquire(item)}
                      className="px-5 py-3 bg-[#B38F4D] hover:bg-[#91713d] text-white text-[10px] font-mono font-bold tracking-widest uppercase rounded-lg transition-all duration-300 shadow-sm cursor-pointer flex items-center gap-1.5 group-hover:scale-[1.01]"
                    >
                      Inquire Class <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
