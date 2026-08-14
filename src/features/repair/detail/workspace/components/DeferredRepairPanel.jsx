import React, { useEffect, useRef, useState } from 'react';

const DeferredRepairPanel = ({
  children,
  eager = false,
  minHeight = 120,
  rootMargin = '0px 0px 240px 0px',
}) => {
  const hostRef = useRef(null);
  const [ready, setReady] = useState(Boolean(eager));

  useEffect(() => {
    if (eager) {
      setReady(true);
      return undefined;
    }
    if (ready) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      setReady(true);
      return undefined;
    }

    const node = hostRef.current;
    if (!node) {
      setReady(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setReady(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [eager, ready, rootMargin]);

  return (
    <div
      ref={hostRef}
      data-repair-deferred-panel={ready ? 'ready' : 'pending'}
      style={ready ? undefined : { minHeight }}
    >
      {ready ? children : null}
    </div>
  );
};

export default DeferredRepairPanel;
