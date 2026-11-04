import React, { useState } from 'react';
import { AdFormatCard } from './components/AdFormatCard';
import { PreviewModal } from './components/PreviewModal';
import { adFormats } from './data/adFormats';
import { AdFormat } from './types/AdFormat';
import { Play, Monitor, Search, Menu, X, Grid, Video } from 'lucide-react';

function App() {
  const [selectedFormat, setSelectedFormat] = useState<AdFormat | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'display' | 'video'>('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const filteredFormats = adFormats.filter(format => {
    const matchesSearch = format.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         format.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || format.type === selectedType;
    return matchesSearch && matchesType;
  });

  const displayFormats = filteredFormats.filter(f => f.type === 'display');
  const videoFormats = filteredFormats.filter(f => f.type === 'video');

  const getFilterCount = (type: 'all' | 'display' | 'video') => {
    if (type === 'all') return adFormats.length;
    return adFormats.filter(f => f.type === type).length;
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      
      {/* Sidebar - Fixed */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col shadow-sm ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Sidebar Header - Fixed */}
        <div className="flex-shrink-0 px-5 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5">
                <img 
                  src="https://assts.tmadsrv.com/logos/Tapmind-Logo-dark.png" 
                  className="w-28"
                  alt="Tapmind"
                />
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-500 lg:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search formats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#FF6B2C] focus:border-[#FF6B2C] text-gray-700 placeholder-gray-400 transition-all text-sm"
            />
          </div>
        </div>

        {/* Filter Section - Scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Categories</h3>
          
          <div className="space-y-1.5">
            {/* ALL */}
            <button
              onClick={() => setSelectedType('all')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-sm ${
                selectedType === 'all'
                  ? 'bg-gradient-to-r from-[#FF6B2C] to-[#FF8C42] text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Grid className="w-4 h-4" />
                <span className="font-medium">All Formats</span>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                selectedType === 'all'
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {getFilterCount('all')}
              </span>
            </button>

            {/* DISPLAY */}
            <button
              onClick={() => setSelectedType('display')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-sm ${
                selectedType === 'display'
                  ? 'bg-gradient-to-r from-[#FF6B2C] to-[#FF8C42] text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Monitor className="w-4 h-4" />
                <span className="font-medium">Display</span>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                selectedType === 'display'
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {getFilterCount('display')}
              </span>
            </button>

            {/* VIDEO */}
            <button
              onClick={() => setSelectedType('video')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-sm ${
                selectedType === 'video'
                  ? 'bg-gradient-to-r from-[#FF6B2C] to-[#FF8C42] text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Video className="w-4 h-4" />
                <span className="font-medium">Video</span>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                selectedType === 'video'
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {getFilterCount('video')}
              </span>
            </button>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">© 2025 Tapmind</p>
          <p className="text-xs text-gray-400 mt-0.5">Creative Studio</p>
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content - Fixed with internal scroll */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'} h-screen`}>
        
        {/* Header - Fixed */}
        <header className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  TapMind Creative Ad Gallery
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Explore interactive ad formats
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-gray-100 border border-gray-200 px-4 py-2 rounded-lg">
                <span className="text-sm font-semibold text-gray-700">
                  {filteredFormats.length} {filteredFormats.length === 1 ? 'Format' : 'Formats'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content - Scrollable */}
        <main className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">

            {/* DISPLAY SECTION */}
            {(selectedType === 'all' || selectedType === 'display') && displayFormats.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-gradient-to-r from-[#FF6B2C] to-[#FF8C42] rounded-lg shadow-sm">
                    <Monitor className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Display Ads</h2>
                    <p className="text-sm text-gray-500">Interactive display units</p>
                  </div>
                  <span className="bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm font-semibold ml-auto shadow-sm">
                    {displayFormats.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {displayFormats.map((format) => (
                    <AdFormatCard
                      key={format.id}
                      format={format}
                      onPreview={setSelectedFormat}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* VIDEO SECTION */}
            {(selectedType === 'all' || selectedType === 'video') && videoFormats.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-gradient-to-r from-[#FF6B2C] to-[#FF8C42] rounded-lg shadow-sm">
                    <Play className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Video Ads</h2>
                    <p className="text-sm text-gray-500">Engaging video units</p>
                  </div>
                  <span className="bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm font-semibold ml-auto shadow-sm">
                    {videoFormats.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {videoFormats.map((format) => (
                    <AdFormatCard
                      key={format.id}
                      format={format}
                      onPreview={setSelectedFormat}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* NO RESULTS */}
            {filteredFormats.length === 0 && (
              <div className="text-center py-16">
                <div className="bg-white border border-gray-200 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No formats found</h3>
                <p className="text-sm text-gray-500 mb-6">Try adjusting your search or filters</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedType('all');
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#FF6B2C] to-[#FF8C42] text-white font-medium rounded-lg hover:shadow-lg transition-all text-sm"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Preview Modal */}
      {selectedFormat && (
        <PreviewModal
          format={selectedFormat}
          onClose={() => setSelectedFormat(null)}
        />
      )}
    </div>
  );
}

export default App;