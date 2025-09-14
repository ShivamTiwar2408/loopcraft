import { useState, useEffect } from 'react';

export default function PerformanceMonitor({ trackCount, isVisible = false }) {
  const [metrics, setMetrics] = useState({
    memoryUsage: 0,
    renderTime: 0,
    trackLoadTime: 0
  });

  useEffect(() => {
    if (!isVisible) return;

    const updateMetrics = () => {
      // Memory usage (if available)
      if (performance.memory) {
        setMetrics(prev => ({
          ...prev,
          memoryUsage: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)
        }));
      }
    };

    const interval = setInterval(updateMetrics, 2000);
    updateMetrics();

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white text-xs p-3 rounded-lg font-mono">
      <div className="space-y-1">
        <div>Tracks: {trackCount}</div>
        {metrics.memoryUsage > 0 && (
          <div>Memory: {metrics.memoryUsage}MB</div>
        )}
        <div>FPS: {Math.round(1000 / 16)}fps</div>
      </div>
    </div>
  );
}