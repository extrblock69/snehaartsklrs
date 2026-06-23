import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Calendar, ExternalLink, ShieldCheck, ZoomIn, X, BookOpen, Crown } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import defaultContent from '../data/site_content.json';

export default function Achievements() {
  const { content } = useContent();

  // Handle fallback if data doesn't exist yet
  const achievements = content.achievements || defaultContent.achievements;
  const { 
    badgeText, 
    title, 
    paragraphs, 
    metricLeftLabel, 
    metricLeftVal, 
    metricLeftSub, 
    metricRightLabel, 
    metricRightVal, 
    metricRightSub, 
    recipientName, 
    summaryText, 
    cards 
  } = achievements;

  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const toggleFlip = (id: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const selectedCard = cards.find((c) => c.id === activeCardId);

  return (
    <section id="achievements" className="py-24 bg-stone-50 dark:bg-stone-900 transition-colors border-y border-stone-200/60 dark:border-stone-800/60 relative overflow-hidden">
      {/* Dynamic Background Art Gradients/Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
        <div className="absolute top-12 left-10 w-96 h-96 rounded-full border border-stone-900 dark:border-stone-100" />
        <div className="absolute -bottom-10 right-20 w-[500px] h-[500px] rounded-full border border-stone-800 dark:border-stone-200" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Descriptive Content & Context */}
          <div className="lg:col-span-5 space-y-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold tracking-widest text-[#B38F4D] dark:text-[#D4AF37] uppercase bg-stone-100 dark:bg-stone-800 rounded-full border border-stone-200 dark:border-stone-700">
              <Award className="w-3.5 h-3.5" />
              {badgeText || "ACADEMIC EXCELLENCE"}
            </span>
            
            <h2 className="text-3xl sm:text-4xl font-serif font-medium tracking-tight text-stone-900 dark:text-stone-50">
              {title || "Honors & Achievements"}
            </h2>

            <div className="space-y-4 text-stone-600 dark:text-stone-300 leading-relaxed font-sans text-base">
              {paragraphs && paragraphs.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            {/* Quick Metrics of Authority */}
            <div className="pt-6 grid grid-cols-2 gap-4 border-t border-stone-200 dark:border-stone-850">
              <div className="p-4 rounded-lg bg-stone-100/50 dark:bg-stone-850 border border-stone-200/50 dark:border-stone-750">
                <div className="flex items-center gap-2 text-[#B38F4D]">
                  <Crown className="w-4 h-4" />
                  <span className="text-xs font-mono font-medium tracking-wider uppercase">{metricLeftLabel || "Verified"}</span>
                </div>
                <div className="mt-1 text-lg font-serif font-semibold text-stone-900 dark:text-stone-100">{metricLeftVal || "Drawing Mastery"}</div>
                <div className="text-xs text-stone-500">{metricLeftSub || "Reyanssh Rahul Academy"}</div>
              </div>
              <div className="p-4 rounded-lg bg-stone-100/50 dark:bg-stone-850 border border-stone-200/50 dark:border-stone-750">
                <div className="flex items-center gap-2 text-[#B38F4D]">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-mono font-medium tracking-wider uppercase">{metricRightLabel || "Credentials"}</span>
                </div>
                <div className="mt-1 text-lg font-serif font-semibold text-stone-900 dark:text-stone-100">{metricRightVal || "National Tutor"}</div>
                <div className="text-xs text-stone-500">{metricRightSub || "Traditional Focus"}</div>
              </div>
            </div>
          </div>

          {/* Right Column: Flashcard Gallery Stack */}
          <div className="lg:col-span-7">
            <div className="text-center sm:text-left mb-6">
              <span className="text-xs font-mono text-stone-400 dark:text-stone-500 uppercase tracking-widest block">
                ✦ Click a card representation to flip or inspect details
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cards && cards.map((card, idx) => {
                const isFlipped = !!flippedCards[card.id];
                return (
                  <div
                    key={card.id || idx}
                    className="h-[380px] w-full perspective-1000 group cursor-pointer"
                    onClick={() => toggleFlip(card.id)}
                  >
                    {/* Inner 3D Container with custom motion */}
                    <div
                      className={`relative w-full h-full duration-700 preserve-3d transition-all ${
                        isFlipped ? 'rotate-y-180' : ''
                      }`}
                    >
                      {/* --- CARD FRONT --- */}
                      <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl bg-white dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800/80 shadow-sm hover:shadow-md hover:border-stone-350 dark:hover:border-stone-700 transition-all flex flex-col overflow-hidden">
                        
                        {/* Certificate preview header */}
                        <div className="h-44 w-full relative overflow-hidden bg-stone-100 dark:bg-stone-900">
                          <img
                            src={card.imageUrl}
                            alt={card.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                          <span className="absolute bottom-3 right-3 bg-stone-950/70 text-white font-mono text-[10px] tracking-wider px-2 py-0.5 rounded border border-white/20">
                            {card.year}
                          </span>
                          
                          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-stone-100 text-xs">
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 blink-slow" />
                            <span className="font-mono text-[10px] uppercase font-semibold tracking-wider text-stone-200">Official Award</span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="text-[10px] font-mono tracking-widest uppercase text-[#B38F4D] mb-1">
                              {card.issuer}
                            </div>
                            <h3 className="text-lg font-serif font-medium text-stone-900 dark:text-stone-50 leading-snug group-hover:text-[#B38F4D] transition-colors line-clamp-2">
                              {card.title}
                            </h3>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-800">
                            <button
                              type="button"
                              className="text-xs font-mono font-medium text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 flex items-center gap-1 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFlip(card.id);
                              }}
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              Flip Details
                            </button>

                            <button
                              type="button"
                              className="p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveCardId(card.id);
                              }}
                              title="Zoom Credential View"
                            >
                              <ZoomIn className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* --- CARD BACK (Detailed Specs) --- */}
                      <div className="absolute inset-0 w-full h-full rotate-y-180 backface-hidden rounded-2xl bg-stone-900 text-stone-100 border border-stone-800 shadow-md p-6 flex flex-col justify-between overflow-hidden">
                        {/* Background subtle cross-hatching */}
                        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
                        
                        <div className="relative z-10 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
                              <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400">
                                Detailed Curriculum
                              </span>
                              <span className="text-[10px] font-mono text-[#D4AF37]">
                                {card.year}
                              </span>
                            </div>

                            <p className="text-xs font-mono text-[#D4AF37] mb-1">{card.issuer}</p>
                            <h4 className="text-base font-serif font-medium text-white mb-3">{card.title}</h4>
                            
                            <p className="text-xs text-stone-300 leading-relaxed font-sans line-clamp-6">
                              {card.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-stone-800">
                            <span className="text-[9px] font-mono text-stone-500 uppercase tracking-wider">
                              ✦ Click anywhere to flip back
                            </span>
                            <button
                              type="button"
                              className="text-xs font-mono font-medium text-[#D4AF37] hover:underline flex items-center gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveCardId(card.id);
                              }}
                            >
                              Magnify
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* --- FLOATING LIGHTBOX POPUP / DETAILED MAGNIFICATION DIALOG --- */}
      <AnimatePresence>
        {selectedCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setActiveCardId(null)}
            />

            {/* Plaque Dialogue Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-stone-50 dark:bg-stone-900 border border-stone-350 dark:border-stone-750 text-stone-900 dark:text-stone-100 rounded-3xl overflow-hidden shadow-2xl relative max-w-2xl w-full z-10 mx-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-stone-250 dark:border-stone-800 bg-stone-100/50 dark:bg-stone-850">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#B38F4D]" />
                  <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#B38F4D]">
                    Official Credential plaque
                  </span>
                </div>
                <button
                  type="button"
                  className="p-1 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 transition-colors"
                  onClick={() => setActiveCardId(null)}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Dynamic Plaque Structure resembling fine academic parchment */}
              <div className="p-6 md:p-8 space-y-6">
                
                {/* Simulated Certificate Display */}
                <div className="border-[6px] border-stone-850 p-2 bg-[#FDFBF7] shadow-inner rounded-lg relative">
                  {/* Subtle Certificate Header bar */}
                  <div className="absolute top-4 left-4 right-4 pointer-events-none flex justify-between items-center opacity-40">
                    <div className="text-[8px] font-serif uppercase tracking-wider text-stone-800">ACADEMIA EXCELLENCIA</div>
                    <div className="text-[8px] font-serif uppercase tracking-wider text-stone-800">{selectedCard.year}</div>
                  </div>

                  <div className="border border-stone-200/60 p-4 md:p-6 text-center space-y-4">
                    {/* Crest */}
                    <div className="inline-block p-2 rounded-full bg-stone-100 border border-stone-200 text-stone-600 mx-auto">
                      <Award className="w-6 h-6 text-[#B38F4D]" />
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-serif text-xs md:text-sm tracking-widest uppercase text-stone-500">
                        {selectedCard.issuer}
                      </h4>
                      <h3 className="font-serif text-xl md:text-2xl font-semibold text-stone-850">
                        {selectedCard.title}
                      </h3>
                    </div>

                    <div className="py-2 inline-block border-y border-stone-200/90 px-8 text-stone-600 italic font-serif text-xs md:text-sm">
                      Presented honorably to {recipientName || "Sneha Bansal"}
                    </div>

                    <p className="text-stone-700 text-xs leading-relaxed max-w-md mx-auto italic font-sans">
                      "{selectedCard.description}"
                    </p>

                    <div className="pt-4 flex justify-between items-end border-t border-stone-100 text-left">
                      <div>
                        <div className="text-[9px] font-mono text-stone-400 uppercase">Credential ID</div>
                        <div className="text-[10px] font-mono text-stone-600 uppercase font-semibold">
                          VERIFIED-{selectedCard.id.toUpperCase()}-{selectedCard.year}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-[9px] font-mono text-stone-400 uppercase font-semibold">CLASSICAL STATUS</div>
                        <div className="text-[10px] font-mono text-emerald-600 font-semibold uppercase flex items-center justify-end gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Authenticated
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Plain text explanation below */}
                <div className="space-y-2">
                  <h4 className="text-xs font-mono text-stone-400 uppercase tracking-wider">Credential Summary</h4>
                  <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-sans">
                    {summaryText || "This achievement represents verified completion of rigorous training or recognized academic accomplishments within traditional drawing disciplines. Under her administration, Sneha propagates these deep values to empower her students at the Kalakar Sneha platform."}
                  </p>
                </div>

              </div>

              {/* Footer CTA */}
              <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-800 bg-stone-100/50 dark:bg-stone-850 text-right">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-750 text-white font-mono text-xs transition-colors"
                  onClick={() => setActiveCardId(null)}
                >
                  Close Plaque View
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
