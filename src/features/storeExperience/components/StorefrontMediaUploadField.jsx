import { useRef, useState } from 'react';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const StorefrontMediaUploadField = ({
  label,
  purpose,
  value,
  onUploaded,
  onBusyChange = () => {},
  upload,
  disabled = false,
  accept = 'image/*',
}) => {
  const inputRef = useRef(null);
  const [uploadState, setUploadState] = useState({ busy: false, error: '' });

  const selectFile = () => inputRef.current?.click();

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!String(file.type || '').toLowerCase().startsWith('image/')) {
      setUploadState({ busy: false, error: 'รองรับเฉพาะไฟล์รูปภาพ' });
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setUploadState({ busy: false, error: 'รูปภาพต้องมีขนาดไม่เกิน 5 MB' });
      return;
    }

    setUploadState({ busy: true, error: '' });
    onBusyChange(true, purpose);
    try {
      const result = await upload({ file, purpose });
      if (!result?.secureUrl) throw new Error('ไม่พบ URL รูปภาพจากระบบอัปโหลด');
      onUploaded(result.secureUrl, result);
      setUploadState({ busy: false, error: '' });
    } catch (error) {
      setUploadState({
        busy: false,
        error: error?.response?.data?.message || error.message || 'อัปโหลดรูปภาพไม่สำเร็จ',
      });
    } finally {
      onBusyChange(false, purpose);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-700">{label}</p>
          <p className="mt-0.5 text-xs text-slate-500">ไฟล์รูปภาพไม่เกิน 5 MB</p>
        </div>
        <button
          type="button"
          onClick={selectFile}
          disabled={disabled || uploadState.busy}
          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploadState.busy ? 'กำลังอัปโหลด...' : value ? 'เปลี่ยนรูป' : 'เลือกรูป'}
        </button>
      </div>
      <input ref={inputRef} type="file" accept={accept} onChange={handleFile} className="hidden" />
      {value ? <img src={value} alt={label} className="mt-3 max-h-44 w-full rounded-lg border border-slate-200 bg-white object-contain" /> : null}
      {uploadState.error ? <p className="mt-2 text-xs font-medium text-red-600">{uploadState.error}</p> : null}
    </div>
  );
};

export default StorefrontMediaUploadField;
