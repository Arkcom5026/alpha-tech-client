import React, { useEffect, useRef, useState } from 'react';

const supportsIntersectionObserver = () =>
  typeof window !== 'undefined' && typeof window.IntersectionObserver === 'function';

const DeferredRepairSection = ({
  children,
  rootMargin = '320px 0px',
  minHeight = 120,
  force = false,
}) => {
  const anchorRef = useRef(null);
  const [ready, setReady] = useState(() => force || !supportsIntersectionObserver());

  useEffect(() => {
    if (force) {
      setReady(true);
      return undefined;
    }
    if (ready || !supportsIntersectionObserver()) return undefined;

    const node = anchorRef.current;
    if (!node) return undefined;

    const observer = new window.IntersectionObserver(
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
  }, [force, ready, rootMargin]);

  if (ready) return children;

  return (
    <div
      ref={anchorRef}
      aria-hidden="true"
      style={{ minHeight }}
      className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50"
    />
  );
};

export default DeferredRepairSection;
