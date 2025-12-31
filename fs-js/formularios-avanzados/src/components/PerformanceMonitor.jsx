import React, { useState, useEffect } from 'react';

export const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({ domReady: 0, pageLoad: 0 });

  useEffect(() => {
    const getMetrics = () => {
      // VALIDACIÓN PARA TESTS: Comprobamos si la función existe antes de usarla
      if (typeof performance !== 'undefined' && typeof performance.getEntriesByType === 'function') {
        const entries = performance.getEntriesByType('navigation');
        if (entries && entries.length > 0) {
          const entry = entries[0];
          setMetrics({
            domReady: Math.round(entry.domContentLoadedEventEnd),
            pageLoad: Math.round(entry.loadEventEnd)
          });
        }
      }
    };

    if (document.readyState === 'complete') {
      getMetrics();
    } else {
      window.addEventListener('load', getMetrics);
      return () => window.removeEventListener('load', getMetrics);
    }
  }, []);

  return (
    <div style={{
      position: 'fixed', bottom: '10px', right: '10px',
      background: '#1a1a1a', color: '#00ff00', padding: '10px',
      fontSize: '11px', borderRadius: '5px', border: '1px solid #333',
      fontFamily: 'monospace', zIndex: 9999
    }}>
      <div style={{ color: '#aaa', fontWeight: 'bold' }}>WEB SERVER METRICS</div>
      <div>DOM Ready: {metrics.domReady}ms</div>
      <div>Page Load: {metrics.pageLoad}ms</div>
    </div>
  );
};