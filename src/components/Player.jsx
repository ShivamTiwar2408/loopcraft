import React, { useRef, useState } from "react";

export default function Player({ track }) {
  const audioRef = useRef(null);
  const [segments, setSegments] = useState([]);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(5);
  const [repeat, setRepeat] = useState(1);

  const addSegment = () => {
    setSegments([...segments, { start, end, repeat }]);
  };

  const playSegments = async () => {
    for (const seg of segments) {
      for (let r = 0; r < seg.repeat; r++) {
        await playSegment(seg.start, seg.end);
      }
    }
    playSegments(); // 🔁 loop whole sequence
  };

  const playSegment = (s, e) => {
    return new Promise(resolve => {
      const audio = audioRef.current;
      audio.currentTime = s;
      audio.play();

      const interval = setInterval(() => {
        if (audio.currentTime >= e) {
          audio.pause();
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  };

  return (
    <div className="mb-6 p-3 border rounded">
      <h2 className="font-semibold">{track.name}</h2>
      <audio ref={audioRef} src={track.url} controls className="w-full mb-2" />

      <div className="flex gap-2 mb-2">
        <input 
          type="number" 
          value={start} 
          onChange={e => setStart(Number(e.target.value))} 
          placeholder="Start (sec)" 
          className="border px-2 py-1 rounded"
        />
        <input 
          type="number" 
          value={end} 
          onChange={e => setEnd(Number(e.target.value))} 
          placeholder="End (sec)" 
          className="border px-2 py-1 rounded"
        />
        <input 
          type="number" 
          value={repeat} 
          onChange={e => setRepeat(Number(e.target.value))} 
          placeholder="Repeat" 
          className="border px-2 py-1 rounded"
        />
        <button 
          onClick={addSegment}
          className="bg-green-500 text-white px-3 py-1 rounded"
        >
          Add
        </button>
      </div>

      <div className="mb-2">
        {segments.map((seg, i) => (
          <p key={i}>▶ {seg.start}s → {seg.end}s × {seg.repeat}</p>
        ))}
      </div>

      <button 
        onClick={playSegments} 
        className="bg-blue-500 text-white px-3 py-1 rounded"
      >
        Play Sequence (Loop)
      </button>
    </div>
  );
}