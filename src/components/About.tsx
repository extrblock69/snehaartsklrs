import { motion } from 'motion/react';
import { Eye, Award, Hammer, Compass } from 'lucide-react';

export default function About() {
  const pillars = [
    {
      icon: Eye,
      title: 'Active Seeing',
      desc: 'Most people draw what they "know" rather than what they actually "see". My foundational classes rebuild your observation skills, training you to spot accurate proportional alignments, subtle values, and negative space geometry.'
    },
    {
      icon: Compass,
      title: 'Structural Architecture',
      desc: 'Before shading, there must be absolute skeletal integrity. We learn how to establish secure structural layouts using triangulation, plumb lines, perspective vanishing points, and block-in boundaries for perfect composition.'
    },
    {
      icon: Hammer,
      title: 'Medium Mastery',
      desc: 'Discover how to manipulate the absolute tooth of your paper. Gain tactile knowledge over vine and compressed charcoal, graphite hard-soft grade scales (9H to 9B), sepia washes, tortillons, and kneaded rubbers to sculpt high-end textures.'
    },
    {
      icon: Award,
      title: 'The Academic Legacy',
      desc: 'Inspired by classical and academic drawing principles. True high craft isn\'t about tracing photo references, but capturing the atmospheric mood, form hierarchy, and emotional weight of a live model or setup.'
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
              ACADEMIC PHILOSOPHY
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-stone-900 dark:text-stone-100 tracking-tight leading-tight">
              Drawing is the honesty of fine art. It cannot be negotiated.
            </h2>
            
            <p className="text-stone-600 dark:text-stone-300 font-light leading-relaxed text-base">
              My instruction does not promise quick shortcuts, filters, or tracing shortcuts. 
              Instead, it is an immersive study of classic light physics, proportional triangulation, 
              and charcoal value gradations that gives you the self-sufficiency to draw <strong>anything</strong> in front of you.
            </p>

            <blockquote className="border-l-4 border-wood pl-5 my-6 italic text-stone-700 dark:text-stone-300 font-serif text-lg leading-relaxed">
              "We do not learn to draw to replicate a photo. We learn to draw so we can translate how light rolls over a surface, and make a flat piece of paper breathe."
            </blockquote>

            {/* Profile Signature & Credentials block */}
            <div className="flex items-center gap-4 pt-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-stone-300 dark:border-stone-700 bg-stone-250">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"
                  alt="Sneha Portrait thumbnail"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-serif text-stone-850 dark:text-stone-100 font-semibold leading-none">
                  Sneha
                </h4>
                <p className="text-xs font-mono text-stone-500 dark:text-stone-400 tracking-wider mt-1 uppercase">
                  Fine Art Mentor, Kailaras, Morena, Madhya Pradesh, India
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Key pillars grid */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {pillars.map((pillar, idx) => {
              const IconComp = pillar.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="bg-stone-50 dark:bg-stone-950 p-6 rounded-md border border-stone-200/50 dark:border-stone-800/50 hover:shadow-md hover:border-stone-300 dark:hover:border-stone-850 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-center text-wood mb-4 shadow-sm">
                    <IconComp className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <h3 className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100 mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-stone-500 dark:text-stone-400 text-xs font-normal leading-relaxed">
                    {pillar.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>

        </div>

        {/* Decorative Tools Row */}
        <div className="mt-20 pt-10 border-t border-stone-200/50 dark:border-stone-800/50 text-center">
          <p className="font-mono text-[10px] tracking-widest text-wood font-semibold uppercase mb-6">
            PRIMARY INSTRUCTIONAL MEDIUMS & TOOLS
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-stone-600 dark:text-stone-400 font-serif italic text-sm md:text-base">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-wood" />
              Raw Vine Charcoal (Coarse and Soft)
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-wood" />
              Academic Graphite (4H to 8B)
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-wood" />
              Sepia Ink & Bamboo Reed Pens
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-wood" />
              Canson 300g Hot-Pressed Art Cotton
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
