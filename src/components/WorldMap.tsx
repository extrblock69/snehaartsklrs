import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, MapPin, ZoomIn, ZoomOut, Users, Navigation, Info, ShieldAlert } from 'lucide-react';

interface VisitorHistoryItem {
  timestamp: string;
  pathname: string;
  referrer: string;
}

interface VisitorLog {
  ip: string;
  visitCount: number;
  firstVisit: string;
  lastVisit: string;
  userAgent: string;
  browser: string;
  os: string;
  device: string;
  screens: string[];
  referrers: string[];
  languages: string[];
  history: VisitorHistoryItem[];
  country?: string;
  countryCode?: string;
  region?: string;
  regionName?: string;
  city?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  isp?: string;
  org?: string;
  as?: string;
}

interface WorldMapProps {
  logs: VisitorLog[];
}

// Highly optimized, simplified equirectangular vector paths for major countries/regions of the world.
// Designed to look elegant, balanced, and load instantly on any device with zero dependencies.
const COUNTRY_PATHS: Record<string, { name: string; path: string }> = {
  RU: {
    name: 'Russia',
    path: 'M250,50 L420,50 L450,110 L430,130 L380,110 L330,135 L260,115 Z M200,60 L248,55 L255,100 L220,95 Z'
  },
  CA: {
    name: 'Canada',
    path: 'M30,55 L160,55 L170,95 L140,110 L120,105 L80,120 L30,105 Z'
  },
  US: {
    name: 'United States',
    path: 'M35,110 L140,115 L155,130 L150,140 L130,130 L115,150 L85,145 L40,130 Z M50,155 L65,155 L60,165 L48,162 Z M150,118 L160,118 L165,124 Z' // Mainland, Alaska, Hawaii, Florida/Long Island hints
  },
  GL: {
    name: 'Greenland',
    path: 'M130,40 L165,42 L150,75 L125,65 Z'
  },
  MX: {
    name: 'Mexico',
    path: 'M42,132 L85,148 L95,175 L80,185 L50,160 Z'
  },
  BR: {
    name: 'Brazil',
    path: 'M110,195 L150,185 L180,210 L160,255 L135,260 L115,225 Z'
  },
  AR: {
    name: 'Argentina',
    path: 'M120,265 L140,260 L135,310 L120,315 Z'
  },
  CO: {
    name: 'Colombia & North SA',
    path: 'M100,180 L125,185 L115,200 L95,190 Z'
  },
  PE: {
    name: 'Peru & West SA',
    path: 'M95,195 L115,205 L110,240 L100,230 Z'
  },
  CL: {
    name: 'Chile',
    path: 'M112,242 L121,242 L118,310 L110,310 Z'
  },
  VE: {
    name: 'Venezuela & Guyanas',
    path: 'M115,175 L145,180 L135,192 L118,188 Z'
  },
  BO: {
    name: 'Bolivia & Paraguay',
    path: 'M115,222 L138,218 L142,245 L122,255 Z'
  },
  GB: {
    name: 'United Kingdom',
    path: 'M200,105 L208,105 L204,118 L197,114 Z'
  },
  IS: {
    name: 'Iceland',
    path: 'M180,75 L192,75 L188,82 Z'
  },
  FR: {
    name: 'France',
    path: 'M203,119 L213,119 L214,129 L201,129 Z'
  },
  ES: {
    name: 'Spain & Portugal',
    path: 'M195,131 L207,131 L205,141 L193,139 Z'
  },
  DE: {
    name: 'Germany',
    path: 'M213,113 L223,113 L222,123 L212,123 Z'
  },
  IT: {
    name: 'Italy',
    path: 'M218,126 L226,128 L232,143 L225,142 L220,132 Z'
  },
  SE: {
    name: 'Sweden',
    path: 'M216,80 L226,80 L224,106 L216,106 Z'
  },
  NO: {
    name: 'Norway',
    path: 'M208,82 L215,80 L218,108 L210,106 Z'
  },
  FI: {
    name: 'Finland',
    path: 'M227,82 L237,84 L232,106 L225,106 Z'
  },
  UA: {
    name: 'Ukraine & EEU',
    path: 'M225,110 L250,110 L253,126 L226,124 Z'
  },
  PL: {
    name: 'Poland & Central Europe',
    path: 'M220,111 L232,111 L230,121 L218,121 Z'
  },
  TR: {
    name: 'Turkey',
    path: 'M236,131 L252,132 L250,139 L234,138 Z'
  },
  KZ: {
    name: 'Kazakhstan',
    path: 'M255,105 L295,108 L290,125 L252,122 Z'
  },
  CN: {
    name: 'China',
    path: 'M300,124 L365,115 L385,145 L360,165 L320,165 L302,140 Z'
  },
  IN: {
    name: 'India',
    path: 'M296,150 L318,148 L328,172 L315,190 L308,170 Z'
  },
  JP: {
    name: 'Japan',
    path: 'M390,128 L395,128 L402,148 L395,152 Z'
  },
  AU: {
    name: 'Australia',
    path: 'M355,255 L415,255 L425,295 L370,305 L350,285 Z'
  },
  NZ: {
    name: 'New Zealand',
    path: 'M428,308 L435,308 L445,328 L436,332 Z'
  },
  ID: {
    name: 'Indonesia & Malaysia',
    path: 'M330,215 L380,215 L390,230 L360,240 L325,225 Z'
  },
  PH: {
    name: 'Philippines',
    path: 'M375,185 L382,185 L382,198 L374,198 Z'
  },
  KR: {
    name: 'Korea',
    path: 'M372,138 L379,138 L376,146 L371,144 Z'
  },
  SA: {
    name: 'Saudi Arabia & ME',
    path: 'M245,145 L272,148 L278,175 L252,175 L242,158 Z'
  },
  IR: {
    name: 'Iran',
    path: 'M265,132 L285,133 L280,146 L262,145 Z'
  },
  PK: {
    name: 'Pakistan & AFG',
    path: 'M282,135 L298,136 L294,154 L278,149 Z'
  },
  MN: {
    name: 'Mongolia',
    path: 'M312,112 L358,111 L352,125 L310,125 Z'
  },
  ZA: {
    name: 'South Africa',
    path: 'M230,265 L258,265 L252,295 L225,290 Z'
  },
  EG: {
    name: 'Egypt & NE Africa',
    path: 'M226,155 L248,155 L248,175 L226,175 Z'
  },
  DZ: {
    name: 'Algeria & NW Africa',
    path: 'M188,152 L224,155 L218,188 L185,180 Z'
  },
  NG: {
    name: 'Nigeria & W Africa',
    path: 'M195,188 L218,190 L216,215 L190,215 Z'
  },
  CD: {
    name: 'Congo & C Africa',
    path: 'M215,205 L238,205 L236,238 L215,235 Z'
  },
  KE: {
    name: 'Kenya & E Africa',
    path: 'M238,185 L255,188 L250,225 L236,215 Z'
  },
  MG: {
    name: 'Madagascar',
    path: 'M256,245 L264,245 L258,272 L252,270 Z'
  },
  AO: {
    name: 'Angola & SW Africa',
    path: 'M212,228 L232,230 L228,265 L210,260 Z'
  }
};

export default function WorldMap({ logs }: WorldMapProps) {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [hoveredPin, setHoveredPin] = useState<VisitorLog | null>(null);
  const [pinTooltipPos, setPinTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeviceFilter, setSelectedDeviceFilter] = useState<'all' | 'desktop' | 'mobile' | 'tablet'>('all');

  // Dimensions of our SVG coordinate projection matrix
  const width = 480;
  const height = 360;

  // Linear projection mapping: Longitude & Latitude to SVG Coordinates
  // Note: Standard world map paths are scaled inside a [0, 480] x [0, 360] coordinate grid.
  // Center is roughly at x=235, y=180.
  const getCoordinates = (lat: number, lon: number) => {
    // Basic Equirectangular mapping adjusted to fit our coordinate space paths:
    // x: Maps [-180, 180] to [15, 465]
    // y: Maps [-90, 90] to [340, 30]
    const x = ((lon + 180) * (width - 30)) / 360 + 15;
    
    // Standard linear projection for latitude
    const y = ((90 - lat) * (height - 50)) / 180 + 35;
    
    return { x, y };
  };

  // Filter logs for active query & device matches
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = searchTerm === '' ||
        (log.ip && log.ip.includes(searchTerm)) ||
        (log.country && log.country.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.city && log.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.isp && log.isp.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesDevice = selectedDeviceFilter === 'all' || 
        log.device?.toLowerCase() === selectedDeviceFilter;

      return matchesSearch && matchesDevice;
    });
  }, [logs, searchTerm, selectedDeviceFilter]);

  // Aggregate logs by country for choropleth mapping
  const countryMetrics = useMemo(() => {
    const counts: Record<string, { count: number; visitors: string[]; name: string; percentage: number }> = {};
    let totalValid = 0;

    logs.forEach(log => {
      if (log.countryCode) {
        totalValid += 1;
        const code = log.countryCode.toUpperCase();
        if (!counts[code]) {
          counts[code] = {
            count: 0,
            visitors: [],
            name: log.country || code,
            percentage: 0
          };
        }
        counts[code].count += log.visitCount || 1;
        if (!counts[code].visitors.includes(log.ip)) {
          counts[code].visitors.push(log.ip);
        }
      }
    });

    // Calculate percentages
    Object.keys(counts).forEach(code => {
      counts[code].percentage = totalValid > 0 ? Math.round((counts[code].count / totalValid) * 100) : 0;
    });

    return counts;
  }, [logs]);

  // Top Countries list
  const sortedCountries = useMemo(() => {
    return Object.keys(countryMetrics)
      .map(code => {
        const item = countryMetrics[code];
        return {
          code,
          count: item.count,
          visitors: item.visitors,
          name: item.name,
          percentage: item.percentage
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [countryMetrics]);

  // Handle pin hover setup
  const handlePinMouseEnter = (e: React.MouseEvent, log: VisitorLog) => {
    const svgRect = e.currentTarget.closest('svg')?.getBoundingClientRect();
    if (svgRect && log.lat && log.lon) {
      const coords = getCoordinates(log.lat, log.lon);
      setHoveredPin(log);
      setPinTooltipPos({
        x: coords.x,
        y: coords.y - 12
      });
    }
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-xl p-6 shadow-sm space-y-6" id="world-map-widget">
      
      {/* Widget Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-850 pb-4">
        <div className="space-y-1">
          <h3 className="text-sm font-serif font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#B38F4D] animate-pulse" />
            Geographic Visitor Map
          </h3>
          <p className="text-[11px] text-stone-500 font-sans">
            Real-time visual distribution of administrators, users, and digital clients
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Search */}
          <input
            type="text"
            placeholder="Search city, IP, or ISP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 w-44 px-2.5 rounded-lg border border-stone-200 dark:border-stone-800 text-xs bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#B38F4D]/50 focus:border-[#B38F4D]"
          />

          {/* Device filter buttons */}
          <div className="flex bg-stone-100 dark:bg-stone-950 p-0.5 rounded-lg border border-stone-200 dark:border-stone-800 text-[10px] font-mono">
            {(['all', 'desktop', 'mobile', 'tablet'] as const).map(device => (
              <button
                key={device}
                onClick={() => setSelectedDeviceFilter(device)}
                className={`px-2.5 py-1 rounded-md uppercase transition-all font-semibold ${
                  selectedDeviceFilter === device
                    ? 'bg-[#B38F4D] text-white'
                    : 'text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                {device}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Country List */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Interactive Vector Map Canvas */}
        <div className="xl:col-span-2 relative bg-stone-50 dark:bg-stone-950/40 border border-stone-150 dark:border-stone-850/60 rounded-xl p-4 overflow-hidden flex flex-col items-center justify-center min-h-[340px]">
          
          {/* SVG Map Container */}
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full max-w-2xl aspect-[4/3] relative select-none"
          >
            {/* Background Map Grid Pattern */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="20" y2="0" stroke="currentColor" className="text-stone-200/20 dark:text-stone-800/20" strokeWidth="0.5" />
                <line x1="0" y1="0" x2="0" y2="20" stroke="currentColor" className="text-stone-200/20 dark:text-stone-800/20" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" rx="8" />

            {/* Equirectangular Map Path Shapes */}
            <g id="regions" className="transition-all duration-300">
              {Object.entries(COUNTRY_PATHS).map(([code, info]) => {
                const metric = countryMetrics[code];
                const hasVisitors = !!metric && metric.count > 0;
                
                // Color codes: Highlight active country, gray out empty ones
                let fillClass = 'fill-stone-200 dark:fill-stone-800/60';
                let strokeClass = 'stroke-white/40 dark:stroke-stone-900/60';
                
                if (hasVisitors) {
                  fillClass = hoveredCountry === code 
                    ? 'fill-[#B38F4D]' 
                    : 'fill-[#B38F4D]/35 dark:fill-[#B38F4D]/30';
                  strokeClass = 'stroke-[#B38F4D]/60 dark:stroke-[#B38F4D]/40';
                } else if (hoveredCountry === code) {
                  fillClass = 'fill-stone-300 dark:fill-stone-700';
                }

                return (
                  <path
                    key={code}
                    d={info.path}
                    className={`${fillClass} ${strokeClass} transition-colors duration-200 cursor-pointer`}
                    strokeWidth="0.75"
                    strokeLinejoin="round"
                    onMouseEnter={() => setHoveredCountry(code)}
                    onMouseLeave={() => setHoveredCountry(null)}
                    title={`${info.name} ${hasVisitors ? `(${metric.count} visits)` : ''}`}
                  />
                );
              })}
            </g>

            {/* Render projected pins for filtered visitors */}
            <g id="visitor-pins">
              {filteredLogs.map((log, idx) => {
                if (log.lat === undefined || log.lon === undefined || (log.lat === 0 && log.lon === 0)) {
                  return null;
                }

                const { x, y } = getCoordinates(log.lat, log.lon);
                const isHovered = hoveredPin?.ip === log.ip;

                return (
                  <g key={`${log.ip}-${idx}`} className="cursor-pointer">
                    {/* Ripple background ring */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? 12 : 5}
                      className="fill-[#B38F4D]/25 dark:fill-[#B38F4D]/30 stroke-[#B38F4D]/10 animate-ping"
                      style={{ animationDuration: '3s' }}
                    />
                    {/* Core pin dot */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? 4.5 : 2.5}
                      className="fill-[#B38F4D] stroke-white dark:stroke-stone-900"
                      strokeWidth={isHovered ? 1.5 : 1}
                      onMouseEnter={(e) => handlePinMouseEnter(e, log)}
                      onMouseLeave={() => setHoveredPin(null)}
                    />
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Floating Static Map Legend */}
          <div className="absolute bottom-3 left-4 flex items-center gap-4 text-[10px] font-mono text-stone-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-stone-200 dark:bg-stone-800" /> Unvisited
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#B38F4D]/35 dark:bg-[#B38F4D]/30 border border-[#B38F4D]/55" /> Active Country
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#B38F4D] ring-4 ring-[#B38F4D]/25" /> Precise Client Coordinates
            </div>
          </div>

          {/* Pin Hover Overlay Tooltip (React Absolute Portal Mimicry) */}
          <AnimatePresence>
            {hoveredPin && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute z-20 bg-stone-900/95 dark:bg-stone-950/95 text-stone-100 rounded-lg p-3 text-[10px] font-mono shadow-xl border border-stone-800 max-w-[220px] pointer-events-none"
                style={{
                  left: `${(pinTooltipPos.x / width) * 100}%`,
                  top: `${(pinTooltipPos.y / height) * 100}%`,
                  transform: 'translate(-50%, -100%)'
                }}
              >
                <div className="border-b border-stone-800 pb-1.5 mb-1.5">
                  <p className="font-bold text-white truncate">{hoveredPin.ip}</p>
                  <p className="text-[#B38F4D] text-[9px] truncate">
                    📍 {hoveredPin.city || 'Unknown'}, {hoveredPin.country || 'Local Host'}
                  </p>
                </div>
                <div className="space-y-1 text-stone-400 text-[9px]">
                  <p><span className="text-stone-500">ISP:</span> <span className="text-stone-300 truncate block max-w-[190px]">{hoveredPin.isp || 'Local loopback'}</span></p>
                  <p><span className="text-stone-500">OS/Device:</span> <span className="text-stone-300">{hoveredPin.os} / {hoveredPin.device}</span></p>
                  <p><span className="text-stone-500">Hits:</span> <span className="text-[#B38F4D] font-bold">{hoveredPin.visitCount} visits</span></p>
                  <p><span className="text-stone-500">Last seen:</span> <span className="text-stone-300">{new Date(hoveredPin.lastVisit).toLocaleTimeString()}</span></p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filter Status Text */}
          {searchTerm && (
            <div className="absolute top-3 left-4 bg-stone-100 dark:bg-stone-900 px-2 py-1 rounded border border-stone-200 dark:border-stone-800 text-[9px] font-mono text-[#B38F4D] flex items-center gap-1">
              <Navigation className="w-3 h-3 animate-spin" /> Viewing {filteredLogs.length} matching client coordinates
            </div>
          )}
        </div>

        {/* Geographic Stats Sidebar Table */}
        <div className="bg-stone-50/50 dark:bg-stone-950/20 border border-stone-150 dark:border-stone-850/60 rounded-xl p-4 flex flex-col space-y-4">
          <div className="border-b border-stone-100 dark:border-stone-850 pb-2 flex items-center justify-between">
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Top Visiting Countries
            </h4>
            <span className="text-[9px] bg-[#B38F4D]/10 text-[#B38F4D] px-1.5 py-0.5 rounded-full font-mono font-bold">
              {sortedCountries.length} countries
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[250px] pr-1 space-y-2.5 custom-scrollbar">
            {sortedCountries.map((c, index) => {
              const totalVisits = logs.reduce((sum, current) => sum + (current.visitCount || 1), 0) || 1;
              const countryPercent = Math.round((c.count / totalVisits) * 100);

              return (
                <div 
                  key={c.code}
                  className="space-y-1 cursor-pointer group"
                  onMouseEnter={() => setHoveredCountry(c.code)}
                  onMouseLeave={() => setHoveredCountry(null)}
                >
                  <div className="flex justify-between text-xs font-mono items-center">
                    <span className="text-stone-700 dark:text-stone-300 flex items-center gap-1.5 group-hover:text-[#B38F4D] transition-colors">
                      <span className="text-[10px] text-stone-400 font-normal">#{index + 1}</span>
                      <span className="text-[14px]">
                        {getFlagEmoji(c.code)}
                      </span>
                      <span className="font-sans font-medium truncate max-w-[120px]">{c.name}</span>
                      <span className="text-[10px] text-stone-400 uppercase">({c.code})</span>
                    </span>
                    <span className="text-[11px] font-medium text-stone-900 dark:text-stone-100">
                      {c.count} views <span className="text-[10px] text-stone-400 font-normal">({countryPercent}%)</span>
                    </span>
                  </div>

                  {/* Progressive Bar */}
                  <div className="w-full bg-stone-100 dark:bg-stone-900 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-[#B38F4D] h-full transition-all duration-500 rounded-full group-hover:bg-amber-500" 
                      style={{ width: `${countryPercent}%` }} 
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-stone-400 font-mono">
                    <span>{c.visitors.length} unique IP{c.visitors.length > 1 ? 's' : ''}</span>
                    <span className="group-hover:text-[#B38F4D] transition-colors">view code paths ↗</span>
                  </div>
                </div>
              );
            })}

            {sortedCountries.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center text-stone-400 text-xs">
                <Globe className="w-8 h-8 text-stone-300 dark:text-stone-800 mb-2 stroke-1" />
                <p>No geographic metrics recorded.</p>
                <p className="text-[10px] text-stone-500 mt-1">
                  Connect real visitors or use public non-loopback addresses to populate geolocation data.
                </p>
              </div>
            )}
          </div>

          {/* Quick Stats Summary */}
          <div className="bg-white dark:bg-stone-900 rounded-lg p-3 border border-stone-150 dark:border-stone-850 flex items-center gap-3">
            <Info className="w-4 h-4 text-[#B38F4D] shrink-0" />
            <div className="text-[10px] text-stone-500 font-mono leading-relaxed">
              Geographic lookup relies on non-loopback visitor IP mapping. Localhost client IPs (::1 / 127.0.0.1) default to "Localhost Network" coordinates.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

// Map Country Code to real Flag Emoji
function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char =>  127397 + char.charCodeAt(0));
  try {
    return String.fromCodePoint(...codePoints);
  } catch (e) {
    return '🏳️';
  }
}
