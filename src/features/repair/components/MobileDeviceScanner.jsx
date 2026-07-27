import React, { useEffect, useRef, useState } from 'react';

const FORMATS = [
  'qr_code',
  'code_128',
  'code_39',
  'ean_13',
  'ean_8',
  'upc_a',
  'upc_e',
  'itf',
  'data_matrix',
];

const MobileDeviceScanner = ({ open, onClose, onDetected }) => {
  const videoRef = useRef(null);
  const frameRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;

    const stop = () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      streamRef.current?.getTracks?.().forEach((track) => track.stop());
      streamRef.current = null;
    };

    const start = async () => {
      if (!('BarcodeDetector' in window)) {
        setError('Browser นี้ยังไม่รองรับการสแกนอัตโนมัติ กรุณากรอกรหัสในช่องค้นหา');
        return;
      }

      try {
        setError(null);
        const supported = await window.BarcodeDetector.getSupportedFormats();
        const formats = FORMATS.filter((format) => supported.includes(format));
        const detector = new window.BarcodeDetector({ formats });
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        const scan = async () => {
          if (cancelled || !videoRef.current) return;
          try {
            const results = await detector.detect(videoRef.current);
            const value = results?.[0]?.rawValue?.trim();
            if (value) {
              stop();
              onDetected(value);
              return;
            }
          } catch {
            // A video frame may be unavailable while the camera is starting.
          }
          frameRef.current = requestAnimationFrame(scan);
        };
        scan();
      } catch (cameraError) {
        setError(
          cameraError?.name === 'NotAllowedError'
            ? 'กรุณาอนุญาตให้เว็บไซต์ใช้กล้องเพื่อสแกนรหัส'
            : 'ไม่สามารถเปิดกล้องได้ กรุณากรอกรหัสด้วยตนเอง'
        );
      }
    };

    start();
    return () => {
      cancelled = true;
      stop();
    };
  }, [open, onDetected]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950 text-white">
      <header className="flex items-center justify-between px-4 py-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-300">Mobile Scanner</p>
          <h2 className="mt-1 text-lg font-black">สแกน Barcode หรือ QR</h2>
        </div>
        <button type="button" onClick={onClose} className="min-h-11 rounded-xl bg-white/10 px-4 font-black">
          ปิด
        </button>
      </header>
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-48 w-[82%] max-w-sm rounded-3xl border-2 border-blue-400 shadow-[0_0_0_999px_rgba(2,6,23,0.58)]" />
        </div>
      </div>
      <footer className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 text-center">
        {error ? (
          <p className="rounded-2xl bg-red-500/15 p-3 text-sm font-bold text-red-200">{error}</p>
        ) : (
          <p className="text-sm text-slate-300">วางรหัสให้อยู่ภายในกรอบ ระบบจะค้นหาให้อัตโนมัติ</p>
        )}
      </footer>
    </div>
  );
};

export default MobileDeviceScanner;
