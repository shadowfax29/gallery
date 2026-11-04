import React, { useState, useRef, useEffect } from 'react';
import { PreviewModal } from './components/PreviewModal';
import MacbookMockup from './components/MacbookMockup';
import IphoneMockup from './components/IphoneMockup';
import macbookFrame from './assets/macbook-pro-16.png';
import iphoneFrame from './assets/iphone_mob.png';
import { adFormats } from './data/adFormats';
import { AdFormat } from './types/AdFormat';
import {
  ChevronDown,
  Play,
  Settings,
  Eye,
  Sparkles,
  Zap,
  ArrowRight,
  Search,
  Monitor,
  Video,
} from 'lucide-react';
import SilkOrangeBackground from './components/SilkOrangeBackground';
import MobileSilhouetteShowcase from './components/MobileSilhouetteShowcase';

// Hidden-preview full images per format
import INTImg from './Img/Int_img.png';
import SLDRImg from './Img/Sldr_img.png';
import SOImg from './Img/So_img.png';
import RemanatImg from './Img/remenat_img.png';
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
  const [showDesktopOnlyModal, setShowDesktopOnlyModal] = useState(false);

  // Toggle Flagship grid instead of modal
  const [showFlagshipGrid, setShowFlagshipGrid] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const navigationRef = useRef<HTMLDivElement>(null);
  const formatRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Delay HERO mockup so text loads first, then animate in
  useEffect(() => {
    if (!heroInView) {
      setShowHeroMockup(false);
      return;
    }
    const t = window.setTimeout(() => setShowHeroMockup(true), 600);
    return () => window.clearTimeout(t);
  }, [heroInView]);

  // Observe HERO visibility
  useEffect(() => {
    const container = containerRef.current;
    const heroEl = heroRef.current;
    if (!container || !heroEl) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setHeroInView(true);
          setHeroCycle((c) => c + 1);
        } else {
          setHeroInView(false);
        }
      },
      { root: container, threshold: 0.5 }
    );

    obs.observe(heroEl);
    return () => obs.disconnect();
  }, []);

  // Show/hide back-to-top
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

  // Observe which ad-format section is in view
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

  // Sync expanded preview to active section
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

  const isMobileOrTablet = () => {
    return window.innerWidth < 1024;
  };

  const handleViewLivePreview = (format: AdFormat) => {
    if (isMobileOrTablet()) {
      setShowDesktopOnlyModal(true);
    } else {
      setSelectedFormat(format);
    }
  };

  const formatDetails: Record<
    string,
    { title: string; description: string; features: string[] }
  > = {
    interstitial: {
      title: 'Interstitial Ads',
      description:
        'Full-screen ad experiences that capture complete user attention with high-impact creative formats.',
      features: ['Full-screen coverage', 'High viewability', 'Multiple size options', 'Auto-close timer'],
    },
    slider: {
      title: 'Slider Ads',
      description: 'Smooth sliding ad units that glide into view without disrupting the user experience.',
      features: ['Non-intrusive', 'Corner placement', 'Easy dismissal', 'Responsive design'],
    },
    'stay-on': {
      title: 'StayOn Ads',
      description:
        'Sticky footer ads that remain visible as users scroll, ensuring persistent brand presence.',
      features: ['Always visible', 'Bottom anchored', 'Scroll-persistent', 'Mobile optimized'],
    },
    'inread-player': {
      title: 'Rewarded Ad',
      description:
        'Engage users with rewarded video ads that offer incentives for viewing, creating a win-win advertising experience.',
      features: ['User incentives', 'High engagement', 'Opt-in experience', 'Mobile optimized'],
    },
    'inread-floating': {
      title: 'InRead + Floating Player',
      description:
        'Hybrid video format that starts in-content and floats as users scroll for continued engagement.',
      features: ['Dual-mode display', 'Sticky on scroll', 'Video continuation', 'Corner minimize'],
    },
    'ribbon-player': {
      title: 'Ribbon Player',
      description:
        'Sleek ribbon-style video player that elegantly slides into view, offering premium video advertising with minimal disruption.',
      features: ['Smooth animation', 'Premium placement', 'Auto-expand on view', 'Easy dismiss'],
    },
    sidebar: {
      title: 'Sidebar Video Player',
      description: 'Elegant sidebar placement that complements content without obstruction.',
      features: ['Side placement', 'Content-aware', 'Multiple sizes', 'Desktop optimized'],
    },
    'hybrid-video': {
      title: 'Hybrid Video',
      description:
        'Hybrid video format where when the player is out of view, it loads high-impact creative formats for maximum engagement.',
      features: ['Out-of-view detection', 'High-impact fallback', 'Seamless transition', 'Maximum engagement'],
    },
    remnant: {
      title: 'Remnant Ads',
      description:
        'Banner ads shown on dedicated ad slots on the webpage for maximum fill rate and revenue optimization.',
      features: ['Dedicated ad slots', 'Sidebar placement', 'Banner placement', 'Multiple sizes'],
    },
  };

  // Flagship Products Configuration (exact labels)
  const flagshipProducts = {
    video: {
      title: 'Video',
      items: [
        { name: 'Hybrid Player', id: 'hybrid-video' },
        { name: 'Ribbon Player', id: 'ribbon-player' },
        { name: 'Sidebar Player', id: 'sidebar' },
      ],
    },
    display: {
      title: 'Display',
      items: [
        { name: 'Slider Ad', id: 'slider' },
        { name: 'Interstitial Ad', id: 'interstitial' },
        // { name: 'Ad slidein & slideout', id: 'stay-on' },
      ],
    },
    app: {
      title: 'App',
      items: [
        { name: 'Rewarded Ad', id: 'inread-player' },
        { name: 'App Interstitial Ad', id: 'interstitial' },
        { name: 'App StayOn Ad', id: 'stay-on' },
      ],
    },
  };

  // Hidden-preview full images per format (fallback to INTImg)
  const hiddenPreviewImages: Record<string, string> = {
    interstitial: INTImg,
    slider: SLDRImg,
    'stay-on': SOImg,
    'inread-player': InReadImg,
    'inread-floating': InReadSldrImg,
    'ribbon-player': InReadSldrImg,
    sidebar: SideBarImg,
    'hybrid-video': InReadSldrImg,
    remnant: RemanatImg,
  };

  const formatVideos: Record<string, string> = {
    interstitial: 'https://gallery.tapmind.io/video/INT_ad.mp4',
    slider: 'https://gallery.tapmind.io/video/Sldr_ad.mp4',
    'stay-on': 'https://gallery.tapmind.io/video/So_ad.mp4',
    'inread-player': 'https://gallery.tapmind.io/video/InRead_ad.mp4',
    'inread-floating': 'https://gallery.tapmind.io/video/InRead_Sldr_ad.mp4',
    'ribbon-player': 'https://gallery.tapmind.io/video/InRead_Sldr_ad.mp4',
    sidebar: 'https://gallery.tapmind.io/video/SideBar_ad.mp4',
    'hybrid-video': 'https://gallery.tapmind.io/video/InRead_Sldr_ad.mp4',
    remnant: 'https://gallery.tapmind.io/video/Remenant_ad.mp4',
  };

  const formatMobileVideos: Record<string, string> = {
    interstitial: 'https://gallery.tapmind.io/video/INT_Mob_gif_ad.gif',
    slider: 'https://gallery.tapmind.io/video/Sldr_Mob_gif_ad.gif',
    'stay-on': 'https://gallery.tapmind.io/video/So_Mob_gif_ad.gif',
    'inread-player': 'https://gallery.tapmind.io/video/InRead_Mob_gif_ad.gif',
    'inread-floating': 'https://gallery.tapmind.io/video/InRead_Sldr_Mob_gif_ad.gif',
    'ribbon-player': 'https://gallery.tapmind.io/video/InRead_Sldr_Mob_gif_ad.gif',
    sidebar: 'https://gallery.tapmind.io/video/sideBar_Sldr_Mob_gif_ad.gif',
    'hybrid-video': 'https://gallery.tapmind.io/video/Hybrid_Mob_gif_ad.gif',
    remnant: 'https://gallery.tapmind.io/video/Remenant_Mob_gif_ad.gif',
  };

  // Preload device frames
  useEffect(() => {
    const mac = new Image();
    mac.src = macbookFrame;
    const iph = new Image();
    iph.src = iphoneFrame;
  }, []);

  // Smart-preload active section video
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

  const allFormats = [...adFormats];

  // mainFormats used for normal grid & sections (keeps search/filter)
  // Exclude 'inread-player' from scrolling sections
  const mainFormats = allFormats
    .filter((f) =>
      [
        'interstitial',
        'slider',
        'stay-on',
        'remnant',
        'inread-floating',
        'sidebar',
        'hybrid-video',
        'ribbon-player',
      ].includes(f.id)
    )
    .filter((f) => {
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

  // All formats for cards (includes inread-player)
  const cardFormats = allFormats
    .filter((f) =>
      [
        'interstitial',
        'slider',
        'stay-on',
        'remnant',
        'inread-player',
        'inread-floating',
        'ribbon-player',
        'sidebar',
        'hybrid-video',
      ].includes(f.id)
    )
    .filter((f) => {
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

  const handleFlagshipClick = () => {
    setShowFlagshipGrid((prev) => !prev);
    setSelectedFormat(null);
  };

  // Helper to always get the base flagship formats (ignores search/filter)
  const flagshipBaseFormats = (id: string) =>
    allFormats.find((f) => f.id === id) ?? cardFormats.find((f) => f.id === id);

  const StickyFormatNav = () => {
    const [openDropdown, setOpenDropdown] = useState<'flagship' | 'display' | 'video' | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between relative">
          {/* Logo - LEFT side */}
          <img
            src="https://assts.tmadsrv.com/logos/Tapmind-Logo-dark.png"
            alt="Tapmind"
            className="h-8 w-auto z-50"
          />

          {/* 3 Centered Flex Dropdowns - Desktop Only */}
          <div className="hidden lg:flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2">
          
            {/* Flagship Products Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setOpenDropdown('flagship')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-[#FF6B2C]/10 hover:border-[#FF6B2C]/30 transition-all">
                <Sparkles className="w-4 h-4" />
                Flagship Products
                <ChevronDown className="w-4 h-4" />
              </button>

              {openDropdown === 'flagship' && (
                <div className="fixed top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 w-screen max-w-6xl bg-white rounded-2xl shadow-2xl border border-gray-200 px-6 py-8 z-[100]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(['video', 'display', 'app'] as const).flatMap((groupKey) =>
                      flagshipProducts[groupKey].items.map((item) => {
                        const format = flagshipBaseFormats(item.id);
                        if (!format) return null;
                        const isVideo = format?.type === 'video';
                        const isApp = groupKey === 'app';
                        const details = formatDetails[item.id];
                        return (
                          <div
                            key={`flagship-dropdown-${groupKey}-${item.id}-${item.name}`}
                            className="group cursor-pointer p-4 border border-gray-100 rounded-xl hover:border-[#FF6B2C]/30 hover:shadow-lg hover:bg-gradient-to-br hover:from-[#FF6B2C]/5 transition-all duration-200 hover:scale-[1.02] h-full flex flex-col"
                            onClick={() => {
                              // For inread-player, scroll to navigation since it has no section
                              if (item.id === 'inread-player') {
                                navigationRef.current?.scrollIntoView({ behavior: 'smooth' });
                              } else {
                                const element = formatRefs.current[item.id];
                                if (element) {
                                  element.scrollIntoView({ behavior: 'smooth' });
                                }
                              }
                              setOpenDropdown(null);
                            }}
                          >
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#FF6B2C]/10 to-[#FF8C42]/10 group-hover:from-[#FF6B2C] group-hover:to-[#FF8C42] rounded-xl flex items-center justify-center mb-3 transition-all">
                              {isApp ? (
                                <svg className="w-5 h-5 text-[#FF6B2C] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                              ) : isVideo ? (
                                <Play className="w-5 h-5 text-[#FF6B2C] group-hover:text-white transition-colors" />
                              ) : (
                                <Zap className="w-5 h-5 text-[#FF6B2C] group-hover:text-white transition-colors" />
                              )}
                            </div>
                            <div className="flex-1 flex flex-col">
                              <h3 className="font-semibold text-sm text-gray-800 group-hover:text-[#FF6B2C] mb-1 leading-tight">
                                {item.name}
                              </h3>
                              <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 flex-1">
                                {details?.description || ''}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Display Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setOpenDropdown('display')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-[#FF6B2C]/10 hover:border-[#FF6B2C]/30 transition-all">
                <Monitor className="w-4 h-4" />
                Display
                <ChevronDown className="w-4 h-4" />
              </button>

              {openDropdown === 'display' && (
                <div className="fixed top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 w-screen max-w-6xl bg-white rounded-2xl shadow-2xl border border-gray-200 px-6 py-8 z-[100]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {mainFormats.filter(f => f.type === 'display').map((format) => {
                      const details = formatDetails[format.id];
                      return (
                        <div
                          key={`display-${format.id}`}
                          className="group cursor-pointer p-4 border border-gray-100 rounded-xl hover:border-[#FF6B2C]/30 hover:shadow-lg hover:bg-gradient-to-br hover:from-[#FF6B2C]/5 transition-all duration-200 hover:scale-[1.02] h-full flex flex-col"
                          onClick={() => {
                            const element = formatRefs.current[format.id];
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth' });
                            }
                            setOpenDropdown(null);
                          }}
                        >
                          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#FF6B2C]/10 to-[#FF8C42]/10 group-hover:from-[#FF6B2C] group-hover:to-[#FF8C42] rounded-xl flex items-center justify-center mb-3 transition-all">
                            <Zap className="w-5 h-5 text-[#FF6B2C] group-hover:text-white transition-colors" />
                          </div>
                          <div className="flex-1 flex flex-col">
                            <h3 className="font-semibold text-sm text-gray-800 group-hover:text-[#FF6B2C] mb-1 leading-tight">
                              {details?.title || format.name}
                            </h3>
                            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 flex-1">
                              {details?.description || format.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Video Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setOpenDropdown('video')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-[#FF6B2C]/10 hover:border-[#FF6B2C]/30 transition-all">
                <Video className="w-4 h-4" />
                Video
                <ChevronDown className="w-4 h-4" />
              </button>

              {openDropdown === 'video' && (
                <div className="fixed top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 w-screen max-w-6xl bg-white rounded-2xl shadow-2xl border border-gray-200 px-6 py-8 z-[100]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {mainFormats.filter(f => f.type === 'video').map((format) => {
                      const details = formatDetails[format.id];
                      return (
                        <div
                          key={`video-${format.id}`}
                          className="group cursor-pointer p-4 border border-gray-100 rounded-xl hover:border-[#FF6B2C]/30 hover:shadow-lg hover:bg-gradient-to-br hover:from-[#FF6B2C]/5 transition-all duration-200 hover:scale-[1.02] h-full flex flex-col"
                          onClick={() => {
                            const element = formatRefs.current[format.id];
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth' });
                            }
                            setOpenDropdown(null);
                          }}
                        >
                          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#FF6B2C]/10 to-[#FF8C42]/10 group-hover:from-[#FF6B2C] group-hover:to-[#FF8C42] rounded-xl flex items-center justify-center mb-3 transition-all">
                            <Play className="w-5 h-5 text-[#FF6B2C] group-hover:text-white transition-colors" />
                          </div>
                          <div className="flex-1 flex flex-col">
                            <h3 className="font-semibold text-sm text-gray-800 group-hover:text-[#FF6B2C] mb-1 leading-tight">
                              {details?.title || format.name}
                            </h3>
                            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 flex-1">
                              {details?.description || format.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Overlay */}
          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 top-[57px] bg-white z-40 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Flagship Products Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-[#FF6B2C]" />
                    <h3 className="text-lg font-bold text-gray-900">Flagship Products</h3>
                  </div>
                  <div className="space-y-2">
                    {(['video', 'display', 'app'] as const).flatMap((groupKey) =>
                      flagshipProducts[groupKey].items.map((item) => {
                        const format = flagshipBaseFormats(item.id);
                        if (!format) return null;
                        const details = formatDetails[item.id];
                        return (
                          <button
                            key={`mobile-flagship-${groupKey}-${item.id}`}
                            onClick={() => {
                              if (item.id === 'inread-player') {
                                navigationRef.current?.scrollIntoView({ behavior: 'smooth' });
                              } else {
                                const element = formatRefs.current[item.id];
                                if (element) {
                                  element.scrollIntoView({ behavior: 'smooth' });
                                }
                              }
                              setMobileMenuOpen(false);
                            }}
                            className="w-full text-left p-3 rounded-lg hover:bg-[#FF6B2C]/10 transition-colors"
                          >
                            <div className="font-semibold text-gray-900">{item.name}</div>
                            <div className="text-xs text-gray-500 line-clamp-1">{details?.description}</div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Display Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Monitor className="w-5 h-5 text-[#FF6B2C]" />
                    <h3 className="text-lg font-bold text-gray-900">Display</h3>
                  </div>
                  <div className="space-y-2">
                    {mainFormats.filter(f => f.type === 'display').map((format) => {
                      const details = formatDetails[format.id];
                      return (
                        <button
                          key={`mobile-display-${format.id}`}
                          onClick={() => {
                            const element = formatRefs.current[format.id];
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth' });
                            }
                            setMobileMenuOpen(false);
                          }}
                          className="w-full text-left p-3 rounded-lg hover:bg-[#FF6B2C]/10 transition-colors"
                        >
                          <div className="font-semibold text-gray-900">{details?.title || format.name}</div>
                          <div className="text-xs text-gray-500 line-clamp-1">{details?.description}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Video Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Video className="w-5 h-5 text-[#FF6B2C]" />
                    <h3 className="text-lg font-bold text-gray-900">Video</h3>
                  </div>
                  <div className="space-y-2">
                    {mainFormats.filter(f => f.type === 'video').map((format) => {
                      const details = formatDetails[format.id];
                      return (
                        <button
                          key={`mobile-video-${format.id}`}
                          onClick={() => {
                            const element = formatRefs.current[format.id];
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth' });
                            }
                            setMobileMenuOpen(false);
                          }}
                          className="w-full text-left p-3 rounded-lg hover:bg-[#FF6B2C]/10 transition-colors"
                        >
                          <div className="font-semibold text-gray-900">{details?.title || format.name}</div>
                          <div className="text-xs text-gray-500 line-clamp-1">{details?.description}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-white snap-y snap-mandatory overflow-y-scroll h-screen"
      style={{ overflowX: 'hidden' }}
    >
      {/* HERO SECTION */}
      <section
        ref={heroRef}
        className="relative h-screen flex items-center justify-center overflow-hidden snap-start"
        style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #120F0D, #1a1816)',
          position: 'relative',
          overflow: 'hidden',
          backgroundImage:
            'linear-gradient(142deg, rgb(104, 43, 0) 0%, rgb(15, 14, 14) 25%, rgb(15, 14, 14) 75%, rgb(104, 43, 0) 100%)',
        }}
      >
        <div className="absolute inset-0" />

        <div className="absolute inset-0 opacity-100 mix-blend-soft-light">
          <SilkOrangeBackground
            speed={0.9}
            grain={0.06}
            light="#FF7A2F"
            dark="#120F0D"
            className="absolute inset-0"
          />
        </div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-transparent rounded-full blur-3xl animate-float"></div>
          <div
            className="absolute bottom-20 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-float"
            style={{ animationDelay: '1s' }}
          ></div>
          <div
            className="absolute top-1/2 left-1/3 w-24 h-24 bg-white/10 rounded-full blur-3xl animate-float"
            style={{ animationDelay: '2s' }}
          ></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto pb-32">
          <div className="mb-8 flex justify-center">
            <div className="bg-transparent">
              <img
                src="https://assts.tmadsrv.com/logos/Tapmind-Logo-White.png"
                className="h-16"
                alt="Tapmind"
              />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
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

          <p className="text-xl md:text-2xl text-white/90 mb-4 font-light leading-relaxed max-w-3xl mx-auto">
            Experience the future of digital advertising with our innovative ad formats
          </p>
          <p className="text-lg text-white/80 mb-12 max-w-2xl mx-auto">
            Powerful technology that allows you to deliver creative online advertising for any device
            within minutes
          </p>

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

          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="flex flex-col items-center gap-2 text-white/60">
              <span className="text-xs uppercase tracking-wider">Scroll to discover</span>
              <ChevronDown className="w-6 h-6 animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* NAVIGATION SECTION */}
      <section
        ref={navigationRef}
        className="min-h-screen snap-start flex items-center justify-center bg-white relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#FF6B2C,transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,#FF8C42,transparent_50%)]"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-8">

            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">Select an Ad Format</h2>
            <p className="text-xl text-gray-600 max-w-2l mx-auto mb-8">
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

              <button
                onClick={handleFlagshipClick}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold border transition-all duration-300 transform hover:scale-105 ${
                  showFlagshipGrid
                    ? 'bg-gradient-to-r from-[#FF6B2C] to-[#FF8C42] text-white border-transparent shadow-lg hover:shadow-xl hover:shadow-[#FF6B2C]/50'
                    : 'bg-white text-[#FF6B2C] border-[#FF6B2C] hover:bg-[#FFF4ED]'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                Flagship Products
              </button>

              <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-full">
                <button
                  onClick={() => {
                    setFilterType('all');
                    setShowFlagshipGrid(false);
                  }}
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
                  onClick={() => {
                    setFilterType('display');
                    setShowFlagshipGrid(false);
                  }}
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
                  onClick={() => {
                    setFilterType('video');
                    setShowFlagshipGrid(false);
                  }}
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

          {!showFlagshipGrid && (
            <>
              {cardFormats.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
                    <Search className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No formats found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery
                      ? `No results for "${searchQuery}". Try a different search term.`
                      : `No ${filterType} formats available.`}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto px-2 sm:px-0">
                  {cardFormats.map((format) => {
                    const details = formatDetails[format.id];
                    const hasScrollSection = format.id !== 'inread-player';
                    return (
                      <div
                        key={format.id}
                        onClick={() => {
                          if (hasScrollSection) {
                            scrollToFormat(format.id);
                          }
                        }}
                        className={`group relative bg-white rounded-2xl border-2 border-gray-200 hover:border-[#FF6B2C] p-4 sm:p-6 lg:p-8 ${
                          hasScrollSection ? 'cursor-pointer' : 'cursor-default'
                        } transition-all duration-300 hover:shadow-2xl hover:shadow-[#FF6B2C]/20 transform hover:-translate-y-2`}
                      >
                        <div className="absolute top-0 left-[10px] right-[10px] h-1 bg-gradient-to-r from-[#FF6B2C] to-[#FF8C42] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        <div className="mb-4 sm:mb-6">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#FF6B2C]/10 to-[#FF8C42]/10 group-hover:from-[#FF6B2C] group-hover:to-[#FF8C42] rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                            {format.type === 'video' ? (
                              <Play className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF6B2C] group-hover:text-white transition-colors" />
                            ) : (
                              <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF6B2C] group-hover:text-white transition-colors" />
                            )}
                          </div>
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 group-hover:text-[#FF6B2C] transition-colors">
                              {details?.title || format.name}
                            </h3>
                            {hasScrollSection && (
                              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF6B2C] opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                            )}
                          </div>

                          <p className="text-gray-600 line-clamp-2 text-xs sm:text-sm">
                            {details?.description || format.description}
                          </p>

                          <div className="inline-flex items-center px-2 sm:px-3 py-1 bg-gray-100 group-hover:bg-gradient-to-r group-hover:from-[#FF6B2C]/10 group-hover:to-[#FF8C42]/10 rounded-full border border-gray-200 group-hover:border-[#FF6B2C]/30 transition-all">
                            <span className="text-[10px] sm:text-xs font-semibold text-gray-600 group-hover:text-[#FF6B2C] uppercase tracking-wide">
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
            </>
          )}

          {showFlagshipGrid && (
            <div className="mt-10 max-w-5xl mx-auto">
              <div className="space-y-8">
              {/* VIDEO ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {flagshipProducts.video.items.map((item) => {
                  const format = flagshipBaseFormats(item.id);
                  if (!format) return null;

                  return (
                    <div
                      key={`video-${item.id}`}
                      onClick={() => scrollToFormat(format.id)}
                      className="group relative bg-white rounded-2xl border-2 border-gray-200 hover:border-[#FF6B2C] p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-[#FF6B2C]/20 transform hover:-translate-y-2"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B2C]/10 to-[#FF8C42]/10 group-hover:from-[#FF6B2C] group-hover:to-[#FF8C42] rounded-xl flex items-center justify-center">
                          <Play className="w-5 h-5 text-[#FF6B2C] group-hover:text-white" />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-[#FF6B2C]">
                          {item.name}
                        </h4>
                      </div>

                      <p className="text-gray-600 text-sm line-clamp-2">
                        {formatDetails[format.id]?.description || format.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* DISPLAY ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {flagshipProducts.display.items.map((item) => {
                  const format = flagshipBaseFormats(item.id);
                  if (!format) return null;

                  return (
                    <div
                      key={`display-${item.id}`}
                      onClick={() => scrollToFormat(format.id)}
                      className="group relative bg-white rounded-2xl border-2 border-gray-200 hover:border-[#FF6B2C] p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-[#FF6B2C]/20 transform hover:-translate-y-2"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B2C]/10 to-[#FF8C42]/10 group-hover:from-[#FF6B2C] group-hover:to-[#FF8C42] rounded-xl flex items-center justify-center">
                          <Zap className="w-5 h-5 text-[#FF6B2C] group-hover:text-white" />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-[#FF6B2C]">
                          {item.name}
                        </h4>
                      </div>

                      <p className="text-gray-600 text-sm line-clamp-2">
                        {formatDetails[format.id]?.description || format.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* APP ROW — FORCE 3 IN ONE ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {flagshipProducts.app.items.map((item) => {
                  const format = flagshipBaseFormats(item.id);
                  if (!format) return null;

                  return (
                    <div
                      key={`app-${item.id}`}
                      onClick={() => scrollToFormat(format.id)}
                      className="group relative bg-white rounded-2xl border-2 border-gray-200 hover:border-[#FF6B2C] p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-[#FF6B2C]/20 transform hover:-translate-y-2"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B2C]/10 to-[#FF8C42]/10 group-hover:from-[#FF6B2C] group-hover:to-[#FF8C42] rounded-xl flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-[#FF6B2C] group-hover:text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-[#FF6B2C]">
                          {item.name}
                        </h4>
                      </div>

                      <p className="text-gray-600 text-sm line-clamp-2">
                        {formatDetails[format.id]?.description || format.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
            </div>
          )}

          <div className="text-center mt-16">
            <p className="text-sm text-gray-500 mb-3">
              Or scroll down to explore each format in detail
            </p>
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
              className="min-h-screen flex flex-col justify-start snap-start relative overflow-hidden"
            >
              <StickyFormatNav />

              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#FF6B2C_1px,transparent_1px),linear-gradient(to_bottom,#FF6B2C_1px,transparent_1px)] bg-[size:40px_40px]"></div>
              </div>

              <div className="container mx-auto px-6 pt-24 pb-20 relative z-10">
                <div
                  className={`flex flex-col ${
                    isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  } items-center gap-12 lg:gap-20`}
                >
                  <div className="flex-1 space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF6B2C]/10 to-[#FF8C42]/10 border border-[#FF6B2C]/30 rounded-full">
                      <Zap className="w-4 h-4 text-[#FF6B2C]" />
                      <span className="text-sm font-semibold text-[#FF6B2C] uppercase tracking-wide">
                        {format.category}
                      </span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
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
                        onClick={() => handleViewLivePreview(format)}
                        className="group flex items-center gap-3 px-8 py-4 text-white font-semibold text-lg rounded-xl hover:shadow-xl hover:shadow-[#FF8C42]/30 transition-all duration-300 transform hover:scale-105"
                        style={{ backgroundColor: '#FF8C42' }}
                      >
                        <Eye className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        <span>View Live Preview</span>
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 w-full max-w-2xl">
                    <div className="relative group">
                      <div className="absolute -inset-4 bg-gradient-to-r from-[#FF6B2C]/20 via-[#FF8C42]/20 to-[#FF6B2C]/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      <div className="relative overflow-hidden transition-all duration-500 ease-in-out">
                        {expandedPreview === format.id && (
                          <div className="flex flex-col items-center justify-center min-h-[350px] sm:min-h-[450px] md:min-h-[550px] animate-fadeIn">
                            <div className="flex items-center justify-center flex-1 w-full relative">
                              {formatVideos[format.id] ? (
                                <>
                                  <div className="flex lg:hidden flex-row items-end justify-center gap-2 sm:gap-4 w-full">
                                    <div className="flex-shrink-0 flex justify-center items-end">
                                      <div className="w-[200px] sm:w-[300px] md:w-[450px]">
                                        <MacbookMockup video={formatVideos[format.id]} />
                                      </div>
                                    </div>
                                    <div
                                      className="flex-shrink-0 flex items-end"
                                      style={{ marginBottom: '-20px' }}
                                    >
                                      <div className="w-[50px] sm:w-[60px] md:w-[70px]">
                                        <IphoneMockup
                                          video={
                                            formatMobileVideos[format.id] ?? formatVideos[format.id]
                                          }
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  <div className="hidden lg:flex flex-row items-stretch justify-center gap-6 w-full">
                                    <div className="w-4/5 flex justify-center items-center">
                                      <div className="w-full max-w-[1100px]">
                                        <MacbookMockup video={formatVideos[format.id]} />
                                      </div>
                                    </div>
                                    <div
                                      className="w-1/5 flex items-center"
                                      style={{ marginLeft: '-25px', marginBottom: '-65px' }}
                                    >
                                      <div className="w-full max-w-[90px]">
                                        <IphoneMockup
                                          video={
                                            formatMobileVideos[format.id] ?? formatVideos[format.id]
                                          }
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <div className="w-full h-auto max-w-2xl aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
                                  <div className="text-center space-y-3">
                                    <Play className="w-20 h-20 text-gray-300 mx-auto animate-pulse" />
                                    <p className="text-gray-500 font-medium text-lg">
                                      Preview for {format.name}
                                    </p>
                                    <p className="text-sm text-gray-400">Video coming soon</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {expandedPreview !== format.id && (
                          <>
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200 shadow-lg z-10">
                              <span className="text-xs font-bold text-[#FF6B2C]">
                                {format.type.toUpperCase()}
                              </span>
                            </div>

                            <div className="relative w-full h-[420px] md:h-[480px] rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex flex-col justify-end">
                              <div className="absolute inset-0 flex items-start justify-center pt-8 pb-32 pointer-events-none">
                                <img
                                  src={hiddenPreviewImages[format.id] ?? INTImg}
                                  alt="Ad format preview"
                                  className="w-auto max-w-[80%] max-h-[80%] object-contain"
                                  draggable={false}
                                />
                              </div>

                              <div className="relative z-10 p-6 text-center space-y-4 bg-gradient-to-t from-white/90 via-white/60 to-transparent">
                                <Play className="w-12 h-12 text-gray-400 mx-auto" />
                                <p className="text-gray-700 font-semibold text-lg">
                                  {format.name} Preview
                                </p>
                                <button
                                  onClick={() => setExpandedPreview(format.id)}
                                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF6B2C] to-[#FF8C42] text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-[#FF6B2C]/30 transition-all transform hover:scale-105"
                                >
                                  <ChevronDown className="w-5 h-5" />
                                  Show Preview
                                </button>
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
          <p className="text-white !text-white text-sm mb-2">
            © 2026 Tapmind. All rights reserved.
          </p>
          <p className="text-gray-400 !text-gray-400 text-xs">
            Creative Ad Gallery
          </p>
        </div>
      </footer>

      {selectedFormat && (
        <PreviewModal format={selectedFormat} onClose={() => setSelectedFormat(null)} />
      )}

      {showDesktopOnlyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center transform transition-all">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-2xl mb-6">
              <Monitor className="w-10 h-10 text-blue-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Desktop and Larger Screens Only
            </h2>

            <p className="text-gray-600 leading-relaxed mb-8">
              This app is best experienced on a desktop. Please open it on a larger screen for full
              functionality and the best user experience.
            </p>

            <button
              onClick={() => setShowDesktopOnlyModal(false)}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#FF6B2C] to-[#FF8C42] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#FF6B2C]/30 transition-all"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-50 group p-4 bg-gradient-to-r from-[#FF6B2C] to-[#FF8C42] text-white rounded-full shadow-2xl hover:shadow-[#FF6B2C]/50 transition-all duration-300 transform hover:scale-110 ${
          showScrollTop && !selectedFormat
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-16 pointer-events-none'
        } ${selectedFormat ? 'lg:opacity-100 lg:translate-y-0 lg:pointer-events-auto' : ''}`}
        aria-label="Back to top"
      >
        <svg
          className="w-6 h-6 transform group-hover:-translate-y-1 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
        <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-0 group-hover:opacity-100"></div>
      </button>
    </div>
  );
}

export default App; 