// src/components/upload/UploadImageEnhanced.jsx
import { useImperativeHandle, useState, useRef, forwardRef } from 'react';

const UploadImageEnhanced = forwardRef(({ defaultImages = [] }, ref) => {
  const [images, setImages] = useState(defaultImages);
  const fileInputRef = useRef(null);

  // เปิดใช้งานเมธอดให้ภายนอกเรียกผ่าน ref
  useImperativeHandle(ref, () => ({
    getImages: () => images,
    getCoverImage: () => images.find((img) => img.isCover) || null,
    setDefaultImages: (imgs) => setImages(imgs),
  }));

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      isCover: false,
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleRemove = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetCover = (index) => {
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, isCover: i === index }))
    );
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept="image/*"
        multiple
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, idx) => (
            <div key={idx} className="relative border rounded overflow-hidden">
              <img
                src={img.url}
                alt={`uploaded-${idx}`}
                className="w-full h-24 object-cover"
              />
              <div className="absolute top-1 right-1 flex gap-1">
                <button
                  type="button"
                  className="text-xs bg-white px-1 rounded border"
                  onClick={() => handleRemove(idx)}
                >ลบ</button>
                <button
                  type="button"
                  className={`text-xs px-1 rounded border ${img.isCover ? 'bg-green-200' : 'bg-white'}`}
                  onClick={() => handleSetCover(idx)}
                >หน้าปก</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default UploadImageEnhanced;