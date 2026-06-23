import { Mail, Phone, MapPin, ArrowUpCircle, Instagram, Youtube, Facebook, Linkedin } from 'lucide-react';
import { KalakaarSnehaLogo } from './KalakarSnehaAssets';
import { useContent } from '../context/ContentContext';

export default function Footer() {
  const { content } = useContent();
  const socials = content.socials;

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
        
        {/* Bio block col 1 (6 cols layout) */}
        <div className="md:col-span-6 space-y-5">
          <div className="flex items-center gap-2">
            <KalakaarSnehaLogo className="h-10 w-auto text-white" />
          </div>

          <p className="text-stone-400 font-light text-xs leading-relaxed max-w-md">
            Educating beginners and classical veterans in the fine visual tradition. 
            Training eyes, hands, and minds to translation and draftsmanship accuracy across raw graphite and vine charcoal mediums.
          </p>

          {/* Social media icons with touch functionality */}
          <div className="flex flex-wrap items-center gap-3.5 pt-1">
            {socials?.instagram && (
              <a
                href={socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram Profile"
                className="w-9 h-9 rounded-full border border-stone-800 hover:border-wood bg-stone-950 flex items-center justify-center text-stone-400 hover:text-white transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {socials?.youtube && (
              <a
                href={socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                title="YouTube Channel"
                className="w-9 h-9 rounded-full border border-stone-800 hover:border-wood bg-stone-950 flex items-center justify-center text-stone-400 hover:text-white transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Youtube className="w-4 h-4" />
              </a>
            )}
            {socials?.facebook && (
              <a
                href={socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook Page"
                className="w-9 h-9 rounded-full border border-stone-800 hover:border-wood bg-stone-950 flex items-center justify-center text-stone-400 hover:text-white transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Facebook className="w-4 h-4" />
              </a>
            )}
            {socials?.linkedin && (
              <a
                href={socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn Profile"
                className="w-9 h-9 rounded-full border border-stone-800 hover:border-wood bg-stone-950 flex items-center justify-center text-stone-400 hover:text-white transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
          </div>

          <p className="text-[10px] font-mono text-stone-500 uppercase tracking-widest pt-2">
            &copy; {new Date().getFullYear()} Sneha. All structural rights reserved.
          </p>
        </div>

        {/* Studio Info (3 cols layout) */}
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

        {/* Coordinates & Back to top (3 cols layout) */}
        <div className="md:col-span-3 flex flex-col items-start md:items-end justify-between h-full space-y-6 md:space-y-0 text-left md:text-right min-h-[140px]">
          <button
            onClick={scrollBackToTop}
            aria-label="Scroll back to top of page"
            className="p-2.5 border border-stone-850 hover:border-stone-700 bg-stone-900 group hover:bg-stone-850 text-stone-400 hover:text-stone-100 rounded-full duration-300 flex items-center gap-1 cursor-pointer focus:outline-none"
          >
            <ArrowUpCircle className="w-6 h-6 transition-transform group-hover:-translate-y-0.5" />
          </button>
          
          <div className="pt-2">
            <span className="font-serif italic text-xs text-stone-500 block">
              Arts Instructor & Fine-Art Coach
            </span>
            <span className="font-mono text-[9px] tracking-widest text-stone-600 block uppercase mt-1">
              LAT. 26.3150° N &bull; LON. 77.6186° E
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
