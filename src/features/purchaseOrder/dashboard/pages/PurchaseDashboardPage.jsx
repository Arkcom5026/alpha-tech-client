// src/features/purchaseOrder/dashboard/pages/PurchaseDashboardPage.jsx
// 🏛️ Enterprise Platinum Light Mode Edition (User Feedback Optimized — Clear Reading Text)
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { usePurchaseOrderStore } from '../../store/purchaseOrderStore';

const formatTimeAgo = (d) => {
  if (!d) return '';
  const ts = typeof d === 'string' || typeof d === 'number' ? new Date(d) : d;
  if (!(ts instanceof Date) || Number.isNaN(ts.getTime())) return '';

  const diffMs = Date.now() - ts.getTime();
  const sec = Math.max(0, Math.floor(diffMs / 1000));
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
};

const Button = ({ children, onClick, disabled, variant = 'subtle' }) => {
  const base = 'inline-flex items-center justify-center rounded-xl px-4 py-2 text-xs font-black transition-all border shadow-sm duration-150 select-none';
  const variants = {
    primary: 'bg-gradient-to-b from-orange-500 to-amber-500 text-white border-orange-600/20 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/10 active:scale-95 transform',
    subtle: 'bg-slate-800 text-slate-100 border-slate-900 hover:bg-slate-900 active:scale-95 transform',
    ghost: 'bg-transparent text-slate-500 border-transparent hover:bg-slate-100 hover:text-slate-900',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

const ErrorStrip = ({ message, onRetry, retrying = false }) => {
  if (!message) return null;
  return (
    <div className="mb-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 shadow-sm animate-fadeIn">
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs text-rose-700 leading-snug font-medium">
          <div className="font-black text-sm">โหลดข้อมูลไม่สำเร็จ</div>
          <div className="mt-0.5 font-bold opacity-90">{String(message)}</div>
        </div>
        {onRetry && (
          <Button variant="subtle" onClick={onRetry} disabled={retrying}>
            {retrying ? 'กำลังลองใหม่...' : 'ลองใหม่'}
          </Button>
        )}
      </div>
    </div>
  );
};

const EmptyBox = ({ title, desc, onClick, clickable = false, loading = false }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={!clickable || loading}
    className={`w-full rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 shadow-inner text-left transition-all duration-200 ${clickable ? 'hover:border-orange-500/40 hover:bg-white hover:-translate-y-0.5 cursor-pointer' : 'cursor-default'} ${loading ? 'opacity-70 cursor-wait' : ''}`}
    aria-label={title}
  >
    <div className="text-sm font-black text-slate-900">{title}</div>
    {desc && <div className="text-xs text-slate-500 mt-1.5 leading-snug font-bold">{desc}</div>}
    {clickable && (
      <div className="mt-4 inline-flex items-center gap-2 text-xs text-orange-600 font-black select-none">
        <span className="rounded-lg bg-orange-500/10 border border-orange-500/20 px-2.5 py-1">แตะเพื่อสั่งโหลดข้อมูล</span>
        <span className="text-[11px] text-slate-400 font-bold">(ระบบไม่โหลดอัตโนมัติ)</span>
      </div>
    )}
  </button>
);

const SummaryCard = ({ label, value, clickable = false, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={!clickable}
    className={`w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-5 py-4 shadow-sm text-left transition-all duration-200 ${clickable ? 'hover:border-orange-500/40 hover:bg-white hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : 'cursor-default'}`}
    aria-label={label}
  >
    <div className="text-xs text-slate-400 font-black uppercase tracking-wide">{label}</div>
    <div className="text-xl font-black text-slate-900 mt-1.5 tracking-tight">{value}</div>
    {clickable && <div className="text-[11px] mt-2 text-orange-600 font-black">แตะเพื่อเรียกดูตาราง</div>}
  </button>
);

const TrendLine = ({ tone = 'neutral', text }) => {
  if (!text) return null;
  const map = {
    neutral: 'text-slate-400',
    good: 'text-emerald-600',
    warn: 'text-orange-600',
    critical: 'text-rose-600',
  };
  return <div className={`text-[11px] mt-1.5 font-black ${map[tone] || map.neutral}`}>{text}</div>;
};

const KPIBarItem = ({ label, value, tone = 'neutral', hint, onClick }) => {
  const toneMap = {
    neutral: 'border-slate-200 bg-white text-slate-900',
    warn: 'border-orange-500/20 bg-orange-500/5 text-slate-900',
    good: 'border-emerald-500/20 bg-emerald-500/5 text-slate-900',
    critical: 'border-rose-500/20 bg-rose-500/5 text-slate-900',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border px-4 py-3 text-left shadow-[0_4px_20px_rgba(0,0,0,0.01)] transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${toneMap[tone] || toneMap.neutral}`}
      aria-label={label}
    >
      <div className="text-[11px] text-slate-400 font-black uppercase tracking-wider select-none">{label}</div>
      <div className="text-lg font-black mt-1 leading-none text-slate-900 tracking-tight">{value}</div>
      <TrendLine tone={tone} text={hint} />
    </button>
  );
};

const HealthBanner = ({ tone = 'neutral', title, subtitle, actionLabel, onAction }) => {
  const toneMap = {
    good: 'border-emerald-500/20 bg-emerald-500/5',
    warn: 'border-orange-500/20 bg-orange-500/5',
    critical: 'border-rose-500/20 bg-rose-500/5',
    neutral: 'border-slate-200 bg-white',
  };

  const dotMap = {
    good: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]',
    warn: 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]',
    critical: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]',
    neutral: 'bg-slate-400',
  };

  return (
    <div className={`w-full rounded-2xl border px-5 py-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)] ${toneMap[tone] || toneMap.neutral}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 select-none">
            <span className={`h-2 w-2 rounded-full ${dotMap[tone] || dotMap.neutral} animate-pulse`} />
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Procurement Health Status</div>
          </div>
          <div className="text-base font-black text-slate-900 mt-1.5 truncate tracking-tight">{title}</div>
          {subtitle && <div className="text-xs text-slate-500 mt-0.5 font-bold leading-snug">{subtitle}</div>}
        </div>

        {onAction && (
          <Button variant="subtle" onClick={onAction}>
            {actionLabel || 'ดูรายการ'}
          </Button>
        )}
      </div>
    </div>
  );
};

const AgingSummary = ({ buckets, onClick }) => {
  const b = buckets || { d0_7: 0, d8_14: 0, d15p: 0 };
  const total = Number(b.d0_7 || 0) + Number(b.d8_14 || 0) + Number(b.d15p || 0);

  const Seg = ({ label, value, tone }) => {
    const map = {
      neutral: 'border-slate-200 bg-slate-50/60',
      warn: 'border-orange-500/20 bg-orange-500/5',
      critical: 'border-rose-500/20 bg-rose-500/5',
    };
    return (
      <button
        type="button"
        onClick={onClick}
        className={`w-full rounded-2xl border px-4 py-3 text-left shadow-sm transition-all duration-200 hover:bg-white hover:shadow-md hover:-translate-y-0.5 ${map[tone]}`}
      >
        <div className="text-[11px] text-slate-400 font-black uppercase tracking-wider">{label}</div>
        <div className="text-base font-black text-slate-900 mt-1 tracking-tight">{value}</div>
      </button>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_25px_rgba(0,0,0,0.01)] space-y-4">
      <div className="flex items-start justify-between gap-3 select-none">
        <div>
          <div className="text-sm font-black text-slate-900">Aging Summary Report</div>
          <div className="text-xs text-slate-400 mt-0.5 font-bold">วิเคราะห์งานค้างตามอายุเอกสารบิล</div>
        </div>
        <div className="text-[10px] font-black bg-slate-100 text-orange-700 px-2.5 py-0.5 rounded-lg border border-slate-200/60 uppercase tracking-wide">
          งานค้างรวม {total} ใบ
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Seg label="0–7 วัน" value={`${Number(b.d0_7 || 0)} บิล`} tone="neutral" />
        <Seg label="8–14 วัน" value={`${Number(b.d8_14 || 0)} บิล`} tone="warn" />
        <Seg label="15+ วัน" value={`${Number(b.d15p || 0)} บิล`} tone="critical" />
      </div>
    </div>
  );
};

export { formatTimeAgo, Button, ErrorStrip, EmptyBox, SummaryCard, TrendLine, KPIBarItem, HealthBanner, AgingSummary };

export { default } from '../../pages/PurchaseDashboardPage';
