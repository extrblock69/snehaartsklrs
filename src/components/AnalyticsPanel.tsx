import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, BarChart3, Users, RefreshCw, Eye, Search, ChevronsUpDown, 
  Clock, ArrowLeft, Globe, Monitor, Smartphone, Tablet, ChevronDown, ChevronUp,
  Cpu, Layout, Compass, Info, Trash2, Zap, AlertCircle
} from 'lucide-react';
import WorldMap from './WorldMap';

const API_BASE_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

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
  // Geolocation
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
  // Tech Specs
  screenResolution?: string;
  windowSize?: string;
  timezoneBrowser?: string;
  platform?: string;
  cores?: number;
  memory?: number;
  connection?: string;
  touchSupported?: string;
  cookieEnabled?: string;
  colorDepth?: string;
}

interface AnalyticsData {
  success: boolean;
  logs: VisitorLog[];
  totals: {
    totalVisits: number;
    uniqueVisitors: number;
    osCounts: Record<string, number>;
    browserCounts: Record<string, number>;
    deviceCounts: Record<string, number>;
    pageViewCounts: Record<string, number>;
  };
}

export default function AnalyticsPanel() {
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AnalyticsData | null>(null);
  
  // Interactive UI controls
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'lastVisit' | 'visitCount' | 'firstVisit' | 'ip'>('lastVisit');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedIps, setExpandedIps] = useState<Record<string, boolean>>({});
  const [filterDevice, setFilterDevice] = useState<string>('all');
  const [isClearing, setIsClearing] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'logs' | 'paths'>('dashboard');
  
  // Auto-polling & refresh countdown state
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(60);

  // Try auto-loading password from localStorage
  useEffect(() => {
    const savedPass = localStorage.getItem('analytics_master_pass');
    if (savedPass) {
      verifyPassword(savedPass, true);
    }
  }, []);

  // Periodic background data auto-refresh polling mechanism (60s)
  useEffect(() => {
    if (!isAuthorized || !autoRefresh) {
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          silentRefresh();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAuthorized, autoRefresh]);

  const verifyPassword = async (passToVerify: string, isAuto = false) => {
    if (!passToVerify.trim()) {
      setAuthError('Passphrase cannot be empty.');
      return;
    }
    setLoading(true);
    setAuthError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/analytics/data?password=${encodeURIComponent(passToVerify)}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
        setIsAuthorized(true);
        localStorage.setItem('analytics_master_pass', passToVerify);
      } else {
        const errJson = await response.json().catch(() => ({}));
        if (!isAuto) {
          setAuthError(errJson.error || 'Invalid administrator passphrase.');
        } else {
          localStorage.removeItem('analytics_master_pass');
        }
      }
    } catch (err) {
      if (!isAuto) {
        setAuthError('Server connection lost. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyPassword(password);
  };

  const handleLogout = () => {
    localStorage.removeItem('analytics_master_pass');
    setIsAuthorized(false);
    setData(null);
    setPassword('');
    setCountdown(60);
  };

  const silentRefresh = async () => {
    const savedPass = localStorage.getItem('analytics_master_pass') || password;
    if (!savedPass) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/analytics/data?password=${encodeURIComponent(savedPass)}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (err) {
      console.error('Auto-refresh failed:', err);
    }
  };

  const handleRefresh = async () => {
    const savedPass = localStorage.getItem('analytics_master_pass') || password;
    if (!savedPass) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/analytics/data?password=${encodeURIComponent(savedPass)}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
        setCountdown(60); // Reset countdown on manual refresh
      }
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger test synthetic visit log to instantly verify recording works
  const handleSimulateVisit = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pathname: '/analytics-test-simulation',
          referrer: 'Internal Admin Panel',
          screen: `${window.innerWidth}x${window.innerHeight}`,
          language: navigator.language || 'en'
        })
      });
      handleRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle expanded row state
  const toggleRow = (ip: string) => {
    setExpandedIps(prev => ({
      ...prev,
      [ip]: !prev[ip]
    }));
  };

  const handleReturnHome = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Filter & sort log array
  const getProcessedLogs = () => {
    if (!data || !data.logs) return [];
    
    let result = [...data.logs];

    // Search term matching
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      result = result.filter(log => 
        log.ip.toLowerCase().includes(query) ||
        log.browser.toLowerCase().includes(query) ||
        log.os.toLowerCase().includes(query) ||
        log.device.toLowerCase().includes(query) ||
        (log.userAgent && log.userAgent.toLowerCase().includes(query)) ||
        (log.country && log.country.toLowerCase().includes(query)) ||
        (log.city && log.city.toLowerCase().includes(query)) ||
        (log.regionName && log.regionName.toLowerCase().includes(query)) ||
        (log.isp && log.isp.toLowerCase().includes(query)) ||
        (log.org && log.org.toLowerCase().includes(query))
      );
    }

    // Filter by Device selection
    if (filterDevice !== 'all') {
      result = result.filter(log => log.device.toLowerCase() === filterDevice.toLowerCase());
    }

    // Sort logs
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'ip') {
        comparison = a.ip.localeCompare(b.ip);
      } else if (sortBy === 'visitCount') {
        comparison = a.visitCount - b.visitCount;
      } else if (sortBy === 'firstVisit') {
        comparison = new Date(a.firstVisit).getTime() - new Date(b.firstVisit).getTime();
      } else if (sortBy === 'lastVisit') {
        comparison = new Date(a.lastVisit).getTime() - new Date(b.lastVisit).getTime();
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return result;
  };

  const changeSort = (field: 'lastVisit' | 'visitCount' | 'firstVisit' | 'ip') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return isoString;
    }
  };

  const getRelativeTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const diffMs = Date.now() - d.getTime();
      const diffMin = Math.round(diffMs / 60000);
      
      if (diffMin < 1) return 'Just now';
      if (diffMin === 1) return '1 minute ago';
      if (diffMin < 60) return `${diffMin} mins ago`;
      
      const diffHrs = Math.round(diffMin / 60);
      if (diffHrs === 1) return '1 hour ago';
      if (diffHrs < 24) return `${diffHrs} hours ago`;
      
      const diffDays = Math.round(diffHrs / 24);
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays} days ago`;
    } catch (e) {
      return '';
    }
  };

  const getDeviceIcon = (device: string) => {
    switch(device?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-3.5 h-3.5 text-stone-500" />;
      case 'tablet':
        return <Tablet className="w-3.5 h-3.5 text-stone-500" />;
      case 'desktop':
      default:
        return <Monitor className="w-3.5 h-3.5 text-stone-500" />;
    }
  };

  const processedLogs = getProcessedLogs();

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 font-sans text-stone-800 dark:text-stone-200 antialiased selection:bg-[#B38F4D]/10 selection:text-[#B38F4D]">
      {/* Background Drawing scaffolding line details */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.015] bg-[radial-gradient(#8b714c_1px,transparent_1px)] [background-size:24px_24px]" />
      
      {!isAuthorized ? (
        // UNLOCKED PASSWORD SCREEN
        <div className="min-h-screen flex flex-col justify-center items-center px-4 relative">
          <div className="absolute top-8 left-8">
            <button 
              onClick={handleReturnHome}
              className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#B38F4D] uppercase hover:underline transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Exit Portfolio
            </button>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md p-8 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 shadow-xl relative overflow-hidden"
          >
            {/* Fine art golden accent border */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#B38F4D] to-transparent" />
            
            <div className="text-center mb-6">
              <div className="inline-flex p-3 bg-stone-100 dark:bg-stone-850 text-[#B38F4D] rounded-full mb-3 border border-stone-200 dark:border-stone-750">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight">Studio Analytics Portal</h2>
              <p className="text-xs text-stone-500 font-light mt-1.5 leading-relaxed">
                Please enter the secure admin key passphrase to lock and display the real-time viewer log charts.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-stone-400 block uppercase tracking-wider">Passphrase Protection</label>
                <input
                  type="password"
                  className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-xs tracking-widest focus:outline-none focus:border-[#B38F4D] focus:ring-1 focus:ring-[#B38F4D] font-mono text-stone-900 dark:text-stone-100 placeholder-stone-400"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
              </div>

              {authError && (
                <div className="p-3 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg text-xs leading-normal flex items-start gap-2 border border-red-100 dark:border-red-900/30">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-stone-905 hover:bg-stone-900 dark:bg-stone-50 dark:hover:bg-stone-100 text-white dark:text-stone-950 text-xs font-mono font-bold tracking-widest uppercase rounded-lg transition-all duration-300 shadow hover:shadow-md flex justify-center items-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> VERIFYING ACCESS...
                  </>
                ) : (
                  'UNLOCK DASHBOARD'
                )}
              </button>
            </form>
          </motion.div>
          <div className="mt-6 text-center">
            <p className="text-[10px] font-mono text-stone-400 tracking-tight uppercase">
              Kalakar Sneha Academy &bull; Secure Analytics Logging Monitor
            </p>
          </div>
        </div>
      ) : (
        // MAIN AUTHORIZED PORTAL VIEW
        <div className="min-h-screen flex flex-col">
          {/* Dashboard Header Bar */}
          <header className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-850 py-4 px-6 sticky top-0 z-40 transition-colors">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-stone-100 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 text-[#B38F4D]">
                  <BarChart3 className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-lg font-serif font-bold text-stone-950 dark:text-stone-150 uppercase tracking-tight flex items-center gap-2">
                    Visual Analytics Suite
                    <span className="text-[9px] font-mono tracking-widest bg-[#B38F4D]/10 text-[#B38F4D] py-0.5 px-2 rounded-full border border-[#B38F4D]/20">ACTIVE</span>
                  </h1>
                  <p className="text-xs text-stone-500 font-light mt-0.5">Real-time IP logs & client statistics platform for Kalakar Sneha.</p>
                </div>
              </div>

              {/* Utility Tools */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleSimulateVisit}
                  title="Submit a synthetic test log into the system"
                  className="px-3 h-9 bg-[#B38F4D]/10 hover:bg-[#B38F4D]/20 text-[#B38F4D] border border-[#B38F4D]/20 text-xs font-mono uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" /> Simulate Visit
                </button>

                {/* Auto Refresh Toggle & Timer Countdown Indicator */}
                <div className="flex items-center gap-2 h-9 px-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-mono text-stone-600 dark:text-stone-400">
                  <button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className="flex items-center gap-1.5 font-semibold text-[11px] cursor-pointer"
                    title={autoRefresh ? "Click to pause automatic polling" : "Click to enable automatic polling"}
                  >
                    <span className={`relative flex h-2 w-2 ${autoRefresh ? 'block' : 'hidden'}`}>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B38F4D] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B38F4D]"></span>
                    </span>
                    {!autoRefresh && <span className="w-2 h-2 rounded-full bg-stone-400 block" />}
                    <span>Auto-refresh:</span>
                    <span className={autoRefresh ? "text-[#B38F4D]" : "text-stone-400"}>
                      {autoRefresh ? "ON" : "OFF"}
                    </span>
                  </button>
                  {autoRefresh && (
                    <span className="border-l border-stone-200 dark:border-stone-800 pl-2 text-stone-400 text-[10px]">
                      {countdown}s
                    </span>
                  )}
                </div>

                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="px-3 h-9 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-850 text-xs font-mono uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> {loading ? 'Syncing...' : 'Reload Logs'}
                </button>

                <button
                  onClick={handleLogout}
                  className="px-3 h-9 bg-stone-900 hover:bg-stone-800 dark:bg-stone-800 dark:hover:bg-stone-750 text-white text-xs font-mono uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Exit Monitor
                </button>
              </div>
            </div>
          </header>

          {/* Main Dashboard Layout Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
            {/* Stat Blocks Grid */}
            {data && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-850 p-5 shadow-sm">
                  <div className="flex items-center justify-between text-stone-400 mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Total Page Views</span>
                    <Eye className="w-4 h-4 text-[#B38F4D]" />
                  </div>
                  <div className="text-3xl font-serif font-semibold text-stone-950 dark:text-stone-100">{data.totals?.totalVisits || 0}</div>
                  <div className="text-[10px] text-stone-500 mt-1">Aggregated site interactions recorded</div>
                </div>

                <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-850 p-5 shadow-sm">
                  <div className="flex items-center justify-between text-stone-400 mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Unique IP Addresses</span>
                    <Users className="w-4 h-4 text-[#B38F4D]" />
                  </div>
                  <div className="text-3xl font-serif font-semibold text-stone-950 dark:text-stone-100">{data.totals?.uniqueVisitors || 0}</div>
                  <div className="text-[10px] text-stone-500 mt-1">Independent physical clients tracked</div>
                </div>

                <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-850 p-5 shadow-sm">
                  <div className="flex items-center justify-between text-stone-400 mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Most Active client</span>
                    <Cpu className="w-4 h-4 text-[#B38F4D]" />
                  </div>
                  <div className="text-xl font-mono text-stone-950 dark:text-stone-200 truncate mt-1">
                    {data.logs && data.logs.length > 0 
                      ? [...data.logs].sort((a,b) => b.visitCount - a.visitCount)[0]?.ip 
                      : 'None'}
                  </div>
                  <div className="text-[10px] text-stone-500 mt-1">
                    Highest visit frequency: {data.logs && data.logs.length > 0 
                      ? [...data.logs].sort((a,b) => b.visitCount - a.visitCount)[0]?.visitCount 
                      : 0} counts
                  </div>
                </div>

                <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-850 p-5 shadow-sm">
                  <div className="flex items-center justify-between text-stone-400 mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Monitoring Status</span>
                    <Layout className="w-4 h-4 text-[#B38F4D]" />
                  </div>
                  <div className="text-3xl font-serif font-semibold text-[#B38F4D]">LIVE</div>
                  <div className="text-[10px] text-stone-500 mt-1">IP resolution: Active via Reverse Proxy</div>
                </div>
              </div>
            )}

            {/* Tab layout selectors */}
            <div className="border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`pb-3 text-xs font-mono uppercase tracking-wider border-b-2 font-semibold transition-all px-1 cursor-pointer ${
                    activeTab === 'dashboard' 
                      ? 'border-[#B38F4D] text-[#B38F4D]' 
                      : 'border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'
                  }`}
                >
                  📊 Aggregate Diagnostics
                </button>
                <button
                  onClick={() => setActiveTab('logs')}
                  className={`pb-3 text-xs font-mono uppercase tracking-wider border-b-2 font-semibold transition-all px-1 cursor-pointer ${
                    activeTab === 'logs' 
                      ? 'border-[#B38F4D] text-[#B38F4D]' 
                      : 'border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'
                  }`}
                >
                  📶 Registered IP logs ({data?.logs?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('paths')}
                  className={`pb-3 text-xs font-mono uppercase tracking-wider border-b-2 font-semibold transition-all px-1 cursor-pointer ${
                    activeTab === 'paths' 
                      ? 'border-[#B38F4D] text-[#B38F4D]' 
                      : 'border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'
                  }`}
                >
                  🔗 Visited Path density
                </button>
              </div>
              <div className="text-[11px] font-mono text-stone-400 uppercase hidden sm:block">
                UTC: {new Date().toISOString().substring(11,19)} ID: #ANALYTICS_V4
              </div>
            </div>

            {/* TAB CONTENT: DASHBOARD DIAGNOSTICS */}
            {activeTab === 'dashboard' && data && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Simplified World Map Geographic distribution of visitors */}
                <WorldMap logs={data.logs} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Device Breakdown */}
                  <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-xl p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-mono tracking-wider font-bold uppercase text-stone-400 flex items-center gap-1.5 border-b border-stone-100 dark:border-stone-850 pb-2">
                      <Monitor className="w-3.5 h-3.5" /> Client Device Profile
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(data.totals?.deviceCounts || {}).map(([device, count]) => {
                        const countNum = count as number;
                        const total = data.totals?.totalVisits || 1;
                        const pct = Math.round((countNum / total) * 100);
                        return (
                          <div key={device} className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-mono flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                                {getDeviceIcon(device)}
                                {device}
                              </span>
                              <span className="font-mono font-medium">{countNum} views ({pct}%)</span>
                            </div>
                            <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-[#B38F4D] h-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                      {Object.keys(data.totals?.deviceCounts || {}).length === 0 && (
                        <div className="text-center text-xs text-stone-400 py-6">No visitor data captured yet.</div>
                      )}
                    </div>
                  </div>

                  {/* Operating System Breakdown */}
                  <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-xl p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-mono tracking-wider font-bold uppercase text-stone-400 flex items-center gap-1.5 border-b border-stone-100 dark:border-stone-850 pb-2">
                      <Cpu className="w-3.5 h-3.5" /> Operating System usage
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(data.totals?.osCounts || {}).map(([os, count]) => {
                        const countNum = count as number;
                        const total = data.totals?.totalVisits || 1;
                        const pct = Math.round((countNum / total) * 100);
                        return (
                          <div key={os} className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-sans text-stone-700 dark:text-stone-300">{os}</span>
                              <span className="font-mono font-medium">{countNum} views ({pct}%)</span>
                            </div>
                            <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-stone-700 dark:bg-stone-400 h-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                      {Object.keys(data.totals?.osCounts || {}).length === 0 && (
                        <div className="text-center text-xs text-stone-400 py-6">No visitor data captured yet.</div>
                      )}
                    </div>
                  </div>

                  {/* Web Browsers Breakdown */}
                  <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-xl p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-mono tracking-wider font-bold uppercase text-stone-400 flex items-center gap-1.5 border-b border-stone-100 dark:border-stone-850 pb-2">
                      <Compass className="w-3.5 h-3.5" /> Web Browser distribution
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(data.totals?.browserCounts || {}).map(([browser, count]) => {
                        const countNum = count as number;
                        const total = data.totals?.totalVisits || 1;
                        const pct = Math.round((countNum / total) * 100);
                        return (
                          <div key={browser} className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-sans text-stone-700 dark:text-stone-300">{browser}</span>
                              <span className="font-mono font-medium">{countNum} views ({pct}%)</span>
                            </div>
                            <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-[#B38F4D]/50 dark:bg-[#B38F4D]/70 h-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                      {Object.keys(data.totals?.browserCounts || {}).length === 0 && (
                        <div className="text-center text-xs text-stone-400 py-6">No visitor data captured yet.</div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB CONTENT: PATH INTENSITY */}
            {activeTab === 'paths' && data && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-xl p-5 shadow-sm space-y-4"
              >
                <div className="pb-3 border-b border-stone-100 dark:border-stone-850">
                  <h3 className="text-sm font-semibold tracking-wide text-stone-900 dark:text-stone-100">Visited Path Popularity Distribution</h3>
                  <p className="text-xs text-stone-500 font-light mt-0.5">Below is the frequency mapping of which individual URL/pathname routes are loaded.</p>
                </div>

                <div className="space-y-4">
                  {Object.entries(data.totals?.pageViewCounts || {})
                    .sort((a,b) => (b[1] as number) - (a[1] as number))
                    .map(([path, count], idx) => {
                      const countNum = count as number;
                      const maxCount = Math.max(...Object.values(data.totals?.pageViewCounts || {}).map(v => v as number), 1);
                      const fillPct = Math.round((countNum / maxCount) * 100);
                      return (
                        <div key={path} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-stone-50 dark:border-stone-850/50 last:border-none text-xs gap-2">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">#{idx + 1}</span>
                              <span className="font-mono text-stone-950 dark:text-stone-200 tracking-tight text-xs font-semibold">{path}</span>
                            </div>
                            <div className="w-full bg-stone-50 dark:bg-stone-950 rounded-full h-1 overflow-hidden mt-1 max-w-lg">
                              <div className="bg-[#B38F4D] h-full" style={{ width: `${fillPct}%` }} />
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-stone-500 text-[11px] font-mono">View proportion</span>
                            <span className="text-xs font-mono font-bold bg-[#B38F4D]/10 text-[#B38F4D] px-2.5 py-1 rounded border border-[#B38F4D]/25">{count} Pageviews</span>
                          </div>
                        </div>
                      );
                    })}
                  {Object.keys(data.totals?.pageViewCounts || {}).length === 0 && (
                    <div className="text-center text-stone-400 text-xs py-12">No pathname interaction tracked.</div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB CONTENT: ACTIVE REGISTERED IP LOGS */}
            {activeTab === 'logs' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {/* Search, Filter Bar */}
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 p-4 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center md:gap-4 gap-3">
                  {/* Search box */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#B38F4D]"
                      placeholder="Search logs by IP, Browser, OS, device, or user-agent..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Filter selectors */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">Device</span>
                    <select
                      className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 p-2 text-xs rounded-lg text-stone-700 dark:text-stone-300 focus:outline-none"
                      value={filterDevice}
                      onChange={(e) => setFilterDevice(e.target.value)}
                    >
                      <option value="all">All Devices</option>
                      <option value="desktop">Desktop</option>
                      <option value="mobile">Mobile</option>
                      <option value="tablet">Tablet</option>
                    </select>

                    <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest pl-2">Displaying</span>
                    <span className="text-xs font-mono font-bold text-stone-700 dark:text-stone-300">
                      {processedLogs.length} of {data?.logs?.length || 0}
                    </span>
                  </div>
                </div>

                {/* Logs Table / Expanding Interactive Card lists */}
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-xl overflow-hidden shadow-sm shadow-stone-100">
                  {/* Headers */}
                  <div className="grid grid-cols-12 bg-stone-50 dark:bg-stone-850 p-4 border-b border-stone-200 dark:border-stone-800 text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 select-none">
                    <div className="col-span-1" />
                    <div className="col-span-3 hover:text-stone-300 transition-colors cursor-pointer flex items-center gap-1" onClick={() => changeSort('ip')}>
                      Client IP {sortBy === 'ip' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </div>
                    <div className="col-span-2 hover:text-stone-300 transition-colors cursor-pointer flex items-center gap-1" onClick={() => changeSort('visitCount')}>
                      Visits {sortBy === 'visitCount' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </div>
                    <div className="col-span-2 hover:text-stone-300 transition-colors cursor-pointer flex items-center gap-1" onClick={() => changeSort('lastVisit')}>
                      Last Active {sortBy === 'lastVisit' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </div>
                    <div className="col-span-2 hover:text-stone-300 transition-colors cursor-pointer flex items-center gap-1" onClick={() => changeSort('firstVisit')}>
                      Initial Visit {sortBy === 'firstVisit' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </div>
                    <div className="col-span-2">Browser / OS Details</div>
                  </div>

                  {/* Rows */}
                  <div className="divide-y divide-stone-100 dark:divide-stone-800">
                    {processedLogs.map((log) => {
                      const isExpanded = !!expandedIps[log.ip];
                      return (
                        <div key={log.ip} className="flex flex-col">
                          {/* Row Summary header click action */}
                          <div 
                            onClick={() => toggleRow(log.ip)}
                            className={`grid grid-cols-12 p-4 items-center cursor-pointer transition-colors hover:bg-stone-50/50 dark:hover:bg-stone-850/40 text-xs ${isExpanded ? 'bg-[#B38F4D]/5 dark:bg-[#B38F4D]/5 border-l-2 border-[#B38F4D]' : ''}`}
                          >
                            <div className="col-span-1 flex justify-center text-stone-400">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                            
                            {/* Client IP */}
                            <div className="col-span-3 font-mono text-stone-900 dark:text-stone-100 tracking-tight flex flex-col justify-center">
                              <span className="font-bold">{log.ip}</span>
                              {log.country && (
                                <span className="text-[10px] text-stone-500 font-sans mt-0.5 flex items-center gap-1">
                                  <span>📍</span>
                                  <span className="truncate max-w-[150px]" title={`${log.city}, ${log.country}`}>{log.city}, {log.country}</span>
                                </span>
                              )}
                            </div>

                            {/* Total Visits Badge */}
                            <div className="col-span-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[#B38F4D]/10 text-[#B38F4D] border border-[#B38F4D]/20">
                                {log.visitCount} visits
                              </span>
                            </div>

                            {/* Relative active duration indicator */}
                            <div className="col-span-2 font-mono text-stone-600 dark:text-stone-400">
                              <div className="font-semibold">{getRelativeTime(log.lastVisit)}</div>
                              <div className="text-[10px] text-stone-500 font-light truncate">{formatDate(log.lastVisit).split(',')[1]}</div>
                            </div>

                            {/* Initial time */}
                            <div className="col-span-2 text-stone-500 font-mono text-[11px]">
                              {formatDate(log.firstVisit).split(',')[0]}
                            </div>

                            {/* Browser details badges */}
                            <div className="col-span-2 flex items-center gap-1.5 flex-wrap">
                              <span className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-[10px] text-stone-600 dark:text-stone-300 font-mono uppercase flex items-center gap-1">
                                {getDeviceIcon(log.device)}
                                {log.browser}
                              </span>
                              <span className="text-[10px] text-stone-500 font-mono font-light truncate max-w-[100px]" title={log.os}>
                                {log.os}
                              </span>
                            </div>
                          </div>

                          {/* Expanded detail box */}
                          {isExpanded && (
                            <div className="bg-stone-50/50 dark:bg-stone-950/40 p-6 px-12 border-t border-b border-stone-200/50 dark:border-stone-850/50 gap-6 grid grid-cols-1 lg:grid-cols-3 text-xs">
                              
                              {/* Geographic profile and ISP Details */}
                              <div className="space-y-4">
                                <h4 className="text-[10px] font-mono uppercase text-[#B38F4D] font-bold tracking-wider border-b border-stone-200 dark:border-stone-800 pb-1 flex items-center gap-1">
                                  <Globe className="w-3.5 h-3.5" /> 📍 Geolocation Profile
                                </h4>
                                <div className="space-y-2 font-mono text-[11px]">
                                  <div className="flex justify-between py-0.5 border-b border-stone-100 dark:border-stone-850">
                                    <span className="text-stone-500">Country:</span>
                                    <span className="text-stone-900 dark:text-stone-200 font-semibold">{log.country ? `${log.country} (${log.countryCode || 'N/A'})` : 'Localhost / Unknown'}</span>
                                  </div>
                                  <div className="flex justify-between py-0.5 border-b border-stone-100 dark:border-stone-850">
                                    <span className="text-stone-500">Region/State:</span>
                                    <span className="text-stone-900 dark:text-stone-200">{log.regionName || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between py-0.5 border-b border-stone-100 dark:border-stone-850">
                                    <span className="text-stone-500">City &amp; Zip:</span>
                                    <span className="text-stone-900 dark:text-stone-200">{log.city ? `${log.city} (${log.zip || 'N/A'})` : 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between py-0.5 border-b border-stone-100 dark:border-stone-850">
                                    <span className="text-stone-500">Timezone (IP):</span>
                                    <span className="text-stone-950 dark:text-stone-200">{log.timezone || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between py-0.5 border-b border-stone-100 dark:border-stone-850">
                                    <span className="text-stone-500">Coordinates:</span>
                                    {log.lat ? (
                                      <a 
                                        href={`https://www.google.com/maps?q=${log.lat},${log.lon}`} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="text-[#B38F4D] hover:underline flex items-center gap-1 font-semibold"
                                      >
                                        {log.lat.toFixed(4)}, {log.lon?.toFixed(4)} ↗
                                      </a>
                                    ) : (
                                      <span className="text-stone-400">N/A</span>
                                    )}
                                  </div>
                                  <div className="flex flex-col pt-1">
                                    <span className="text-[10px] text-stone-400 font-semibold uppercase">ISP Provider:</span>
                                    <span className="text-stone-900 dark:text-stone-300 text-xs mt-0.5 font-sans truncate" title={log.isp || 'Local Network'}>
                                      {log.isp || 'Local loopback'}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[10px] text-stone-400 font-semibold uppercase">AS Domain/Org:</span>
                                    <span className="text-stone-900 dark:text-stone-300 text-xs mt-0.5 font-sans truncate" title={log.org || log.as || 'Local system'}>
                                      {log.org || log.as || 'System loopback'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Technical Device Specs & Client Metrics */}
                              <div className="space-y-4">
                                <h4 className="text-[10px] font-mono uppercase text-[#B38F4D] font-bold tracking-wider border-b border-stone-200 dark:border-stone-800 pb-1 flex items-center gap-1">
                                  <Monitor className="w-3.5 h-3.5" /> 💻 Client Specifications
                                </h4>
                                <div className="space-y-2 font-mono text-[11px]">
                                  <div className="flex justify-between py-0.5 border-b border-stone-100 dark:border-stone-850">
                                    <span className="text-stone-500">Screen Res:</span>
                                    <span className="text-stone-900 dark:text-stone-200 font-semibold">{log.screenResolution || 'Unknown'}</span>
                                  </div>
                                  <div className="flex justify-between py-0.5 border-b border-stone-100 dark:border-stone-850">
                                    <span className="text-stone-500">Browser Window:</span>
                                    <span className="text-stone-900 dark:text-stone-200">{log.windowSize || log.screens?.[0] || 'Unknown'}</span>
                                  </div>
                                  <div className="flex justify-between py-0.5 border-b border-stone-100 dark:border-stone-850">
                                    <span className="text-stone-500">Browser TZ:</span>
                                    <span className="text-stone-900 dark:text-stone-200 truncate max-w-[140px]" title={log.timezoneBrowser}>{log.timezoneBrowser || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between py-0.5 border-b border-stone-100 dark:border-stone-850">
                                    <span className="text-stone-500">Platform OS:</span>
                                    <span className="text-stone-900 dark:text-stone-200 truncate max-w-[140px]" title={log.platform}>{log.platform || 'Unknown'}</span>
                                  </div>
                                  <div className="flex justify-between py-0.5 border-b border-stone-100 dark:border-stone-850">
                                    <span className="text-stone-500">CPU / Memory:</span>
                                    <span className="text-stone-900 dark:text-stone-200">
                                      {log.cores ? `${log.cores} Cores ` : ''}{log.memory ? `/ ${log.memory} GB RAM` : ''}{!log.cores && !log.memory ? 'Unknown' : ''}
                                    </span>
                                  </div>
                                  <div className="flex justify-between py-0.5 border-b border-stone-100 dark:border-stone-850">
                                    <span className="text-stone-500">Connection Speed:</span>
                                    <span className="text-stone-900 dark:text-stone-200 uppercase font-semibold">{log.connection || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between py-0.5 border-b border-stone-100 dark:border-stone-850">
                                    <span className="text-stone-500">Touch Screen:</span>
                                    <span className="text-stone-900 dark:text-stone-200">{log.touchSupported || 'No'}</span>
                                  </div>
                                  <div className="flex justify-between py-0.5 border-b border-stone-100 dark:border-stone-850">
                                    <span className="text-stone-500">Cookies Status:</span>
                                    <span className="text-stone-900 dark:text-stone-200">{log.cookieEnabled || 'Yes'}</span>
                                  </div>
                                  <div className="flex justify-between py-0.5 border-b border-stone-100 dark:border-stone-850">
                                    <span className="text-stone-500">Color Depth:</span>
                                    <span className="text-stone-900 dark:text-stone-200">{log.colorDepth || '24-bit'}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Right dynamic tracking chronology timeline sequences */}
                              <div className="space-y-4">
                                <h4 className="text-[10px] font-mono uppercase text-[#B38F4D] font-bold tracking-wider border-b border-stone-200 dark:border-stone-800 pb-1 flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" /> ⏱️ Navigation Chronology
                                </h4>
                                <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                                  {log.history && log.history.map((hist, idx) => (
                                    <div key={idx} className="flex gap-3 text-xs justify-between group rounded hover:bg-stone-100/50 dark:hover:bg-stone-850/50 p-1 rounded-md transition-all">
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <span className="text-[#B38F4D] text-[10px] font-mono leading-none">✦</span>
                                        <span className="font-mono text-stone-900 dark:text-stone-100 font-semibold truncate" title={hist.pathname}>{hist.pathname || '/'}</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-stone-400 font-mono text-[9px] shrink-0">
                                        <span className="truncate max-w-[80px] block opacity-70 group-hover:opacity-100" title={hist.referrer}>{hist.referrer === 'Direct Link' ? '' : hist.referrer}</span>
                                        <span>{formatDate(hist.timestamp).split(',')[1]}</span>
                                      </div>
                                    </div>
                                  ))}
                                  {(!log.history || log.history.length === 0) && (
                                    <div className="text-center text-xs text-stone-400 italic py-6">No session action chronology recorded.</div>
                                  )}
                                </div>

                                <div className="space-y-1 pt-1.5">
                                  <span className="text-[9px] font-mono uppercase text-stone-400 font-semibold block">Full Browser User-Agent Header</span>
                                  <p className="text-[9px] bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-2 text-stone-500 dark:text-stone-400 font-mono tracking-tighter leading-snug select-all max-h-16 overflow-y-auto custom-scrollbar">
                                    {log.userAgent || 'Missing header'}
                                  </p>
                                </div>
                              </div>

                            </div>
                          )}
                        </div>
                      );
                    })}
                    {processedLogs.length === 0 && (
                      <div className="text-center py-16 text-stone-400 text-xs font-mono">
                        No client records found matching search queries.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </main>

          {/* Footer of the Portal */}
          <footer className="py-6 px-12 border-t border-stone-200 dark:border-stone-850 bg-white dark:bg-stone-900 text-center text-[10px] font-mono text-stone-400 uppercase tracking-wider">
            Kalakar Sneha &bull; secure system monitoring control room &bull; version 4.1 &copy; 2026
          </footer>
        </div>
      )}
    </div>
  );
}
