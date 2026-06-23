import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, X, Info, Download } from 'lucide-react';
import { Artwork, ArtCategory } from '../types';
import { useContent } from '../context/ContentContext';

const CATEGORIES: { label: string; value: ArtCategory }[] = [
  { label: 'All Drawings', value: 'all' },
  { label: 'Charcoal', value: 'charcoal' },
  { label: 'Academic Graphite', value: 'graphite' },
  { label: 'Classical Ink', value: 'ink' },
  { label: 'Earth Pastel', value: 'pastel' }
];

export default function Gallery() {
  const { content } = useContent();
  const [selectedCategory, setSelectedCategory] = useState<ArtCategory>('all');
  const [activeArtwork, setActiveArtwork] = useState<Artwork | null>(null);

  const filteredArtworks = (content.gallery || []).filter(
    (art) => selectedCategory === 'all' || art.category === selectedCategory
  );


  return (
    <section
      id="gallery"
      className="py-24 bg-stone-50 dark:bg-stone-950 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Elements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center max-w-2xl mx-auto space-y-4 mb-16"
        >
          <span className="font-mono text-xs text-wood font-semibold tracking-widest uppercase block">
            PORTFOLIO SHOWCASE
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-stone-900 dark:text-stone-100 tracking-tight">
            Original Fine-Art Expositions
          </h2>
          <div className="h-[1px] w-12 bg-wood mx-auto" />
          <p className="text-stone-550 dark:text-stone-400 font-light text-sm md:text-base">
            Browse through some of Sneha's recent personal drawings and academic demonstrations. 
            Click any drawing study to view creation details, materials used, and pedagogical notes.
          </p>
        </motion.div>

        {/* Category Filters row */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          className="flex flex-wrap justify-center items-center gap-1.5 md:gap-3 mb-12"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 text-xs font-mono tracking-widest uppercase rounded-full cursor-pointer transition-all border duration-300 ${
                selectedCategory === cat.value
                  ? 'bg-stone-950 text-white border-stone-950 dark:bg-stone-50 dark:text-stone-950 dark:border-stone-50 font-semibold shadow-sm'
                  : 'bg-stone-100/50 text-stone-550 border-stone-200 hover:bg-stone-150 dark:bg-stone-930 dark:text-stone-400 dark:border-stone-850 dark:hover:bg-stone-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* Artwork Grid with motion animate content layout */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredArtworks.map((art) => (
              <motion.div
                layout
                key={art.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="group relative bg-stone-100 dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/60 p-4 rounded-lg flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md"
              >
                {/* Image layout */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded bg-stone-200 dark:bg-stone-800">
                  <img
                    src={art.imageUrl}
                    alt={art.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-[850ms] group-hover:scale-105"
                  />
                  {/* Subtle hover overlay details */}
                  <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setActiveArtwork(art)}
                      aria-label={`Zoom in on ${art.title}`}
                      className="p-3 bg-stone-50 hover:bg-stone-100 text-stone-900 rounded-full cursor-pointer transform translate-y-3 group-hover:translate-y-0 transition-all duration-300"
                    >
                      <Maximize2 className="w-4 h-4 stroke-[2]" />
                    </button>
                    <button
                      onClick={() => setActiveArtwork(art)}
                      aria-label={`View documentation of ${art.title}`}
                      className="p-3 bg-stone-50 hover:bg-stone-100 text-stone-900 rounded-full cursor-pointer transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 delay-75"
                    >
                      <Info className="w-4 h-4 stroke-[2]" />
                    </button>
                  </div>

                  {/* Top category label widget */}
                  <div className="absolute top-3 left-3 bg-stone-900/75 backdrop-blur-sm shadow border border-white/10 px-2.5 py-1 text-[9px] font-mono tracking-widest text-stone-50 rounded uppercase">
                    {art.category}
                  </div>
                </div>

                {/* Text attributes */}
                <div className="pt-4 text-left flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-serif text-lg font-medium text-stone-900 dark:text-stone-50 leading-tight">
                      {art.title}
                    </h3>
                    <p className="font-mono text-[10px] text-stone-500 dark:text-stone-400 tracking-wider">
                      {art.dimensions} &bull; {art.year}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setActiveArtwork(art)}
                    aria-label={`View sheet data for ${art.title}`}
                    className="p-1 px-2.5 bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-200/50 dark:bg-stone-900 dark:hover:bg-stone-850 dark:text-stone-100 dark:border-stone-800/80 text-[10px] font-mono tracking-wide rounded uppercase cursor-pointer transition-all font-semibold"
                  >
                    Expose Study
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Dynamic Lightbox Detailed Modal */}
        <AnimatePresence>
          {activeArtwork && (
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
                className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row text-left"
              >
                {/* Left side: Canvas image showcase */}
                <div className="md:w-3/5 bg-stone-100 dark:bg-stone-950 relative flex items-center justify-center p-3 border-b md:border-b-0 md:border-r border-stone-200 dark:border-stone-800 overflow-hidden">
                  <img
                    src={activeArtwork.imageUrl}
                    alt={activeArtwork.title}
                    referrerPolicy="no-referrer"
                    className="w-full max-h-[50vh] md:max-h-[75vh] object-contain shadow-inner rounded"
                  />
                  
                  {/* Floating Action Buttons inside Modal */}
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    <a
                      href={activeArtwork.imageUrl}
                      download={`${activeArtwork.title.toLowerCase().replace(/\s/g, '_')}.jpg`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-stone-900/70 hover:bg-stone-900 text-stone-50 rounded backdrop-blur-sm text-xs font-mono flex items-center gap-1.5 transition-colors uppercase cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>HD Source</span>
                    </a>
                  </div>
                </div>

                {/* Right side: Artistic metadata commentary sheet */}
                <div className="md:w-2/5 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
                  <div className="space-y-6">
                    {/* Header title */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="font-mono text-[10px] tracking-widest text-stone-550 dark:text-stone-400 uppercase">
                          STUDIO DEMONSTRATION &bull; {activeArtwork.category}
                        </span>
                        <h3 className="font-serif text-2xl font-light text-stone-900 dark:text-stone-50 leading-tight">
                          {activeArtwork.title}
                        </h3>
                      </div>
                      <button
                        onClick={() => setActiveArtwork(null)}
                        aria-label="Close modal dialog"
                        className="p-2 border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 rounded-full cursor-pointer transition-transform duration-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <hr className="border-stone-200 dark:border-stone-800" />

                    {/* Detailed Metadata Spec List */}
                    <div className="space-y-3 font-sans text-xs">
                      <div>
                        <span className="font-mono text-[10px] text-stone-400 dark:text-stone-500 uppercase block">
                          Materials & Medium
                        </span>
                        <span className="text-stone-800 dark:text-stone-200 font-medium">
                          {activeArtwork.medium}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="font-mono text-[10px] text-stone-400 dark:text-stone-500 uppercase block">
                            Dimensions (Tooth bounds)
                          </span>
                          <span className="text-stone-800 dark:text-stone-200 font-medium">
                            {activeArtwork.dimensions}
                          </span>
                        </div>
                        <div>
                          <span className="font-mono text-[10px] text-stone-400 dark:text-stone-500 uppercase block">
                            Year Conceived
                          </span>
                          <span className="text-stone-800 dark:text-stone-200 font-medium">
                            {activeArtwork.year}
                          </span>
                        </div>
                      </div>
                    </div>

                    <hr className="border-stone-200 dark:border-stone-800" />

                    {/* Artist pedagogical notes */}
                    <div>
                      <span className="font-mono text-[10px] text-stone-400 dark:text-stone-500 uppercase block mb-1.5">
                        Pedagogical Notes
                      </span>
                      <p className="text-stone-600 dark:text-stone-305 font-light text-sm leading-relaxed italic pr-2 font-serif">
                        "{activeArtwork.description}"
                      </p>
                    </div>
                  </div>

                  {/* Link action leading back into enrollment */}
                  <div className="pt-6 mt-6 border-t border-stone-250 dark:border-stone-800">
                    <button
                      onClick={() => {
                        setActiveArtwork(null);
                        const el = document.getElementById('contact');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full py-3 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-stone-50 dark:text-stone-950 font-mono text-xs tracking-widest uppercase text-center rounded transition-all cursor-pointer"
                    >
                      Inquire About Classes
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
