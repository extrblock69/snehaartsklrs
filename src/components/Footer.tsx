import { Mail, Phone, MapPin, ArrowUpCircle } from 'lucide-react';
import { KalakarSnehaLogo } from './KalakarSnehaAssets';

export default function Footer() {
  const scrollBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer
      id="site-footer"
      className="bg-stone-900 border-t border-stone-800 text-stone-300 py-16 transition-colors duration-300 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 items-start relative z-10 text-left">
        
        {/* Bio block col 1 (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center gap-2">
            <KalakarSnehaLogo className="h-10 w-auto text-white dark:text-white" />
          </div>

          <p className="text-stone-400 dark:text-stone-400 font-light text-xs leading-relaxed max-w-sm">
            Educating beginners and classical veterans in the fine visual tradition. 
            Training eyes, hands, and minds to translation and draftsmanship accuracy across raw graphite and vine charcoal mediums.
          </p>

          <p className="text-[10px] font-mono text-stone-500 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Sneha. All structural rights reserved.
          </p>
        </div>

        {/* Studio Info (3 cols) */}
        <div className="md:col-span-3 space-y-3 font-sans text-xs">
          <h4 className="font-mono text-[10px] tracking-widest text-white uppercase font-bold">
            THE STUDIO WORKSPACE
          </h4>
          <ul className="space-y-2.5 text-stone-400">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-wood mt-0.5 flex-shrink-0" />
              <span>Studio 12, Main Road,<br />Kailaras, Morena, Madhya Pradesh, India</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-wood flex-shrink-0" />
              <span>+91 7562 224809</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-wood flex-shrink-0" />
              <span>sneha@fineart-morena.com</span>
            </li>
          </ul>
        </div>

        {/* Academy links (2 cols) */}
        <div className="md:col-span-2 space-y-3 text-xs">
          <h4 className="font-mono text-[10px] tracking-widest text-white uppercase font-bold">
            ACADEMIC RESOURCES
          </h4>
          <ul className="space-y-2 text-stone-400 font-mono text-[11px]">
            <li>
              <a href="#about" className="hover:text-white transition-colors">PHILOSOPHY</a>
            </li>
            <li>
              <a href="#gallery" className="hover:text-white transition-colors">EXHIBITIONS</a>
            </li>
            <li>
              <a href="#sketchpad" className="hover:text-white transition-colors">PRACTICE CANVASES</a>
            </li>
            <li>
              <a href="#lessons" className="hover:text-white transition-colors">CURRICULAS</a>
            </li>
            <li>
              <a href="#admin" className="hover:text-amber-500 hover:underline transition-colors tracking-wider font-bold">ADMIN PORTAL</a>
            </li>
          </ul>
        </div>

        {/* Back to top (2 cols) */}
        <div className="md:col-span-2 flex flex-col items-start md:items-end justify-between h-full">
          <button
            onClick={scrollBackToTop}
            aria-label="Scroll back to top of page"
            className="p-2 border border-stone-850 hover:border-stone-605 bg-stone-900 group hover:bg-stone-855 text-stone-400 hover:text-stone-105 rounded-full duration-300 flex items-center gap-1 cursor-pointer focus:outline-none"
          >
            <ArrowUpCircle className="w-6 h-6 transition-transform group-hover:-translate-y-0.5" />
          </button>
          
          <div className="text-left md:text-right pt-6 md:pt-0">
            <span className="font-serif italic text-xs text-stone-500 block">
              Triangulate, Contour, Sculpt
            </span>
            <span className="font-mono text-[9px] tracking-widest text-stone-600 block uppercase mt-0.5">
              LAT. 43.7696° N &bull; LON. 11.2558° E
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
