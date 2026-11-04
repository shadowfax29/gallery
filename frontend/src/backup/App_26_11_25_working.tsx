import React, { useState, useRef, useEffect } from 'react';
import { PreviewModal } from './components/PreviewModal';
import MacbookMockup from './components/MacbookMockup';
import IphoneMockup from './components/IphoneMockup';
import macbookFrame from './assets/macbook-pro-16.png';
import iphoneFrame from './assets/iphone_mob.png';
import { adFormats } from './data/adFormats';
import { AdFormat } from './types/AdFormat';
import { ChevronDown, Play, Settings, Eye, Sparkles, Zap, ArrowRight, Search, Monitor, Video } from 'lucide-react';
import SilkOrangeBackground from './components/SilkOrangeBackground';
import MobileSilhouetteShowcase from './components/MobileSilhouetteShowcase';

// HERO mockup thumbnails (local files in src/Img)
import INTThumb from './Img/INT_tumb.png';
import SLDRThumb from './Img/SLDR_tumb.png';
import SOThumb from './Img/SO_tumb.png';
import InReadThumb from './Img/InRead_tumb.png';
import SideBarThumb from './Img/SideBar_tumb.png';

// Hidden-preview full images per format
import INTImg from './Img/Int_img.png';
import SLDRImg from './Img/Sldr_img.png';
import SOImg from './Img/So_img.png';
import InReadImg from './Img/InRead_img.png';
import InReadSldrImg from './Img/InRead_Sldr_img.png';
import SideBarImg from './Img/SideBar_Sldr_img.png';

function App() {
  const [selectedFormat, setSelectedFormat] = useState<AdFormat | null>(null);
  const [activeFormatId, setActiveFormatId] = useState<string | null>(null);
  const previewDebounceRef = useRef<number | null>(null);
  const preloadedVideosRef = useRef<Set<string>>(new Set());
  const [expandedPreview, setExpandedPreview] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'display' | 'video'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showHeroMockup, setShowHeroMockup] = useState(false);
  const [heroInView, setHeroInView] = useState(true);
  const [heroCycle, setHeroCycle] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const navigationRef = useRef<HTMLDivElement>(null);
  const formatRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Delay HERO mockup so text loads first, then animate in
  // Re-run this delay every time the HERO section comes back into view
  useEffect(() => {
    if (!heroInView) {
      setShowHeroMockup(false);
      return;
    }
    const t = window.setTimeout(() => setShowHeroMockup(true), 600);
    return () => window.clearTimeout(t);
  }, [heroInView]);

  // Observe HERO visibility inside the scroll container.
  // When HERO re-enters view, bump heroCycle to remount showcase
  useEffect(() => {
    const container = containerRef.current;
    const heroEl = heroRef.current;
    if (!container || !heroEl) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setHeroInView(true);
          setHeroCycle((c) => c + 1); // force remount -> restart scroll + randomization
        } else {
          setHeroInView(false);
        }
      },
      { root: container, threshold: 0.5 }
    );

    obs.observe(heroEl);
    return () => obs.disconnect();
  }, []);

  // Handle scroll to show/hide back-to-top button
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollY = container.scrollTop;
      setShowScrollTop(scrollY > 500);
    };

    handleScroll();
    container.addEventListener('scroll', handleScroll);

    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Observe which ad-format section is in view and auto-toggle preview
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ids = Object.keys(formatRefs.current);
    const elements = ids
      .map((id) => ({ id, el: formatRefs.current[id] }))
      .filter((x): x is { id: string; el: HTMLDivElement } => Boolean(x.el));

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target) {
          const found = elements.find((x) => x.el === visible.target);
          setActiveFormatId(found?.id ?? null);
        } else {
          setActiveFormatId(null);
        }
      },
      {
        root: container,
        threshold: [0.35, 0.6, 0.85],
      }
    );

    elements.forEach(({ el }) => observer.observe(el));

    return () => observer.disconnect();
  }, [filterType, searchQuery]);

  // Sync expanded preview to active section (no debounce to avoid perceived delay)
  useEffect(() => {
    setExpandedPreview(activeFormatId);
  }, [activeFormatId]);

  const scrollToNavigation = () => {
    navigationRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToFormat = (formatId: string) => {
    formatRefs.current[formatId]?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    navigationRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatDetails: Record<string, { title: string; description: string; features: string[] }> = {
    'interstitial': {
      title: 'Interstitial Ads',
      description: 'Full-screen ad experiences that capture complete user attention with high-impact creative formats.',
      features: ['Full-screen coverage', 'High viewability', 'Multiple size options', 'Auto-close timer']
    },
    'slider': {
      title: 'Slider Ads',
      description: 'Smooth sliding ad units that glide into view without disrupting the user experience.',
      features: ['Non-intrusive', 'Corner placement', 'Easy dismissal', 'Responsive design']
    },
    'stay-on': {
      title: 'StayOn Ads',
      description: 'Sticky footer ads that remain visible as users scroll, ensuring persistent brand presence.',
      features: ['Always visible', 'Bottom anchored', 'Scroll-persistent', 'Mobile optimized']
    },
    'inread-player': {
      title: 'InRead Video Player',
      description: 'Contextual video ads that play within content, providing seamless video advertising experiences.',
      features: ['Auto-play on view', 'Sound on click', 'In-content placement', 'VAST compatible']
    },
    'inread-floating': {
      title: 'InRead + Floating Player',
      description: 'Hybrid video format that starts in-content and floats as users scroll for continued engagement.',
      features: ['Dual-mode display', 'Sticky on scroll', 'Video continuation', 'Corner minimize']
    },
    'sidebar': {
      title: 'Sidebar Video Player',
      description: 'Elegant sidebar placement that complements content without obstruction.',
      features: ['Side placement', 'Content-aware', 'Multiple sizes', 'Desktop optimized']
    },
  };

  // Hidden-preview full images per format (fallback to INTImg)
  const hiddenPreviewImages: Record<string, string> = {
    interstitial: INTImg,
    slider: SLDRImg,
    'stay-on': SOImg,
    'inread-player': InReadImg,
    'inread-floating': InReadSldrImg,
    sidebar: SideBarImg,
  };

  const formatVideos: Record<string, string> = {
    'interstitial': 'https://gallery.tapmind.io/dev/video/INT_ad.mp4',
    'slider': 'https://gallery.tapmind.io/dev/video/Sldr_ad.mp4',
    'stay-on': 'https://gallery.tapmind.io/dev/video/So_ad.mp4',
    'inread-player': 'https://gallery.tapmind.io/dev/video/InRead_ad.mp4',
    'inread-floating': 'https://gallery.tapmind.io/dev/video/InRead_Sldr_ad.mp4',
    'sidebar': 'https://gallery.tapmind.io/dev/video/SideBar_ad.mp4',
  };

  // Mobile-specific preview videos (fallback to desktop if missing)
  const formatMobileVideos: Record<string, string> = {
    'interstitial': 'https://gallery.tapmind.io/dev/video/INT_Mob_gif_ad.gif',
    'slider': 'https://gallery.tapmind.io/dev/video/Sldr_Mob_gif_ad.gif',
    'stay-on': 'https://gallery.tapmind.io/dev/video/So_Mob_gif_ad.gif',
    'inread-player': 'https://gallery.tapmind.io/dev/video/InRead_Mob_gif_ad.gif',
    'inread-floating': 'https://gallery.tapmind.io/dev/video/InRead_Sldr_Mob_gif_ad.gif',
    'sidebar': 'https://gallery.tapmind.io/dev/video/sideBar_Sldr_Mob_gif_ad.gif',
  };

  // Preload device frame images once so mockups appear instantly
  useEffect(() => {
    const mac = new Image();
    mac.src = macbookFrame;
    const iph = new Image();
    iph.src = iphoneFrame;
  }, []);

  // Smart-preload ONLY the active section video metadata
  useEffect(() => {
    if (!activeFormatId) return;
    const src = formatVideos[activeFormatId];
    if (!src || preloadedVideosRef.current.has(src)) return;

    const vid = document.createElement('video');
    vid.src = src;
    vid.preload = 'metadata';
    vid.muted = true;
    (vid as any).playsInline = true;
    vid.load();

    preloadedVideosRef.current.add(src);
  }, [activeFormatId]);

  const mainFormats = adFormats
    .filter(f => ['interstitial', 'slider', 'stay-on', 'inread-player', 'inread-floating', 'sidebar'].includes(f.id))
    .filter(f => {
      if (filterType === 'display' && f.type !== 'display') return false;
      if (filterType === 'video' && f.type !== 'video') return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const details = formatDetails[f.id];
        return (
          f.name.toLowerCase().includes(query) ||
          details?.title.toLowerCase().includes(query) ||
          details?.description.toLowerCase().includes(query)
        );
      }
      return true;
    });

  return (
    <div ref={containerRef} className="min-h-screen bg-white snap-y snap-mandatory overflow-y-scroll h-screen">

      {/* HERO SECTION - Full Viewport */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden snap-start">
        {/* Hero Gradient Background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to bottom, rgb(104, 43, 0) 0%, rgb(15, 14, 14) 100%)',
          }}
        />

        {/* Silk Orange Animation Overlay */}
        <div className="absolute inset-0 opacity-100 mix-blend-soft-light">
          <SilkOrangeBackground
            speed={0.9}
            grain={0.06}
            light="#FF7A2F"
            dark="#120F0D"
            className="absolute inset-0"
          />
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-transparent rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Mobile Mockup Auto-Scroll Showcase */}
        {showHeroMockup && heroInView && (
          <div className="absolute right-6 xl:right-12 2xl:right-20 top-1/2 -translate-y-1/2 z-10 hidden lg:block pointer-events-auto">
            <div className="relative animate-[heroFloat_6s_ease-in-out_infinite] animate-[mockupEnter_900ms_cubic-bezier(0.2,0.8,0.2,1)_both]">
              <MobileSilhouetteShowcase
                key={heroCycle}
                images={[
                  { src: INTThumb, alt: 'Interstitial' },
                  { src: SLDRThumb, alt: 'Slider' },
                  { src: SOThumb, alt: 'StayOn' },
                  { src: InReadThumb, alt: 'InRead' },
                  { src: SideBarThumb, alt: 'Sidebar' },
                ]}
                speedSec={10}
                className="scale-95 xl:scale-100 2xl:scale-105 max-w-[360px] xl:max-w-[400px] 2xl:max-w-[420px]"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto pb-32">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="bg-transparent">
              <img
                src="https://assts.tmadsrv.com/logos/Tapmind-Logo-White.png"
                className="h-16"
                alt="Tapmind"
              />
            </div>
          </div>

          {/* Title with Glow Effect */}
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            <span
              className="inline-block animate-[glow_2s_ease-in-out_infinite]"
              style={{
                color: '#fff',
                textShadow: `
                  0 1px 0 #ef5a1f,
                  0 2px 0 #e4531c,
                  0 3px 0 #d84d19,
                  0 4px 0 #cc4616,
                  0 6px 8px rgba(0,0,0,0.55),
                  0 10px 22px rgba(0,0,0,0.6)
                `,
                transform: 'translateZ(0)',
                letterSpacing: '0.5px',
              }}
            >
              Creative Ad Gallery
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/90 mb-4 font-light leading-relaxed max-w-3xl mx-auto">
            Experience the future of digital advertising with our innovative ad formats
          </p>
          <p className="text-lg text-white/80 mb-12 max-w-2xl mx-auto">
            Powerful technology that allows you to deliver creative online advertising for any device within minutes
          </p>

          {/* Stats */}
          {/* <div className="flex justify-center gap-8 mb-12 flex-wrap">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-1" style={{ color: '#ffffff' }}>15+</div>
              <div className="text-white/80 text-sm">Ad Formats</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-1" style={{ color: '#ffffff' }}>100%</div>
              <div className="text-white/80 text-sm">Responsive</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-1" style={{ color: '#ffffff' }}>1M+</div>
              <div className="text-white/80 text-sm">Impressions/Day</div>
            </div>
          </div> */}

          {/* CTA Button */}
          <button
            onClick={scrollToNavigation}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white/10 text-white font-semibold rounded-full backdrop-blur-md border border-white/25 shadow-lg shadow-[#FF6B2C]/30 hover:bg-white/15 hover:shadow-2xl hover:shadow-[#FF6B2C]/50 transition-all duration-300 transform hover:scale-105 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/25 via-[#FF6B2C]/15 to-white/25 opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute inset-0 rounded-full ring-1 ring-white/30"></div>

            <Sparkles className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform" />
            <span className="relative z-10 text-lg">Explore Ad Formats</span>
            <ChevronDown className="w-5 h-5 relative z-10 animate-bounce" />
          </button>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="flex flex-col items-center gap-2 text-white/60">
              <span className="text-xs uppercase tracking-wider">Scroll to discover</span>
              <ChevronDown className="w-6 h-6 animate-bounce" />
            </div>
          </div>
        </div>

        {/* Custom Animations */}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes glow {
            0%, 100% { text-shadow: 0 0 20px rgba(255, 107, 44, 0.6), 0 0 40px rgba(255, 140, 66, 0.4); }
            50% { text-shadow: 0 0 30px rgba(255, 107, 44, 0.9), 0 0 60px rgba(255, 140, 66, 0.7); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-out;
          }
          @keyframes heroFloat {
            0%, 100% { transform: translateY(0px) rotate(-1deg); }
            50% { transform: translateY(-16px) rotate(1deg); }
          }
          @keyframes mockupEnter {
            0% { opacity: 0; transform: translateY(60px) rotate(-10deg) scale(0.9); }
            100% { opacity: 1; transform: translateY(0px) rotate(0deg) scale(1); }
          }
        `}</style>
      </section>

      {/* NAVIGATION SECTION */}
      <section ref={navigationRef} className="min-h-screen snap-start flex items-center justify-center bg-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#FF6B2C,transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,#FF8C42,transparent_50%)]"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF6B2C]/10 to-[#FF8C42]/10 border border-[#FF6B2C]/30 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-[#FF6B2C]" />
              <span className="text-sm font-semibold text-[#FF6B2C] uppercase tracking-wide">
                Choose Your Format
              </span>
            </div>

            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Select an Ad Format
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Click on any format below to explore its features, capabilities, and customization options
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-4xl mx-auto">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search ad formats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-full focus:border-[#FF6B2C] focus:outline-none transition-colors duration-300"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-full">
                <button
                  onClick={() => setFilterType('all')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold transition-all duration-300 ${
                    filterType === 'all'
                      ? 'bg-gradient-to-r from-[#FF6B2C] to-[#FF8C42] text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  All Formats
                </button>
                <button
                  onClick={() => setFilterType('display')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold transition-all duration-300 ${
                    filterType === 'display'
                      ? 'bg-gradient-to-r from-[#FF6B2C] to-[#FF8C42] text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  Display
                </button>
                <button
                  onClick={() => setFilterType('video')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold transition-all duration-300 ${
                    filterType === 'video'
                      ? 'bg-gradient-to-r from-[#FF6B2C] to-[#FF8C42] text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  Video
                </button>
              </div>
            </div>
          </div>

          {(filterType !== 'all' || searchQuery) && (
            <div className="text-center mb-8">
              <p className="text-gray-600">
                Found <span className="font-bold text-[#FF6B2C]">{mainFormats.length}</span> format{mainFormats.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {mainFormats.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No formats found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery
                  ? `No results for "${searchQuery}". Try a different search term.`
                  : `No ${filterType} formats available.`
                }
              </p>
              <button
                onClick={() => {
                  setFilterType('all');
                  setSearchQuery('');
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF6B2C] to-[#FF8C42] text-white rounded-full font-semibold hover:shadow-lg transition-all"
              >
                <Eye className="w-4 h-4" />
                Show All Formats
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {mainFormats.map((format) => {
                const details = formatDetails[format.id];

                return (
                  <div
                    key={format.id}
                    onClick={() => scrollToFormat(format.id)}
                    className="group relative bg-white rounded-2xl border-2 border-gray-200 hover:border-[#FF6B2C] p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-[#FF6B2C]/20 transform hover:-translate-y-2"
                  >
                    <div className="absolute top-0 left-[10px] right-[10px] h-1 bg-gradient-to-r from-[#FF6B2C] to-[#FF8C42] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B2C]/10 to-[#FF8C42]/10 group-hover:from-[#FF6B2C] group-hover:to-[#FF8C42] rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                        {format.type === 'video' ? (
                          <Play className="w-8 h-8 text-[#FF6B2C] group-hover:text-white transition-colors" />
                        ) : (
                          <Zap className="w-8 h-8 text-[#FF6B2C] group-hover:text-white transition-colors" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-[#FF6B2C] transition-colors">
                          {details?.title || format.name}
                        </h3>
                        <ArrowRight className="w-5 h-5 text-[#FF6B2C] opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                      </div>

                      <p className="text-gray-600 line-clamp-2 text-sm">
                        {details?.description || format.description}
                      </p>

                      <div className="inline-flex items-center px-3 py-1 bg-gray-100 group-hover:bg-gradient-to-r group-hover:from-[#FF6B2C]/10 group-hover:to-[#FF8C42]/10 rounded-full border border-gray-200 group-hover:border-[#FF6B2C]/30 transition-all">
                        <span className="text-xs font-semibold text-gray-600 group-hover:text-[#FF6B2C] uppercase tracking-wide">
                          {format.category}
                        </span>
                      </div>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B2C]/5 to-[#FF8C42]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-center mt-16">
            <p className="text-sm text-gray-500 mb-3">Or scroll down to explore each format in detail</p>
            <ChevronDown className="w-6 h-6 text-gray-400 mx-auto animate-bounce" />
          </div>
        </div>
      </section>

      {/* AD FORMATS SECTION */}
      <section className="bg-gray-50">
        {mainFormats.map((format, index) => {
          const details = formatDetails[format.id];
          const isEven = index % 2 === 0;

          return (
            <div
              key={format.id}
              ref={(el) => (formatRefs.current[format.id] = el)}
              className="min-h-screen flex items-center justify-center py-20 snap-start relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#FF6B2C_1px,transparent_1px),linear-gradient(to_bottom,#FF6B2C_1px,transparent_1px)] bg-[size:40px_40px]"></div>
              </div>

              <div className="container mx-auto px-6 relative z-10">
                <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-20`}>
                  <div className="flex-1 space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF6B2C]/10 to-[#FF8C42]/10 border border-[#FF6B2C]/30 rounded-full">
                      <Zap className="w-4 h-4 text-[#FF6B2C]" />
                      <span className="text-sm font-semibold text-[#FF6B2C] uppercase tracking-wide">
                        {format.category}
                      </span>
                    </div>

                    <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                      {details?.title || format.name}
                    </h2>

                    <p className="text-xl text-gray-600 leading-relaxed">
                      {details?.description || format.description}
                    </p>

                    {details?.features && (
                      <div className="grid grid-cols-2 gap-3 pt-4">
                        {details.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-[#FF6B2C] rounded-full"></div>
                            <span className="text-sm text-gray-700 font-medium">{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 pt-6">
                      <button
                        onClick={() => setExpandedPreview(expandedPreview === format.id ? null : format.id)}
                        className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#FF6B2C] to-[#FF8C42] text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-[#FF6B2C]/30 transition-all duration-300 transform hover:scale-105"
                      >
                        <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>{expandedPreview === format.id ? 'Hide Preview' : 'View Preview'}</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>

                      <button
                        onClick={() => setSelectedFormat(format)}
                        className="group flex items-center gap-3 px-6 py-3 bg-white border-2 border-[#FF6B2C]/30 text-[#FF6B2C] font-semibold rounded-xl hover:bg-[#FF6B2C] hover:text-white hover:border-[#FF6B2C] transition-all duration-300 transform hover:scale-105"
                      >
                        <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        <span>Custom Preview</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 w-full max-w-2xl">
                    <div className="relative group">
                      <div className="absolute -inset-4 bg-gradient-to-r from-[#FF6B2C]/20 via-[#FF8C42]/20 to-[#FF6B2C]/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      <div className={`relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-200 overflow-hidden transition-all duration-500 ease-in-out ${
                        expandedPreview === format.id ? 'min-h-[600px]' : ''
                      }`}>
                        {expandedPreview === format.id && (
                          <div className="flex flex-col items-center justify-center min-h-[550px] animate-fadeIn">
                            <div className="mb-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 shadow-lg z-20">
                              <span className="text-xs font-bold text-[#FF6B2C]">
                                {format.type.toUpperCase()}
                              </span>
                            </div>

                            <div className="flex items-center justify-center flex-1 w-full relative">
                              {formatVideos[format.id] ? (
                                <div className="flex flex-col lg:flex-row items-stretch justify-center gap-6 w-full">
                                  <div className="w-full lg:w-4/5 flex justify-center items-center">
                                    <div className="w-full max-w-[1100px]">
                                      <MacbookMockup video={formatVideos[format.id]} />
                                    </div>
                                  </div>
                                  <div className="w-full lg:w-1/5 flex items-center" style={{ marginLeft: '-25px', marginBottom: '-65px' }}>
                                    <div className="w-full max-w-[100px] lg:max-w-[90px]">
                                      <IphoneMockup video={formatMobileVideos[format.id] ?? formatVideos[format.id]} />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="w-full h-auto max-w-2xl aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
                                  <div className="text-center space-y-3">
                                    <Play className="w-20 h-20 text-gray-300 mx-auto animate-pulse" />
                                    <p className="text-gray-500 font-medium text-lg">
                                      Preview for {format.name}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                      Video coming soon
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedPreview(null);
                              }}
                              className="mt-6 bg-white/90 backdrop-blur-sm text-[#FF6B2C] px-6 py-2 rounded-full font-semibold hover:bg-white transition-all shadow-lg z-20"
                            >
                              Hide Preview
                            </button>
                          </div>
                        )}

                        {expandedPreview !== format.id && (
                          <>
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200 shadow-lg z-10">
                              <span className="text-xs font-bold text-[#FF6B2C]">
                                {format.type.toUpperCase()}
                              </span>
                            </div>

                            {/* Hidden preview state: center image + bottom-aligned text */}
                            <div className="relative w-full h-[420px] md:h-[480px] rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex flex-col justify-end">
                              {/* Center image */}
                              <div className="absolute inset-0 flex items-start justify-center pt-8 pb-32 pointer-events-none">
                                <img
                                  src={hiddenPreviewImages[format.id] ?? INTImg}
                                  alt="Ad format preview"
                                  className="w-auto max-w-[80%] max-h-[80%] object-contain"
                                  draggable={false}
                                />
                              </div>

                              {/* Bottom text */}
                              <div className="relative z-10 p-6 text-center space-y-3 bg-gradient-to-t from-white/90 via-white/60 to-transparent">
                                <Play className="w-12 h-12 text-gray-400 mx-auto" />
                                <p className="text-gray-700 font-semibold text-lg">
                                  {format.name} Preview
                                </p>
                                <p className="text-sm text-gray-500">
                                  Click “View Preview” to see it in action
                                </p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {index < mainFormats.length - 1 && (
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF6B2C]/20 to-transparent"></div>
              )}
            </div>
          );
        })}
      </section>

      {/* FOOTER */}
      <footer className="snap-start bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="mb-6">
            <img
              src="https://assts.tmadsrv.com/logos/Tapmind-Logo-White.png"
              className="h-8 mx-auto mb-4"
              alt="Tapmind"
            />
          </div>
          <p className="text-white text-sm mb-2" style={{ color: '#ffffff' }}>© 2025 Tapmind. All rights reserved.</p>
          <p className="text-gray-400 text-xs" style={{ color: '#9ca3af' }}>Creative Ad Gallery</p>
        </div>
      </footer>

      {selectedFormat && (
        <PreviewModal
          format={selectedFormat}
          onClose={() => setSelectedFormat(null)}
        />
      )}

      {/* BACK TO TOP BUTTON */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-50 group p-4 bg-gradient-to-r from-[#FF6B2C] to-[#FF8C42] text-white rounded-full shadow-2xl hover:shadow-[#FF6B2C]/50 transition-all duration-300 transform hover:scale-110 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16 pointer-events-none'
        }`}
        aria-label="Back to top"
      >
        <svg
          className="w-6 h-6 transform group-hover:-translate-y-1 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
        <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-0 group-hover:opacity-100"></div>
      </button>
    </div>
  );
}

export default App;
