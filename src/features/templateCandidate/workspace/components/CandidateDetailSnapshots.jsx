const JsonPanel = ({ title, description, value }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="text-lg font-black text-slate-900">{title}</h2>
    <p className="mt-1 text-xs font-semibold text-slate-500">{description}</p>
    <pre className="mt-4 max-h-[440px] overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">
      {JSON.stringify(value || {}, null, 2)}
    </pre>
  </div>
);

const CandidateDetailSnapshots = ({ candidate }) => {
  const catalogQualityCandidate = Boolean(candidate?.type);

  if (catalogQualityCandidate) {
    return (
      <section className="grid gap-5 xl:grid-cols-2">
        <JsonPanel
          title="Catalog Assessment"
          description="หลักฐานและ Snapshot ที่ระบบใช้เปิด Candidate โดยไม่เปลี่ยน Product ของร้าน"
          value={candidate.assessment || candidate.sourceSnapshot}
        />
        <JsonPanel
          title="Resolution"
          description="ผลการจัดการ Candidate และหลักฐานปลายทาง เมื่อ Candidate ถูก resolve หรือ archive"
          value={candidate.resolution}
        />
      </section>
    );
  }

  return (
    <section className="grid gap-5 xl:grid-cols-2">
      <JsonPanel
        title="Source Snapshot"
        description="ข้อมูลจาก legacy Candidate ณ เวลาสร้างรายการ"
        value={candidate?.sourceSnapshot}
      />
      <JsonPanel
        title="Proposed Template Data"
        description="ข้อมูล legacy ที่ใช้กับ lifecycle เดิม"
        value={candidate?.proposedTemplateData}
      />
    </section>
  );
};

export default CandidateDetailSnapshots;
