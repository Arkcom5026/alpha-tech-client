import { useEffect, useMemo, useRef, useState } from 'react';

const EMPLOYEE_MANAGE_CAPABILITY = 'employee.manage';
const REPAIR_CAPABILITIES = Object.freeze({
  READ: 'repair.read',
  INTAKE: 'repair.intake',
  WORKFLOW: 'repair.workflow',
  PARTS: 'repair.parts',
  ESTIMATE: 'repair.estimate',
  CLAIM: 'repair.claim',
  HANDOVER: 'repair.handover',
  CUSTOMER_ACCESS: 'repair.customer-access',
  CUSTOMER_OVERRIDE: 'repair.customer-override',
});
const INVENTORY_CAPABILITIES = Object.freeze({
  ADJUST: 'inventory.adjust',
  TRANSFER: 'inventory.transfer',
});

const CAPABILITY_GROUPS = Object.freeze([
  {
    key: 'employee',
    title: 'การจัดการพนักงาน',
    description: 'สิทธิ์ด้านบัญชีและโครงสร้างพนักงานภายในสาขา',
    options: [
      {
        key: EMPLOYEE_MANAGE_CAPABILITY,
        label: 'เพิ่มและจัดการพนักงาน',
        description: 'อนุญาตให้พนักงานในตำแหน่งนี้จัดการ flow เพิ่มพนักงานของสาขา',
      },
    ],
  },
  {
    key: 'repair',
    title: 'งานซ่อมและเคลม',
    description: 'กำหนดขอบเขตงานซ่อมเป็นรายหน้าที่ โดยไม่อิงชื่อหรือตำแหน่งแบบตายตัว',
    options: [
      {
        key: REPAIR_CAPABILITIES.READ,
        label: 'ดูข้อมูลงานซ่อม',
        description: 'ดูรายการงานซ่อม รายละเอียด และข้อมูลประกอบที่อยู่ในสาขา',
      },
      {
        key: REPAIR_CAPABILITIES.INTAKE,
        label: 'รับงานซ่อมและรับอุปกรณ์',
        description: 'สร้างงานรับซ่อมและบันทึกข้อมูลการรับอุปกรณ์จากลูกค้า',
      },
      {
        key: REPAIR_CAPABILITIES.WORKFLOW,
        label: 'ดำเนินขั้นตอนงานซ่อม',
        description: 'รับงาน วินิจฉัย เริ่มซ่อม เปลี่ยนสถานะ และดำเนิน workflow ของช่าง',
      },
      {
        key: REPAIR_CAPABILITIES.PARTS,
        label: 'จัดการอะไหล่ในงานซ่อม',
        description: 'เพิ่มหรือเบิกอะไหล่และเชื่อมการใช้สต๊อกเข้ากับงานซ่อม',
      },
      {
        key: REPAIR_CAPABILITIES.ESTIMATE,
        label: 'จัดการการประเมินราคา',
        description: 'จัดทำและส่งข้อมูลประเมินราคาหรือข้อตกลงก่อนดำเนินงาน',
      },
      {
        key: REPAIR_CAPABILITIES.CLAIM,
        label: 'จัดการงานเคลม',
        description: 'เปิด ติดตาม และดำเนินสถานะงานเคลมที่เกี่ยวข้องกับงานซ่อม',
      },
      {
        key: REPAIR_CAPABILITIES.HANDOVER,
        label: 'ส่งมอบงานซ่อม',
        description: 'ยืนยันการส่งมอบอุปกรณ์และปิดขั้นตอน custody กับลูกค้า',
      },
      {
        key: REPAIR_CAPABILITIES.CUSTOMER_ACCESS,
        label: 'จัดการการเข้าถึงของลูกค้า',
        description: 'สร้างและจัดการข้อมูลสำหรับติดตามงานซ่อมจากฝั่งลูกค้า',
      },
      {
        key: REPAIR_CAPABILITIES.CUSTOMER_OVERRIDE,
        label: 'อนุญาตรับงานกรณีเจ้าของอุปกรณ์ไม่ตรง',
        description: 'อนุญาต override เจ้าของอุปกรณ์เดิมเมื่อมีเหตุผลและผู้ใช้เลือกยืนยันอย่างชัดเจน',
      },
    ],
  },
  {
    key: 'inventory',
    title: 'สต๊อกและการเคลื่อนไหวสินค้า',
    description: 'กำหนดสิทธิ์การปรับยอดและโอนสต๊อกแบบ Simple แยกจากชื่อบทบาทเดิม',
    options: [
      {
        key: INVENTORY_CAPABILITIES.ADJUST,
        label: 'ปรับยอดสต๊อก',
        description: 'อนุญาตเพิ่มหรือลดยอดสต๊อกแบบ Simple เมื่อมีเหตุผลและหลักฐานประกอบ',
      },
      {
        key: INVENTORY_CAPABILITIES.TRANSFER,
        label: 'โอนสต๊อกระหว่างสาขา',
        description: 'อนุญาตสร้างรายการโอนสต๊อกแบบ Simple จากสาขาปัจจุบันไปยังสาขาปลายทาง',
      },
    ],
  },
]);

const PositionForm = ({
  initialValues = { name: '', description: '', capabilities: [] },
  onSubmit,
  onCancel,
  submitting = false,
  mutationOwnedRef,
  error = null,
}) => {
  const [name, setName] = useState(initialValues?.name || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [positionAuthorityEnabled, setPositionAuthorityEnabled] = useState(
    Array.isArray(initialValues?.capabilities),
  );
  const [capabilities, setCapabilities] = useState(
    Array.isArray(initialValues?.capabilities) ? initialValues.capabilities : [],
  );
  const prevInitial = useRef(initialValues);

  useEffect(() => {
    if (prevInitial.current !== initialValues) {
      setName(initialValues?.name || '');
      setDescription(initialValues?.description || '');
      setPositionAuthorityEnabled(Array.isArray(initialValues?.capabilities));
      setCapabilities(Array.isArray(initialValues?.capabilities) ? initialValues.capabilities : []);
      prevInitial.current = initialValues;
    }
  }, [initialValues]);

  const mutationBusy = submitting || Boolean(mutationOwnedRef?.current);
  const canSubmit = useMemo(() => {
    const nm = String(name || '').trim();
    return nm.length > 0 && !submitting;
  }, [name, submitting]);

  const hasCapability = (key) => capabilities.includes(key);
  const toggleCapability = (key) => {
    if (mutationBusy) return;
    setCapabilities((current) => (
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key]
    ));
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!canSubmit || mutationOwnedRef?.current) return;

    const payload = {
      name: String(name).trim(),
      description: String(description || '').trim() || null,
    };
    if (positionAuthorityEnabled) payload.capabilities = capabilities;
    onSubmit?.(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-busy={mutationBusy}>
      {error && (
        <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">ชื่อตำแหน่ง <span className="text-rose-600">*</span></label>
        <input
          className="w-full border border-zinc-300 dark:border-zinc-700 rounded-md px-3 py-2 bg-white dark:bg-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-950/40 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="เช่น ผู้ดูแลระบบ"
          value={name}
          onChange={(e) => {
            if (!mutationOwnedRef?.current) setName(e.target.value);
          }}
          disabled={mutationBusy}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">คำอธิบาย</label>
        <textarea
          className="w-full border border-zinc-300 dark:border-zinc-700 rounded-md px-3 py-2 bg-white dark:bg-zinc-900 min-h-[96px] outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-950/40 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
          value={description}
          onChange={(e) => {
            if (!mutationOwnedRef?.current) setDescription(e.target.value);
          }}
          disabled={mutationBusy}
        />
      </div>

      <section className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">สิทธิ์ของตำแหน่งงาน</h2>
            <p className="mt-1 text-xs leading-5 text-zinc-600">
              ตำแหน่งงานจะเป็นแหล่งกำหนดสิทธิ์หลักของพนักงาน ส่วน v2Role จะคงไว้เป็นชั้นรองรับของระบบเดิมระหว่างการย้าย
            </p>
          </div>
          {!positionAuthorityEnabled && (
            <button
              type="button"
              disabled={mutationBusy}
              onClick={() => setPositionAuthorityEnabled(true)}
              className="shrink-0 rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
            >
              เริ่มใช้สิทธิ์จากตำแหน่งนี้
            </button>
          )}
        </div>

        {!positionAuthorityEnabled ? (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
            ตำแหน่งนี้ยังใช้สิทธิ์จากระบบเดิมอยู่ การกดเริ่มใช้สิทธิ์จากตำแหน่งจะย้าย authority ของตำแหน่งนี้แบบค่อยเป็นค่อยไป
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {CAPABILITY_GROUPS.map((group) => (
              <div key={group.key} className="rounded-xl border border-zinc-200 bg-white p-3">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">{group.title}</h3>
                  <p className="mt-0.5 text-xs leading-5 text-zinc-600">{group.description}</p>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                  {group.options.map((option) => (
                    <label key={option.key} className="flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50/60 p-3">
                      <input
                        type="checkbox"
                        checked={hasCapability(option.key)}
                        onChange={() => toggleCapability(option.key)}
                        disabled={mutationBusy}
                        className="mt-0.5 h-4 w-4 accent-emerald-600"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-zinc-900">{option.label}</span>
                        <span className="mt-0.5 block text-xs leading-5 text-zinc-600">{option.description}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button type="button" className="px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50" onClick={onCancel} disabled={mutationBusy}>ยกเลิก</button>
        <button type="submit" disabled={!canSubmit || mutationBusy} className="px-3 py-2 rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50">{mutationBusy ? 'กำลังบันทึก...' : 'บันทึก'}</button>
      </div>
    </form>
  );
};

export default PositionForm;
