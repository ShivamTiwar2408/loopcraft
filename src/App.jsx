import React, { useEffect, useState } from "react";
import Player from "./components/Player";

function App() {
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    fetch("/manifest.json")
      .then(res => res.json())
      .then(data => setTracks(data))
      .catch(err => console.log("No manifest found yet"));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4 text-purple-600">🎵 LoopCraft</h1>
      <p className="text-gray-600 mb-6">Craft custom audio loops with precision</p>
      {tracks.length === 0 && <p>No tracks found.</p>}
      {tracks.map((track, i) => (
        <Player key={i} track={track} />
      ))}
    </div>
  );
}

export default App;