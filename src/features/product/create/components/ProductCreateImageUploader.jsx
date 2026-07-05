// src/features/product/create/components/ProductCreateImageUploader.jsx

import React, { forwardRef, useImperativeHandle, useRef } from 'react';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const normalizeFileList = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  return Array.from(input);
};

const revokePreviewUrls = (urls = []) => {
  urls.forEach((url) => {
    if (typeof url === 'string' && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  });
};

const ProductCreateImageUploader = forwardRef(({
  files = [],
  setFiles,
  previewUrls = [],
  setPreviewUrls,
  captions = [],
  setCaptions,
  coverIndex = 0,
  setCoverIndex,
  disabled = false,
}, ref) => {
  const inputRef = useRef(null);

  const reset = () => {
    revokePreviewUrls(previewUrls);
    setFiles?.([]);
    setPreviewUrls?.([]);
    setCaptions?.([]);
    setCoverIndex?.(0);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  useImperativeHandle(ref, () => ({
    reset,
  }));

  const applyFiles = (incomingFiles = []) => {
    const currentFiles = normalizeFileList(files);
    const validFiles = incomingFiles.filter((file) => {
      if (!file) return false;
      if (!ACCEPTED_TYPES.includes(file.type)) return false;
      if (file.size > MAX_FILE_SIZE_BYTES) return false;
      return true;
    });

    if (!validFiles.length) return;

    const nextFiles = [...currentFiles, ...validFiles];
    const nextPreviewUrls = [
      ...previewUrls,
      ...validFiles.map((file) => URL.createObjectURL(file)),
    ];

    setFiles?.(nextFiles);
    setPreviewUrls?.(nextPreviewUrls);
    setCaptions?.([
      ...captions,
      ...validFiles.map(() => ''),
    ]);

    if (!nextFiles[coverIndex]) {
      setCoverIndex?.(0);
    }
  };

  const handleFileChange = (event) => {
    applyFiles(normalizeFileList(event.target.files));
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    if (disabled) return;
    applyFiles(normalizeFileList(event.dataTransfer.files));
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const removeFile = (index) => {
    const nextFiles = files.filter((_, idx) => idx !== index);
    const removedUrl = previewUrls[index];

    if (removedUrl?.startsWith?.('blob:')) {
      URL.revokeObjectURL(removedUrl);
    }

    const nextPreviewUrls = previewUrls.filter((_, idx) => idx !== index);
    const nextCaptions = captions.filter((_, idx) => idx !== index);

    setFiles?.(nextFiles);
    setPreviewUrls?.(nextPreviewUrls);
    setCaptions?.(nextCaptions);

    if (!nextFiles.length) {
      setCoverIndex?.(0);
    } else if (coverIndex === index) {
      setCoverIndex?.(0);
    } else if (coverIndex > index) {
      setCoverIndex?.(coverIndex - 1);
    }
  };

  const updateCaption = (index, value) => {
    const nextCaptions = [...captions];
    nextCaptions[index] = value;
    setCaptions?.(nextCaptions);
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={disabled}
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          เลือกรูปภาพสินค้า
        </button>

        <p className="mt-2 text-xs text-slate-500">
          รองรับ JPG, PNG, WEBP ขนาดไม่เกิน {MAX_FILE_SIZE_MB}MB ต่อไฟล์
        </p>
        <p className="mt-1 text-xs text-slate-400">
          สามารถลากไฟล์มาวางในพื้นที่นี้ได้
        </p>
      </div>

      {files.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${file.size}-${index}`}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="aspect-square bg-slate-100">
                {previewUrls[index] ? (
                  <img
                    src={previewUrls[index]}
                    alt={file.name || `product-image-${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>

              <div className="space-y-2 p-3">
                <div className="truncate text-xs font-medium text-slate-700">
                  {file.name || `รูปภาพ ${index + 1}`}
                </div>

                <input
                  type="text"
                  value={captions[index] ?? ''}
                  disabled={disabled}
                  onChange={(event) => updateCaption(index, event.target.value)}
                  placeholder="คำอธิบายรูปภาพ"
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setCoverIndex?.(index)}
                    className={`rounded-lg px-2 py-1 text-xs font-medium ${
                      coverIndex === index
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {coverIndex === index ? 'รูปปก' : 'ตั้งเป็นปก'}
                  </button>

                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => removeFile(index)}
                    className="rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">
          ยังไม่ได้เลือกรูปภาพสินค้า
        </p>
      )}
    </div>
  );
});

ProductCreateImageUploader.displayName = 'ProductCreateImageUploader';

export default ProductCreateImageUploader;
