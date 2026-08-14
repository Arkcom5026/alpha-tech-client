import { TEMPLATE_CANDIDATE_TYPE } from '../../utils/candidateStatus';

const CandidateCatalogQualityDecisionPanel = ({
  candidate,
  busy,
  decisionNote,
  setDecisionNote,
  canonicalTemplateProductId,
  setCanonicalTemplateProductId,
  onResolveDuplicate,
  onArchiveOrphan,
}) => {
  if (!candidate?.type) return null;

  const actionable = ['OPEN', 'UNDER_REVIEW'].includes(candidate.status);
  const isDuplicate = candidate.type === TEMPLATE_CANDIDATE_TYPE.POSSIBLE_DUPLICATE;
  const isOrphan = candidate.type === TEMPLATE_CANDIDATE_TYPE.ORPHAN_UNUSED;
  const isQuality = candidate.type === TEMPLATE_CANDIDATE_TYPE.QUALITY_REVIEW;

  return (
    <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-emerald-600">Template Catalog Quality</p>
        <h2 className="mt-2 text-lg font-black text-slate-900">การจัดการ Candidate</h2>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          Candidate ใช้ดูแลคุณภาพ Product ต้นแบบเท่านั้น ไม่แก้ Product หรือธุรกรรมของร้านโดยตรง
        </p>
      </div>

      <label className="block">
        <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Decision Note</span>
        <textarea
          value={decisionNote}
          maxLength={2000}
          onChange={(event) => setDecisionNote(event.target.value)}
          className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 p-3 text-sm"
          placeholder="เหตุผลหรือบันทึกประกอบการตัดสินใจ"
        />
      </label>

      {isDuplicate && (
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
          <h3 className="font-black text-violet-900">Possible Duplicate</h3>
          <p className="mt-1 text-xs font-semibold leading-5 text-violet-700">
            เลือก Product ต้นแบบที่จะเป็น Canonical Product ระบบจะย้ายเฉพาะการอ้างอิงจาก Local Product ไปยัง Canonical และ retire ตัวซ้ำเมื่อไม่มี reference เหลือ
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {[candidate.primaryTemplateProductId, candidate.comparisonTemplateProductId]
              .filter(Boolean)
              .map((productId) => (
                <label key={productId} className="flex cursor-pointer items-center gap-3 rounded-xl border border-violet-200 bg-white p-3 text-sm font-bold text-slate-800">
                  <input
                    type="radio"
                    name="canonicalTemplateProductId"
                    value={productId}
                    checked={Number(canonicalTemplateProductId) === Number(productId)}
                    onChange={(event) => setCanonicalTemplateProductId(event.target.value)}
                  />
                  Template Product #{productId}
                </label>
              ))}
          </div>
          <button
            type="button"
            disabled={busy || !actionable || !canonicalTemplateProductId}
            onClick={onResolveDuplicate}
            className="mt-4 min-h-11 rounded-xl bg-violet-700 px-4 text-sm font-black text-white disabled:opacity-40"
          >
            ยืนยัน Canonical และจัดการตัวซ้ำ
          </button>
        </div>
      )}

      {isOrphan && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="font-black text-amber-900">Orphan / Unused Template</h3>
          <p className="mt-1 text-xs font-semibold leading-5 text-amber-700">
            ระบบจะตรวจจำนวน Local Product reference ซ้ำภายใน transaction ก่อนนำ Product ต้นแบบออกจาก Catalog หากมีร้านอ้างอิงใหม่ การทำรายการจะถูกปฏิเสธ
          </p>
          <button
            type="button"
            disabled={busy || !actionable}
            onClick={onArchiveOrphan}
            className="mt-4 min-h-11 rounded-xl bg-amber-700 px-4 text-sm font-black text-white disabled:opacity-40"
          >
            ตรวจซ้ำและนำออกจาก Catalog
          </button>
        </div>
      )}

      {isQuality && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <h3 className="font-black text-blue-900">Quality Review</h3>
          <p className="mt-1 text-xs font-semibold leading-5 text-blue-700">
            ใช้ Assessment ด้านล่างเพื่อตรวจชื่อ ประเภทสินค้า Brand Unit Barcode และรูปภาพ ปัจจุบัน Candidate ประเภทนี้เป็น review surface และไม่แก้ Product อัตโนมัติ
          </p>
        </div>
      )}

      {!actionable && (
        <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
          Candidate นี้อยู่ในสถานะปลายทางแล้ว ไม่มี action ที่เปลี่ยน Catalog เพิ่มเติม
        </p>
      )}
    </section>
  );
};

export default CandidateCatalogQualityDecisionPanel;
