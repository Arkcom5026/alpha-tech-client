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
  AUDIT: 'inventory.audit',
  AUDIT_FINALIZE: 'inventory.audit.finalize',
  RECEIVE: 'inventory.receive',
  LIFECYCLE: 'inventory.lifecycle',
  QUICK_STOCK: 'inventory.quick-stock',
  QUICK_RECEIPT: 'inventory.quick-receipt',
  QUICK_RECEIPT_FINALIZE: 'inventory.quick-receipt.finalize',
});
const SALES_CAPABILITIES = Object.freeze({
  CORE: 'sales.core',
  COMPLETE: 'sales.complete',
  RETURN: 'sales.return',
  RETURN_DEDUCTION_APPROVE: 'sales.return.deduction-approve',
  PAYMENT_READ: 'sales.payment.read',
  PAYMENT_MANAGE: 'sales.payment.manage',
  PAYMENT_CANCEL: 'sales.payment.cancel',
  SETTLEMENT_CLOSE: 'sales.settlement.close',
  DOCUMENT_PREPARE: 'sales.document.prepare',
  DOCUMENT_LOCK: 'sales.document.lock',
  DOCUMENT_REPLACE: 'sales.document.replace',
  DOCUMENT_TAX_PUBLISH: 'sales.document.tax-publish',
});
const TAX_OUTPUT_CAPABILITIES = Object.freeze({
  READ: 'tax.output.read',
  PREPARE: 'tax.output.prepare',
  ISSUE: 'tax.output.issue',
  CREDIT_NOTE: 'tax.output.credit-note',
  LIFECYCLE: 'tax.output.lifecycle',
});
const PROCUREMENT_CAPABILITIES = Object.freeze({
  PURCHASE_ORDER: 'procurement.purchase-order',
  PURCHASE_ORDER_CONTROL: 'procurement.purchase-order.control',
  SUPPLIER: 'procurement.supplier',
  SUPPLIER_DELETE: 'procurement.supplier.delete',
  SUPPLIER_PAYMENT_READ: 'procurement.supplier-payment.read',
  SUPPLIER_PAYMENT_MANAGE: 'procurement.supplier-payment.manage',
  SUPPLIER_PAYMENT_VOID: 'procurement.supplier-payment.void',
  RECEIPT: 'procurement.receipt',
  RECEIPT_FINALIZE: 'procurement.receipt.finalize',
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
    description: 'กำหนดสิทธิ์งานสต๊อกแบบ privileged แยกจากชื่อบทบาทเดิม',
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
      {
        key: INVENTORY_CAPABILITIES.AUDIT,
        label: 'ตรวจนับสต๊อก',
        description: 'ดูรอบตรวจนับ เริ่มรอบใหม่ และสแกนสินค้า/หมายเลขเครื่องภายในรอบตรวจนับ',
      },
      {
        key: INVENTORY_CAPABILITIES.AUDIT_FINALIZE,
        label: 'ยืนยันหรือยกเลิกรอบตรวจนับ',
        description: 'อนุญาตยืนยันผลหรือล้มเลิกรอบตรวจนับสต๊อก โดยต้องมีสิทธิ์ตรวจนับสต๊อกด้วย',
      },
      {
        key: INVENTORY_CAPABILITIES.RECEIVE,
        label: 'รับสินค้าเข้าสต๊อก',
        description: 'อนุญาตรับสินค้าจากเอกสารรับเข้า บันทึกบาร์โค้ด/หมายเลขเครื่อง และยืนยันสินค้าเข้าสู่สต๊อก',
      },
      {
        key: INVENTORY_CAPABILITIES.LIFECYCLE,
        label: 'จัดการสถานะรายการสต๊อก',
        description: 'อนุญาตเปลี่ยนสถานะรายการสต๊อกแบบ manual และลบรายการที่ยังไม่ถูกขาย โดยไม่ครอบคลุมการตัดขายจาก flow การขาย',
      },
      {
        key: INVENTORY_CAPABILITIES.QUICK_STOCK,
        label: 'เพิ่มสต๊อกด่วน',
        description: 'อนุญาตใช้ Quick Stock แบบ one-shot เพื่อเพิ่มบาร์โค้ด รับสินค้าเดิม หรือสร้างสินค้าและรับเข้าสต๊อกในขั้นตอนเดียว โดยไม่รวม Quick Receipt Session',
      },
      {
        key: INVENTORY_CAPABILITIES.QUICK_RECEIPT,
        label: 'จัดทำใบรับสินค้าด่วน',
        description: 'ดู สร้าง และแก้ไข Quick Receipt Session รวมถึงเพิ่มหรือลบรายการในร่าง โดยยังไม่อนุญาตปิดรอบ',
      },
      {
        key: INVENTORY_CAPABILITIES.QUICK_RECEIPT_FINALIZE,
        label: 'ยืนยันหรือยกเลิกใบรับสินค้าด่วน',
        description: 'อนุญาต Complete, Finalize หรือ Cancel Quick Receipt Session โดยต้องมีสิทธิ์จัดทำใบรับสินค้าด่วนด้วย',
      },
    ],
  },
  {
    key: 'sales',
    title: 'การขายและหน้าขายสินค้า',
    description: 'แยกสิทธิ์หน้าขาย การคืนสินค้า การรับชำระ การปิดยอด และการกำกับเอกสารออกจากกันตาม authority ของแต่ละขั้นตอน',
    options: [
      {
        key: SALES_CAPABILITIES.CORE,
        label: 'ใช้งานการขาย',
        description: 'ค้นหาสินค้า ใช้ตะกร้าพัก สร้างรายการขาย และดูประวัติ/รายละเอียดการขาย โดยยังไม่รวมการยืนยันขาย',
      },
      {
        key: SALES_CAPABILITIES.COMPLETE,
        label: 'ยืนยันการขาย',
        description: 'อนุญาตยืนยันการขายผ่าน completion flow ที่ตัดสต๊อก บันทึก payment evidence และเผยแพร่ tax candidate โดยต้องมีสิทธิ์ใช้งานการขายด้วย',
      },
      {
        key: SALES_CAPABILITIES.RETURN,
        label: 'รับคืนสินค้า',
        description: 'ดูสิทธิ์คืนสินค้า ประวัติรายการคืน และยืนยันการคืนที่คืนสต๊อกและบันทึก refund evidence',
      },
      {
        key: SALES_CAPABILITIES.RETURN_DEDUCTION_APPROVE,
        label: 'อนุมัติการหักยอดคืน',
        description: 'อนุญาตยืนยันการคืนที่มีการหักยอดเงินคืน โดยต้องมีสิทธิ์รับคืนสินค้าด้วย',
      },
      {
        key: SALES_CAPABILITIES.PAYMENT_READ,
        label: 'ดูข้อมูลการชำระเงิน',
        description: 'ดูและค้นหารายการชำระเงินที่ใช้เป็นหลักฐานทางการเงินของการขาย',
      },
      {
        key: SALES_CAPABILITIES.PAYMENT_MANAGE,
        label: 'บันทึกการชำระเงิน',
        description: 'สร้าง payment evidence สำหรับการรับชำระ รวมถึง flow ที่เชื่อมเงินมัดจำหรือลูกหนี้ตามกฎเดิมของระบบ',
      },
      {
        key: SALES_CAPABILITIES.PAYMENT_CANCEL,
        label: 'ยกเลิกรายการชำระเงิน',
        description: 'ย้อนหรือยกเลิก payment evidence โดยต้องมีสิทธิ์บันทึกการชำระเงินด้วย',
      },
      {
        key: SALES_CAPABILITIES.SETTLEMENT_CLOSE,
        label: 'ปิดยอดการขาย',
        description: 'อนุญาตใช้ mark-paid เพื่อปิดยอดจากหลักฐานการชำระที่ระบบตรวจสอบแล้ว แยกจากสิทธิ์สร้างหรือยกเลิก payment evidence',
      },
      {
        key: SALES_CAPABILITIES.DOCUMENT_PREPARE,
        label: 'จัดเตรียมเอกสารการขาย',
        description: 'ดู สร้าง และแก้ไขร่างเอกสาร รวมถึงบรรทัดและข้อความประกอบ โดยไม่รวมการล็อกหรือเผยแพร่ภาษี',
      },
      {
        key: SALES_CAPABILITIES.DOCUMENT_LOCK,
        label: 'ล็อกเอกสารการขาย',
        description: 'ยืนยัน snapshot ของเอกสารที่จัดเตรียมหรือเอกสารทดแทน โดยต้องมีสิทธิ์ของ flow เอกสารนั้นร่วมด้วย',
      },
      {
        key: SALES_CAPABILITIES.DOCUMENT_REPLACE,
        label: 'จัดทำเอกสารทดแทน',
        description: 'สร้าง ดู และแก้ไขเอกสารทดแทนภายใต้ financial lock ของเอกสารเดิม โดยยังไม่รวมการล็อกเอกสาร',
      },
      {
        key: SALES_CAPABILITIES.DOCUMENT_TAX_PUBLISH,
        label: 'เผยแพร่เอกสารเข้าสู่ภาษี',
        description: 'อนุญาตลงทะเบียน tax candidate จากเอกสารที่จัดเตรียมแล้ว โดยแยกจากสิทธิ์ออกใบส่งของและ tax lifecycle อื่น',
      },
    ],
  },
  {
    key: 'tax-output',
    title: 'ภาษีขายและเอกสารภาษี',
    description: 'แยกสิทธิ์อ่าน เตรียม ออกเอกสาร เครดิตโน้ต และควบคุม lifecycle ของเอกสารภาษีขายออกจากกัน',
    options: [
      {
        key: TAX_OUTPUT_CAPABILITIES.READ,
        label: 'ดูข้อมูลภาษีขาย',
        description: 'ดู tax candidate รายการเอกสาร รายละเอียด และเอกสารพร้อมพิมพ์ภายในสาขา',
      },
      {
        key: TAX_OUTPUT_CAPABILITIES.PREPARE,
        label: 'เตรียมเอกสารภาษีขาย',
        description: 'ลงทะเบียน tax candidate จากแหล่งที่รองรับและรีเฟรชข้อมูลผู้รับในเอกสารร่าง',
      },
      {
        key: TAX_OUTPUT_CAPABILITIES.ISSUE,
        label: 'ออกเอกสารภาษีขาย',
        description: 'ออกใบกำกับภาษีหรือเอกสารภาษีขายผ่าน atomic issuance authority ของระบบ',
      },
      {
        key: TAX_OUTPUT_CAPABILITIES.CREDIT_NOTE,
        label: 'ออกใบลดหนี้ภาษีขาย',
        description: 'ออก credit note จากเอกสารภาษีหรือ Sale Return ตาม eligibility และหลักฐานเดิมของระบบ',
      },
      {
        key: TAX_OUTPUT_CAPABILITIES.LIFECYCLE,
        label: 'ควบคุมสถานะเอกสารภาษี',
        description: 'ดำเนิน transition ของเอกสารภาษีผ่าน canonical lifecycle โดยไม่เปลี่ยนกฎ transition เดิม',
      },
    ],
  },
  {
    key: 'procurement',
    title: 'จัดซื้อและใบรับสินค้า',
    description: 'กำหนดสิทธิ์สำหรับ Supplier, ใบสั่งซื้อ การรับสินค้า และ authority การชำระ โดยแยกงานทั่วไป งานลบ และงานการเงินจริงออกจากกัน',
    options: [
      {
        key: PROCUREMENT_CAPABILITIES.SUPPLIER,
        label: 'จัดการข้อมูล Supplier',
        description: 'ดู เพิ่ม และแก้ไขข้อมูล Supplier ของสาขา โดยยังไม่อนุญาตลบ Supplier',
      },
      {
        key: PROCUREMENT_CAPABILITIES.SUPPLIER_DELETE,
        label: 'ลบข้อมูล Supplier',
        description: 'อนุญาตลบ Supplier ที่ไม่ใช่ Supplier ระบบและไม่มีเอกสารจัดซื้ออ้างอิง โดยต้องมีสิทธิ์จัดการข้อมูล Supplier ด้วย',
      },
      {
        key: PROCUREMENT_CAPABILITIES.PURCHASE_ORDER,
        label: 'จัดทำใบสั่งซื้อ',
        description: 'ดู สร้าง แก้ไข และพิมพ์ใบสั่งซื้อ รวมถึงค้นหา PO ตาม Supplier โดยยังไม่อนุญาตลบหรือเปลี่ยนสถานะเอกสาร',
      },
      {
        key: PROCUREMENT_CAPABILITIES.PURCHASE_ORDER_CONTROL,
        label: 'ควบคุมสถานะหรือลบใบสั่งซื้อ',
        description: 'อนุญาตเปลี่ยนสถานะหรือลบใบสั่งซื้อ โดยต้องมีสิทธิ์จัดทำใบสั่งซื้อด้วย',
      },
      {
        key: PROCUREMENT_CAPABILITIES.SUPPLIER_PAYMENT_READ,
        label: 'ดูข้อมูลการชำระ Supplier',
        description: 'ดูประวัติการชำระ เงินจ่ายล่วงหน้า และรายการตาม Supplier หรือ PO ผ่านพื้นผิว read-only เดิม',
      },
      {
        key: PROCUREMENT_CAPABILITIES.SUPPLIER_PAYMENT_MANAGE,
        label: 'จัดการการชำระ Supplier',
        description: 'ดูรายการใน payment-allocation authority และสร้างการชำระที่ยืนยันแล้วเพื่อจัดสรรยอดให้เจ้าหนี้ Supplier ตามขอบเขตเดิมของ OWNER/MANAGER',
      },
      {
        key: PROCUREMENT_CAPABILITIES.SUPPLIER_PAYMENT_VOID,
        label: 'ยกเลิกรายการชำระ Supplier',
        description: 'อนุญาต void การชำระที่ยืนยันแล้วและย้อน allocation อย่างมีประวัติ โดย route ยังต้องผ่านสิทธิ์จัดการการชำระ Supplier ด้วย',
      },
      {
        key: PROCUREMENT_CAPABILITIES.RECEIPT,
        label: 'จัดทำใบรับสินค้าจาก PO',
        description: 'ดู สร้าง และแก้ไขใบรับสินค้า รายการสินค้า บาร์โค้ด และข้อมูลประกอบ โดยยังไม่อนุญาตปิดหรือ commit เอกสาร',
      },
      {
        key: PROCUREMENT_CAPABILITIES.RECEIPT_FINALIZE,
        label: 'ยืนยันหรือลบใบรับสินค้า',
        description: 'อนุญาต Finalize, Commit เข้าสต๊อก หรือลบใบรับสินค้าทั้งใบ โดยต้องมีสิทธิ์จัดทำใบรับสินค้าจาก PO ด้วย',
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