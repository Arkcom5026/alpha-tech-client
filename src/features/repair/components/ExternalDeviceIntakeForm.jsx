import React, { useEffect, useMemo, useState } from 'react';
import MobileIntakeEvidenceFields from './MobileIntakeEvidenceFields';

const DEVICE_CATEGORIES = [
  ['NOTEBOOK', 'โน้ตบุ๊ก'],
  ['DESKTOP_COMPUTER', 'คอมพิวเตอร์ตั้งโต๊ะ'],
  ['PRINTER', 'เครื่องพิมพ์'],
  ['MONITOR', 'จอภาพ'],
  ['UPS', 'เครื่องสำรองไฟ'],
  ['NETWORK_DEVICE', 'อุปกรณ์เครือข่าย'],
  ['MOBILE_DEVICE', 'โทรศัพท์มือถือ'],
  ['TABLET', 'แท็บเล็ต'],
  ['STORAGE_DEVICE', 'อุปกรณ์จัดเก็บข้อมูล'],
  ['ACCESSORY', 'อุปกรณ์เสริม'],
  ['OTHER', 'อื่น ๆ'],
];

const ACCESSORIES = [
  ['CHARGER', 'ที่ชาร์จ'],
  ['POWER_ADAPTER', 'อะแดปเตอร์'],
  ['CABLE', 'สายเชื่อมต่อ'],
  ['BATTERY', 'แบตเตอรี่'],
  ['BAG_CASE', 'กระเป๋า/เคส'],
  ['SIM_CARD', 'ซิมการ์ด'],
  ['MEMORY_CARD', 'เมมโมรีการ์ด'],
  ['OTHER', 'อื่น ๆ'],
];

const initialDraft = {
  category: 'NOTEBOOK',
  brand: '',
  model: '',
  serialNumber: '',
  imei: '',
  barcode: '',
  customerProblem: '',
  internalRemark: '',
  depositPaid: 0,
  estimatedCost: 0,
  preAgreedService: {
    enabled: false,
    agreedScope: '',
    confirmedByName: '',
    confirmationNote: '',
  },
};

const initialEvidence = {
  photos: [],
  confirmed: false,
  customerSignature: '',
  allowDataErase: false,
  allowFactoryReset: false,
  allowDisassembly: false,
  allowOutsourceRepair: false,
};

const ExternalDeviceIntakeForm = ({
  customer,
  submitting,
  error,
  onCancel,
  onSubmit,
}) => {
  const [draft, setDraft] = useState(initialDraft);
  const [selectedAccessories, setSelectedAccessories] = useState([]);
  const [intakeEvidence, setIntakeEvidence] = useState(initialEvidence);
  const defaultCustomerSignature = customer?.name || customer?.companyName || '';

  useEffect(() => {
    if (!defaultCustomerSignature) return;
    setIntakeEvidence((current) =>
      current.customerSignature.trim()
        ? current
        : { ...current, customerSignature: defaultCustomerSignature }
    );
  }, [defaultCustomerSignature]);

  const repairAuthorization = draft.preAgreedService;
  const canSubmit = useMemo(() => {
    const baseReady = Boolean(
      customer?.id &&
        draft.model.trim() &&
        draft.customerProblem.trim() &&
        intakeEvidence.confirmed &&
        intakeEvidence.customerSignature.trim() &&
        !submitting
    );
    if (!baseReady) return false;
    if (!repairAuthorization.enabled) return true;
    return Boolean(repairAuthorization.confirmedByName.trim());
  }, [
    customer,
    draft.model,
    draft.customerProblem,
    intakeEvidence,
    repairAuthorization,
    submitting,
  ]);

  const patch = (field, value) =>
    setDraft((current) => ({ ...current, [field]: value }));

  const patchAuthorization = (patchValue) =>
    setDraft((current) => ({
      ...current,
      preAgreedService: {
        ...current.preAgreedService,
        ...patchValue,
      },
    }));

  const toggleAccessory = (accessoryType) =>
    setSelectedAccessories((current) =>
      current.includes(accessoryType)
        ? current.filter((item) => item !== accessoryType)
        : [...current, accessoryType]
    );

  const submit = () => {
    if (!canSubmit) return;
    const authorization = repairAuthorization.enabled
      ? {
          enabled: true,
          authorizationMode: 'REPAIR_AUTHORIZED',
          agreedScope:
            repairAuthorization.agreedScope.trim() ||
            'ลูกค้าอนุมัติให้ดำเนินการซ่อมตามอาการที่แจ้ง',
          confirmedByName: repairAuthorization.confirmedByName.trim(),
          confirmationNote: repairAuthorization.confirmationNote.trim() || null,
        }
      : undefined;

    onSubmit({
      customerId: customer.id,
      customerName: customer?.name || customer?.companyName || '',
      device: {
        category: draft.category,
        brand: draft.brand,
        model: draft.model,
        serialNumber: draft.serialNumber,
        imei: draft.imei,
        barcode: draft.barcode,
      },
      customerProblem: draft.customerProblem,
      internalRemark: draft.internalRemark,
      depositPaid: Number(draft.depositPaid || 0),
      estimatedCost: Number(draft.estimatedCost || 0),
      accessories: selectedAccessories.map((accessoryType) => ({
        accessoryType,
        quantity: 1,
      })),
      ...(authorization ? { preAgreedService: authorization } : {}),
      intakeEvidence,
    });
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-700">
          External Device
        </p>
        <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-black text-blue-950">เพิ่มอุปกรณ์ภายนอกร้าน</h3>
            <p className="mt-1 text-sm text-blue-800">
              เจ้าของ: {customer?.name || customer?.companyName || `Customer #${customer?.id}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="w-fit text-sm font-black text-blue-700 hover:text-blue-950"
          >
            ยกเลิก
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs font-black text-slate-600">ประเภทอุปกรณ์ *</span>
          <select
            value={draft.category}
            onChange={(event) => patch('category', event.target.value)}
            className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4"
          >
            {DEVICE_CATEGORIES.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs font-black text-slate-600">ยี่ห้อ</span>
          <input
            value={draft.brand}
            onChange={(event) => patch('brand', event.target.value)}
            placeholder="เช่น ASUS, HP, Canon"
            className="min-h-12 w-full rounded-xl border border-slate-300 px-4"
          />
        </label>

        <label className="space-y-1 md:col-span-2">
          <span className="text-xs font-black text-slate-600">รุ่นหรือรายละเอียดอุปกรณ์ *</span>
          <input
            value={draft.model}
            onChange={(event) => patch('model', event.target.value)}
            placeholder="ระบุรุ่น หรือรายละเอียดที่ใช้แยกเครื่อง"
            className="min-h-12 w-full rounded-xl border border-slate-300 px-4"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-black text-slate-600">Serial Number</span>
          <input
            value={draft.serialNumber}
            onChange={(event) => patch('serialNumber', event.target.value)}
            placeholder="ถ้ามี"
            className="min-h-12 w-full rounded-xl border border-slate-300 px-4"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-black text-slate-600">IMEI</span>
          <input
            value={draft.imei}
            onChange={(event) => patch('imei', event.target.value)}
            placeholder="สำหรับโทรศัพท์หรือแท็บเล็ต"
            className="min-h-12 w-full rounded-xl border border-slate-300 px-4"
          />
        </label>

        <label className="space-y-1 md:col-span-2">
          <span className="text-xs font-black text-slate-600">Barcode / QR ของร้าน</span>
          <input
            value={draft.barcode}
            onChange={(event) => patch('barcode', event.target.value)}
            placeholder="เว้นว่างเพื่อให้ระบบสร้างรหัสอุปกรณ์ของร้านอัตโนมัติ"
            className="min-h-12 w-full rounded-xl border border-slate-300 px-4"
          />
          <span className="block text-[11px] text-slate-500">
            ใช้รหัสเดียวกันพิมพ์เป็น Barcode หรือ QR เพื่อติดที่ตัวอุปกรณ์ได้
          </span>
        </label>

        <label className="space-y-1 md:col-span-2">
          <span className="text-xs font-black text-slate-600">อาการที่ลูกค้าแจ้ง *</span>
          <textarea
            rows={4}
            value={draft.customerProblem}
            onChange={(event) => patch('customerProblem', event.target.value)}
            placeholder="เช่น เปิดไม่ติด ชาร์จไม่เข้า หรือพิมพ์ไม่ชัด"
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />
        </label>
      </div>

      <MobileIntakeEvidenceFields
        value={intakeEvidence}
        onChange={setIntakeEvidence}
      />

      <section>
        <p className="text-xs font-black text-slate-600">อุปกรณ์ที่นำมาด้วย</p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {ACCESSORIES.map(([value, label]) => {
            const selected = selectedAccessories.includes(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => toggleAccessory(value)}
                className={`min-h-11 rounded-xl border px-3 text-sm font-black ${
                  selected
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
                }`}
              >
                {selected ? '✓ ' : ''}{label}
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs font-black text-slate-600">มัดจำ</span>
          <input
            type="number"
            min="0"
            value={draft.depositPaid}
            onChange={(event) => patch('depositPaid', event.target.value)}
            className="min-h-12 w-full rounded-xl border border-slate-300 px-4"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-black text-slate-600">งบ/ราคาประเมินเบื้องต้น (ถ้ามี)</span>
          <input
            type="number"
            min="0"
            value={draft.estimatedCost}
            onChange={(event) => patch('estimatedCost', event.target.value)}
            className="min-h-12 w-full rounded-xl border border-slate-300 px-4"
          />
          <span className="block text-[11px] text-slate-500">ไม่บังคับสำหรับงานที่ลูกค้าอนุมัติให้ซ่อม ราคาจริงระบุเมื่อซ่อมเสร็จ</span>
        </label>
        <label className="space-y-1 md:col-span-2">
          <span className="text-xs font-black text-slate-600">หมายเหตุภายใน</span>
          <textarea
            rows={2}
            value={draft.internalRemark}
            onChange={(event) => patch('internalRemark', event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />
        </label>
      </div>

      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={Boolean(repairAuthorization.enabled)}
            onChange={(event) =>
              patchAuthorization({
                enabled: event.target.checked,
                confirmedByName:
                  repairAuthorization.confirmedByName ||
                  customer?.name ||
                  customer?.companyName ||
                  '',
              })
            }
            className="mt-1 h-4 w-4"
          />
          <span>
            <span className="block font-black text-emerald-950">ลูกค้าอนุมัติให้ซ่อม — ไม่ต้องเสนอราคาก่อน</span>
            <span className="mt-1 block text-xs leading-5 text-emerald-800">
              ใช้กับเคสที่ลูกค้าอนุญาตให้ร้านดำเนินงานได้เลย ไม่ต้องกำหนดยอดล่วงหน้า ช่างระบุค่าซ่อมจริงเมื่อทำงานเสร็จ หากลูกค้าต้องการทราบราคาก่อน ให้ไม่เลือกช่องนี้และใช้ขั้นตรวจสอบ/เสนอราคาแทน
            </span>
          </span>
        </label>

        {repairAuthorization.enabled ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <textarea
              rows={3}
              value={repairAuthorization.agreedScope}
              onChange={(event) => patchAuthorization({ agreedScope: event.target.value })}
              placeholder="ขอบเขต/เงื่อนไขที่ลูกค้าอนุมัติ (ถ้ามี)"
              className="rounded-xl border border-emerald-200 bg-white px-4 py-3 md:col-span-2"
            />
            <input
              value={repairAuthorization.confirmedByName}
              onChange={(event) => patchAuthorization({ confirmedByName: event.target.value })}
              placeholder="ผู้อนุมัติให้ซ่อม *"
              className="rounded-xl border border-emerald-200 bg-white px-4 py-3 md:col-span-2"
            />
            <textarea
              rows={2}
              value={repairAuthorization.confirmationNote}
              onChange={(event) => patchAuthorization({ confirmationNote: event.target.value })}
              placeholder="หมายเหตุ / ช่องทางที่ลูกค้าอนุมัติ (ถ้ามี)"
              className="rounded-xl border border-emerald-200 bg-white px-4 py-3 md:col-span-2"
            />
          </div>
        ) : null}
      </section>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        disabled={!canSubmit}
        onClick={submit}
        className="sticky bottom-0 z-20 min-h-14 w-full rounded-xl bg-blue-700 px-6 font-black text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-40 md:static md:min-h-12 md:shadow-sm"
      >
        {submitting ? 'กำลังรับเครื่องและเปิดใบงาน' : 'ยืนยันรับอุปกรณ์ภายนอก'}
      </button>
    </div>
  );
};

export default ExternalDeviceIntakeForm;