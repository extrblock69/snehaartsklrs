import { motion } from 'motion/react';
import { Palette, Globe, GraduationCap, Newspaper, Sparkles, BookOpen, Heart } from 'lucide-react';
import { KalakarSnehaPhoto } from './KalakarSnehaAssets';
import { useContent } from '../context/ContentContext';

export default function About() {
  const { content } = useContent();
  const { about } = content;

  const highlights = [
    {
      icon: Palette,
      title: 'Trained & Mentored ' + about.studentsMentored + ' Students',
      desc: 'Nurtured creative skills in drawing, sketching, shading, and lifelike portrait creation.'
    },
    {
      icon: Globe,
      title: 'Global Outreach & Classes',
      desc: 'Conducted live, immersive online classes for enthusiastic students across India and international regions.'
    },
    {
      icon: GraduationCap,
      title: 'Academic & School Associations',
      desc: 'Associated with and contributed to art-related pedagogies in reputed institutions like Oxford and Sanskar.'
    },
    {
      icon: Newspaper,
      title: 'Press & Media Features',
      desc: 'Featured in newspapers recognizing dedication to art education, creative initiatives, and community impact.'
    },
    {
      icon: Sparkles,
      title: 'Large-scale Art Projects',
      desc: 'Participated in and contributed to prestigious creative events, large canvases, and community projects.'
    },
    {
      icon: BookOpen,
      title: 'Structured Art Programs',
      desc: 'Developed tailored, step-by-step training curriculum for both absolute beginners and advanced creators.'
    },
    {
      icon: Heart,
      title: 'Growing Creative Community',
      desc: 'Built a supportive network of young artists through active mentorship, reviews, and continuous guidance.'
    }
  ];

  return (
    <section
      id="about"
      className="py-24 bg-cream/30 dark:bg-stone-930/30 border-t border-stone-200/50 dark:border-stone-850 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column: Philosophical bio and highlights */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <span className="font-mono text-xs text-wood dark:text-wood font-semibold tracking-widest uppercase block">
              {about.badgeText}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-stone-900 dark:text-stone-100 tracking-tight leading-tight">
              {about.title}
            </h2>
            <p className="font-mono text-[11px] tracking-wider text-wood uppercase font-medium -mt-3">
              Artist &bull; Art Educator &bull; Creative Mentor
            </p>
            
            <div className="space-y-4 text-stone-600 dark:text-stone-300 font-light leading-relaxed text-sm">
              {about.paragraphs.map((para, i) => (
                <p key={i}>
                  {para}
                </p>
              ))}
            </div>

            <blockquote className="border-l-4 border-wood pl-5 my-6 italic text-stone-700 dark:text-stone-300 font-serif text-base leading-relaxed">
              "{about.quote || "We do not learn to draw to replicate a photo. We learn to draw so we can translate how light rolls over a surface, and make a flat piece of paper breathe."}"
            </blockquote>

            {/* Profile Signature & Credentials block */}
            <div className="flex items-center gap-4 pt-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-stone-300 dark:border-stone-700 bg-stone-250 flex-shrink-0">
                <KalakarSnehaPhoto src={about.avatarUrl || content.hero.teacherPhotoUrl} className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-serif text-stone-850 dark:text-stone-100 font-semibold leading-none">
                  {about.authorName || "Sneha Bansal"}
                </h4>
                <p className="text-[10px] font-mono text-stone-500 dark:text-stone-400 tracking-wider mt-1.5 uppercase leading-normal">
                  {about.authorRole || "Academic Director, Kailaras, Morena, Madhya Pradesh, India"}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Key pillars grid */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200/50 dark:border-stone-800/50 pb-2">
              <span className="font-mono text-xs text-wood dark:text-wood font-semibold tracking-widest uppercase block">
                Highlights & Achievements
              </span>
              <span className="font-mono text-[9px] text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                IMPACT STUDY
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {highlights.map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.6, delay: idx * 0.08 }}
                    className={`bg-stone-50 dark:bg-stone-950 p-6 rounded-md border border-stone-200/50 dark:border-stone-800/50 hover:shadow-md hover:border-stone-300 dark:hover:border-stone-850 transition-all text-left ${
                      idx === highlights.length - 1 ? 'sm:col-span-2' : ''
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-center text-wood mb-4 shadow-sm">
                      <IconComp className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <h3 className="font-serif text-base font-semibold text-stone-900 dark:text-stone-100 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-stone-500 dark:text-stone-400 text-xs font-normal leading-relaxed">
                      {item.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
