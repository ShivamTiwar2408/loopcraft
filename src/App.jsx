import { useEffect, useState } from "react";
import Player from "./components/Player";
import TrackBrowser from "./components/TrackBrowser";
import PerformanceMonitor from "./components/PerformanceMonitor";

function App() {
  const [tracks, setTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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
              <p className="text-gray-500 text-sm mt-1">Craft custom audio loops</p>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Settings"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Settings Panel */}
          {showSettings && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-3">Settings</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showPerformanceMonitor}
                    onChange={(e) => setShowPerformanceMonitor(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Show Performance Monitor</span>
                </label>
                <div className="text-xs text-gray-500 mt-2">
                  Performance monitor helps track app performance with large track libraries.
                </div>
              </div>
            </div>
          )}
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
            {/* Track Browser */}
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
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Select a Track</h3>
                  <p className="text-gray-500">Choose a track from the library to start creating loops</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Performance Monitor */}
      <PerformanceMonitor 
        trackCount={tracks.length} 
        isVisible={showPerformanceMonitor} 
      />
    </div>
  );
}

export default App;