const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
};

const CandidateDetailTimeline = ({ events }) => (
  <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="text-lg font-black text-slate-900">Event Timeline</h2>
    <div className="mt-4 space-y-3">
      {events.length === 0 ? <p className="text-sm font-semibold text-slate-500">ยังไม่มี Event</p> : events.map((event) => (
        <div key={event.id || `${event.eventType}-${event.createdAt}`} className="rounded-2xl border border-slate-200 p-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><p className="font-black text-slate-900">{event.eventType || '-'}</p><p className="text-xs font-bold text-slate-400">{formatDate(event.createdAt)}</p></div>
          <p className="mt-2 text-sm font-semibold text-slate-600">{event.previousStatus || '-'} → {event.resultingStatus || '-'} · Actor #{event.actorEmployeeId || '-'}</p>
          {event.note && <p className="mt-2 text-sm text-slate-700">{event.note}</p>}
          {event.metadata && <pre className="mt-3 overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-100">{JSON.stringify(event.metadata, null, 2)}</pre>}
        </div>
      ))}
    </div>
  </section>
);

export default CandidateDetailTimeline;
