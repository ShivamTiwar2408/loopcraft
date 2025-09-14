import { useState, useMemo, useCallback } from "react";

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
  { value: 'category-asc', label: 'Category A-Z' },
  { value: 'recent', label: 'Recently Added' },
  { value: 'size-desc', label: 'Largest First' },
  { value: 'size-asc', label: 'Smallest First' }
];

export default function TrackBrowser({ 
  tracks, 
  selectedTrack, 
  onTrackSelect, 
  isLoading 
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState('name-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const TRACKS_PER_PAGE = 25;

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(tracks.map(track => track.category || 'Uncategorized'))];
    return cats.sort();
  }, [tracks]);

  // Filter and sort tracks
  const processedTracks = useMemo(() => {
    let filtered = tracks;
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(track => 
        (track.category || 'Uncategorized') === selectedCategory
      );
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(track => 
        track.name.toLowerCase().includes(query) ||
        (track.category || 'Uncategorized').toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'category-asc':
          const catA = a.category || 'Uncategorized';
          const catB = b.category || 'Uncategorized';
          if (catA !== catB) return catA.localeCompare(catB);
          return a.name.localeCompare(b.name);
        case 'recent':
          if (a.modified && b.modified) {
            return new Date(b.modified) - new Date(a.modified);
          }
          return tracks.indexOf(b) - tracks.indexOf(a);
        case 'size-desc':
          return (b.size || 0) - (a.size || 0);
        case 'size-asc':
          return (a.size || 0) - (b.size || 0);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [tracks, searchQuery, sortBy, selectedCategory]);

  // Paginate processed tracks
  const paginatedTracks = useMemo(() => {
    const startIndex = (currentPage - 1) * TRACKS_PER_PAGE;
    return processedTracks.slice(startIndex, startIndex + TRACKS_PER_PAGE);
  }, [processedTracks, currentPage]);

  const totalPages = Math.ceil(processedTracks.length / TRACKS_PER_PAGE);

  // Reset to first page when search, sort, or category changes
  const resetPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  // Handle search change
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    resetPage();
  }, [resetPage]);

  // Handle sort change
  const handleSortChange = useCallback((e) => {
    setSortBy(e.target.value);
    resetPage();
  }, [resetPage]);

  // Format file size
  const formatFileSize = useCallback((bytes) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }, []);

  // Quick navigation to page
  const goToPage = useCallback((page) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)));
  }, [totalPages]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading tracks...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">
            Track Library ({processedTracks.length})
          </h2>
          <div className="flex items-center space-x-2">
            {selectedTrack && (
              <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                Playing
              </div>
            )}
            {/* View Mode Toggle */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM3 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Search and Filter Controls */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search tracks and categories..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
            
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Category Filter */}
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All ({tracks.length})
              </button>
              {categories.map(category => {
                const count = tracks.filter(track => (track.category || 'Uncategorized') === category).length;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      selectedCategory === category
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {category} ({count})
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Track List/Grid */}
      <div className="max-h-96 overflow-y-auto">
        {paginatedTracks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 6.306a7.962 7.962 0 00-6 0m6 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v1.306m8 0V7a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2h8a2 2 0 012 2v1.306z" />
            </svg>
            {searchQuery ? 'No tracks match your search' : 'No tracks found'}
          </div>
        ) : viewMode === 'list' ? (
          // List View
          <div>
            {paginatedTracks.map((track) => (
              <button
                key={track.url}
                onClick={() => onTrackSelect(track)}
                className={`w-full p-4 text-left border-b border-gray-50 last:border-b-0 transition-all duration-200 ${
                  selectedTrack?.url === track.url
                    ? 'bg-purple-50 border-l-4 border-l-purple-500 shadow-sm'
                    : 'hover:bg-gray-50 active:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 truncate">{track.name}</div>
                    <div className="text-sm text-gray-500 flex items-center justify-between mt-1">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793l-4-3A1 1 0 014 13V7a1 1 0 01.383-.793l4-3zM14 7a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zM14 12a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="truncate">{track.category || 'Uncategorized'}</span>
                      </div>
                      {track.size && (
                        <span className="text-xs text-gray-400 ml-2">
                          {formatFileSize(track.size)}
                        </span>
                      )}
                    </div>
                  </div>
                  {selectedTrack?.url === track.url && (
                    <div className="text-purple-500 ml-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          // Grid View
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4">
            {paginatedTracks.map((track) => (
              <button
                key={track.url}
                onClick={() => onTrackSelect(track)}
                className={`p-4 text-center rounded-lg border-2 transition-all duration-200 ${
                  selectedTrack?.url === track.url
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-3xl mb-2">🎵</div>
                <div className="font-medium text-gray-800 text-sm truncate mb-1">{track.name}</div>
                <div className="text-xs text-gray-500 truncate">{track.category || 'Uncategorized'}</div>
                {track.size && (
                  <div className="text-xs text-gray-400 mt-1">{formatFileSize(track.size)}</div>
                )}
                {selectedTrack?.url === track.url && (
                  <div className="text-purple-500 mt-2">
                    <svg className="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((currentPage - 1) * TRACKS_PER_PAGE) + 1}-{Math.min(currentPage * TRACKS_PER_PAGE, processedTracks.length)} of {processedTracks.length}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="px-2 py-1 text-sm border border-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                ««
              </button>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-3 py-1 text-sm border rounded ${
                      currentPage === pageNum
                        ? 'bg-purple-500 text-white border-purple-500'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
              <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-sm border border-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                »»
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}