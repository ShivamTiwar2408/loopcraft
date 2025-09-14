import { useState, useEffect, useMemo } from 'react';

export default function SequenceManager({ isOpen, onClose }) {
  const [sequences, setSequences] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  // Load sequences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('loopcraft-sequences');
    if (saved) {
      try {
        setSequences(JSON.parse(saved));
      } catch (e) {
        console.warn('Failed to load sequences:', e);
      }
    }
  }, [isOpen]);

  // Filter and sort sequences
  const processedSequences = useMemo(() => {
    let filtered = sequences;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = sequences.filter(seq => 
        seq.name.toLowerCase().includes(query) ||
        seq.trackName.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'track':
          return a.trackName.localeCompare(b.trackName);
        case 'duration':
          return b.totalDuration - a.totalDuration;
        case 'recent':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return filtered;
  }, [sequences, searchQuery, sortBy]);

  // Delete sequence
  const deleteSequence = (sequenceId) => {
    const updated = sequences.filter(seq => seq.id !== sequenceId);
    setSequences(updated);
    localStorage.setItem('loopcraft-sequences', JSON.stringify(updated));
  };

  // Export sequences as JSON
  const exportSequences = () => {
    const dataStr = JSON.stringify(sequences, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'loopcraft-sequences.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import sequences from JSON
  const importSequences = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported)) {
          const merged = [...sequences, ...imported];
          setSequences(merged);
          localStorage.setItem('loopcraft-sequences', JSON.stringify(merged));
          window.alert(`Imported ${imported.length} sequences successfully!`);
        } else {
          window.alert('Invalid file format. Expected an array of sequences.');
        }
      } catch (error) {
        window.alert('Failed to import sequences. Please check the file format.');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Sequence Manager</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Search and Controls */}
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search sequences..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="recent">Recently Created</option>
              <option value="name">Name A-Z</option>
              <option value="track">Track Name</option>
              <option value="duration">Duration</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={exportSequences}
                disabled={sequences.length === 0}
                className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
              >
                Export
              </button>
              <label className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer text-sm">
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={importSequences}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Sequences List */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {processedSequences.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-300 text-5xl mb-4">🎵</div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                {searchQuery ? 'No sequences match your search' : 'No saved sequences'}
              </h3>
              <p className="text-gray-500">
                {searchQuery ? 'Try a different search term' : 'Create some loop sequences and save them to see them here'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {processedSequences.map((sequence) => (
                <div key={sequence.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-800 truncate">{sequence.name}</h3>
                      <p className="text-sm text-gray-600 truncate mt-1">Track: {sequence.trackName}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>{sequence.segments.length} segments</span>
                        <span>{formatTime(sequence.totalDuration)} total</span>
                        <span>{new Date(sequence.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => {
                          // Copy sequence data to clipboard for manual loading
                          navigator.clipboard.writeText(JSON.stringify(sequence, null, 2));
                          window.alert('Sequence data copied to clipboard!');
                        }}
                        className="text-sm bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
                        title="Copy sequence data"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete sequence "${sequence.name}"?`)) {
                            deleteSequence(sequence.id);
                          }
                        }}
                        className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                        title="Delete sequence"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{sequences.length} total sequences saved</span>
            <span>Sequences are stored locally in your browser</span>
          </div>
        </div>
      </div>
    </div>
  );
}