import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  getRepairHelpSection,
  inferRepairHelpSection,
  repairHelpSections,
} from './repairHelpContent';

const normalizeSearchText = (section) =>
  [
    section.title,
    section.shortTitle,
    section.summary,
    ...(section.keywords || []),
    ...(section.steps || []),
    ...(section.checklist || []),
    ...(section.notes || []),
    ...(section.statusTable || []).flat(),
    ...(section.faq || []).flat(),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

const GuideList = ({ title, items, ordered = false }) => {
  if (!items?.length) return null;
  const Tag = ordered ? 'ol' : 'ul';

  return (
    <section>
      <h3 className="text-sm font-black text-slate-950">{title}</h3>
      <Tag className={`mt-3 space-y-2 ${ordered ? 'list-decimal pl-5' : ''}`}>
        {items.map((item, index) => (
          <li
            key={`${item}-${index}`}
            className={
              ordered
                ? 'pl-1 text-sm leading-6 text-slate-700'
                : 'flex gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm leading-6 text-slate-700'
            }
          >
            {!ordered ? (
              <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-black text-blue-700">
                ✓
              </span>
            ) : null}
            <span>{item}</span>
          </li>
        ))}
      </Tag>
    </section>
  );
};

const RepairHelpCenter = ({ open, onClose }) => {
  const location = useLocation();
  const contextualSection = inferRepairHelpSection(location.pathname);
  const [activeSectionId, setActiveSectionId] = useState(contextualSection);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) return;
    setActiveSectionId(contextualSection);
    setQuery('');
  }, [open, contextualSection]);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  const filteredSections = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return repairHelpSections;
    return repairHelpSections.filter((section) =>
      normalizeSearchText(section).includes(normalized)
    );
  }, [query]);

  useEffect(() => {
    if (!query || !filteredSections.length) return;
    if (!filteredSections.some((section) => section.id === activeSectionId)) {
      setActiveSectionId(filteredSections[0].id);
    }
  }, [query, filteredSections, activeSectionId]);

  if (!open) return null;

  const activeSection = getRepairHelpSection(activeSectionId);

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="คู่มืองานรับซ่อม">
      <button
        type="button"
        aria-label="ปิดคู่มือ"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px]"
      />

      <aside className="absolute inset-y-0 right-0 flex w-full max-w-5xl flex-col bg-slate-100 shadow-2xl">
        <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                Alpha-Tech Repair Guide
              </p>
              <h2 className="mt-1 text-xl font-black text-slate-950">คู่มือการใช้งานงานรับซ่อม</h2>
              <p className="mt-1 text-sm text-slate-500">
                เปิดดูขั้นตอน Checklist และแนวทางแก้ปัญหาได้โดยไม่ต้องออกจากหน้าทำงาน
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl font-black text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
              aria-label="ปิดคู่มือ"
            >
              ×
            </button>
          </div>

          <label className="mt-4 block">
            <span className="sr-only">ค้นหาในคู่มือ</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ค้นหา เช่น รับเครื่อง, อนุมัติราคา, SLA, ส่งมอบ"
              className="min-h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              autoFocus
            />
          </label>
        </header>

        <div className="grid min-h-0 flex-1 md:grid-cols-[240px_minmax(0,1fr)]">
          <nav className="overflow-y-auto border-b border-slate-200 bg-white p-3 md:border-b-0 md:border-r">
            <div className="flex gap-2 overflow-x-auto pb-1 md:block md:space-y-1 md:overflow-visible">
              {filteredSections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSectionId(section.id)}
                  className={`shrink-0 rounded-xl border px-3 py-2 text-left text-sm font-black transition md:w-full ${
                    activeSectionId === section.id
                      ? 'border-blue-700 bg-blue-700 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {section.shortTitle}
                </button>
              ))}
            </div>
            {!filteredSections.length ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">
                ไม่พบหัวข้อที่ค้นหา
              </div>
            ) : null}
          </nav>

          <main className="overflow-y-auto p-4 sm:p-6 lg:p-8">
            <article className="mx-auto max-w-3xl space-y-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div>
                <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                  คู่มือภายในระบบ
                </span>
                <h2 className="mt-3 text-2xl font-black text-slate-950">{activeSection.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{activeSection.summary}</p>
              </div>

              <GuideList title="ลำดับการทำงาน" items={activeSection.steps} ordered />
              <GuideList title="รายการที่ต้องตรวจ" items={activeSection.checklist} />

              {activeSection.statusTable?.length ? (
                <section>
                  <h3 className="text-sm font-black text-slate-950">ความหมายของสถานะ</h3>
                  <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                    {activeSection.statusTable.map(([code, label, action]) => (
                      <div
                        key={code}
                        className="grid gap-1 border-b border-slate-200 p-3 last:border-b-0 sm:grid-cols-[130px_150px_minmax(0,1fr)]"
                      >
                        <code className="text-xs font-black text-blue-700">{code}</code>
                        <span className="text-sm font-black text-slate-900">{label}</span>
                        <span className="text-sm text-slate-600">{action}</span>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {activeSection.faq?.length ? (
                <section>
                  <h3 className="text-sm font-black text-slate-950">คำถามและแนวทางตรวจสอบ</h3>
                  <div className="mt-3 space-y-3">
                    {activeSection.faq.map(([question, answer]) => (
                      <details key={question} className="group rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <summary className="cursor-pointer list-none text-sm font-black text-slate-900">
                          {question}
                        </summary>
                        <p className="mt-3 border-t border-slate-200 pt-3 text-sm leading-6 text-slate-600">
                          {answer}
                        </p>
                      </details>
                    ))}
                  </div>
                </section>
              ) : null}

              {activeSection.notes?.length ? (
                <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <h3 className="text-sm font-black text-amber-950">ข้อควรรู้</h3>
                  <ul className="mt-2 space-y-2">
                    {activeSection.notes.map((note) => (
                      <li key={note} className="flex gap-2 text-sm leading-6 text-amber-900">
                        <span aria-hidden="true">•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </article>
          </main>
        </div>
      </aside>
    </div>
  );
};

export default RepairHelpCenter;
