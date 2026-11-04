import React, { useState } from 'react';
import { AdFormatCard } from './components/AdFormatCard';
import { PreviewModal } from './components/PreviewModal';
import { adFormats } from './data/adFormats';
import { AdFormat } from './types/AdFormat';
import { Play, Monitor, Search, Filter, Menu, X, Grid, Video } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl border-r border-slate-200 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="px-6 py-8 border-b border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="p-3 bg-gradient-to-br from-blue-200 to-indigo-300 rounded-2xl shadow-lg">
                    <Monitor className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Ad Gallery</h2>
                  <p className="text-sm text-slate-600 font-medium">Creative Studio</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-white/80 rounded-xl transition-colors text-slate-400 hover:text-slate-600 lg:hidden shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black" style={{ zIndex: "9999" }} />
              <input
                type="text"
                placeholder="Search ad formats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 placeholder-slate-400 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Filter Section */}
          <div className="px-6 py-6 border-b border-slate-200 bg-white">
            <div className="flex items-center gap-3 mb-6">
              <Filter className="w-5 h-5 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Categories</h3>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => setSelectedType('all')}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-200 group ${
                  selectedType === 'all'
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-blue-700 shadow-md'
                    : 'bg-slate-50 hover:bg-slate-100 border-2 border-transparent text-slate-600 hover:text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Grid className={`w-5 h-5 ${selectedType === 'all' ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'}`} />
                  <span className="font-semibold">All Formats</span>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${
                  selectedType === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                }`}>
                  {getFilterCount('all')}
                </span>
              </button>

              <button
                onClick={() => setSelectedType('display')}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-200 group ${
                  selectedType === 'display'
                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 text-emerald-700 shadow-md'
                    : 'bg-slate-50 hover:bg-slate-100 border-2 border-transparent text-slate-600 hover:text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Monitor className={`w-5 h-5 ${selectedType === 'display' ? 'text-emerald-600' : 'text-slate-500 group-hover:text-slate-700'}`} />
                  <span className="font-semibold">Display Ads</span>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${
                  selectedType === 'display' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                }`}>
                  {getFilterCount('display')}
                </span>
              </button>

              <button
                onClick={() => setSelectedType('video')}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-200 group ${
                  selectedType === 'video'
                    ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 text-purple-700 shadow-md'
                    : 'bg-slate-50 hover:bg-slate-100 border-2 border-transparent text-slate-600 hover:text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Video className={`w-5 h-5 ${selectedType === 'video' ? 'text-purple-600' : 'text-slate-500 group-hover:text-slate-700'}`} />
                  <span className="font-semibold">Video Ads</span>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${
                  selectedType === 'video' ? 'bg-purple-100 text-purple-700' : 'bg-slate-200 text-slate-600'
                }`}>
                  {getFilterCount('video')}
                </span>
              </button>
            </div>
          </div>

          {/* Footer Options in Sidebar */}
          <div className="mt-auto p-4 text-center border-t border-slate-200">
            <p className="text-sm text-slate-500 font-medium">© 2025 Tapmind Interactive Ad format</p>
            <p className="text-sm text-slate-500 font-medium">Professional Edition</p>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'lg:ml-80' : 'ml-0'}`}>
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-lg shadow-sm border-b border-slate-200 sticky top-0 z-30">
          <div className="px-8 py-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-3 hover:bg-slate-100 rounded-2xl transition-colors text-slate-500 hover:text-slate-700 shadow-sm"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      Tapmind Creative Ad Gallery
                    </h1>
                    <div className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 rounded-full">
                      <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Pro</span>
                    </div>
                  </div>
                  <p className="text-slate-500 font-medium">Explore and preview different ad formats with interactive examples</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 px-6 py-3 rounded-2xl shadow-sm">
                  <span className="text-sm font-bold text-blue-700">
                    {filteredFormats.length} {filteredFormats.length === 1 ? 'Result' : 'Results'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 px-8 py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {/* Display Ads Section */}
            {(selectedType === 'all' || selectedType === 'display') && displayFormats.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-lg">
                    <Monitor className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Display Ad Formats</h2>
                    <p className="text-slate-600 font-medium">Interactive display advertisements</p>
                  </div>
                  <span className="bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700 border border-emerald-300 px-4 py-2 rounded-2xl text-sm font-bold shadow-sm ml-auto">
                    {displayFormats.length} Available
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
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

            {/* Video Ads Section */}
            {(selectedType === 'all' || selectedType === 'video') && videoFormats.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                    <Play className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Video Ad Formats</h2>
                    <p className="text-slate-600 font-medium">Engaging video advertisements</p>
                  </div>
                  <span className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 border border-purple-300 px-4 py-2 rounded-2xl text-sm font-bold shadow-sm ml-auto">
                    {videoFormats.length} Available
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
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

            {/* No Results */}
            {filteredFormats.length === 0 && (
              <div className="text-center py-20">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl w-24 h-24 flex items-center justify-center mx-auto mb-8 shadow-lg">
                  <Search className="w-12 h-12 text-slate-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">No ad formats found</h3>
                <p className="text-slate-600 mb-8 font-medium">Try adjusting your search or filter criteria</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedType('all');
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Clear All Filters
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
