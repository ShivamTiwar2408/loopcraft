import { useEffect, useState } from "react";
import Player from "./components/Player";
import TrackBrowser from "./components/TrackBrowser";
import SequenceManager from "./components/SequenceManager";

function App() {
  const [tracks, setTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSequenceManager, setShowSequenceManager] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetch("/manifest.json")
      .then(res => res.json())
      .then(data => {
        setTracks(data);
        if (data.length > 0) {
          setSelectedTrack(data[0]);
        }
      })
      .catch(() => console.log("No manifest found yet"))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold text-purple-600">🎵 LoopCraft</h1>
              <p className="text-gray-500 text-sm mt-1">Craft custom audio & video loops</p>
            </div>
            <button
              onClick={() => setShowSequenceManager(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              title="Manage saved sequences"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Sequences</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading tracks...</p>
          </div>
        ) : tracks.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-gray-400 text-4xl mb-4">🎵</div>
            <p className="text-gray-500">No tracks found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            {/* Media Browser */}
            <TrackBrowser
              tracks={tracks}
              selectedTrack={selectedTrack}
              onTrackSelect={setSelectedTrack}
              isLoading={isLoading}
            />

            {/* Player Controls */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              {selectedTrack ? (
                <Player track={selectedTrack} />
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <div className="text-gray-300 text-5xl mb-4">🎵</div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Select Media</h3>
                  <p className="text-gray-500">Choose audio or video from the library to start creating loops</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Global Sequence Manager */}
      <SequenceManager 
        isOpen={showSequenceManager} 
        onClose={() => setShowSequenceManager(false)} 
      />
    </div>
  );
}

export default App;