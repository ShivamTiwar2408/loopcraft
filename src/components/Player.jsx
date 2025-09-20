import { useRef, useState, useCallback, useEffect, useMemo } from "react";

export default function Player({ track }) {
  const mediaRef = useRef(null);
  const playbackControlRef = useRef({ shouldStop: false });
  const [segments, setSegments] = useState([]);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(5);
  const [repeat, setRepeat] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [savedSequences, setSavedSequences] = useState([]);
  const [showSequenceManager, setShowSequenceManager] = useState(false);
  const [editingSegmentIndex, setEditingSegmentIndex] = useState(null);

  // Load saved sequences from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('loopcraft-sequences');
    if (saved) {
      try {
        setSavedSequences(JSON.parse(saved));
      } catch (e) {
        console.warn('Failed to load saved sequences:', e);
      }
    }
  }, []);

  // Reset segments when track changes
  useEffect(() => {
    setSegments([]);
    setIsPlaying(false);
    playbackControlRef.current.shouldStop = true;
  }, [track.url]);

  // Update duration and current time
  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const updateTime = () => setCurrentTime(media.currentTime);
    const updateDuration = () => setDuration(media.duration || 0);

    media.addEventListener('timeupdate', updateTime);
    media.addEventListener('loadedmetadata', updateDuration);
    media.addEventListener('durationchange', updateDuration);

    return () => {
      media.removeEventListener('timeupdate', updateTime);
      media.removeEventListener('loadedmetadata', updateDuration);
      media.removeEventListener('durationchange', updateDuration);
    };
  }, [track.url]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addSegment = useCallback(() => {
    if (start >= end || start < 0 || repeat < 1) return;
    const segmentNumber = segments.length + 1;
    setSegments(prev => [...prev, { 
      start, 
      end, 
      repeat, 
      label: `Segment ${segmentNumber}` 
    }]);
    // Reset inputs for next segment
    setStart(end);
    setEnd(Math.min(end + 5, duration));
  }, [start, end, repeat, duration, segments.length]);

  const deleteSegment = useCallback((index) => {
    setSegments(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateSegmentLabel = useCallback((index, newLabel) => {
    setSegments(prev => prev.map((segment, i) => 
      i === index ? { ...segment, label: newLabel } : segment
    ));
  }, []);

  const updateSegmentRepeat = useCallback((index, newRepeat) => {
    if (newRepeat < 1) return;
    setSegments(prev => prev.map((segment, i) => 
      i === index ? { ...segment, repeat: newRepeat } : segment
    ));
  }, []);

  const playSegment = useCallback((startTime, endTime) => {
    return new Promise(resolve => {
      if (playbackControlRef.current.shouldStop) {
        resolve();
        return;
      }

      const media = mediaRef.current;
      if (!media) {
        resolve();
        return;
      }

      media.currentTime = startTime;
      media.play().catch(() => resolve());

      const checkTime = () => {
        if (playbackControlRef.current.shouldStop || media.currentTime >= endTime) {
          media.pause();
          resolve();
        } else {
          requestAnimationFrame(checkTime);
        }
      };

      requestAnimationFrame(checkTime);
    });
  }, []);

  const playSegments = useCallback(async (loop = true) => {
    if (isPlaying || segments.length === 0) return;

    setIsPlaying(true);
    playbackControlRef.current.shouldStop = false;

    const playSequence = async () => {
      for (const segment of segments) {
        if (playbackControlRef.current.shouldStop) break;

        for (let i = 0; i < segment.repeat; i++) {
          if (playbackControlRef.current.shouldStop) break;
          await playSegment(segment.start, segment.end);
        }
      }
    };

    do {
      await playSequence();
    } while (loop && !playbackControlRef.current.shouldStop);

    setIsPlaying(false);
  }, [isPlaying, segments, playSegment]);

  const stopPlayback = useCallback(() => {
    playbackControlRef.current.shouldStop = true;
    mediaRef.current?.pause();
    setIsPlaying(false);
  }, []);

  // Save current sequence to localStorage
  const saveSequence = useCallback((name) => {
    if (!name.trim() || segments.length === 0) return false;
    
    const sequence = {
      id: Date.now().toString(),
      name: name.trim(),
      trackName: track.name,
      trackUrl: track.url,
      segments: segments,
      createdAt: new Date().toISOString(),
      totalDuration: segments.reduce((total, segment) => {
        return total + (segment.end - segment.start) * segment.repeat;
      }, 0)
    };

    const updated = [...savedSequences, sequence];
    setSavedSequences(updated);
    localStorage.setItem('loopcraft-sequences', JSON.stringify(updated));
    return true;
  }, [segments, track, savedSequences]);

  // Load a saved sequence
  const loadSequence = useCallback((sequence) => {
    if (sequence.trackUrl !== track.url) {
      window.alert('This sequence was created for a different track. Please select the correct track first.');
      return;
    }
    // Ensure backward compatibility by adding labels to segments that don't have them
    const segmentsWithLabels = sequence.segments.map((segment, index) => ({
      ...segment,
      label: segment.label || `Segment ${index + 1}`
    }));
    setSegments(segmentsWithLabels);
    setShowSequenceManager(false);
  }, [track.url]);

  // Delete a saved sequence
  const deleteSequence = useCallback((sequenceId) => {
    const updated = savedSequences.filter(seq => seq.id !== sequenceId);
    setSavedSequences(updated);
    localStorage.setItem('loopcraft-sequences', JSON.stringify(updated));
  }, [savedSequences]);

  // Get sequences for current track
  const currentTrackSequences = useMemo(() => {
    return savedSequences.filter(seq => seq.trackUrl === track.url);
  }, [savedSequences, track.url]);

  // Keyboard shortcuts - placed after function definitions
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Only handle shortcuts when not typing in an input
      if (e.target.tagName === 'INPUT') return;

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          if (segments.length > 0) {
            if (isPlaying) {
              stopPlayback();
            } else {
              playSegments(true);
            }
          }
          break;
        case 'a':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            addSegment();
          }
          break;
        case 'escape':
          if (isPlaying) {
            stopPlayback();
          }
          break;
        default:
          // No action for other keys
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [segments, isPlaying, stopPlayback, playSegments, addSegment]);

  const isValidSegment = start < end && start >= 0 && repeat >= 1;
  const hasSegments = segments.length > 0;

  // Memoize total loop duration for performance
  const totalLoopDuration = useMemo(() => {
    return segments.reduce((total, segment) => {
      return total + (segment.end - segment.start) * segment.repeat;
    }, 0);
  }, [segments]);

  return (
    <div className="bg-white m-4 rounded-xl shadow-sm overflow-hidden">
      {/* Media Element */}
      {track.mediaType === 'video' ? (
        <div className="relative">
          <video 
            ref={mediaRef} 
            src={track.url} 
            preload="metadata"
            className="w-full max-h-64 bg-black"
            controls={false}
            muted={false}
          />
          {/* Video overlay controls could go here if needed */}
        </div>
      ) : (
        <audio ref={mediaRef} src={track.url} preload="metadata" />
      )}

      {/* Now Playing Header */}
      <div className={`${track.mediaType === 'video' ? 'bg-gradient-to-r from-red-500 to-pink-500' : 'bg-gradient-to-r from-purple-500 to-blue-500'} text-white p-4`}>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            {track.mediaType === 'video' ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793l-4-3A1 1 0 014 13V7a1 1 0 01.383-.793l4-3zM14 7a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zM14 12a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold truncate">{track.name}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                track.mediaType === 'video' 
                  ? 'bg-white/20 text-white' 
                  : 'bg-white/20 text-white'
              }`}>
                {track.mediaType === 'video' ? '🎥' : '🎵'} {track.format?.toUpperCase()}
              </span>
            </div>
            <p className="text-white/80 text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </p>
          </div>
        </div>
      </div>

      {/* Segment Creation */}
      <div className="p-4 border-b border-gray-100">
        <h4 className="font-medium text-gray-800 mb-3">Create Loop Segment</h4>

        <div className="grid grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Start (s)</label>
            <input
              type="number"
              value={start}
              onChange={(e) => setStart(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="0"
              max={duration}
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">End (s)</label>
            <input
              type="number"
              value={end}
              onChange={(e) => setEnd(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="0"
              max={duration}
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Repeat</label>
            <input
              type="number"
              value={repeat}
              onChange={(e) => setRepeat(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="1"
              max="10"
            />
          </div>
        </div>

        <button
          onClick={addSegment}
          disabled={!isValidSegment}
          className="w-full bg-green-500 text-white py-3 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isValidSegment ? '+ Add Segment' : 'Invalid Segment'}
        </button>
      </div>

      {/* Segments List */}
      {hasSegments && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-800">
              Loop Segments ({segments.length})
            </h4>
            <div className="text-xs text-gray-500">
              Total: {formatTime(totalLoopDuration)}
            </div>
          </div>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {segments.map((segment, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                {/* Segment Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-purple-600 font-medium text-sm">#{index + 1}</span>
                    {editingSegmentIndex === index ? (
                      <input
                        type="text"
                        value={segment.label || `Segment ${index + 1}`}
                        onChange={(e) => updateSegmentLabel(index, e.target.value)}
                        onBlur={() => setEditingSegmentIndex(null)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === 'Escape') {
                            setEditingSegmentIndex(null);
                          }
                        }}
                        className="bg-white border border-gray-200 rounded px-2 py-1 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        style={{ width: '200px' }}
                        maxLength={25}
                        placeholder="Segment label"
                        autoFocus
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-800 px-2 py-1">
                        {segment.label || `Segment ${index + 1}`}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setEditingSegmentIndex(index)}
                      className="text-blue-500 hover:bg-blue-100 p-1 rounded transition-colors"
                      title="Edit segment name"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteSegment(index)}
                      className="text-red-500 hover:bg-red-100 p-1 rounded transition-colors"
                      title="Delete segment"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Segment Details */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <span>
                      {formatTime(segment.start)} → {formatTime(segment.end)}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({formatTime((segment.end - segment.start) * segment.repeat)} total)
                    </span>
                  </div>

                  {/* Repeat Controls */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Repeat:</span>
                    <button
                      onClick={() => updateSegmentRepeat(index, segment.repeat - 1)}
                      disabled={segment.repeat <= 1}
                      className="w-6 h-6 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-600 rounded flex items-center justify-center text-sm font-medium transition-colors"
                      title="Decrease repeat count"
                    >
                      −
                    </button>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-medium min-w-[40px] text-center">
                      {segment.repeat}
                    </span>
                    <button
                      onClick={() => updateSegmentRepeat(index, segment.repeat + 1)}
                      disabled={segment.repeat >= 10}
                      className="w-6 h-6 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-600 rounded flex items-center justify-center text-sm font-medium transition-colors"
                      title="Increase repeat count"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sequence Actions */}
          <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setSegments([])}
              className="text-sm text-red-600 hover:text-red-700 transition-colors"
            >
              Clear All Segments
            </button>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  const name = window.prompt('Enter a name for this sequence:');
                  if (name && saveSequence(name)) {
                    window.alert('Sequence saved successfully!');
                  }
                }}
                className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
                title="Save current sequence"
              >
                Save Sequence
              </button>
              {currentTrackSequences.length > 0 && (
                <button
                  onClick={() => setShowSequenceManager(!showSequenceManager)}
                  className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                  title="Load saved sequence"
                >
                  Load ({currentTrackSequences.length})
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sequence Manager */}
      {showSequenceManager && currentTrackSequences.length > 0 && (
        <div className="p-4 border-b border-gray-100 bg-blue-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-800">Saved Sequences for {track.name}</h4>
            <button
              onClick={() => setShowSequenceManager(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {currentTrackSequences.map((sequence) => (
              <div key={sequence.id} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800 truncate">{sequence.name}</div>
                  <div className="text-sm text-gray-500 flex items-center space-x-2">
                    <span>{sequence.segments.length} segments</span>
                    <span>•</span>
                    <span>{formatTime(sequence.totalDuration)}</span>
                    <span>•</span>
                    <span>{new Date(sequence.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-2">
                  <button
                    onClick={() => loadSequence(sequence)}
                    className="text-sm bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                    title="Load this sequence"
                  >
                    Load
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
            ))}
          </div>
        </div>
      )}

      {/* Playback Controls */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => playSegments(false)}
            disabled={isPlaying || !hasSegments}
            className="flex items-center justify-center space-x-2 bg-blue-500 text-white py-3 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            title="Play segments once"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            <span>Play Once</span>
          </button>

          <button
            onClick={() => playSegments(true)}
            disabled={isPlaying || !hasSegments}
            className="flex items-center justify-center space-x-2 bg-purple-500 text-white py-3 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            title="Loop segments continuously (Spacebar)"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            <span>Loop</span>
          </button>
        </div>

        {isPlaying && (
          <button
            onClick={stopPlayback}
            className="w-full mt-3 flex items-center justify-center space-x-2 bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors"
            title="Stop playback (Escape)"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
            <span>Stop</span>
          </button>
        )}

        {/* Quick Actions */}
        {!hasSegments && currentTrackSequences.length > 0 && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm text-blue-800">
                {currentTrackSequences.length} saved sequence{currentTrackSequences.length !== 1 ? 's' : ''} available
              </div>
              <button
                onClick={() => setShowSequenceManager(true)}
                className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
              >
                Load Sequence
              </button>
            </div>
          </div>
        )}

        {/* Keyboard Shortcuts Help */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            <div className="font-medium mb-1">Keyboard Shortcuts:</div>
            <div className="space-y-1">
              <div>Spacebar: Play/Stop loop</div>
              <div>Ctrl/Cmd + A: Add segment</div>
              <div>Escape: Stop playback</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}