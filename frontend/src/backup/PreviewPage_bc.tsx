import React, { useEffect, useState,useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DeviceFrame } from './DeviceFrame';
import { AdPreview } from './AdPreview';
import { adFormats, adSizes, deviceTypes } from '../data/adFormats';
import { AdFormat, AdSize, DeviceType } from '../types/AdFormat';
import { X, RefreshCw, ExternalLink, AlertTriangle, Monitor } from 'lucide-react';

export const PreviewPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [format, setFormat] = useState<AdFormat | null>(null);
  const [size, setSize] = useState<AdSize | null>(null);
  const [device, setDevice] = useState<DeviceType | null>(null);
  const [siteUrl, setSiteUrl] = useState<string>('');
  const [tagScript, setTagScript] = useState<string>('');
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
    const [loadTime, setLoadTime] = useState(Date.now());

  useEffect(() => {
    const formatId = searchParams.get('format');
    const sizeParam = searchParams.get('size');
    const deviceId = searchParams.get('device');
    const url = searchParams.get('url');
    setTagScript(decodeURIComponent(searchParams.get('tag') || ''));
    const encodedAdTag = encodeURIComponent(searchParams.get('tag') || '');
    const urlParam = decodeURIComponent(searchParams.get('url') || '');
    setPreviewUrl(`/api/preview?url=${urlParam}&adTag=${encodedAdTag}`);
    //setPreviewUrl(`/api/preview?url=${urlParam}&adTag=${encodedAdTag}`);
    console.log('Preview URL:', previewUrl,urlParam,encodedAdTag);

    if (formatId) {
      const foundFormat = adFormats.find(f => f.id === formatId);
      setFormat(foundFormat || null);
    }

    if (sizeParam) {
      const [width, height] = sizeParam.split('x').map(Number);
      const foundSize = adSizes.find(s => s.width === width && s.height === height);
      setSize(foundSize || null);
    }

    if (deviceId) {
      const foundDevice = deviceTypes.find(d => d.id === deviceId);
      setDevice(foundDevice || null);
    }

    if (url) {
      setSiteUrl(decodeURIComponent(url));
    }
  }, [searchParams]);



  const handleRefresh = () => {
    setIframeLoaded(false);
    setIframeError(false);
    setShowFallback(false);
    console.log('Page refreshed, reloading iframe');
    const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

const iframeRef = useRef<HTMLIFrameElement>(null);

const handleIframeLoad = () => {
      setIframeError(false);
    setIframeLoaded(true);
    console.log(siteUrl, 'iframe loaded successfully');
    console.log('siteLoaded Time', Date.now() - loadTime, 'ms');
  // try {
  //   const iframe = iframeRef.current;
  //   if (!iframe) return;

  //   const doc = iframe.contentDocument || iframe.contentWindow?.document;

  //   if (doc && tagScript) {
  //     const wrapper = doc.createElement("div");
  //     wrapper.id = "ad-tag-wrapper-prashant";
  //     wrapper.innerHTML = tagScript;

  //     doc.body.appendChild(wrapper);
  //     console.log("Ad tag script injected successfully");
  //   }
  // } catch (err) {
  //   console.error("Error injecting tag script into iframe:", err);
  // }
};


  const handleIframeError = () => {
    console.log('Error loading iframe, showing fallback content');
    setIframeError(true);
    setIframeLoaded(true);
    // Show fallback immediately for better UX
    setShowFallback(true);
  };

  // Enhanced fallback content that simulates a realistic website
  const renderFallbackContent = () => (
    <div className="w-full h-full bg-white overflow-y-auto">
      {/* Simulated Website Header */}
      <header className="bg-red-600 text-white p-4 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-3xl font-bold">CNN</h1>
            <nav className="hidden md:flex gap-8">
              <a href="#" className="hover:underline font-medium">World</a>
              <a href="#" className="hover:underline font-medium">Politics</a>
              <a href="#" className="hover:underline font-medium">Business</a>
              <a href="#" className="hover:underline font-medium">Tech</a>
              <a href="#" className="hover:underline font-medium">Sports</a>
              <a href="#" className="hover:underline font-medium">Entertainment</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-red-700 px-3 py-1 rounded text-sm font-bold">LIVE</div>
            <div className="text-sm">Breaking News</div>
          </div>
        </div>
      </header>

      {/* Breaking News Banner */}
      <div className="bg-yellow-400 text-black p-2 text-center font-bold">
        🚨 BREAKING: Major Technology Breakthrough Announced - Live Updates
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - 3 columns */}
          <div className="lg:col-span-3">
            {/* Hero Article */}
            <article className="mb-10">
              <div className="mb-4">
                <span className="bg-red-600 text-white px-3 py-1 rounded text-sm font-bold">TECHNOLOGY</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Revolutionary AI Breakthrough Changes Everything We Know About Computing
              </h1>
              <div className="flex items-center gap-6 text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <img src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=40&h=40"
                    alt="Author" className="w-8 h-8 rounded-full object-cover" />
                  <span className="font-medium">Sarah Johnson</span>
                </div>
                <span>•</span>
                <span>Published 2 hours ago</span>
                <span>•</span>
                <span>Updated 30 minutes ago</span>
              </div>

              <img
                src="https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600"
                alt="Technology breakthrough"
                className="w-full h-80 object-cover rounded-xl mb-8 shadow-lg"
              />

              <div className="prose prose-lg max-w-none">
                <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                  In a groundbreaking announcement that has sent shockwaves through the technology industry,
                  researchers at leading institutions have unveiled an artificial intelligence system that
                  demonstrates unprecedented capabilities in problem-solving and creative thinking.
                </p>

                <p className="text-gray-700 mb-6 leading-relaxed">
                  The breakthrough, developed over five years of intensive research and testing, represents
                  what many experts are calling the most significant advancement in artificial intelligence
                  since the development of neural networks. The system has demonstrated the ability to
                  understand complex problems, generate innovative solutions, and even exhibit forms of
                  creative reasoning previously thought impossible for machines.
                </p>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-8 rounded-r-lg">
                  <p className="text-lg italic text-blue-900">
                    "This technology will fundamentally change how we approach problem-solving in every
                    sector imaginable. We're not just looking at incremental improvements – this is a
                    paradigm shift that will reshape entire industries."
                  </p>
                  <p className="text-blue-700 font-medium mt-2">
                    — Dr. Michael Chen, Lead AI Researcher
                  </p>
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed">
                  The implications of this breakthrough extend far beyond the technology sector. Healthcare
                  professionals are already exploring applications for drug discovery and personalized
                  treatment plans. Educational institutions see potential for revolutionary learning systems
                  that adapt to individual student needs in real-time.
                </p>

                <p className="text-gray-700 mb-6 leading-relaxed">
                  Financial markets have responded enthusiastically to the news, with technology stocks
                  experiencing significant gains. Major corporations including Google, Microsoft, and Apple
                  have reportedly expressed interest in licensing the technology for integration into their
                  existing products and services.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-bold text-lg mb-3 text-gray-900">Key Applications</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Advanced medical diagnostics</li>
                      <li>• Personalized education systems</li>
                      <li>• Climate change solutions</li>
                      <li>• Financial market analysis</li>
                      <li>• Creative content generation</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="font-bold text-lg mb-3 text-gray-900">Market Impact</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• $2.5 trillion market potential</li>
                      <li>• 50+ million new jobs projected</li>
                      <li>• 300% efficiency improvements</li>
                      <li>• Global productivity boost</li>
                      <li>• Innovation acceleration</li>
                    </ul>
                  </div>
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed">
                  The research team, led by Dr. Sarah Johnson at the Institute for Advanced Computing,
                  has been working in collaboration with universities and research institutions worldwide.
                  Their approach combines cutting-edge neural network architectures with novel training
                  methodologies that allow the system to learn and adapt in ways previously thought impossible.
                </p>

                <p className="text-gray-700 mb-6 leading-relaxed">
                  Industry analysts predict that commercial applications of this technology could become
                  available within the next 18-24 months, with early adopters likely to gain significant
                  competitive advantages. The technology promises to democratize access to advanced
                  problem-solving capabilities, potentially leveling the playing field for smaller
                  companies and startups.
                </p>
              </div>
            </article>

            {/* Related Articles Grid */}
            <section className="border-t-2 border-gray-200 pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Stories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    title: "Tech Giants Race to Adopt New AI Technology",
                    image: "https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=500&h=300",
                    excerpt: "Major technology companies are investing billions to integrate the breakthrough AI system..."
                  },
                  {
                    title: "Healthcare Revolution: AI Diagnoses Rare Diseases",
                    image: "https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&cs=tinysrgb&w=500&h=300",
                    excerpt: "Medical professionals report unprecedented accuracy in diagnosing complex conditions..."
                  },
                  {
                    title: "Education Transformed by Intelligent Learning Systems",
                    image: "https://images.pexels.com/photos/3861943/pexels-photo-3861943.jpeg?auto=compress&cs=tinysrgb&w=500&h=300",
                    excerpt: "Students worldwide benefit from personalized AI tutoring systems that adapt in real-time..."
                  },
                  {
                    title: "Climate Solutions Accelerated by AI Innovation",
                    image: "https://images.pexels.com/photos/3861976/pexels-photo-3861976.jpeg?auto=compress&cs=tinysrgb&w=500&h=300",
                    excerpt: "Environmental scientists use AI to develop breakthrough solutions for climate change..."
                  }
                ].map((article, index) => (
                  <article key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <h3 className="font-bold text-lg text-gray-900 mb-3 hover:text-blue-600 cursor-pointer">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{article.excerpt}</p>
                    <div className="mt-4 text-blue-600 text-sm font-medium hover:underline cursor-pointer">
                      Read more →
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar - 1 column */}
          <aside className="space-y-8">
            {/* Trending Stories */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="font-bold text-xl text-gray-900 mb-6">Trending Now</h3>
              <div className="space-y-4">
                {[
                  "Global Markets Surge on AI News",
                  "Climate Summit Reaches Historic Agreement",
                  "Space Mission Discovers New Planets",
                  "Olympic Games Break Viewership Records",
                  "Renewable Energy Costs Hit New Low"
                ].map((headline, index) => (
                  <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-200 last:border-b-0">
                    <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                      {index + 1}
                    </div>
                    <a href="#" className="text-gray-900 hover:text-blue-600 font-medium text-sm leading-relaxed">
                      {headline}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-6 rounded-xl text-white">
              <h3 className="font-bold text-xl mb-3">Stay Informed</h3>
              <p className="text-blue-100 mb-4 text-sm">
                Get breaking news and exclusive analysis delivered to your inbox
              </p>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full p-3 rounded-lg text-gray-900 mb-3 text-sm"
              />
              <button className="w-full bg-white text-blue-600 p-3 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors">
                Subscribe Now
              </button>
            </div>

            {/* Weather Widget */}
            <div className="bg-gradient-to-br from-cyan-400 to-blue-500 p-6 rounded-xl text-white">
              <h3 className="font-bold text-lg mb-3">Weather</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">72°F</div>
                  <div className="text-cyan-100 text-sm">Partly Cloudy</div>
                </div>
                <div className="text-4xl">⛅</div>
              </div>
            </div>

            {/* Stock Ticker */}
            <div className="bg-gray-900 p-6 rounded-xl text-white">
              <h3 className="font-bold text-lg mb-4">Markets</h3>
              <div className="space-y-3">
                {[
                  { symbol: "AAPL", price: "$175.43", change: "+2.34%" },
                  { symbol: "GOOGL", price: "$142.56", change: "+5.67%" },
                  { symbol: "MSFT", price: "$378.92", change: "+3.21%" },
                  { symbol: "TSLA", price: "$248.73", change: "+8.45%" }
                ].map((stock, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium">{stock.symbol}</span>
                    <div className="text-right">
                      <div className="font-bold">{stock.price}</div>
                      <div className="text-green-400 text-xs">{stock.change}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold mb-4">CNN</h2>
              <p className="text-gray-400 mb-4">
                The most trusted name in news. Delivering breaking news, analysis,
                and comprehensive coverage from around the world.
              </p>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">f</div>
                <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">t</div>
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">y</div>
                <div className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center">in</div>
              </div>
            </div>
            {[
              {
                title: "News",
                links: ["World", "Politics", "Business", "Tech", "Health", "Sports"]
              },
              {
                title: "Opinion",
                links: ["Editorials", "Op-Eds", "Letters", "Columnists"]
              },
              {
                title: "More",
                links: ["Weather", "Markets", "Travel", "Food", "Style"]
              }
            ].map((section, index) => (
              <div key={index}>
                <h4 className="font-bold text-lg mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 Cable News Network. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
console.log('Preview URL:', format, size, device);
  if (!format || !size || !device) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading preview...</p>
        </div>
      </div>
    );
  }

  return (
    // <div>
    //   {previewUrl && (
    //     <div style={{ marginTop: "20px" }}>
    //       <iframe
    //         src={previewUrl}
    //         width="100%"
    //         height="100%"
    //         title="Ad Preview"
    //         style={{ border: "1px solid #ccc" }}
    //       />
    //     </div>
    //   )}
    // </div>
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Compact Header Controls */}
      <div className="bg-gray-800 shadow-xl border-b border-gray-700 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Monitor className="w-5 h-5 text-blue-400" />
            <h1 className="text-lg font-bold text-white">Live Ad Preview</h1>
            <div className="flex items-center gap-2 text-sm">
              <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-1 rounded font-medium">
                {format.name}
              </span>
              <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded font-medium">
                {size.width}×{size.height}
              </span>
              <span className="bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-1 rounded font-medium">
                {device.name}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
            <a
              href={siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors border border-gray-600 text-sm"
            >
              <ExternalLink className="w-3 h-3" />
              Open Site
            </a>
            <button
              onClick={() => window.close()}
              className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
            >
              <X className="w-3 h-3" />
              Close
            </button>
          </div>
        </div>

        {/* URL Display */}
        <div className="mt-2 p-2 bg-gray-700/50 rounded border border-gray-600">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">Loading:</span>
            <span className="text-white font-mono break-all">{siteUrl}</span>
            {iframeError && (
              <div className="flex items-center gap-1 text-yellow-400">
                <AlertTriangle className="w-3 h-3" />
                <span>Using fallback content</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full-Screen Preview Container */}
      <div className="flex-1 flex justify-center items-center py-4 ">
        {device.id === 'desktop' ? (
          // Full-screen desktop view
          <div className="w-full h-full relative bg-white rounded-lg overflow-hidden shadow-2xl border border-gray-700">
            {/* Website Content */}
            {!showFallback ? (
              <>
                  <iframe
                id="preview-iframe"
                src={previewUrl}
                className="w-full h-full border-none"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                title="Website Preview"
                // sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
              />
               {/* {(iframeLoaded || showFallback) && (
              <AdPreview 
                format={format} 
                size={size} 
                position={getAdPosition()}
                adTagContent={tagScript} 
              />
            )} */}
              </>


            ) : (
              renderFallbackContent()
            )}

            {/* Loading Overlay */}
            {!iframeLoaded && !showFallback && (
              <div className="absolute inset-0 flex items-center justify-center bg-white">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">Loading website...</p>
                  <p className="text-sm text-gray-500 mt-1">This may take a few moments</p>
                </div>
              </div>
            )}

            {/* Ad Preview Overlay */}

          </div>
        ) : (
          // Mobile/Tablet with device frame
          <DeviceFrame device={device}>
            <div className="w-full h-full relative bg-white">
              {!showFallback ? (<>
                   <iframe
                  id="preview-iframe"
                  src={previewUrl}
                  className="w-full h-full border-none"
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                  title="Website Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                />
                     {/* {(iframeLoaded || showFallback) && (
                <AdPreview 
                  format={format} 
                  size={size} 
                  position={getAdPosition()} 
                  adTagContent={tagScript}
                />
              )} */}
              </>

              ) : (
                renderFallbackContent()
              )}

              {!iframeLoaded && !showFallback && (
                <div className="absolute inset-0 flex items-center justify-center bg-white">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
                    <p className="text-gray-600 text-sm">Loading...</p>
                  </div>
                </div>
              )}


            </div>
          </DeviceFrame>
        )}
      </div>
    </div>
  );
};