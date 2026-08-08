import { useRef, useState } from 'react';
import { listStorefrontMedia } from '../api/storeExperienceApi';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const USAGE_LABELS = {
  DRAFT: 'ใช้ในแบบร่าง',
  PUBLISHED: 'ใช้ในหน้าร้าน',
  DRAFT_AND_PUBLISHED: 'ใช้ทั้งแบบร่างและหน้าร้าน',
  UNUSED: 'ยังไม่ถูกใช้',
};

const formatBytes = (bytes) => {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value < 0) return '-';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
};

const formatCreatedAt = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('th-TH');
};

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
  const [search, setSearch] = useState('');
  const [library, setLibrary] = useState({ open: false, loading: false, error: '', assets: [], nextCursor: null });

  const selectFile = () => inputRef.current?.click();

  const loadLibrary = async ({ append = false, cursor = null, searchValue = search } = {}) => {
    setLibrary((current) => ({ ...current, open: true, loading: true, error: '' }));
    try {
      const result = await listStorefrontMedia({ purpose, search: searchValue, pageSize: 24, nextCursor: cursor });
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

  const handleSearch = (event) => {
    event.preventDefault();
    loadLibrary({ searchValue: search.trim() });
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
      setUploadState({ busy: false, error: error?.response?.data?.message || error.message || 'อัปโหลดรูปภาพไม่สำเร็จ' });
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
          <button type="button" onClick={() => loadLibrary()} disabled={disabled || uploadState.busy} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60">จัดการคลัง</button>
          <button type="button" onClick={selectFile} disabled={disabled || uploadState.busy} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60">{uploadState.busy ? 'กำลังอัปโหลด...' : value ? 'เปลี่ยนรูป' : 'อัปโหลดรูป'}</button>
        </div>
      </div>
      <input ref={inputRef} type="file" accept={accept} onChange={handleFile} className="hidden" />
      {value ? <img src={value} alt={label} className="mt-3 max-h-44 w-full rounded-lg border border-slate-200 bg-white object-contain" /> : null}
      {uploadState.error ? <p className="mt-2 text-xs font-medium text-red-600">{uploadState.error}</p> : null}

      {library.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-label={`จัดการคลังรูปภาพ ${label}`}>
          <div className="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="font-bold text-slate-900">จัดการคลังรูปภาพของร้าน</h3>
                <p className="mt-1 text-xs text-slate-500">ค้นหา ตรวจ metadata และเลือกภาพประเภท {label} กลับมาใช้ในแบบร่าง</p>
              </div>
              <button type="button" onClick={() => setLibrary((current) => ({ ...current, open: false }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">ปิด</button>
            </div>

            <div className="max-h-[72vh] overflow-y-auto p-5">
              <form onSubmit={handleSearch} className="mb-5 flex gap-2">
                <input value={search} maxLength={120} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหา Public ID, URL, format หรือประเภทภาพ" className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                <button type="submit" disabled={library.loading} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">ค้นหา</button>
                <button type="button" onClick={() => { setSearch(''); loadLibrary({ searchValue: '' }); }} disabled={library.loading} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60">ล้าง</button>
              </form>

              {library.loading && library.assets.length === 0 ? <p className="py-10 text-center text-sm text-slate-500">กำลังโหลดคลังรูปภาพ...</p> : null}
              {library.error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><p>{library.error}</p><button type="button" onClick={() => loadLibrary()} className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white">ลองใหม่</button></div> : null}
              {!library.loading && !library.error && library.assets.length === 0 ? <p className="py-10 text-center text-sm text-slate-500">ไม่พบภาพตามเงื่อนไข</p> : null}

              {library.assets.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {library.assets.map((asset) => (
                    <article key={asset.publicId} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                      <img src={asset.secureUrl} alt={asset.publicId} className="h-40 w-full bg-slate-100 object-cover" />
                      <div className="space-y-2 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="min-w-0 truncate text-xs font-semibold text-slate-700" title={asset.publicId}>{asset.publicId}</p>
                          <span className="shrink-0 rounded-full bg-blue-100 px-2 py-1 text-[10px] font-bold text-blue-700">{USAGE_LABELS[asset.usage] || asset.usage || 'ไม่ทราบสถานะ'}</span>
                        </div>
                        <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-500">
                          <dt>ขนาดภาพ</dt><dd className="text-right">{asset.width || '-'} × {asset.height || '-'}</dd>
                          <dt>ขนาดไฟล์</dt><dd className="text-right">{formatBytes(asset.bytes)}</dd>
                          <dt>ชนิดไฟล์</dt><dd className="text-right">{asset.format || 'image'}</dd>
                          <dt>Provider</dt><dd className="text-right">{asset.provider || '-'}</dd>
                          <dt>สร้างเมื่อ</dt><dd className="col-span-2 truncate text-right" title={asset.createdAt || ''}>{formatCreatedAt(asset.createdAt)}</dd>
                        </dl>
                        <div className="flex gap-2 pt-1">
                          <button type="button" onClick={() => chooseAsset(asset)} className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700">ใช้ในแบบร่าง</button>
                          <button type="button" disabled title="ยังไม่เปิดสิทธิ์ลบใน Foundation นี้" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-400 disabled:cursor-not-allowed">ลบ</button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}

              {library.nextCursor ? <div className="mt-5 text-center"><button type="button" disabled={library.loading} onClick={() => loadLibrary({ append: true, cursor: library.nextCursor })} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">{library.loading ? 'กำลังโหลด...' : 'โหลดเพิ่มเติม'}</button></div> : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default StorefrontMediaUploadField;
