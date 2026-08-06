import { useRef, useState } from 'react';
import { listStorefrontMedia } from '../api/storeExperienceApi';

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
  const [library, setLibrary] = useState({ open: false, loading: false, error: '', assets: [], nextCursor: null });

  const selectFile = () => inputRef.current?.click();

  const loadLibrary = async ({ append = false, cursor = null } = {}) => {
    setLibrary((current) => ({ ...current, open: true, loading: true, error: '' }));
    try {
      const result = await listStorefrontMedia({ purpose, pageSize: 24, nextCursor: cursor });
      setLibrary((current) => ({
        ...current,
        open: true,
        loading: false,
        error: '',
        assets: append ? [...current.assets, ...(result?.assets || [])] : (result?.assets || []),
        nextCursor: result?.nextCursor || null,
      }));
    } catch (error) {
      setLibrary((current) => ({
        ...current,
        open: true,
        loading: false,
        error: error?.response?.data?.message || error.message || 'โหลดคลังรูปภาพไม่สำเร็จ',
      }));
    }
  };

  const chooseAsset = (asset) => {
    if (!asset?.secureUrl) return;
    onUploaded(asset.secureUrl, asset);
    setLibrary((current) => ({ ...current, open: false }));
  };

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
          <p className="mt-0.5 text-xs text-slate-500">อัปโหลดใหม่หรือเลือกภาพเดิมของร้าน ไฟล์ไม่เกิน 5 MB</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={() => loadLibrary()}
            disabled={disabled || uploadState.busy}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            เลือกจากคลัง
          </button>
          <button
            type="button"
            onClick={selectFile}
            disabled={disabled || uploadState.busy}
            className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploadState.busy ? 'กำลังอัปโหลด...' : value ? 'เปลี่ยนรูป' : 'อัปโหลดรูป'}
          </button>
        </div>
      </div>
      <input ref={inputRef} type="file" accept={accept} onChange={handleFile} className="hidden" />
      {value ? <img src={value} alt={label} className="mt-3 max-h-44 w-full rounded-lg border border-slate-200 bg-white object-contain" /> : null}
      {uploadState.error ? <p className="mt-2 text-xs font-medium text-red-600">{uploadState.error}</p> : null}

      {library.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-label={`คลังรูปภาพ ${label}`}>
          <div className="max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="font-bold text-slate-900">เลือกภาพจากคลังของร้าน</h3>
                <p className="mt-1 text-xs text-slate-500">แสดงเฉพาะภาพประเภท {label} ของร้านปัจจุบัน</p>
              </div>
              <button type="button" onClick={() => setLibrary((current) => ({ ...current, open: false }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">ปิด</button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto p-5">
              {library.loading && library.assets.length === 0 ? <p className="py-10 text-center text-sm text-slate-500">กำลังโหลดคลังรูปภาพ...</p> : null}
              {library.error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <p>{library.error}</p>
                  <button type="button" onClick={() => loadLibrary()} className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white">ลองใหม่</button>
                </div>
              ) : null}
              {!library.loading && !library.error && library.assets.length === 0 ? <p className="py-10 text-center text-sm text-slate-500">ยังไม่มีภาพประเภทนี้ในคลัง</p> : null}

              {library.assets.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {library.assets.map((asset) => (
                    <button
                      type="button"
                      key={asset.publicId}
                      onClick={() => chooseAsset(asset)}
                      className="overflow-hidden rounded-xl border border-slate-200 bg-white text-left transition hover:border-blue-500 hover:shadow-md"
                    >
                      <img src={asset.secureUrl} alt={asset.publicId} className="h-40 w-full bg-slate-100 object-cover" />
                      <div className="p-3">
                        <p className="truncate text-xs font-semibold text-slate-700">{asset.publicId}</p>
                        <p className="mt-1 text-[11px] text-slate-500">{asset.width || '-'} × {asset.height || '-'} · {asset.format || 'image'}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}

              {library.nextCursor ? (
                <div className="mt-5 text-center">
                  <button type="button" disabled={library.loading} onClick={() => loadLibrary({ append: true, cursor: library.nextCursor })} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
                    {library.loading ? 'กำลังโหลด...' : 'โหลดเพิ่มเติม'}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default StorefrontMediaUploadField;
