
// =============================
// FILE: src/features/online/productOnline/components/LazyImageOnline.jsx
// (เวอร์ชันเฉพาะ Online: ตั้งค่าเริ่มต้นเหมาะกับภาพจำนวนมาก + รองรับ aboveFold/fetchPriority/sizes)
// =============================
import React from 'react';
import LazyImage from './LazyImage';


/**
 * ใช้กับ Grid หน้า Online ที่มีภาพเยอะ ๆ:
 * - default width=320,height=220, objectFit=contain
 * - rootMargin=600px เพื่อเริ่มโหลดก่อนเลื่อนถึง (รู้สึกไว)
 * - sizes: บอก browser ให้เลือกไฟล์ตามความกว้างคอลัมน์จริง
 * - รองรับ prop aboveFold เพื่อบังคับ eager + fetchPriority=high (ภาพแถวแรก)
 * - เพิ่ม index สำหรับ auto aboveFold (แถวแรก 12 รูป)
 */
const LazyImageOnline = React.memo(function LazyImageOnline({
  src,
  alt = '',
  width = 320,
  height = 220,
  className,
  imgClassName,
  rounded = 'rounded-xl',
  priority = false,
  style,
  rootMargin = '1200px',
  sizes = '(max-width: 640px) 45vw, 240px',
  aboveFold = false,
  objectFit = 'contain',
  index = null, // ใช้ตอน map
  quality = 55,
  blurQuality = 8,
  blurStrength = 1400,
}) {
  // ถ้า index < 6 ให้ aboveFold อัตโนมัติ
  const autoAboveFold = typeof index === 'number' && index < 6;
  const eager = priority || aboveFold || autoAboveFold;
  const fetchPriority = eager ? 'high' : 'low';

  return (
    <LazyImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      imgClassName={imgClassName}
      rounded={rounded}
      priority={eager}
      fetchPriority={fetchPriority}
      rootMargin={rootMargin}
      sizes={sizes}
      quality={quality}
      blurQuality={blurQuality}
      blurStrength={blurStrength}
      objectFit={objectFit}
      style={style}
    />
  );
});

export default LazyImageOnline;

