import { useEffect, useState } from "react";
import Player from "./components/Player";
import TrackBrowser from "./components/TrackBrowser";

function App() {
  const [tracks, setTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
          <h1 className="text-2xl font-bold text-purple-600 text-center">🎵 LoopCraft</h1>
          <p className="text-gray-500 text-sm text-center mt-1">Craft custom audio loops</p>
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
    </div>
  );
}

export default App;