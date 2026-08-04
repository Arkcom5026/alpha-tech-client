import { useEffect, useMemo, useState } from 'react';
import apiClient from '@/utils/apiClient';

const absoluteProtocols = /^(?:https?:|data:|blob:)/i;

export const resolvePublicAssetUrl = (value) => {
  const source = String(value || '').trim();
  if (!source) return null;
  if (absoluteProtocols.test(source)) return source;
  if (source.startsWith('//')) {
    return `${typeof window !== 'undefined' ? window.location.protocol : 'https:'}${source}`;
  }

  try {
    const browserOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
    const apiBase = apiClient?.defaults?.baseURL || import.meta.env?.VITE_API_BASE_URL || browserOrigin;
    const apiOrigin = new URL(apiBase, browserOrigin).origin;
    const path = source.startsWith('/') ? source : `/${source}`;
    return new URL(path, apiOrigin).href;
  } catch (_) {
    return null;
  }
};

const PublicProductImage = ({
  src,
  alt,
  className = '',
  fallbackClassName = '',
  fallbackSize = 'text-4xl',
}) => {
  const resolvedSrc = useMemo(() => resolvePublicAssetUrl(src), [src]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [resolvedSrc]);

  if (!resolvedSrc || failed) {
    return (
      <div className={`grid h-full w-full place-items-center text-slate-300 ${fallbackSize} ${fallbackClassName}`} aria-label={alt || 'ไม่มีรูปสินค้า'}>
        📦
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt || 'สินค้า'}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
};

export default PublicProductImage;
