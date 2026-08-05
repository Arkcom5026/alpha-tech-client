import React, { useEffect, useRef, useState } from 'react';
import useStockAuditStore from '../store/stockAuditStore';
import ScanInput from '../components/ScanInput';
import AuditTable from '../components/AuditTable';
import StockAuditSessionSummary from '../components/workspace/StockAuditSessionSummary';
import StockAuditActionBar from '../components/workspace/StockAuditActionBar';
import StockAuditListPanel from '../components/workspace/StockAuditListPanel';
import ConfirmActionDialog from '@/components/shared/dialogs/ConfirmActionDialog';

const ReadyToSellAuditPage = () => {
  const scanRef = useRef(null);
  const audioCtxRef = useRef(null);
  const initRef = useRef(false);

  const {
    sessionId,
    expectedCount,
    scannedCount,
    missingCount,
    expectedItems,
    expectedTotal,
    expectedPage,
    expectedPageSize,
    scannedItems,
    scannedTotal,
    scannedPage,
    scannedPageSize,
    startReadyAuditAction,
    loadActiveReadyAuditAction,
    loadOverviewAction,
    loadItemsAction,
    scanBarcodeAction,
    confirmAuditAction,
    scanSnAction,
    cancelAuditAction,
    resetAuditStateAction,
    isScanning,
    isConfirming,
    errorMessage,
    isLoadingItems,
    isCancelling,
    isStarting,
  } = useStockAuditStore();

  const [scanMode, setScanMode] = useState('BARCODE');
  const [openConfirmLost, setOpenConfirmLost] = useState(false);
  const [openConfirmPending, setOpenConfirmPending] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');
  const [sessionClosed, setSessionClosed] = useState(false);
  const [lastScannedValue, setLastScannedValue] = useState('');
  const [expectedQ, setExpectedQ] = useState('');
  const [scannedQ, setScannedQ] = useState('');

  const formatNum = (value) => Number(value ?? 0).toLocaleString('th-TH');

  const focusScan = () => {
    const element = scanRef.current;
    if (!element) return;

    const focus = () => {
      try {
        if (typeof element.focus === 'function') element.focus();
        if (typeof element.select === 'function') element.select();
      } catch (error) {
        console.error('Focus error:', error);
      }
    };

    if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
      window.requestAnimationFrame(focus);
    } else {
      setTimeout(focus, 0);
    }
  };

  const getAudioCtx = async () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContextClass();
      const context = audioCtxRef.current;
      if (context.state === 'suspended' && context.resume) await context.resume();
      return context;
    } catch (error) {
      console.error('AudioContext error:', error);
      return null;
    }
  };

  const playBeep = async ({ freq, duration, type = 'square', volume = 0.6 }) => {
    const context = await getAudioCtx();
    if (!context) return;
    const start = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.min(volume, 1), start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.05);
    return new Promise((resolve) => setTimeout(resolve, duration * 1000 + 50));
  };

  const playNoise = async ({ duration = 0.3, volume = 0.5 }) => {
    const context = await getAudioCtx();
    if (!context) return;
    const start = context.currentTime;
    const bufferSize = Math.max(1, Math.floor(context.sampleRate * duration));
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < bufferSize; index += 1) {
      data[index] = (Math.random() * 2 - 1) * 0.9;
    }
    const noise = context.createBufferSource();
    const gain = context.createGain();
    noise.buffer = buffer;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.min(volume, 1), start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    noise.connect(gain).connect(context.destination);
    noise.start(start);
    noise.stop(start + duration + 0.02);
  };

  const playSuccess = async () => {
    await playBeep({ freq: 900, duration: 0.2, type: 'triangle', volume: 1 });
    await playBeep({ freq: 1500, duration: 0.2, type: 'triangle', volume: 1 });
  };

  const playDuplicate = async () => {
    const context = await getAudioCtx();
    if (!context) return;
    const now = context.currentTime;
    const makeTone = (start, freq, duration, volume = 0.85) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.05);
    };
    const duration = 0.25;
    const gap = 0.12;
    makeTone(now, 1900, duration);
    makeTone(now + duration + gap, 1900, duration);
  };

  const playError = async () => {
    const context = await getAudioCtx();
    if (!context) return;
    const start = context.currentTime;
    const duration = 1.2;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(1000, start);
    oscillator.frequency.exponentialRampToValueAtTime(200, start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.7, start + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration);
    await playNoise({ duration: 0.5, volume: 0.5 });
  };

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const bootstrap = async () => {
      try {
        const response = await loadActiveReadyAuditAction();
        if (response?.ok && response?.found) {
          setSessionClosed(false);
          setBannerMessage('พบรอบตรวจนับที่เปิดค้างอยู่ ระบบเชื่อมเข้ารอบเดิมให้แล้ว');
          setTimeout(() => setBannerMessage(''), 3500);
        }
      } catch (error) {
        console.error('Bootstrap active audit error:', error);
      } finally {
        focusScan();
      }
    };

    bootstrap();
  }, [loadActiveReadyAuditAction]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'F2') {
        event.preventDefault();
        focusScan();
      } else if (event.key === 'F3') {
        event.preventDefault();
        setScanMode((current) => (current === 'BARCODE' ? 'SN' : 'BARCODE'));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    focusScan();
  }, [scanMode]);

  useEffect(() => {
    if (!sessionId || typeof loadOverviewAction !== 'function') {
      setSessionClosed(false);
      return undefined;
    }

    let cancelled = false;
    const syncSessionState = async () => {
      try {
        const response = await loadOverviewAction(sessionId);
        const confirmedAt = response?.session?.confirmedAt || null;
        if (cancelled) return;
        if (confirmedAt) {
          setSessionClosed(true);
          setBannerMessage('รอบตรวจนับนี้ถูกปิดแล้ว ระบบพร้อมให้เริ่มรอบใหม่');
          if (typeof resetAuditStateAction === 'function') resetAuditStateAction();
          setTimeout(() => setBannerMessage(''), 4500);
          return;
        }
        setSessionClosed(false);
      } catch (error) {
        if (!cancelled) console.error('Sync session state error:', error);
      }
    };

    syncSessionState();
    return () => {
      cancelled = true;
    };
  }, [sessionId, loadOverviewAction, resetAuditStateAction]);

  const classifyScanResult = (result, error) => {
    const code = String(result?.code ?? result?.status ?? result?.reason ?? '').toUpperCase();
    const statusCode = Number(result?.statusCode ?? result?.httpStatus ?? error?.response?.status ?? 0);
    const messageRaw = (result?.message ?? result?.msg ?? result?.error ?? error?.response?.data?.message ?? error?.response?.data?.error ?? '').toString();
    const message = messageRaw.toLowerCase();
    const flags = {
      ok: Boolean(result && (result.ok === true || result === true)),
      duplicate: statusCode === 409,
      notFound: statusCode === 404 || statusCode === 422,
      resolvedPending: false,
    };

    if (['DUPLICATE', 'ALREADY', 'ALREADY_SCANNED'].some((token) => code.includes(token))) flags.duplicate = true;
    if (['NOT_FOUND', 'NOT_IN_EXPECTED', 'UNEXPECTED', 'UNKNOWN_ITEM'].some((token) => code.includes(token))) flags.notFound = true;
    if (['RESOLVED_PENDING', 'PENDING_RESOLVED'].some((token) => code.includes(token))) flags.resolvedPending = true;
    if (message.includes('duplicate') || (message.includes('สแกน') && message.includes('แล้ว'))) flags.duplicate = true;
    if (message.includes('ไม่พบ') || message.includes('not found') || message.includes('unexpected') || message.includes('ไม่อยู่ในชุดคาดหวัง')) flags.notFound = true;
    if (message.includes('ค้างตรวจ') || (message.includes('pending') && message.includes('resolved'))) flags.resolvedPending = true;
    if (flags.duplicate && flags.notFound) flags.notFound = false;
    return flags;
  };

  const handleScan = async (value) => {
    if (!value) {
      focusScan();
      return;
    }

    const input = String(value).trim();
    try {
      const result = scanMode === 'SN' && typeof scanSnAction === 'function'
        ? await scanSnAction(input)
        : await scanBarcodeAction(input, { mode: scanMode });
      const { ok, duplicate, notFound, resolvedPending } = classifyScanResult(result);

      if (ok || resolvedPending) {
        await playSuccess();
        setLastScannedValue(input);
        if (resolvedPending) {
          setBannerMessage('พบสินค้าค้างตรวจและปรับสถานะเรียบร้อยแล้ว');
          setTimeout(() => setBannerMessage(''), 2500);
        }
      } else if (duplicate) {
        await playDuplicate();
      } else if (notFound) {
        await playError();
      } else {
        await playError();
      }
    } catch (error) {
      const { duplicate, notFound, resolvedPending } = classifyScanResult(null, error);
      if (resolvedPending) {
        await playSuccess();
        setBannerMessage('พบสินค้าค้างตรวจและปรับสถานะเรียบร้อยแล้ว');
        setTimeout(() => setBannerMessage(''), 2500);
      } else if (duplicate) {
        await playDuplicate();
      } else if (notFound) {
        await playError();
      } else {
        console.error('Scan error:', error);
        await playError();
      }
    } finally {
      focusScan();
    }
  };

  const startAudit = async () => {
    const response = await startReadyAuditAction();
    if (response?.ok) setSessionClosed(false);
    if (response?.ok && response?.reused) {
      setBannerMessage('พบรอบตรวจนับที่เปิดค้างอยู่ ระบบเชื่อมเข้ารอบเดิมให้แล้ว');
      setTimeout(() => setBannerMessage(''), 3500);
    }
    focusScan();
  };

  const doConfirmLost = async () => {
    try {
      const response = await confirmAuditAction('MARK_LOST');
      if (response?.ok) await playSuccess();
    } catch {
      await playError();
    } finally {
      setOpenConfirmLost(false);
      focusScan();
    }
  };

  const doConfirmPending = async () => {
    try {
      const response = await confirmAuditAction('MARK_PENDING');
      if (response?.ok) await playSuccess();
    } catch {
      await playError();
    } finally {
      setOpenConfirmPending(false);
      focusScan();
    }
  };

  const doCancelAudit = async () => {
    if (!sessionId) return;
    try {
      const response = await cancelAuditAction(sessionId);
      if (response?.ok) {
        await playSuccess();
        if (typeof resetAuditStateAction === 'function') resetAuditStateAction();
      } else {
        await playError();
      }
    } catch {
      await playError();
    } finally {
      setOpenCancel(false);
      focusScan();
    }
  };

  const scanner = (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-600" htmlFor="stock-audit-scan-input">
          สแกนสินค้า
        </label>
        <ScanInput
          id="stock-audit-scan-input"
          ref={scanRef}
          onSubmit={handleScan}
          disabled={isScanning || !sessionId || sessionClosed}
          placeholder={sessionClosed
            ? 'รอบนี้ถูกปิดแล้ว กรุณาเริ่มรอบใหม่'
            : scanMode === 'SN'
              ? 'สแกนหรือพิมพ์หมายเลขเครื่อง'
              : 'สแกนบาร์โค้ดสินค้า'}
          autoSubmit
          delay={140}
          className="min-h-12 w-full rounded-xl border border-teal-200 bg-white px-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
        />
      </div>

      <div>
        <p className="mb-1.5 text-xs font-semibold text-slate-600">โหมดสแกน</p>
        <div className="grid grid-cols-2 rounded-xl border border-teal-200 bg-teal-50 p-1 lg:min-w-[220px]">
          {['BARCODE', 'SN'].map((mode) => {
            const active = scanMode === mode;
            return (
              <button
                key={mode}
                type="button"
                className={`min-h-10 rounded-lg px-4 text-sm font-semibold transition ${active
                  ? 'bg-emerald-200 text-emerald-950 shadow-sm'
                  : 'text-teal-900 hover:bg-white'}`}
                onClick={() => setScanMode(mode)}
              >
                {mode === 'BARCODE' ? 'Barcode' : 'SN'}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-full bg-slate-50 p-3 md:p-5">
      <div className="mx-auto max-w-[1500px] space-y-4">
        <StockAuditSessionSummary
          sessionId={sessionId}
          expectedCount={expectedCount}
          scannedCount={scannedCount}
          missingCount={missingCount}
          formatNumber={formatNum}
        />

        <StockAuditActionBar
          sessionId={sessionId}
          sessionClosed={sessionClosed}
          isStarting={isStarting}
          isConfirming={isConfirming}
          isCancelling={isCancelling}
          onStart={startAudit}
          onCancel={() => setOpenCancel(true)}
          onMarkLost={() => setOpenConfirmLost(true)}
          onMarkPending={() => setOpenConfirmPending(true)}
        />

        {(errorMessage || bannerMessage || lastScannedValue) ? (
          <section className="grid gap-2 sm:grid-cols-2">
            {errorMessage ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                {errorMessage}
              </div>
            ) : null}
            {bannerMessage ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                {bannerMessage}
              </div>
            ) : null}
            {lastScannedValue && !errorMessage ? (
              <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
                สแกนล่าสุด: <strong className="font-semibold tabular-nums">{lastScannedValue}</strong>
              </div>
            ) : null}
          </section>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-2">
          <StockAuditListPanel
            title="รายการรอตรวจนับ"
            description="สินค้าที่คาดว่าจะพบและยังไม่ได้สแกนในรอบนี้"
            count={formatNum(expectedTotal)}
            scanner={scanner}
          >
            <AuditTable
              items={expectedItems}
              total={expectedTotal}
              page={expectedPage}
              pageSize={expectedPageSize}
              loading={isLoadingItems}
              onSearch={(query) => {
                setExpectedQ(query);
                return loadItemsAction({ scanned: 0, q: query, page: 1, pageSize: expectedPageSize });
              }}
              onPageChange={(page) => loadItemsAction({ scanned: 0, q: expectedQ, page, pageSize: expectedPageSize })}
            />
          </StockAuditListPanel>

          <StockAuditListPanel
            title="รายการที่สแกนแล้ว"
            description="สินค้าที่ตรวจพบและบันทึกเข้าสู่รอบตรวจนับแล้ว"
            count={formatNum(scannedTotal)}
            accent="emerald"
          >
            <AuditTable
              items={scannedItems}
              total={scannedTotal}
              page={scannedPage}
              pageSize={scannedPageSize}
              scanned
              highlightValue={lastScannedValue}
              loading={isLoadingItems}
              onSearch={(query) => {
                setScannedQ(query);
                return loadItemsAction({ scanned: 1, q: query, page: 1, pageSize: scannedPageSize });
              }}
              onPageChange={(page) => loadItemsAction({ scanned: 1, q: scannedQ, page, pageSize: scannedPageSize })}
            />
          </StockAuditListPanel>
        </div>
      </div>

      <ConfirmActionDialog
        open={openConfirmLost}
        onOpenChange={setOpenConfirmLost}
        title="บันทึกสินค้าสูญหาย"
        description="สินค้าที่ยังไม่ถูกสแกนจะถูกบันทึกเป็นสูญหาย และรอบตรวจนับจะถูกปิดทันที"
        confirmText={isConfirming ? 'กำลังบันทึก...' : 'ยืนยันบันทึกสูญหาย'}
        confirmVariant="primary"
        onConfirm={doConfirmLost}
        disabled={isConfirming || isCancelling || !sessionId || sessionClosed}
      />

      <ConfirmActionDialog
        open={openConfirmPending}
        onOpenChange={setOpenConfirmPending}
        title="ปิดรอบแบบค้างตรวจ"
        description="ปิดรอบโดยยังไม่สรุปเป็นสูญหาย สินค้าที่ยังไม่ถูกสแกนจะถูกทำเครื่องหมายเป็นค้างตรวจ"
        confirmText={isConfirming ? 'กำลังบันทึก...' : 'ยืนยันปิดรอบ'}
        confirmVariant="warning"
        onConfirm={doConfirmPending}
        disabled={isConfirming || isCancelling || !sessionId || sessionClosed}
      />

      <ConfirmActionDialog
        open={openCancel}
        onOpenChange={setOpenCancel}
        title="ยกเลิกรอบตรวจนับ"
        description="ยกเลิกรอบนี้โดยไม่สรุปเป็นสูญหายหรือค้างตรวจ และล้างข้อมูลรอบปัจจุบัน"
        confirmText={isCancelling ? 'กำลังยกเลิก...' : 'ยืนยันยกเลิกรอบ'}
        confirmVariant="danger"
        onConfirm={doCancelAudit}
        disabled={isConfirming || isCancelling || !sessionId || sessionClosed}
      />
    </div>
  );
};

export default ReadyToSellAuditPage;
