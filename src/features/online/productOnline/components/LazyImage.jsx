
// =============================
// FILE: src/features/online/productOnline/components/LazyImage.jsx
// (Base Lazy image + blur-up: ปรับให้ยืดหยุ่นขึ้น รองรับ sizes/srcSet, rootMargin, quality, onError fallback)
// =============================
import React, { useEffect, useRef, useState, useMemo } from 'react';

function toCloudinary(url, { width = 400, height, quality = 80, format = 'auto', blur = 0 } = {}) {
  try {
    if (!url || !/res\.cloudinary\.com/.test(url)) return url;
    const u = new URL(url);
    const parts = u.pathname.split('/'); // /<cloud>/image/upload/<transform>/v123/...
    const i = parts.findIndex((p) => p === 'upload');
    if (i === -1) return url;
    const transforms = [];
    if (format) transforms.push(`f_${format}`);
    if (quality) transforms.push(`q_${quality}`);
    if (width) transforms.push(`w_${width}`);
    if (height) transforms.push(`h_${height}`);
    if (blur) transforms.push(`e_blur:${blur}`);
    parts.splice(i + 1, 0, transforms.join(','));
    u.pathname = parts.join('/');
    return u.toString();
  } catch {
    return url;
  }
}

const LazyImage = React.memo(function LazyImage({
  src,
  alt = '',
  width = 400,
  height = 400,
  className = '',
  imgClassName = '',
  rounded = 'rounded-xl',
  style,
  priority = false, // ถ้า true จะไม่ใช้ observer
  rootMargin = '300px',
  quality = 80,
  blurQuality = 10,
  blurStrength = 2000,
  sizes, // HTML sizes attribute (responsive)
  objectFit = 'contain', // contain/cover
  fetchPriority, // 'high'|'low'
  onErrorFallback = null, // string url หรือ null → จะใช้กล่องสีเทา
}) {
  const containerRef = useRef(null);
  const [inView, setInView] = useState(priority);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const ratioPadding = useMemo(() => {
    const r = height && width ? (height / width) * 100 : 100;
    return `${r}%`;
  }, [width, height]);

  const blurSrc = useMemo(() => toCloudinary(src, { width: 24, height: Math.round((height / width) * 24) || 24, quality: blurQuality, format: 'auto', blur: blurStrength }), [src, width, height, blurQuality, blurStrength]);
  const mainSrc = useMemo(() => toCloudinary(src, { width, height, quality, format: 'auto' }), [src, width, height, quality]);

  const srcSet = useMemo(() => {
    if (!/res\.cloudinary\.com/.test(src)) return undefined;
    const widths = [320, 480, 640, 768];
    return widths.map((w) => `${toCloudinary(src, { width: w, height: Math.round((height / width) * w) || undefined, quality, format: 'auto' })} ${w}w`).join(', ');
  }, [src, width, height, quality]);

  useEffect(() => {
    if (priority) return;
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true);
            io.disconnect();
          }
        });
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [priority, rootMargin]);

  return (
    <div ref={containerRef} className={`relative ${rounded} overflow-hidden ${className}`} style={style} aria-busy={!loaded}>
      <div style={{ paddingTop: ratioPadding }} />

      <img
        src={blurSrc || src}
        alt={alt}
        aria-hidden
        loading="eager"
        decoding="async"
        className={`absolute inset-0 w-full h-full object-${objectFit} filter blur-xl scale-105 transition-opacity duration-300 ${loaded ? 'opacity-0' : 'opacity-100'}`}
      />

      {inView && !failed && (
        <img
          src={mainSrc || src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          width={width}
          height={height}
          fetchpriority={fetchPriority}
          onLoad={() => setLoaded(true)}
          onError={() => { setFailed(true); setLoaded(true); }}
          className={`absolute inset-0 w-full h-full object-${objectFit} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
        />
      )}

      {inView && failed && (
        onErrorFallback ? (
          <img src={onErrorFallback} alt={alt} className={`absolute inset-0 w-full h-full object-${objectFit}`} />
        ) : (
          <div className="absolute inset-0 bg-gray-200 text-gray-400 flex items-center justify-center text-xs">No Image</div>
        )
      )}

      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 opacity-60" />
      )}
    </div>
  );
});

export default LazyImage;
