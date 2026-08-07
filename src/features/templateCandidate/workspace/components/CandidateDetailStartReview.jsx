const CandidateDetailStartReview = ({ visible, busy, onStartReview }) => {
  if (!visible) return null;
  return (
    <section className="rounded-3xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
      <h2 className="text-lg font-black text-blue-950">เริ่มตรวจสอบ Candidate</h2>
      <p className="mt-1 text-sm font-semibold text-blue-700">เปลี่ยนสถานะจาก DRAFT เป็น UNDER_REVIEW ก่อนตัดสินใจ</p>
      <button type="button" disabled={busy} onClick={onStartReview} className="mt-4 min-h-11 rounded-2xl bg-blue-700 px-5 text-sm font-black text-white disabled:opacity-50">
        {busy ? 'กำลังดำเนินการ...' : 'Start Review'}
      </button>
    </section>
  );
};

export default CandidateDetailStartReview;
