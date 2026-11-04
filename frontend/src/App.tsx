import React, { useState, useRef, useEffect } from 'react';
import { PreviewModal } from './components/PreviewModal';
import { FormatCarousel } from './components/FormatCarousel';
import MacbookMockup from './components/MacbookMockup';
import IphoneMockup from './components/IphoneMockup';
import TabletMockup from './components/tabletMockup';
import tabletFrame from './assets/tablet.png';
import macbookFrame from './assets/macbook-pro-16.png';
import iphoneFrame from './assets/iphone_mob.png';
import { adFormats } from './data/adFormats';
import { AdFormat } from './types/AdFormat';
import { ChevronDown, Play, Settings, Eye, Sparkles, Zap, ArrowRight, Search, Monitor, Video, } from 'lucide-react';
import SilkOrangeBackground from './components/SilkOrangeBackground';
import tapmindLogoDark from './Img/Tapmind-Logo-dark.png';
import MobileSilhouetteShowcase from './components/MobileSilhouetteShowcase';

// Hidden-preview full images per format
import INTImg from './Img/Int_img.png';
import SLDRImg from './Img/Sldr_img.png';
import SOImg from './Img/So_img.png';
import RemanatImg from './Img/remenat_img.png';
import InReadImg from './Img/InRead_img.png';
import InReadSldrImg from './Img/InRead_Sldr_img.png';
import SideBarImg from './Img/SideBar_Sldr_img.png';

const SOCIAL_LINKS: Record<string, string> = {
  LinkedIn: 'https://www.linkedin.com/company/tapmind',
  Instagram: 'https://www.instagram.com/tapmindsocial/',
  YouTube: 'https://www.youtube.com/@tapmind.social',
};

/** A mockup iframe. Below `autoBelow` px wide it takes the height the page inside reports, so there is no empty gap. */
const MockupFrame: React.FC<{ src: string; title: string; className: string; autoBelow: number }> = ({ src, title, className, autoBelow }) => {
  const ref = useRef<HTMLIFrameElement>(null);
  const [h, setH] = useState<number | null>(null);
  const [auto, setAuto] = useState<boolean>(() => typeof window !== 'undefined' && window.innerWidth < autoBelow);
  useEffect(() => {
    const onResize = () => setAuto(window.innerWidth < autoBelow);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [autoBelow]);
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.source !== ref.current?.contentWindow) return;
      if (e.data && e.data.type === 'tm-height' && typeof e.data.h === 'number') setH(Math.ceil(e.data.h));
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);
  return <iframe ref={ref} src={src} title={title} className={className} style={auto && h ? { height: h } : undefined} />;
};

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
  const [showStickyNav, setShowStickyNav] = useState(false);
  // Nav menu state lives here: StickyFormatNav is re-created on every render, so state kept inside it was lost
  const [openDropdown, setOpenDropdown] = useState<'flagship' | 'display' | 'video' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Toggle Flagship grid instead of modal
  const [showFlagshipGrid, setShowFlagshipGrid] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const navigationRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const browseRef = useRef<HTMLDivElement>(null);
  const [introTab, setIntroTab] = useState<'creative' | 'format'>('creative');
  const [activeEnv, setActiveEnv] = useState<'video' | 'display' | 'app'>('video');
  const [exploreTab, setExploreTab] = useState<string>('all');
  const [exploreKey, setExploreKey] = useState<string | null>(null);
  const [replayKey, setReplayKey] = useState(0);
  const formatRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const REWARDED_FORMAT_ID = 'rewarded-ad';

  // Add this new state
  const [isDesktop, setIsDesktop] = useState<boolean>(true);
  // Update existing mobile check useEffect to also set isDesktop
  useEffect(() => {
    const checkSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsDesktop(!mobile);
      if (!mobile) setShowDesktopOnlyModal(false);
    };

    checkSize(); // Initial check
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

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

  // Show/hide sticky nav and back-to-top based on scroll
  useEffect(() => {
    const container = containerRef.current;
    const navEl = navigationRef.current;
    if (!container || !navEl) return;

    const handleScroll = () => {
      const scrollY = container.scrollTop;
      const navOffset = navEl.offsetTop;

      // Show sticky nav after scrolling past the navigation section
      setShowStickyNav(scrollY > navOffset + 100);

      // Show back to top button
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
    introRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    setSelectedFormat(format);
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
      title: 'InRead Player',
      description:
        'Video player that starts within content and provides seamless in-content video advertising experience.',
      features: ['In-content placement', 'Auto-play on view', 'Smooth integration', 'High engagement'],
    },
    'rewarded-ad': {
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
    // sidebar: {
    //   title: 'Sidebar Video Player',
    //   description: 'Elegant sidebar placement that complements content without obstruction.',
    //   features: ['Side placement', 'Content-aware', 'Multiple sizes', 'Desktop optimized'],
    // },
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

  const categoryConfig = {
    video: {
      label: "Video",
      icon: <Play className="w-5 h-5 text-[#FF6B2C] group-hover:text-white" />
    },
    display: {
      label: "Display",
      icon: <Zap className="w-5 h-5 text-[#FF6B2C] group-hover:text-white" />
    },
    app: {
      label: "App",
      icon: (
        <svg
          className="w-5 h-5 text-[#FF6B2C] group-hover:text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      )
    }
  };
  // Flagship Products Configuration (exact labels)
  const flagshipProducts = {
    video: {
      title: 'Video',
      items: [
        { name: 'Hybrid Player', id: 'hybrid-video' },
        { name: 'Ribbon Player', id: 'ribbon-player' },
        // { name: 'Sidebar Player', id: 'sidebar' },
      ],
    },
    display: {
      title: 'Display',
      items: [
        { name: 'Slider Ad', id: 'slider' },
        { name: 'Interstitial Ad', id: 'interstitial' },
      ],
    },
    app: {
      title: 'App',
      items: [
        { name: 'Rewarded Ad', id: 'rewarded-ad' },
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
    'rewarded-ad': InReadImg,
    'inread-floating': InReadSldrImg,
    'ribbon-player': InReadSldrImg,
    sidebar: SideBarImg,
    'hybrid-video': InReadSldrImg,
    remnant: RemanatImg,
  };

  const MOCKUP_FORMATS = ['interstitial', 'slider', 'stay-on', 'remnant', 'inread-player', 'inread-floating', 'ribbon-player', 'hybrid-video', 'rewarded-ad'];

  const formatVideos: Record<string, string> = {
    interstitial: 'https://gallery.tapmind.io/video/INT_ad.mp4',
    slider: 'https://gallery.tapmind.io/video/Sldr_ad.mp4',
    'stay-on': 'https://gallery.tapmind.io/video/So_ad.mp4',
    'inread-player': 'https://gallery.tapmind.io/video/InRead_ad.mp4',
    'rewarded-ad': 'https://gallery.tapmind.io/video/InRead_ad.mp4',
    'inread-floating': 'https://gallery.tapmind.io/video/InRead_Sldr_ad.mp4',
    'ribbon-player': 'https://gallery.tapmind.io/video/tab.mp4',
    sidebar: 'https://gallery.tapmind.io/video/SideBar_ad.mp4',
    'hybrid-video': 'https://gallery.tapmind.io/video/hybrid_desktop.mp4',
    remnant: 'https://gallery.tapmind.io/video/Remenant_ad.mp4',
  };

  const formatMobileVideos: Record<string, string> = {
    interstitial: 'https://gallery.tapmind.io/video/INT_Mob_gif_ad.gif',
    slider: 'https://gallery.tapmind.io/video/Sldr_Mob_gif_ad.gif',
    'stay-on': 'https://gallery.tapmind.io/video/So_Mob_gif_ad.gif',
    'inread-player': 'https://gallery.tapmind.io/video/InRead_Mob_gif_ad.gif',
    'rewarded-ad': 'https://gallery.tapmind.io/video/Rewards_Mob_gif_ad.gif',
    'inread-floating': 'https://gallery.tapmind.io/video/InRead_Sldr_Mob_gif_ad.gif',
    'ribbon-player': 'https://gallery.tapmind.io/video/ribbon_player_mobile.gif',
    sidebar: 'https://gallery.tapmind.io/video/sideBar_Sldr_Mob_gif_ad.gif',
    'hybrid-video': 'https://gallery.tapmind.io/video/Hybrid_Mob_gif_ad.mp4',
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

  // Display formats only (for Display dropdown and filter)
  const displayFormatIds = ['interstitial', 'slider', 'stay-on', 'remnant'];

  // Video formats only (for Video dropdown and filter) - NOW INCLUDES 'inread-player'
  const videoFormatIds = ['inread-player', 'inread-floating', 'sidebar', 'hybrid-video', "ribbon-player"];

  // All scrollable formats (Display + Video + Ribbon Player + Rewarded Ad)
  const scrollableFormatIds = [...displayFormatIds, ...videoFormatIds, 'ribbon-player', 'rewarded-ad'];

  // mainFormats used for scrolling sections (includes ribbon-player and rewarded-ad)
  const mainFormats = allFormats
    .filter((f) => scrollableFormatIds.includes(f.id))
    .filter((f) => {
      // For filtering, exclude ribbon-player and rewarded-ad from display/video filters
      if (filterType === 'display' && (!displayFormatIds.includes(f.id) || f.id === 'ribbon-player' || f.id === 'rewarded-ad')) return false;
      if (filterType === 'video' && !videoFormatIds.includes(f.id)) return false;
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

  // All formats including rewarded-ad (for cards display in flagship)
  const allCardFormatIds = [...displayFormatIds, ...videoFormatIds];

  // cardFormats includes all formats for the card grid
  const cardFormats = allFormats
    .filter((f) => allCardFormatIds.includes(f.id))
    .filter((f) => {
      // Exclude rewarded-ad from All Formats and filters
      if (f.id === 'rewarded-ad') return false;

      if (filterType === 'display' && !displayFormatIds.includes(f.id)) return false;
      if (filterType === 'video' && !videoFormatIds.includes(f.id)) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const details = formatDetails[f.id];

        // Also search in flagship products
        const inFlagship = Object.values(flagshipProducts).some(group =>
          group.items.some(item =>
            item.id === f.id && (
              item.name.toLowerCase().includes(query) ||
              (details?.title.toLowerCase().includes(query) ?? false) ||
              (details?.description.toLowerCase().includes(query) ?? false)
            )
          )
        );

        return (
          f.name.toLowerCase().includes(query) ||
          details?.title.toLowerCase().includes(query) ||
          details?.description.toLowerCase().includes(query) ||
          inFlagship
        );
      }
      return true;
    });

  // Flagship formats for the grid (independent of filters, but respects search)
  const flagshipCardFormats = (() => {
    const flagshipIds = new Set([
      ...flagshipProducts.video.items.map(i => i.id),
      ...flagshipProducts.display.items.map(i => i.id),
      ...flagshipProducts.app.items.map(i => i.id),
    ]);

    return allFormats.filter(f => {
      if (!flagshipIds.has(f.id)) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const details = formatDetails[f.id];

        // Find the flagship item name for this format
        const flagshipItem = Object.values(flagshipProducts)
          .flatMap(group => group.items)
          .find(item => item.id === f.id);

        return (
          f.name.toLowerCase().includes(query) ||
          details?.title.toLowerCase().includes(query) ||
          details?.description.toLowerCase().includes(query) ||
          (flagshipItem?.name.toLowerCase().includes(query) ?? false)
        );
      }
      return true;
    });
  })();

  const handleFlagshipClick = () => {
    setShowFlagshipGrid(true);
    setFilterType('all');
    setSelectedFormat(null);
  };

  // Helper to always get the base flagship formats (ignores search/filter)
  const flagshipBaseFormats = (id: string) =>
    allFormats.find((f) => f.id === id);

  const StickyFormatNav = () => {

    return (
      <>
      <div className={`fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 transition-all duration-300 ${showStickyNav ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between relative">
          {/* Logo - LEFT side - Fixed container to prevent flickering */}
          <div className="flex-shrink-0 z-50" style={{ width: '140px', height: '32px' }}>
            <img
              src="https://assts.tmadsrv.com/logos/Tapmind-Logo-dark.png"
              alt="Tapmind"
              className="h-full w-auto object-contain"
              loading="eager"
            />
          </div>

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
                  <div className="space-y-6">
                    {/* VIDEO ROW */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {flagshipProducts.video.items.map((item) => {
                        const format = flagshipBaseFormats(item.id);
                        if (!format) return null;
                        const details = formatDetails[item.id];

                        return (
                          <div
                            key={`flagship-dd-video-${item.id}`}
                            className="group cursor-pointer p-4 border border-gray-100 rounded-xl hover:border-[#FF6B2C]/30 hover:shadow-lg hover:bg-gradient-to-br hover:from-[#FF6B2C]/5 transition-all duration-200 hover:scale-[1.02] h-full flex flex-col"
                            onClick={() => {
                              const el = formatRefs.current[item.id];
                              if (el) {
                                el.scrollIntoView({ behavior: 'smooth' });
                              }
                              setOpenDropdown(null);
                            }}
                          >
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#FF6B2C]/10 to-[#FF8C42]/10 group-hover:from-[#FF6B2C] group-hover:to-[#FF8C42] rounded-xl flex items-center justify-center mb-3">
                              <Play className="w-5 h-5 text-[#FF6B2C] group-hover:text-white" />
                            </div>
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-sm text-gray-800 group-hover:text-[#FF6B2C]">
                                {item.name}
                              </h3>
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {details?.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* DISPLAY ROW */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {flagshipProducts.display.items.map((item) => {
                        const format = flagshipBaseFormats(item.id);
                        if (!format) return null;
                        const details = formatDetails[item.id];

                        return (
                          <div
                            key={`flagship-dd-display-${item.id}`}
                            className="group cursor-pointer p-4 border border-gray-100 rounded-xl hover:border-[#FF6B2C]/30 hover:shadow-lg hover:bg-gradient-to-br hover:from-[#FF6B2C]/5 transition-all duration-200 hover:scale-[1.02] h-full flex flex-col"
                            onClick={() => {
                              const el = formatRefs.current[item.id];
                              console.log('Scrolling to format:', format.id, el);

                              if (el) {
                                el.scrollIntoView({ behavior: 'smooth' });
                              }
                              setOpenDropdown(null);
                            }}
                          >
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#FF6B2C]/10 to-[#FF8C42]/10 group-hover:from-[#FF6B2C] group-hover:to-[#FF8C42] rounded-xl flex items-center justify-center mb-3">
                              <Zap className="w-5 h-5 text-[#FF6B2C] group-hover:text-white" />
                            </div>
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-sm text-gray-800 group-hover:text-[#FF6B2C]">
                                {item.name}
                              </h3>
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {details?.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* APP ROW */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {flagshipProducts.app.items.map((item) => {
                        const format = flagshipBaseFormats(item.id);
                        if (!format) return null;
                        const details = formatDetails[item.id];

                        return (
                          <div
                            key={`flagship-dd-app-${item.id}`}
                            className="group cursor-pointer p-4 border border-gray-100 rounded-xl hover:border-[#FF6B2C]/30 hover:shadow-lg hover:bg-gradient-to-br hover:from-[#FF6B2C]/5 transition-all duration-200 hover:scale-[1.02] h-full flex flex-col"
                            onClick={() => {
                              const el = formatRefs.current[item.id];
                              if (el) {
                                el.scrollIntoView({ behavior: 'smooth' });
                              }
                              setOpenDropdown(null);
                            }}
                          >
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#FF6B2C]/10 to-[#FF8C42]/10 group-hover:from-[#FF6B2C] group-hover:to-[#FF8C42] rounded-xl flex items-center justify-center mb-3">
                              <svg
                                className="w-5 h-5 text-[#FF6B2C] group-hover:text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-sm text-gray-800 group-hover:text-[#FF6B2C]">
                                {item.name}
                              </h3>
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {details?.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Display Dropdown */}
            {
              filterType !== 'video' && (<div
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
                      {allFormats.filter(f => displayFormatIds.includes(f.id)).map((format) => {
                        const details = formatDetails[format.id];
                        return (
                          <div
                            key={`display-${format.id}`}
                            className="group cursor-pointer p-4 border border-gray-100 rounded-xl hover:border-[#FF6B2C]/30 hover:shadow-lg hover:bg-gradient-to-br hover:from-[#FF6B2C]/5 transition-all duration-200 hover:scale-[1.02] h-full flex flex-col"
                            onClick={() => {
                              const element = formatRefs.current[format.id];
                              console.log('Scrolling to format:', format.id, element);
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
              </div>)
            }


            {/* Video Dropdown */}
            {
              filterType !== 'display' && (<div
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
                      {allFormats.filter(f => videoFormatIds.includes(f.id)).map((format) => {
                        const details = formatDetails[format.id];
                        return (
                          <div
                            key={`video-${format.id}`}
                            className="group cursor-pointer p-4 border border-gray-100 rounded-xl hover:border-[#FF6B2C]/30 hover:shadow-lg hover:bg-gradient-to-br hover:from-[#FF6B2C]/5 transition-all duration-200 hover:scale-[1.02] h-full flex flex-col"
                            onClick={() => {
                              const element = formatRefs.current[format.id];
                              console.log('Scrolling to format:', format.id, element);

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
              </div>)
            }

          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

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
                          const element = formatRefs.current[item.id];
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth' });
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
                {allFormats.filter(f => displayFormatIds.includes(f.id)).map((format) => {
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
                {allFormats.filter(f => videoFormatIds.includes(f.id)).map((format) => {
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
      </>
    );
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-white snap-y snap-mandatory overflow-y-scroll h-screen"
      style={{ overflowX: 'hidden' }}
    >
      {/* INTRO SECTION: one campaign, every ad format */}
      <section ref={introRef} className="snap-start" style={{ fontFamily: "'Geist', system-ui, sans-serif" }}>
        {/* Hero */}
        <div className="relative h-screen min-h-[620px] flex flex-col overflow-hidden bg-white">
          <div className="relative z-10 flex-none px-4 sm:px-8 pt-4">
            <img src={tapmindLogoDark} alt="TapMind" className="h-9 sm:h-11 w-auto" />
          </div>

          <div className="relative z-10 flex-none">
            <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 pt-1 pb-2 text-center">
              <div className="inline-flex items-center gap-3 mb-3">
                <span className="block w-10 sm:w-14 h-px bg-[#FF7E01]" />
                <span className="text-lg sm:text-2xl font-bold tracking-[0.16em] uppercase text-[#FF7E01]">Creative Studio</span>
                <span className="block w-10 sm:w-14 h-px bg-[#FF7E01]" />
              </div>

              <h1
                className="font-bold leading-[1.05] tracking-[-0.035em] lg:whitespace-nowrap"
                style={{ color: '#0b0b0b', fontSize: 'clamp(1.8rem, 3.6vw, 3.1rem)' }}
              >
                Performance Starts With <span style={{ color: '#FF7E01' }}>Better Creative</span>
              </h1>

              <p className="mt-4 mx-auto max-w-2xl text-base sm:text-lg leading-relaxed" style={{ color: '#4a4a46' }}>
                <strong style={{ color: '#0b0b0b' }}>The creative is what users see.</strong> TapMind formats turn it into an
                immersive, interactive experience on any device — within minutes.
              </p>

              <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
                <button
                  onClick={() => navigationRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center justify-center gap-2 !px-8 !py-4 text-base font-semibold transition-colors hover:!bg-[#E86F00]"
                  style={{ backgroundColor: '#FF7E01', color: '#ffffff' }}
                >
                  Explore ad formats <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="relative z-10 w-full flex-1 min-h-0 pt-6 sm:pt-8 pb-2">
            <FormatCarousel />
          </div>
        </div>
      </section>

      {/* NAVIGATION SECTION: explore ad formats */}
      <section
        ref={navigationRef}
        className="min-h-screen snap-start bg-white relative"
        style={{ fontFamily: "'Geist', system-ui, sans-serif" }}
      >
        {(() => {
          type Env = 'video' | 'display' | 'app';
          type Entry = { key: string; id: string; env: Env; name: string; desc: string; flagship: boolean };

          const describe = (id: string) => formatDetails[id]?.description || allFormats.find((f) => f.id === id)?.description || '';
          const titleOf = (id: string) => formatDetails[id]?.title || allFormats.find((f) => f.id === id)?.name || id;
          const isFlagship = (env: Env, id: string) => flagshipProducts[env].items.some((i) => i.id === id);
          const nameFor = (env: Env, id: string) => flagshipProducts[env].items.find((i) => i.id === id)?.name || titleOf(id);

          const entries: Entry[] = [
            ...(['hybrid-video', 'ribbon-player', 'inread-player', 'inread-floating'] as const).map((id) => ({ env: 'video' as Env, id })),
            ...(['interstitial', 'slider', 'stay-on', 'remnant'] as const).map((id) => ({ env: 'display' as Env, id })),
            // App formats (Rewarded Ad, App Interstitial Ad, App StayOn Ad) are hidden for now:
            // ...(['rewarded-ad', 'interstitial', 'stay-on'] as const).map((id) => ({ env: 'app' as Env, id })),
          ].map(({ env, id }) => ({
            key: `${env}-${id}`,
            id,
            env,
            name: nameFor(env, id),
            desc: describe(id),
            flagship: isFlagship(env, id),
          }));

          const q = searchQuery.trim().toLowerCase();
          const matches = (e: Entry) => !q || e.name.toLowerCase().includes(q) || e.desc.toLowerCase().includes(q);
          const inTab = (e: Entry) =>
            exploreTab === 'all' ? true : exploreTab === 'flagship' ? e.flagship : e.env === exploreTab;

          const count = (t: string) => entries.filter((e) => (t === 'all' ? true : t === 'flagship' ? e.flagship : e.env === t)).length;
          const list = entries.filter((e) => inTab(e) && matches(e));
          const selected = list.find((e) => e.key === exploreKey) || list[0];
          const selectedFormat = selected ? allFormats.find((f) => f.id === selected.id) : undefined;
          const hasMockup = selected ? MOCKUP_FORMATS.includes(selected.id) : false;
          const src = selected
            ? selected.id === 'interstitial'
              ? '/interstitial-design.html'
              : `/format-design.html?format=${selected.id}`
            : '';
          const devices = selected?.id === 'rewarded-ad' ? 'Mobile' : 'Desktop · Mobile';

          const tabs: [string, string][] = [
            ['all', 'All'],
            ['flagship', 'Flagship'],
            ['video', 'Video'],
            ['display', 'Web / Display'],
            // ['app', 'App'],
          ];

          return (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-14 sm:pb-20">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                <div>
                  <h2 className="font-bold tracking-[-0.03em] leading-tight" style={{ color: '#0b0b0b', fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}>
                    Explore ad formats
                  </h2>
                  <p className="mt-2 text-sm sm:text-base" style={{ color: '#666661' }}>
                    Choose an environment, see how each format behaves, then open the working demo.
                  </p>
                </div>
                <div className="relative w-full md:w-72 flex-none">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a8780] pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search ad formats..."
                    aria-label="Search ad formats"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-11 pl-10 pr-9 text-sm bg-white border border-[#e4e0da] focus:border-[#0b0b0b] focus:outline-none transition-colors"
                    style={{ color: '#0b0b0b' }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8780] hover:text-[#0b0b0b] text-sm"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="mt-8 border-b border-[#e4e0da] flex flex-wrap gap-x-1 sm:gap-x-3" role="tablist">
                {tabs.map(([key, label]) => {
                  const on = exploreTab === key;
                  return (
                    <button
                      key={key}
                      role="tab"
                      aria-selected={on}
                      onClick={() => setExploreTab(key)}
                      className="!px-3 !py-3 text-sm font-semibold -mb-px transition-colors"
                      style={{ color: on ? '#0b0b0b' : '#8a8780', borderBottom: `2px solid ${on ? '#FF7E01' : 'transparent'}` }}
                    >
                      {label} <span className="font-medium" style={{ color: '#b5b2aa' }}>{count(key)}</span>
                    </button>
                  );
                })}
              </div>

              {list.length === 0 || !selected ? (
                <div className="py-20 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-[#f5f4f1]">
                    <Search className="w-7 h-7 text-[#8a8780]" />
                  </div>
                  <h3 className="text-2xl font-bold" style={{ color: '#0b0b0b' }}>No formats found</h3>
                  <p className="mt-2 mb-6" style={{ color: '#666661' }}>
                    {searchQuery ? `No results for "${searchQuery}". Try a different search term.` : 'No formats in this group.'}
                  </p>
                  <button
                    onClick={() => { setSearchQuery(''); setExploreTab('all'); }}
                    className="!px-6 !py-3 text-sm font-semibold"
                    style={{ backgroundColor: '#0b0b0b', color: '#ffffff' }}
                  >
                    Show all formats
                  </button>
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_460px] gap-5">
                  {/* Preview */}
                  <div className="min-w-0 border border-[#e4e0da] bg-[#f5f4f1] flex flex-col">
                    <div className="flex-1 min-h-[460px] lg:min-h-[540px]">
                      {hasMockup ? (
                        <MockupFrame
                          key={`${selected.key}-${replayKey}`}
                          src={src}
                          title={`${selected.name} preview`}
                          autoBelow={640}
                          className="w-full h-[800px] sm:h-[560px] border-0 bg-transparent block"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full p-8">
                          <img src={hiddenPreviewImages[selected.id] ?? INTImg} alt={selected.name} className="max-h-[420px] w-auto object-contain" draggable={false} />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e4e0da] bg-white px-4 py-3">
                      <div className="text-xs" style={{ color: '#666661' }}>
                        <strong style={{ color: '#0b0b0b' }}>{selected.name}</strong> · {devices}
                      </div>
                      <div className="flex items-center gap-2">
                        {selected.id !== REWARDED_FORMAT_ID && selectedFormat && (
                          <button
                            onClick={() => handleViewLivePreview(selectedFormat)}
                            className="inline-flex items-center gap-2 !px-4 !py-2.5 text-xs font-semibold hover:!bg-[#E86F00] transition-colors"
                            style={{ backgroundColor: '#0b0b0b', color: '#ffffff' }}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View live preview
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Format list */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 content-start">
                    {list.map((e) => {
                      const on = e.key === selected.key;
                      return (
                        <div
                          key={e.key}
                          role="button"
                          tabIndex={0}
                          aria-pressed={on}
                          onClick={() => setExploreKey(e.key)}
                          onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); setExploreKey(e.key); } }}
                          className="cursor-pointer p-3.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF7E01]"
                          style={{ backgroundColor: on ? '#fff4ed' : '#ffffff', border: `1px solid ${on ? '#FF7E01' : '#e4e0da'}` }}
                        >
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                            <span
                              className="block w-2.5 h-2.5 flex-none"
                              style={{ backgroundColor: on ? '#FF7E01' : 'transparent', border: `1px solid ${on ? '#FF7E01' : '#b5b2aa'}` }}
                            />
                            <span className="text-[13px] font-bold" style={{ color: '#0b0b0b' }}>{e.name}</span>
                            {e.flagship && (
                              <span className="text-[8px] font-bold tracking-[0.1em] px-1.5 py-0.5" style={{ backgroundColor: '#0b0b0b', color: '#ffffff' }}>
                                FLAGSHIP
                              </span>
                            )}
                          </div>
                          <p className="mt-2 text-[11px] leading-snug line-clamp-2" style={{ color: '#666661' }}>{e.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </section>

      {/* AD FORMATS SECTION */}
      <section className="bg-white">
        {mainFormats.map((format, index) => {
          const details = formatDetails[format.id];
          const isEven = index % 2 === 0;

          return (
            <div
              key={format.id}
              ref={(el) => (formatRefs.current[format.id] = el)}
              className="lg:min-h-screen flex flex-col justify-center snap-start relative overflow-hidden"
            >
              <div className={`container mx-auto px-4 sm:px-6 relative z-10 ${MOCKUP_FORMATS.includes(format.id) ? 'py-8 lg:py-6' : 'py-16 sm:py-20'}`}>
                <div
                  className={`flex flex-col ${MOCKUP_FORMATS.includes(format.id) ? 'gap-8 lg:gap-6' : 'lg:flex-row gap-12 lg:gap-16 items-center'}`}
                >
                  <div className={`${MOCKUP_FORMATS.includes(format.id) ? 'lg:grid lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-x-6 lg:gap-y-5 lg:items-start lg:auto-rows-min lg:content-start space-y-6 lg:space-y-0' : 'flex-1 space-y-6'}`} style={{ fontFamily: "'Geist', system-ui, sans-serif" }}>
                    <div className={`flex items-center gap-3 ${MOCKUP_FORMATS.includes(format.id) ? 'lg:col-span-3 lg:row-start-1' : ''}`}>
                      <span className="block w-6 h-px bg-[#FF6B2C]"></span>
                      <span className="text-xs font-semibold text-[#FF6B2C] uppercase tracking-[0.14em]">
                        {format.category}
                      </span>
                    </div>

                    <h2 className={`${MOCKUP_FORMATS.includes(format.id) ? 'text-3xl sm:text-4xl lg:text-4xl' : 'text-4xl sm:text-5xl lg:text-6xl'} font-semibold text-[#0b0b0b] leading-[1.04] tracking-[-0.035em] ${MOCKUP_FORMATS.includes(format.id) ? 'lg:col-start-1 lg:row-start-2 lg:self-end' : ''}`}>
                      {details?.title || format.name}
                    </h2>

                    <p className={`text-lg text-[#666661] leading-relaxed max-w-xl ${MOCKUP_FORMATS.includes(format.id) ? 'lg:col-start-2 lg:col-span-2 lg:row-start-2 lg:self-end lg:pb-1 lg:max-w-none' : ''}`}>
                      {details?.description || format.description}
                    </p>

                    {details?.features && (
                      <div className={`grid grid-cols-2 sm:grid-cols-4 border border-[#deded9] bg-white max-w-xl ${MOCKUP_FORMATS.includes(format.id) ? 'lg:col-start-1 lg:col-span-2 lg:row-start-3 lg:max-w-none' : ''}`}>
                        {details.features.map((feature, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center gap-2.5 px-4 py-3 border-[#deded9] ${idx > 0 ? 'sm:border-l' : ''} ${idx % 2 === 1 ? 'border-l sm:border-l' : ''} ${idx > 1 ? 'border-t sm:border-t-0' : ''}`}
                          >
                            <div className="w-1.5 h-1.5 bg-[#FF6B2C] flex-none"></div>
                            <span className="text-sm text-[#0b0b0b] font-medium">{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className={`flex flex-wrap gap-4 pt-4 ${MOCKUP_FORMATS.includes(format.id) ? 'lg:col-start-3 lg:row-start-3 lg:pt-0 lg:self-stretch lg:items-stretch lg:ml-4' : ''}`}>
                      {format.id !== REWARDED_FORMAT_ID && (
                        <button
                          onClick={() => handleViewLivePreview(format)}
                          className="group inline-flex w-full sm:w-auto justify-center items-center gap-2.5 !px-5 !py-2.5 text-sm !bg-[#0b0b0b] hover:!bg-[#FF6B2C] !text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B2C] font-semibold transition-colors duration-200"
                          style={{ color: '#ffffff', backgroundColor: '#0b0b0b' }}
                        >
                          <Eye className="w-4 h-4" color="#ffffff" />
                          <span>View Live Preview</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" color="#ffffff" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className={`w-full ${MOCKUP_FORMATS.includes(format.id) ? '' : MOCKUP_FORMATS.includes(format.id) ? 'lg:flex-[1.45] max-w-5xl' : 'flex-1 max-w-2xl'}`}>
                    <div className="relative group">
                      <div className="relative overflow-hidden transition-all duration-500 ease-in-out">
                        {(expandedPreview === format.id || MOCKUP_FORMATS.includes(format.id)) && (
                          <div className="flex flex-col items-center justify-center min-h-[350px] sm:min-h-[450px] md:min-h-[550px] animate-fadeIn">
                            <div className="flex items-center justify-center flex-1 w-full relative">
                              {MOCKUP_FORMATS.includes(format.id) ? (
                                <MockupFrame
                                  src={format.id === 'interstitial' ? '/interstitial-design.html?wide=1' : `/format-design.html?format=${format.id}&wide=1`}
                                  title={`${format.name} mockup`}
                                  autoBelow={1024}
                                  className={`w-full border-0 bg-transparent ${MOCKUP_FORMATS.includes(format.id) ? 'h-[760px] lg:h-[calc(100vh-18rem)] lg:min-h-[460px]' : 'h-[860px] sm:h-[640px] md:h-[720px]'}`}
                                />
                              ) : formatVideos[format.id] ? (
                                <>
                                  {/* Rewarded Ad - iPhone Only (Bigger) */}
                                  {format.id === 'rewarded-ad' ? (
                                    <div className="flex justify-center items-center w-full">
                                      <div className="w-[180px] sm:w-[220px] md:w-[260px] lg:w-[300px]">
                                        <IphoneMockup
                                          video={formatMobileVideos[format.id] ?? formatVideos[format.id]}
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      {/* Regular formats - MacBook + iPhone */}
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
                                            {format.id === "ribbon-player" ? (
                                              <TabletMockup
                                                video={formatVideos[format.id]}
                                              />

                                            ) : (
                                              <MacbookMockup
                                                video={formatVideos[format.id]}
                                                isvideo={format.id === "hybrid-video"}
                                              />
                                            )}
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
                                  )}
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

                        {expandedPreview !== format.id && !MOCKUP_FORMATS.includes(format.id) && (
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
      <footer className="snap-start text-white" style={{ backgroundColor: '#0a0a0c', fontFamily: "'Geist', system-ui, sans-serif" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-8">
          <img
            src="https://assts.tmadsrv.com/logos/Tapmind-Logo-White.png"
            className="h-12 w-auto"
            alt="Tapmind - Tap into Growth"
          />
          <p className="mt-6 max-w-[330px] text-[15px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
            An Intelligent AdTech Ecosystem that Drives Publisher Growth through OpenMediation, Additional Demand, and Intelligent Yield Optimization.
          </p>

          <div className="mt-6 flex items-center gap-4">
            {([
              ['LinkedIn', 'M6.94 8.5H3.56V20h3.38V8.5zM5.25 3.5a1.97 1.97 0 1 0 0 3.94 1.97 1.97 0 0 0 0-3.94zM20.44 13.4c0-3.05-1.63-4.9-4.27-4.9-1.4 0-2.4.77-2.8 1.5h-.05V8.5H10.1V20h3.38v-6.1c0-1.6.3-3.15 2.3-3.15 1.97 0 2 1.84 2 3.25V20h3.38l-.02-6.6z'],
              ['Instagram', 'M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4zm0 7.75a3.05 3.05 0 1 1 0-6.1 3.05 3.05 0 0 1 0 6.1zM17.2 5.6a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2zM12 3c-2.44 0-2.75.01-3.7.05-2.97.14-4.8 1.97-4.94 4.94C3.31 9 3.3 9.3 3.3 11.7v.6c0 2.4.01 2.7.06 3.65.14 2.97 1.97 4.8 4.94 4.94.95.05 1.26.06 3.7.06s2.75-.01 3.7-.06c2.97-.14 4.8-1.97 4.94-4.94.05-.95.06-1.26.06-3.7v-.6c0-2.4-.01-2.7-.06-3.65-.14-2.97-1.97-4.8-4.94-4.94C14.75 3.01 14.44 3 12 3z'],
              ['YouTube', 'M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.3 5 12 5 12 5s-6.3 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2C2 8.76 2 12 2 12s0 3.24.4 4.8a2.5 2.5 0 0 0 1.76 1.77C5.7 19 12 19 12 19s6.3 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77c.4-1.56.4-4.8.4-4.8s0-3.24-.4-4.8zM10 15.2V8.8l5.2 3.2-5.2 3.2z'],
            ] as const).map(([name, d]) => (
              <a
                key={name}
                href={SOCIAL_LINKS[name]}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`TapMind on ${name}`}
                title={name}
                className="flex items-center justify-center w-9 h-9 rounded-lg transition-colors hover:!bg-[#E86F00]"
                style={{ backgroundColor: '#d4d4d8', color: '#0a0a0c' }}
              >
                {name === 'Instagram' ? (
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true"><path d={d} /></svg>
                )}
              </a>
            ))}
          </div>

          <div className="mt-10 border-t pt-5 text-xs" style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }}>
            © {new Date().getFullYear()} Tapmind. All rights reserved.
          </div>
        </div>
      </footer>

      {selectedFormat && (
        <PreviewModal format={selectedFormat} onClose={() => setSelectedFormat(null)} autoLaunch />
      )}

      {showDesktopOnlyModal && !isDesktop && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowDesktopOnlyModal(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-2xl mb-6">
              <Monitor className="w-10 h-10 text-blue-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Live Preview Needs a Larger Screen
            </h2>

            <p className="text-gray-600 leading-relaxed mb-8">
              The animated mockups on this page work on your phone. The full live preview is best
              experienced on a desktop or tablet in landscape.
            </p>

            <button
              onClick={() => setShowDesktopOnlyModal(false)}
              className="!px-6 !py-3 !bg-[#0b0b0b] !text-white font-semibold"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-50 group p-4 bg-gradient-to-r from-[#FF6B2C] to-[#FF8C42] text-white rounded-full shadow-2xl hover:shadow-[#FF6B2C]/50 transition-all duration-300 transform hover:scale-110 ${showScrollTop && !selectedFormat
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





// import React, { useState, useRef, useEffect } from 'react';
// import { PreviewModal } from './components/PreviewModal';
// import MacbookMockup from './components/MacbookMockup';
// import IphoneMockup from './components/IphoneMockup';
// import macbookFrame from './assets/macbook-pro-16.png';
// import iphoneFrame from './assets/iphone_mob.png';
// import { adFormats } from './data/adFormats';
// import { AdFormat } from './types/AdFormat';
// import { ChevronDown, Play, Settings, Eye, Sparkles, Zap, ArrowRight, Search, Monitor, Video, } from 'lucide-react';
// import SilkOrangeBackground from './components/SilkOrangeBackground';
// import MobileSilhouetteShowcase from './components/MobileSilhouetteShowcase';

// // Hidden-preview full images per format
// import INTImg from './Img/Int_img.png';
// import SLDRImg from './Img/Sldr_img.png';
// import SOImg from './Img/So_img.png';
// import RemanatImg from './Img/remenat_img.png';
// import InReadImg from './Img/InRead_img.png';
// import InReadSldrImg from './Img/InRead_Sldr_img.png';
// import SideBarImg from './Img/SideBar_Sldr_img.png';

// function App() {
//   const [selectedFormat, setSelectedFormat] = useState<AdFormat | null>(null);
//   const [activeFormatId, setActiveFormatId] = useState<string | null>(null);
//   const previewDebounceRef = useRef<number | null>(null);
//   const preloadedVideosRef = useRef<Set<string>>(new Set());
//   const [expandedPreview, setExpandedPreview] = useState<string | null>(null);
//   const [showScrollTop, setShowScrollTop] = useState(false);
//   const [filterType, setFilterType] = useState<'all' | 'display' | 'video'>('all');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [showHeroMockup, setShowHeroMockup] = useState(false);
//   const [heroInView, setHeroInView] = useState(true);
//   const [heroCycle, setHeroCycle] = useState(0);
//   const [showDesktopOnlyModal, setShowDesktopOnlyModal] = useState(false);
//   const [showStickyNav, setShowStickyNav] = useState(false);

//   // Toggle Flagship grid instead of modal
//   const [showFlagshipGrid, setShowFlagshipGrid] = useState(true);

//   const containerRef = useRef<HTMLDivElement>(null);
//   const heroRef = useRef<HTMLDivElement>(null);
//   const navigationRef = useRef<HTMLDivElement>(null);
//   const formatRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
//   const REWARDED_FORMAT_ID = 'rewarded-ad';

//   // Add this new state
//   const [isDesktop, setIsDesktop] = useState<boolean>(true);
//   // Update existing mobile check useEffect to also set isDesktop
//   useEffect(() => {
//     const checkSize = () => {
//       const mobile = window.innerWidth < 1024;
//       setIsDesktop(!mobile);
//       if (mobile) {
//         setShowDesktopOnlyModal(true);
//       }
//     };

//     checkSize(); // Initial check
//     window.addEventListener('resize', checkSize);
//     return () => window.removeEventListener('resize', checkSize);
//   }, []);

//   // Delay HERO mockup so text loads first, then animate in
//   useEffect(() => {
//     if (!heroInView) {
//       setShowHeroMockup(false);
//       return;
//     }
//     const t = window.setTimeout(() => setShowHeroMockup(true), 600);
//     return () => window.clearTimeout(t);
//   }, [heroInView]);

//   // Observe HERO visibility
//   useEffect(() => {
//     const container = containerRef.current;
//     const heroEl = heroRef.current;
//     if (!container || !heroEl) return;

//     const obs = new IntersectionObserver(
//       (entries) => {
//         const entry = entries[0];
//         if (entry.isIntersecting) {
//           setHeroInView(true);
//           setHeroCycle((c) => c + 1);
//         } else {
//           setHeroInView(false);
//         }
//       },
//       { root: container, threshold: 0.5 }
//     );

//     obs.observe(heroEl);
//     return () => obs.disconnect();
//   }, []);

//   // Show/hide sticky nav and back-to-top based on scroll
//   useEffect(() => {
//     const container = containerRef.current;
//     const navEl = navigationRef.current;
//     if (!container || !navEl) return;

//     const handleScroll = () => {
//       const scrollY = container.scrollTop;
//       const navOffset = navEl.offsetTop;

//       // Show sticky nav after scrolling past the navigation section
//       setShowStickyNav(scrollY > navOffset + 100);

//       // Show back to top button
//       setShowScrollTop(scrollY > 500);
//     };

//     handleScroll();
//     container.addEventListener('scroll', handleScroll);

//     return () => container.removeEventListener('scroll', handleScroll);
//   }, []);

//   // Observe which ad-format section is in view
//   useEffect(() => {
//     const container = containerRef.current;
//     if (!container) return;

//     const ids = Object.keys(formatRefs.current);
//     const elements = ids
//       .map((id) => ({ id, el: formatRefs.current[id] }))
//       .filter((x): x is { id: string; el: HTMLDivElement } => Boolean(x.el));

//     if (!elements.length) return;

//     const observer = new IntersectionObserver(
//       (entries) => {
//         const visible = entries
//           .filter((e) => e.isIntersecting)
//           .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

//         if (visible?.target) {
//           const found = elements.find((x) => x.el === visible.target);
//           setActiveFormatId(found?.id ?? null);
//         } else {
//           setActiveFormatId(null);
//         }
//       },
//       {
//         root: container,
//         threshold: [0.35, 0.6, 0.85],
//       }
//     );

//     elements.forEach(({ el }) => observer.observe(el));

//     return () => observer.disconnect();
//   }, [filterType, searchQuery]);

//   // Sync expanded preview to active section
//   useEffect(() => {
//     setExpandedPreview(activeFormatId);
//   }, [activeFormatId]);

//   const scrollToNavigation = () => {
//     navigationRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   const scrollToFormat = (formatId: string) => {
//     formatRefs.current[formatId]?.scrollIntoView({ behavior: 'smooth' });
//   };

//   const scrollToTop = () => {
//     navigationRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   const isMobileOrTablet = () => {
//     return window.innerWidth < 1024;
//   };

//   const handleViewLivePreview = (format: AdFormat) => {
//     if (!isDesktop) {
//       setShowDesktopOnlyModal(true);
//       return; // Block completely
//     }
//     setSelectedFormat(format);
//   };

//   const formatDetails: Record<
//     string,
//     { title: string; description: string; features: string[] }
//   > = {
//     interstitial: {
//       title: 'Interstitial Ads',
//       description:
//         'Full-screen ad experiences that capture complete user attention with high-impact creative formats.',
//       features: ['Full-screen coverage', 'High viewability', 'Multiple size options', 'Auto-close timer'],
//     },
//     slider: {
//       title: 'Slider Ads',
//       description: 'Smooth sliding ad units that glide into view without disrupting the user experience.',
//       features: ['Non-intrusive', 'Corner placement', 'Easy dismissal', 'Responsive design'],
//     },
//     'stay-on': {
//       title: 'StayOn Ads',
//       description:
//         'Sticky footer ads that remain visible as users scroll, ensuring persistent brand presence.',
//       features: ['Always visible', 'Bottom anchored', 'Scroll-persistent', 'Mobile optimized'],
//     },
//     'inread-player': {
//       title: 'InRead Player',
//       description:
//         'Video player that starts within content and provides seamless in-content video advertising experience.',
//       features: ['In-content placement', 'Auto-play on view', 'Smooth integration', 'High engagement'],
//     },
//     'rewarded-ad': {
//       title: 'Rewarded Ad',
//       description:
//         'Engage users with rewarded video ads that offer incentives for viewing, creating a win-win advertising experience.',
//       features: ['User incentives', 'High engagement', 'Opt-in experience', 'Mobile optimized'],
//     },
//     'inread-floating': {
//       title: 'InRead + Floating Player',
//       description:
//         'Hybrid video format that starts in-content and floats as users scroll for continued engagement.',
//       features: ['Dual-mode display', 'Sticky on scroll', 'Video continuation', 'Corner minimize'],
//     },
//     'ribbon-player': {
//       title: 'Ribbon Player',
//       description:
//         'Sleek ribbon-style video player that elegantly slides into view, offering premium video advertising with minimal disruption.',
//       features: ['Smooth animation', 'Premium placement', 'Auto-expand on view', 'Easy dismiss'],
//     },
//     // sidebar: {
//     //   title: 'Sidebar Video Player',
//     //   description: 'Elegant sidebar placement that complements content without obstruction.',
//     //   features: ['Side placement', 'Content-aware', 'Multiple sizes', 'Desktop optimized'],
//     // },
//     'hybrid-video': {
//       title: 'Hybrid Video',
//       description:
//         'Hybrid video format where when the player is out of view, it loads high-impact creative formats for maximum engagement.',
//       features: ['Out-of-view detection', 'High-impact fallback', 'Seamless transition', 'Maximum engagement'],
//     },
//     remnant: {
//       title: 'Remnant Ads',
//       description:
//         'Banner ads shown on dedicated ad slots on the webpage for maximum fill rate and revenue optimization.',
//       features: ['Dedicated ad slots', 'Sidebar placement', 'Banner placement', 'Multiple sizes'],
//     },
//   };

//   const categoryConfig = {
//     video: {
//       label: "Video",
//       icon: <Play className="w-5 h-5 text-[#FF6B2C] group-hover:text-white" />
//     },
//     display: {
//       label: "Display",
//       icon: <Zap className="w-5 h-5 text-[#FF6B2C] group-hover:text-white" />
//     },
//     app: {
//       label: "App",
//       icon: (
//         <svg
//           className="w-5 h-5 text-[#FF6B2C] group-hover:text-white"
//           fill="none"
//           stroke="currentColor"
//           viewBox="0 0 24 24"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth={2}
//             d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
//           />
//         </svg>
//       )
//     }
//   };
//   // Flagship Products Configuration (exact labels)
//   const flagshipProducts = {
//     video: {
//       title: 'Video',
//       items: [
//         { name: 'Hybrid Player', id: 'hybrid-video' },
//         { name: 'Ribbon Player', id: 'ribbon-player' },
//         // { name: 'Sidebar Player', id: 'sidebar' },
//       ],
//     },
//     display: {
//       title: 'Display',
//       items: [
//         { name: 'Slider Ad', id: 'slider' },
//         { name: 'Interstitial Ad', id: 'interstitial' },
//       ],
//     },
//     app: {
//       title: 'App',
//       items: [
//         { name: 'Rewarded Ad', id: 'rewarded-ad' },
//         { name: 'App Interstitial Ad', id: 'interstitial' },
//         { name: 'App StayOn Ad', id: 'stay-on' },
//       ],
//     },
//   };

//   // Hidden-preview full images per format (fallback to INTImg)
//   const hiddenPreviewImages: Record<string, string> = {
//     interstitial: INTImg,
//     slider: SLDRImg,
//     'stay-on': SOImg,
//     'inread-player': InReadImg,
//     'rewarded-ad': InReadImg,
//     'inread-floating': InReadSldrImg,
//     'ribbon-player': InReadSldrImg,
//     sidebar: SideBarImg,
//     'hybrid-video': InReadSldrImg,
//     remnant: RemanatImg,
//   };

//   const formatVideos: Record<string, string> = {
//     interstitial: 'https://gallery.tapmind.io/video/INT_ad.mp4',
//     slider: 'https://gallery.tapmind.io/video/Sldr_ad.mp4',
//     'stay-on': 'https://gallery.tapmind.io/video/So_ad.mp4',
//     'inread-player': 'https://gallery.tapmind.io/video/InRead_ad.mp4',
//     'rewarded-ad': 'https://gallery.tapmind.io/video/InRead_ad.mp4',
//     'inread-floating': 'https://gallery.tapmind.io/video/InRead_Sldr_ad.mp4',
//     'ribbon-player': 'https://gallery.tapmind.io/video/InRead_Sldr_ad.mp4',
//     sidebar: 'https://gallery.tapmind.io/video/SideBar_ad.mp4',
//     'hybrid-video': 'https://gallery.tapmind.io/video/InRead_Sldr_ad.mp4',
//     remnant: 'https://gallery.tapmind.io/video/Remenant_ad.mp4',
//   };

//   const formatMobileVideos: Record<string, string> = {
//     interstitial: 'https://gallery.tapmind.io/video/INT_Mob_gif_ad.gif',
//     slider: 'https://gallery.tapmind.io/video/Sldr_Mob_gif_ad.gif',
//     'stay-on': 'https://gallery.tapmind.io/video/So_Mob_gif_ad.gif',
//     'inread-player': 'https://gallery.tapmind.io/video/InRead_Mob_gif_ad.gif',
//     'rewarded-ad': 'https://gallery.tapmind.io/video/Rewards_Mob_gif_ad.gif',
//     'inread-floating': 'https://gallery.tapmind.io/video/InRead_Sldr_Mob_gif_ad.gif',
//     'ribbon-player': 'https://gallery.tapmind.io/video/Ribbon_Mob_gif_ad.gif',
//     sidebar: 'https://gallery.tapmind.io/video/sideBar_Sldr_Mob_gif_ad.gif',
//     'hybrid-video': 'https://gallery.tapmind.io/video/Hybrid_Mob_gif_ad.gif',
//     remnant: 'https://gallery.tapmind.io/video/Remenant_Mob_gif_ad.gif',
//   };

//   // Preload device frames
//   useEffect(() => {
//     const mac = new Image();
//     mac.src = macbookFrame;
//     const iph = new Image();
//     iph.src = iphoneFrame;
//   }, []);

//   // Smart-preload active section video
//   useEffect(() => {
//     if (!activeFormatId) return;
//     const src = formatVideos[activeFormatId];
//     if (!src || preloadedVideosRef.current.has(src)) return;

//     const vid = document.createElement('video');
//     vid.src = src;
//     vid.preload = 'metadata';
//     vid.muted = true;
//     (vid as any).playsInline = true;
//     vid.load();

//     preloadedVideosRef.current.add(src);
//   }, [activeFormatId]);

//   const allFormats = [...adFormats];

//   // Display formats only (for Display dropdown and filter)
//   const displayFormatIds = ['interstitial', 'slider', 'stay-on', 'remnant'];

//   // Video formats only (for Video dropdown and filter) - NOW INCLUDES 'inread-player'
//   const videoFormatIds = ['inread-player', 'inread-floating', 'sidebar', 'hybrid-video'];

//   // All scrollable formats (Display + Video + Ribbon Player + Rewarded Ad)
//   const scrollableFormatIds = [...displayFormatIds, ...videoFormatIds, 'ribbon-player', 'rewarded-ad'];

//   // mainFormats used for scrolling sections (includes ribbon-player and rewarded-ad)
//   const mainFormats = allFormats
//     .filter((f) => scrollableFormatIds.includes(f.id))
//     .filter((f) => {
//       // For filtering, exclude ribbon-player and rewarded-ad from display/video filters
//       if (filterType === 'display' && (!displayFormatIds.includes(f.id) || f.id === 'ribbon-player' || f.id === 'rewarded-ad')) return false;
//       if (filterType === 'video' && (!videoFormatIds.includes(f.id) || f.id === 'ribbon-player' || f.id === 'rewarded-ad')) return false;

//       if (searchQuery.trim()) {
//         const query = searchQuery.toLowerCase();
//         const details = formatDetails[f.id];
//         return (
//           f.name.toLowerCase().includes(query) ||
//           details?.title.toLowerCase().includes(query) ||
//           details?.description.toLowerCase().includes(query)
//         );
//       }
//       return true;
//     });

//   // All formats including rewarded-ad (for cards display in flagship)
//   const allCardFormatIds = [...displayFormatIds, ...videoFormatIds];

//   // cardFormats includes all formats for the card grid
//   const cardFormats = allFormats
//     .filter((f) => allCardFormatIds.includes(f.id))
//     .filter((f) => {
//       // Exclude rewarded-ad from All Formats and filters
//       if (f.id === 'rewarded-ad') return false;

//       if (filterType === 'display' && !displayFormatIds.includes(f.id)) return false;
//       if (filterType === 'video' && !videoFormatIds.includes(f.id)) return false;

//       if (searchQuery.trim()) {
//         const query = searchQuery.toLowerCase();
//         const details = formatDetails[f.id];

//         // Also search in flagship products
//         const inFlagship = Object.values(flagshipProducts).some(group =>
//           group.items.some(item =>
//             item.id === f.id && (
//               item.name.toLowerCase().includes(query) ||
//               (details?.title.toLowerCase().includes(query) ?? false) ||
//               (details?.description.toLowerCase().includes(query) ?? false)
//             )
//           )
//         );

//         return (
//           f.name.toLowerCase().includes(query) ||
//           details?.title.toLowerCase().includes(query) ||
//           details?.description.toLowerCase().includes(query) ||
//           inFlagship
//         );
//       }
//       return true;
//     });

//   // Flagship formats for the grid (independent of filters, but respects search)
//   const flagshipCardFormats = (() => {
//     const flagshipIds = new Set([
//       ...flagshipProducts.video.items.map(i => i.id),
//       ...flagshipProducts.display.items.map(i => i.id),
//       ...flagshipProducts.app.items.map(i => i.id),
//     ]);

//     return allFormats.filter(f => {
//       if (!flagshipIds.has(f.id)) return false;

//       if (searchQuery.trim()) {
//         const query = searchQuery.toLowerCase();
//         const details = formatDetails[f.id];

//         // Find the flagship item name for this format
//         const flagshipItem = Object.values(flagshipProducts)
//           .flatMap(group => group.items)
//           .find(item => item.id === f.id);

//         return (
//           f.name.toLowerCase().includes(query) ||
//           details?.title.toLowerCase().includes(query) ||
//           details?.description.toLowerCase().includes(query) ||
//           (flagshipItem?.name.toLowerCase().includes(query) ?? false)
//         );
//       }
//       return true;
//     });
//   })();

//   const handleFlagshipClick = () => {
//     setShowFlagshipGrid(true);
//     setFilterType('all');
//     setSelectedFormat(null);
//   };

//   // Helper to always get the base flagship formats (ignores search/filter)
//   const flagshipBaseFormats = (id: string) =>
//     allFormats.find((f) => f.id === id);

//   const StickyFormatNav = () => {
//     const [openDropdown, setOpenDropdown] = useState<'flagship' | 'display' | 'video' | null>(null);
//     const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//     return (
//       <div className={`fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 transition-all duration-300 ${showStickyNav ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
//         }`}>
//         <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between relative">
//           {/* Logo - LEFT side - Fixed container to prevent flickering */}
//           <div className="flex-shrink-0 z-50" style={{ width: '140px', height: '32px' }}>
//             <img
//               src="https://assts.tmadsrv.com/logos/Tapmind-Logo-dark.png"
//               alt="Tapmind"
//               className="h-full w-auto object-contain"
//               loading="eager"
//             />
//           </div>

//           {/* 3 Centered Flex Dropdowns - Desktop Only */}
//           <div className="hidden lg:flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2">

//             {/* Flagship Products Dropdown */}

//             <div
//               className="relative"
//               onMouseEnter={() => setOpenDropdown('flagship')}
//               onMouseLeave={() => setOpenDropdown(null)}
//             >
//               <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-[#FF6B2C]/10 hover:border-[#FF6B2C]/30 transition-all">
//                 <Sparkles className="w-4 h-4" />
//                 Flagship Products
//                 <ChevronDown className="w-4 h-4" />
//               </button>

//               {openDropdown === 'flagship' && (
//                 <div className="fixed top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 w-screen max-w-6xl bg-white rounded-2xl shadow-2xl border border-gray-200 px-6 py-8 z-[100]">
//                   <div className="space-y-6">
//                     {/* VIDEO ROW */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                       {flagshipProducts.video.items.map((item) => {
//                         const format = flagshipBaseFormats(item.id);
//                         if (!format) return null;
//                         const details = formatDetails[item.id];

//                         return (
//                           <div
//                             key={`flagship-dd-video-${item.id}`}
//                             className="group cursor-pointer p-4 border border-gray-100 rounded-xl hover:border-[#FF6B2C]/30 hover:shadow-lg hover:bg-gradient-to-br hover:from-[#FF6B2C]/5 transition-all duration-200 hover:scale-[1.02] h-full flex flex-col"
//                             onClick={() => {
//                               const el = formatRefs.current[item.id];
//                               if (el) {
//                                 el.scrollIntoView({ behavior: 'smooth' });
//                               }
//                               setOpenDropdown(null);
//                             }}
//                           >
//                             <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#FF6B2C]/10 to-[#FF8C42]/10 group-hover:from-[#FF6B2C] group-hover:to-[#FF8C42] rounded-xl flex items-center justify-center mb-3">
//                               <Play className="w-5 h-5 text-[#FF6B2C] group-hover:text-white" />
//                             </div>
//                             <div className="flex items-center justify-between mb-1">
//                               <h3 className="font-semibold text-sm text-gray-800 group-hover:text-[#FF6B2C]">
//                                 {item.name}
//                               </h3>
//                             </div>
//                             <p className="text-xs text-gray-500 line-clamp-2">
//                               {details?.description}
//                             </p>
//                           </div>
//                         );
//                       })}
//                     </div>

//                     {/* DISPLAY ROW */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                       {flagshipProducts.display.items.map((item) => {
//                         const format = flagshipBaseFormats(item.id);
//                         if (!format) return null;
//                         const details = formatDetails[item.id];

//                         return (
//                           <div
//                             key={`flagship-dd-display-${item.id}`}
//                             className="group cursor-pointer p-4 border border-gray-100 rounded-xl hover:border-[#FF6B2C]/30 hover:shadow-lg hover:bg-gradient-to-br hover:from-[#FF6B2C]/5 transition-all duration-200 hover:scale-[1.02] h-full flex flex-col"
//                             onClick={() => {
//                               const el = formatRefs.current[item.id];
//                               console.log('Scrolling to format:', format.id, el);

//                               if (el) {
//                                 el.scrollIntoView({ behavior: 'smooth' });
//                               }
//                               setOpenDropdown(null);
//                             }}
//                           >
//                             <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#FF6B2C]/10 to-[#FF8C42]/10 group-hover:from-[#FF6B2C] group-hover:to-[#FF8C42] rounded-xl flex items-center justify-center mb-3">
//                               <Zap className="w-5 h-5 text-[#FF6B2C] group-hover:text-white" />
//                             </div>
//                             <div className="flex items-center justify-between mb-1">
//                               <h3 className="font-semibold text-sm text-gray-800 group-hover:text-[#FF6B2C]">
//                                 {item.name}
//                               </h3>
//                             </div>
//                             <p className="text-xs text-gray-500 line-clamp-2">
//                               {details?.description}
//                             </p>
//                           </div>
//                         );
//                       })}
//                     </div>

//                     {/* APP ROW */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                       {flagshipProducts.app.items.map((item) => {
//                         const format = flagshipBaseFormats(item.id);
//                         if (!format) return null;
//                         const details = formatDetails[item.id];

//                         return (
//                           <div
//                             key={`flagship-dd-app-${item.id}`}
//                             className="group cursor-pointer p-4 border border-gray-100 rounded-xl hover:border-[#FF6B2C]/30 hover:shadow-lg hover:bg-gradient-to-br hover:from-[#FF6B2C]/5 transition-all duration-200 hover:scale-[1.02] h-full flex flex-col"
//                             onClick={() => {
//                               const el = formatRefs.current[item.id];
//                               if (el) {
//                                 el.scrollIntoView({ behavior: 'smooth' });
//                               }
//                               setOpenDropdown(null);
//                             }}
//                           >
//                             <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#FF6B2C]/10 to-[#FF8C42]/10 group-hover:from-[#FF6B2C] group-hover:to-[#FF8C42] rounded-xl flex items-center justify-center mb-3">
//                               <svg
//                                 className="w-5 h-5 text-[#FF6B2C] group-hover:text-white"
//                                 fill="none"
//                                 stroke="currentColor"
//                                 viewBox="0 0 24 24"
//                               >
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
//                               </svg>
//                             </div>
//                             <div className="flex items-center justify-between mb-1">
//                               <h3 className="font-semibold text-sm text-gray-800 group-hover:text-[#FF6B2C]">
//                                 {item.name}
//                               </h3>
//                             </div>
//                             <p className="text-xs text-gray-500 line-clamp-2">
//                               {details?.description}
//                             </p>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Display Dropdown */}
//             {
//               filterType !== 'video' && (<div
//                 className="relative"
//                 onMouseEnter={() => setOpenDropdown('display')}
//                 onMouseLeave={() => setOpenDropdown(null)}
//               >
//                 <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-[#FF6B2C]/10 hover:border-[#FF6B2C]/30 transition-all">
//                   <Monitor className="w-4 h-4" />
//                   Display
//                   <ChevronDown className="w-4 h-4" />
//                 </button>

//                 {openDropdown === 'display' && (
//                   <div className="fixed top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 w-screen max-w-6xl bg-white rounded-2xl shadow-2xl border border-gray-200 px-6 py-8 z-[100]">
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                       {allFormats.filter(f => displayFormatIds.includes(f.id)).map((format) => {
//                         const details = formatDetails[format.id];
//                         return (
//                           <div
//                             key={`display-${format.id}`}
//                             className="group cursor-pointer p-4 border border-gray-100 rounded-xl hover:border-[#FF6B2C]/30 hover:shadow-lg hover:bg-gradient-to-br hover:from-[#FF6B2C]/5 transition-all duration-200 hover:scale-[1.02] h-full flex flex-col"
//                             onClick={() => {
//                               const element = formatRefs.current[format.id];
//                               console.log('Scrolling to format:', format.id, element);
//                               if (element) {
//                                 element.scrollIntoView({ behavior: 'smooth' });
//                               }
//                               setOpenDropdown(null);
//                             }}
//                           >
//                             <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#FF6B2C]/10 to-[#FF8C42]/10 group-hover:from-[#FF6B2C] group-hover:to-[#FF8C42] rounded-xl flex items-center justify-center mb-3 transition-all">
//                               <Zap className="w-5 h-5 text-[#FF6B2C] group-hover:text-white transition-colors" />
//                             </div>
//                             <div className="flex-1 flex flex-col">
//                               <h3 className="font-semibold text-sm text-gray-800 group-hover:text-[#FF6B2C] mb-1 leading-tight">
//                                 {details?.title || format.name}
//                               </h3>
//                               <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 flex-1">
//                                 {details?.description || format.description}
//                               </p>
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 )}
//               </div>)
//             }


//             {/* Video Dropdown */}
//             {
//               filterType !== 'display' && (<div
//                 className="relative"
//                 onMouseEnter={() => setOpenDropdown('video')}
//                 onMouseLeave={() => setOpenDropdown(null)}
//               >
//                 <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-[#FF6B2C]/10 hover:border-[#FF6B2C]/30 transition-all">
//                   <Video className="w-4 h-4" />
//                   Video
//                   <ChevronDown className="w-4 h-4" />
//                 </button>

//                 {openDropdown === 'video' && (
//                   <div className="fixed top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 w-screen max-w-6xl bg-white rounded-2xl shadow-2xl border border-gray-200 px-6 py-8 z-[100]">
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                       {allFormats.filter(f => videoFormatIds.includes(f.id)).map((format) => {
//                         const details = formatDetails[format.id];
//                         return (
//                           <div
//                             key={`video-${format.id}`}
//                             className="group cursor-pointer p-4 border border-gray-100 rounded-xl hover:border-[#FF6B2C]/30 hover:shadow-lg hover:bg-gradient-to-br hover:from-[#FF6B2C]/5 transition-all duration-200 hover:scale-[1.02] h-full flex flex-col"
//                             onClick={() => {
//                               const element = formatRefs.current[format.id];
//                               console.log('Scrolling to format:', format.id, element);

//                               if (element) {
//                                 element.scrollIntoView({ behavior: 'smooth' });
//                               }
//                               setOpenDropdown(null);
//                             }}
//                           >
//                             <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#FF6B2C]/10 to-[#FF8C42]/10 group-hover:from-[#FF6B2C] group-hover:to-[#FF8C42] rounded-xl flex items-center justify-center mb-3 transition-all">
//                               <Play className="w-5 h-5 text-[#FF6B2C] group-hover:text-white transition-colors" />
//                             </div>
//                             <div className="flex-1 flex flex-col">
//                               <h3 className="font-semibold text-sm text-gray-800 group-hover:text-[#FF6B2C] mb-1 leading-tight">
//                                 {details?.title || format.name}
//                               </h3>
//                               <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 flex-1">
//                                 {details?.description || format.description}
//                               </p>
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 )}
//               </div>)
//             }

//           </div>

//           {/* Mobile Menu Toggle */}
//           <button
//             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//             className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
//           >
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               {mobileMenuOpen ? (
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               ) : (
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//               )}
//             </svg>
//           </button>

//           {/* Mobile Menu Overlay */}
//           {mobileMenuOpen && (
//             <div className="lg:hidden fixed inset-0 top-[57px] bg-white z-40 overflow-y-auto">
//               <div className="p-6 space-y-6">
//                 {/* Flagship Products Section */}
//                 <div>
//                   <div className="flex items-center gap-2 mb-4">
//                     <Sparkles className="w-5 h-5 text-[#FF6B2C]" />
//                     <h3 className="text-lg font-bold text-gray-900">Flagship Products</h3>
//                   </div>
//                   <div className="space-y-2">
//                     {(['video', 'display', 'app'] as const).flatMap((groupKey) =>
//                       flagshipProducts[groupKey].items.map((item) => {
//                         const format = flagshipBaseFormats(item.id);
//                         if (!format) return null;
//                         const details = formatDetails[item.id];
//                         return (
//                           <button
//                             key={`mobile-flagship-${groupKey}-${item.id}`}
//                             onClick={() => {
//                               const element = formatRefs.current[item.id];
//                               if (element) {
//                                 element.scrollIntoView({ behavior: 'smooth' });
//                               }
//                               setMobileMenuOpen(false);
//                             }}
//                             className="w-full text-left p-3 rounded-lg hover:bg-[#FF6B2C]/10 transition-colors"
//                           >
//                             <div className="font-semibold text-gray-900">{item.name}</div>
//                             <div className="text-xs text-gray-500 line-clamp-1">{details?.description}</div>
//                           </button>
//                         );
//                       })
//                     )}
//                   </div>
//                 </div>

//                 {/* Display Section */}
//                 <div>
//                   <div className="flex items-center gap-2 mb-4">
//                     <Monitor className="w-5 h-5 text-[#FF6B2C]" />
//                     <h3 className="text-lg font-bold text-gray-900">Display</h3>
//                   </div>
//                   <div className="space-y-2">
//                     {allFormats.filter(f => displayFormatIds.includes(f.id)).map((format) => {
//                       const details = formatDetails[format.id];
//                       return (
//                         <button
//                           key={`mobile-display-${format.id}`}
//                           onClick={() => {
//                             const element = formatRefs.current[format.id];
//                             if (element) {
//                               element.scrollIntoView({ behavior: 'smooth' });
//                             }
//                             setMobileMenuOpen(false);
//                           }}
//                           className="w-full text-left p-3 rounded-lg hover:bg-[#FF6B2C]/10 transition-colors"
//                         >
//                           <div className="font-semibold text-gray-900">{details?.title || format.name}</div>
//                           <div className="text-xs text-gray-500 line-clamp-1">{details?.description}</div>
//                         </button>
//                       );
//                     })}
//                   </div>
//                 </div>

//                 {/* Video Section */}
//                 <div>
//                   <div className="flex items-center gap-2 mb-4">
//                     <Video className="w-5 h-5 text-[#FF6B2C]" />
//                     <h3 className="text-lg font-bold text-gray-900">Video</h3>
//                   </div>
//                   <div className="space-y-2">
//                     {allFormats.filter(f => videoFormatIds.includes(f.id)).map((format) => {
//                       const details = formatDetails[format.id];
//                       return (
//                         <button
//                           key={`mobile-video-${format.id}`}
//                           onClick={() => {
//                             const element = formatRefs.current[format.id];
//                             if (element) {
//                               element.scrollIntoView({ behavior: 'smooth' });
//                             }
//                             setMobileMenuOpen(false);
//                           }}
//                           className="w-full text-left p-3 rounded-lg hover:bg-[#FF6B2C]/10 transition-colors"
//                         >
//                           <div className="font-semibold text-gray-900">{details?.title || format.name}</div>
//                           <div className="text-xs text-gray-500 line-clamp-1">{details?.description}</div>
//                         </button>
//                       );
//                     })}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div
//       ref={containerRef}
//       className="min-h-screen bg-white snap-y snap-mandatory overflow-y-scroll h-screen"
//       style={{ overflowX: 'hidden' }}
//     >
//       {/* HERO SECTION */}
//       <section
//         ref={heroRef}
//         className="relative h-screen flex items-center justify-center overflow-hidden snap-start"
//         style={{
//           width: '100%',
//           height: '100vh',
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           background: 'linear-gradient(135deg, #120F0D, #1a1816)',
//           position: 'relative',
//           overflow: 'hidden',
//           backgroundImage:
//             'linear-gradient(142deg, rgb(104, 43, 0) 0%, rgb(15, 14, 14) 25%, rgb(15, 14, 14) 75%, rgb(104, 43, 0) 100%)',
//         }}
//       >
//         <div className="absolute inset-0" />

//         <div className="absolute inset-0 opacity-100 mix-blend-soft-light">
//           <SilkOrangeBackground
//             speed={0.9}
//             grain={0.06}
//             light="#FF7A2F"
//             dark="#120F0D"
//             className="absolute inset-0"
//           />
//         </div>

//         <div className="absolute inset-0 overflow-hidden pointer-events-none">
//           <div className="absolute top-20 left-10 w-32 h-32 bg-transparent rounded-full blur-3xl animate-float"></div>
//           <div
//             className="absolute bottom-20 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-float"
//             style={{ animationDelay: '1s' }}
//           ></div>
//           <div
//             className="absolute top-1/2 left-1/3 w-24 h-24 bg-white/10 rounded-full blur-3xl animate-float"
//             style={{ animationDelay: '2s' }}
//           ></div>
//         </div>

//         <div className="relative z-10 text-center px-6 max-w-5xl mx-auto pb-32">
//           <div className="mb-8 flex justify-center">
//             <div className="bg-transparent">
//               <img
//                 src="https://assts.tmadsrv.com/logos/Tapmind-Logo-White.png"
//                 className="h-16"
//                 alt="Tapmind"
//               />
//             </div>
//           </div>

//           <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
//             <span
//               className="inline-block animate-[glow_2s_ease-in-out_infinite]"
//               style={{
//                 color: '#fff',
//                 textShadow: `
//                   0 1px 0 #ef5a1f,
//                   0 2px 0 #e4531c,
//                   0 3px 0 #d84d19,
//                   0 4px 0 #cc4616,
//                   0 6px 8px rgba(0,0,0,0.55),
//                   0 10px 22px rgba(0,0,0,0.6)
//                 `,
//                 transform: 'translateZ(0)',
//                 letterSpacing: '0.5px',
//               }}
//             >
//               Creative Ad Gallery
//             </span>
//           </h1>

//           <p className="text-xl md:text-2xl text-white/90 mb-4 font-light leading-relaxed max-w-3xl mx-auto">
//             Experience the future of digital advertising with our innovative ad formats
//           </p>
//           <p className="text-lg text-white/80 mb-12 max-w-2xl mx-auto">
//             Powerful technology that allows you to deliver creative online advertising for any device
//             within minutes
//           </p>

//           <button
//             onClick={scrollToNavigation}
//             className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white/10 text-white font-semibold rounded-full backdrop-blur-md border border-white/25 shadow-lg shadow-[#FF6B2C]/30 hover:bg-white/15 hover:shadow-2xl hover:shadow-[#FF6B2C]/50 transition-all duration-300 transform hover:scale-105 overflow-hidden"
//           >
//             <div className="absolute inset-0 bg-gradient-to-r from-white/25 via-[#FF6B2C]/15 to-white/25 opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
//             <div className="absolute inset-0 rounded-full ring-1 ring-white/30"></div>

//             <Sparkles className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform" />
//             <span className="relative z-10 text-lg">Explore Ad Formats</span>
//             <ChevronDown className="w-5 h-5 relative z-10 animate-bounce" />
//           </button>

//           <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
//             <div className="flex flex-col items-center gap-2 text-white/60">
//               <span className="text-xs uppercase tracking-wider">Scroll to discover</span>
//               <ChevronDown className="w-6 h-6 animate-bounce" />
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* NAVIGATION SECTION */}
//       <section
//         ref={navigationRef}
//         className="min-h-screen snap-start flex items-center justify-center relative overflow-hidden"
//         style={{ background: 'linear-gradient(160deg, #f8f9fb 0%, #ffffff 60%, #f8f9fb 100%)' }}
//       >
//         {/* subtle grid overlay */}
//         <div className="absolute inset-0 opacity-10 pointer-events-none"
//           style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.04) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

//         <div className="container mx-auto px-6 relative z-10 py-16">
//           {/* TOP ROW: LEFT TEXT + RIGHT FILTER TABS */}
//           <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">

//             {/* LEFT: eyebrow + Title + Description */}
//             <div className="text-left max-w-2xl">
//               <span className="text-xs font-bold tracking-widest uppercase text-[#FF6B2C] mb-3 block">Premium Collection</span>
//               <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 leading-tight">
//                 Flagship Products
//               </h2>
//               <p className="text-base text-gray-500 leading-relaxed max-w-md">
//                 High-impact ad units designed for maximum visibility and engagement. Redefining the digital advertising landscape through cinematic motion and native integration.
//               </p>
//             </div>

//             {/* RIGHT: filter tabs + search */}
//             <div className="flex flex-col items-start lg:items-end gap-4">
//               {/* Search */}
//               <div className="relative w-full sm:max-w-[220px]">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search formats..."
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className="w-full pl-10 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-full text-gray-800 placeholder-gray-400 focus:border-[#FF6B2C]/60 focus:outline-none transition-colors"
//                 />
//                 {searchQuery && (
//                   <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">✕</button>
//                 )}
//               </div>

//               {/* Filter tabs */}
//               <div className="flex flex-wrap items-center gap-2 bg-gray-100 border border-gray-200 p-1.5 rounded-full">
//                 <button
//                   onClick={handleFlagshipClick}
//                   className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${showFlagshipGrid ? 'bg-[#FF6B2C] text-white shadow-lg shadow-[#FF6B2C]/30' : 'text-gray-500 hover:text-gray-800'}`}
//                 >
//                   Flagship Products
//                 </button>
//                 <button
//                   onClick={() => { setFilterType('all'); setShowFlagshipGrid(false); }}
//                   className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${filterType === 'all' && !showFlagshipGrid ? 'bg-[#FF6B2C] text-white shadow-lg shadow-[#FF6B2C]/30' : 'text-gray-500 hover:text-gray-800'}`}
//                 >
//                   All Formats
//                 </button>
//                 <button
//                   onClick={() => { setFilterType('display'); setShowFlagshipGrid(false); }}
//                   className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${filterType === 'display' && !showFlagshipGrid ? 'bg-[#FF6B2C] text-white shadow-lg shadow-[#FF6B2C]/30' : 'text-gray-500 hover:text-gray-800'}`}
//                 >
//                   Display
//                 </button>
//                 <button
//                   onClick={() => { setFilterType('video'); setShowFlagshipGrid(false); }}
//                   className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${filterType === 'video' && !showFlagshipGrid ? 'bg-[#FF6B2C] text-white shadow-lg shadow-[#FF6B2C]/30' : 'text-gray-500 hover:text-gray-800'}`}
//                 >
//                   Video
//                 </button>
//               </div>
//             </div>
//           </div>


//           {!showFlagshipGrid && (
//             <>
//               {cardFormats.length === 0 ? (
//                 <div className="text-center py-16">
//                   <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
//                     <Search className="w-12 h-12 text-gray-400" />
//                   </div>
//                   <h3 className="text-2xl font-bold text-gray-900 mb-3">No formats found</h3>
//                   <p className="text-gray-500 mb-6">
//                     {searchQuery ? `No results for "${searchQuery}". Try a different search term.` : `No ${filterType} formats available.`}
//                   </p>
//                   <button
//                     onClick={() => { setFilterType('all'); setSearchQuery(''); }}
//                     className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B2C] text-white rounded-full font-semibold hover:bg-[#FF8C42] transition-all"
//                   >
//                     <Eye className="w-4 h-4" />
//                     Show All Formats
//                   </button>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl mx-auto">
//                   {cardFormats.map((format) => {
//                     const details = formatDetails[format.id];
//                     const hasScrollSection = scrollableFormatIds.includes(format.id);
//                     return (
//                       <div
//                         key={format.id}
//                         onClick={() => { if (hasScrollSection) scrollToFormat(format.id); }}
//                         className={`group relative rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 p-5 ${hasScrollSection ? 'cursor-pointer' : 'cursor-default'} transition-all duration-300 hover:border-[#FF6B2C]/40 hover:shadow-xl hover:shadow-[#FF6B2C]/10 hover:-translate-y-1`}
//                       >
//                         <div className="mb-4">
//                           <div className="w-11 h-11 bg-gray-100 group-hover:bg-[#FF6B2C]/10 rounded-xl flex items-center justify-center transition-all duration-300">
//                             {format.type === 'video' ? (
//                               <Play className="w-5 h-5 text-[#FF6B2C]" />
//                             ) : (
//                               <Zap className="w-5 h-5 text-[#FF6B2C]" />
//                             )}
//                           </div>
//                         </div>
//                         <div className="space-y-1.5">
//                           <div className="flex items-center gap-2">
//                             <h3 className="text-base font-bold text-gray-900 group-hover:text-[#FF6B2C] transition-colors">
//                               {details?.title || format.name}
//                             </h3>
//                             {hasScrollSection && (
//                               <ArrowRight className="w-4 h-4 text-[#FF6B2C] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
//                             )}
//                           </div>
//                           <p className="text-gray-500 line-clamp-2 text-xs leading-relaxed">
//                             {details?.description || format.description}
//                           </p>
//                           <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider text-[#FF6B2C]/80 border border-[#FF6B2C]/20 px-2 py-0.5 rounded-full bg-[#FF6B2C]/5">
//                             {format.category}
//                           </span>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </>
//           )}

//           {showFlagshipGrid && (
//             <div className="mt-4 max-w-6xl mx-auto">
//               {flagshipCardFormats.length === 0 ? (
//                 <div className="text-center py-16">
//                   <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
//                     <Search className="w-12 h-12 text-gray-400" />
//                   </div>
//                   <h3 className="text-2xl font-bold text-gray-900 mb-3">No flagship products found</h3>
//                   <p className="text-gray-500 mb-6">No results for "{searchQuery}". Try a different search term.</p>
//                   <button
//                     onClick={() => setSearchQuery('')}
//                     className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B2C] text-white rounded-full font-semibold hover:bg-[#FF8C42] transition-all"
//                   >
//                     <Sparkles className="w-4 h-4" />
//                     Show All Flagship Products
//                   </button>
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {/* TOP ROW: hero card (left) + 2 side cards (right) */}
//                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//                     {/* Hero card — Hybrid Player */}
//                     {(() => {
//                       const heroItem = flagshipProducts.video.items[0];
//                       const heroFormat = flagshipCardFormats.find(f => f.id === heroItem?.id);
//                       if (!heroFormat || !heroItem) return null;
//                       return (
//                         <div
//                           key={`hero-${heroItem.id}`}
//                           onClick={() => scrollToFormat(heroFormat.id)}
//                           className="lg:col-span-2 group relative rounded-2xl overflow-hidden cursor-pointer min-h-[340px] flex flex-col justify-end"
//                           style={{ background: 'linear-gradient(135deg, #e8edf5 0%, #dde4f0 100%)' }}
//                         >
//                           {/* background image tint */}
//                           <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-10" />
//                           <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent z-10" />
//                           {/* placeholder silhouette bg */}
//                           <div className="absolute inset-0 flex items-center justify-end pr-8 opacity-30">
//                             <div className="w-48 h-64 bg-gradient-to-b from-white/20 to-transparent rounded-full blur-2xl" />
//                           </div>
//                           <div className="relative z-20 p-7">
//                             <div className="flex gap-2 mb-3">
//                               <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FF6B2C] text-white px-2.5 py-1 rounded-full">New Release</span>
//                               <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white/80 px-2.5 py-1 rounded-full border border-white/20">Video</span>
//                             </div>
//                             <h3 className="text-3xl font-extrabold text-white mb-2">{heroItem.name}</h3>
//                             <p className="text-white/60 text-sm mb-5 max-w-xs leading-relaxed">
//                               {formatDetails[heroItem.id]?.description}
//                             </p>
//                             <button
//                               onClick={(e) => { e.stopPropagation(); scrollToFormat(heroFormat.id); }}
//                               className="inline-flex items-center gap-2 bg-[#FF6B2C] hover:bg-[#FF8C42] text-white font-bold px-6 py-3 rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-[#FF6B2C]/40"
//                             >
//                               Explore Format <ArrowRight className="w-4 h-4" />
//                             </button>
//                           </div>
//                         </div>
//                       );
//                     })()}

//                     {/* Right column: Ribbon Player + Slider Ad */}
//                     <div className="flex flex-col gap-4">
//                       {[
//                         { item: flagshipProducts.video.items[1], accent: '#ede9f8', iconBg: '#7c5cbf' },
//                         { item: flagshipProducts.display.items[0], accent: '#e8f0f8', iconBg: '#3a7abf' },
//                       ].map(({ item, accent, iconBg }) => {
//                         if (!item) return null;
//                         const fmt = flagshipCardFormats.find(f => f.id === item.id);
//                         if (!fmt) return null;
//                         return (
//                           <div
//                             key={`side-${item.id}`}
//                             onClick={() => scrollToFormat(fmt.id)}
//                             className="group relative rounded-2xl p-5 cursor-pointer flex-1 transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5"
//                             style={{ background: `linear-gradient(135deg, ${accent} 0%, #f5f7fa 100%)`, border: '1px solid rgba(0,0,0,0.07)' }}
//                           >
//                             <div className="flex items-start justify-between mb-3">
//                               <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: iconBg }}>
//                                 {fmt.type === 'video' ? <Play className="w-4 h-4 text-white" /> : <Zap className="w-4 h-4 text-white" />}
//                               </div>
//                               <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Premium</span>
//                             </div>
//                             <h4 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h4>
//                             <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{formatDetails[item.id]?.description}</p>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </div>

//                   {/* BOTTOM ROW: remaining cards */}
//                   {(() => {
//                     const bottomItems = [
//                       ...flagshipProducts.display.items.slice(1),
//                       ...flagshipProducts.app.items,
//                     ];
//                     const bottomFormats = bottomItems
//                       .map(item => ({ item, fmt: flagshipCardFormats.find(f => f.id === item.id) }))
//                       .filter(x => x.fmt);
//                     if (!bottomFormats.length) return null;
//                     return (
//                       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//                         {bottomFormats.map(({ item, fmt }) => (
//                           <div
//                             key={`bottom-${item.id}`}
//                             onClick={() => scrollToFormat(fmt!.id)}
//                             className="group relative rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5"
//                             style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #eef1f6 100%)', border: '1px solid rgba(0,0,0,0.06)' }}
//                           >
//                             <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#FF6B2C]/10 transition-colors" style={{ background: 'rgba(0,0,0,0.05)' }}>
//                               {fmt!.type === 'video' ? <Play className="w-4 h-4 text-[#FF6B2C]" /> : <Zap className="w-4 h-4 text-[#FF6B2C]" />}
//                             </div>
//                             <h4 className="text-sm font-bold text-gray-900 mb-1">{item.name}</h4>
//                             <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{formatDetails[item.id]?.description}</p>
//                           </div>
//                         ))}
//                       </div>
//                     );
//                   })()}
//                 </div>
//               )}
//             </div>
//           )}
//           <div className="text-center mt-12">
//             <p className="text-sm text-gray-400 mb-3">
//               Or scroll down to explore each format in detail
//             </p>
//             <ChevronDown className="w-6 h-6 text-gray-300 mx-auto animate-bounce" />
//           </div>
//         </div>
//       </section>

//       {/* AD FORMATS SECTION */}
//       <section className="bg-gray-50">
//         {mainFormats.map((format, index) => {
//           const details = formatDetails[format.id];
//           const isEven = index % 2 === 0;

//           return (
//             <div
//               key={format.id}
//               ref={(el) => (formatRefs.current[format.id] = el)}
//               className="min-h-screen flex flex-col justify-start snap-start relative overflow-hidden"
//             >
//               <StickyFormatNav />

//               <div className="absolute inset-0 opacity-5">
//                 <div className="absolute inset-0 bg-[linear-gradient(to_right,#FF6B2C_1px,transparent_1px),linear-gradient(to_bottom,#FF6B2C_1px,transparent_1px)] bg-[size:40px_40px]"></div>
//               </div>

//               <div className="container mx-auto px-6 pt-24 pb-20 relative z-10">
//                 <div
//                   className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
//                     } items-center gap-12 lg:gap-20`}
//                 >
//                   <div className="flex-1 space-y-6">
//                     <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF6B2C]/10 to-[#FF8C42]/10 border border-[#FF6B2C]/30 rounded-full">
//                       <Zap className="w-4 h-4 text-[#FF6B2C]" />
//                       <span className="text-sm font-semibold text-[#FF6B2C] uppercase tracking-wide">
//                         {format.category}
//                       </span>
//                     </div>

//                     <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
//                       {details?.title || format.name}
//                     </h2>

//                     <p className="text-xl text-gray-600 leading-relaxed">
//                       {details?.description || format.description}
//                     </p>

//                     {details?.features && (
//                       <div className="grid grid-cols-2 gap-3 pt-4">
//                         {details.features.map((feature, idx) => (
//                           <div key={idx} className="flex items-center gap-2">
//                             <div className="w-1.5 h-1.5 bg-[#FF6B2C] rounded-full"></div>
//                             <span className="text-sm text-gray-700 font-medium">{feature}</span>
//                           </div>
//                         ))}
//                       </div>
//                     )}

//                     <div className="flex flex-wrap gap-4 pt-6">
//                       {format.id !== REWARDED_FORMAT_ID && (
//                         <button
//                           onClick={() => handleViewLivePreview(format)}
//                           className="group flex items-center gap-3 px-8 py-4 text-white font-semibold text-lg rounded-xl hover:shadow-xl hover:shadow-[#FF8C42]/30 transition-all duration-300 transform hover:scale-105"
//                           style={{ backgroundColor: '#FF8C42' }}
//                         >
//                           <Eye className="w-6 h-6 group-hover:scale-110 transition-transform" />
//                           <span>View Live Preview</span>
//                           <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
//                         </button>
//                       )}
//                     </div>
//                   </div>

//                   <div className="flex-1 w-full max-w-2xl">
//                     <div className="relative group">
//                       <div className="absolute -inset-4 bg-gradient-to-r from-[#FF6B2C]/20 via-[#FF8C42]/20 to-[#FF6B2C]/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

//                       <div className="relative overflow-hidden transition-all duration-500 ease-in-out">
//                         {expandedPreview === format.id && (
//                           <div className="flex flex-col items-center justify-center min-h-[350px] sm:min-h-[450px] md:min-h-[550px] animate-fadeIn">
//                             <div className="flex items-center justify-center flex-1 w-full relative">
//                               {formatVideos[format.id] ? (
//                                 <>
//                                   {/* Rewarded Ad - iPhone Only (Bigger) */}
//                                   {format.id === 'rewarded-ad' ? (
//                                     <div className="flex justify-center items-center w-full">
//                                       <div className="w-[180px] sm:w-[220px] md:w-[260px] lg:w-[300px]">
//                                         <IphoneMockup
//                                           video={formatMobileVideos[format.id] ?? formatVideos[format.id]}
//                                         />
//                                       </div>
//                                     </div>
//                                   ) : (
//                                     <>
//                                       {/* Regular formats - MacBook + iPhone */}
//                                       <div className="flex lg:hidden flex-row items-end justify-center gap-2 sm:gap-4 w-full">
//                                         <div className="flex-shrink-0 flex justify-center items-end">
//                                           <div className="w-[200px] sm:w-[300px] md:w-[450px]">
//                                             <MacbookMockup video={formatVideos[format.id]} />
//                                           </div>
//                                         </div>
//                                         <div
//                                           className="flex-shrink-0 flex items-end"
//                                           style={{ marginBottom: '-20px' }}
//                                         >
//                                           <div className="w-[50px] sm:w-[60px] md:w-[70px]">
//                                             <IphoneMockup
//                                               video={
//                                                 formatMobileVideos[format.id] ?? formatVideos[format.id]
//                                               }
//                                             />
//                                           </div>
//                                         </div>
//                                       </div>

//                                       <div className="hidden lg:flex flex-row items-stretch justify-center gap-6 w-full">
//                                         <div className="w-4/5 flex justify-center items-center">
//                                           <div className="w-full max-w-[1100px]">
//                                             <MacbookMockup video={formatVideos[format.id]} />
//                                           </div>
//                                         </div>
//                                         <div
//                                           className="w-1/5 flex items-center"
//                                           style={{ marginLeft: '-25px', marginBottom: '-65px' }}
//                                         >
//                                           <div className="w-full max-w-[90px]">
//                                             <IphoneMockup
//                                               video={
//                                                 formatMobileVideos[format.id] ?? formatVideos[format.id]
//                                               }
//                                             />
//                                           </div>
//                                         </div>
//                                       </div>
//                                     </>
//                                   )}
//                                 </>
//                               ) : (
//                                 <div className="w-full h-auto max-w-2xl aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
//                                   <div className="text-center space-y-3">
//                                     <Play className="w-20 h-20 text-gray-300 mx-auto animate-pulse" />
//                                     <p className="text-gray-500 font-medium text-lg">
//                                       Preview for {format.name}
//                                     </p>
//                                     <p className="text-sm text-gray-400">Video coming soon</p>
//                                   </div>
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         )}

//                         {expandedPreview !== format.id && (
//                           <>
//                             <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200 shadow-lg z-10">
//                               <span className="text-xs font-bold text-[#FF6B2C]">
//                                 {format.type.toUpperCase()}
//                               </span>
//                             </div>

//                             <div className="relative w-full h-[420px] md:h-[480px] rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex flex-col justify-end">
//                               <div className="absolute inset-0 flex items-start justify-center pt-8 pb-32 pointer-events-none">
//                                 <img
//                                   src={hiddenPreviewImages[format.id] ?? INTImg}
//                                   alt="Ad format preview"
//                                   className="w-auto max-w-[80%] max-h-[80%] object-contain"
//                                   draggable={false}
//                                 />
//                               </div>

//                               <div className="relative z-10 p-6 text-center space-y-4 bg-gradient-to-t from-white/90 via-white/60 to-transparent">
//                                 <Play className="w-12 h-12 text-gray-400 mx-auto" />
//                                 <p className="text-gray-700 font-semibold text-lg">
//                                   {format.name} Preview
//                                 </p>
//                                 <button
//                                   onClick={() => setExpandedPreview(format.id)}
//                                   className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF6B2C] to-[#FF8C42] text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-[#FF6B2C]/30 transition-all transform hover:scale-105"
//                                 >
//                                   <ChevronDown className="w-5 h-5" />
//                                   Show Preview
//                                 </button>
//                               </div>
//                             </div>
//                           </>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {(index < mainFormats.length - 1) && (
//                 <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF6B2C]/20 to-transparent"></div>
//               )}
//             </div>
//           );
//         })}
//       </section>

//       {/* FOOTER */}
//       <footer className="snap-start bg-gray-900 text-white py-12">
//         <div className="container mx-auto px-6 text-center">
//           <div className="mb-6">
//             <img
//               src="https://assts.tmadsrv.com/logos/Tapmind-Logo-White.png"
//               className="h-8 mx-auto mb-4"
//               alt="Tapmind"
//             />
//           </div>
//           <p className="text-white text-sm mb-2" style={{ color: '#ffffff' }}>© 2025 Tapmind. All rights reserved.</p>
//           <p className="text-gray-400 text-xs" style={{ color: '#9ca3af' }}>Creative Ad Gallery</p>
//         </div>
//       </footer>

//       {selectedFormat && (
//         <PreviewModal format={selectedFormat} onClose={() => setSelectedFormat(null)} />
//       )}

//       {showDesktopOnlyModal && !isDesktop && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
//           <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center transform transition-all">
//             <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-2xl mb-6">
//               <Monitor className="w-10 h-10 text-blue-600" />
//             </div>

//             <h2 className="text-2xl font-bold text-gray-900 mb-4">
//               Desktop and Larger Screens Only
//             </h2>

//             <p className="text-gray-600 leading-relaxed mb-8">
//               This app is best experienced on a desktop. Please open it on a larger screen for full
//               functionality and the best user experience.
//             </p>
//           </div>
//         </div>
//       )}

//       <button
//         onClick={scrollToTop}
//         className={`fixed bottom-8 right-8 z-50 group p-4 bg-gradient-to-r from-[#FF6B2C] to-[#FF8C42] text-white rounded-full shadow-2xl hover:shadow-[#FF6B2C]/50 transition-all duration-300 transform hover:scale-110 ${showScrollTop && !selectedFormat
//           ? 'opacity-100 translate-y-0'
//           : 'opacity-0 translate-y-16 pointer-events-none'
//           } ${selectedFormat ? 'lg:opacity-100 lg:translate-y-0 lg:pointer-events-auto' : ''}`}
//         aria-label="Back to top"
//       >
//         <svg
//           className="w-6 h-6 transform group-hover:-translate-y-1 transition-transform"
//           fill="none"
//           stroke="currentColor"
//           viewBox="0 0 24 24"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth={2.5}
//             d="M5 10l7-7m0 0l7 7m-7-7v18"
//           />
//         </svg>
//         <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-0 group-hover:opacity-100"></div>
//       </button>
//     </div>
//   );
// }

// export default App;