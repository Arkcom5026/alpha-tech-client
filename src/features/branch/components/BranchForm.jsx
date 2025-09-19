import React, { useEffect, useMemo, useCallback } from 'react';
import AddressForm from '@/features/address/components/AddressForm';
import { useAddressStore } from '@/features/address/store/addressStore';

/* -------------------------------------------
   Region filter constants (module-scope only)
   - ไม่ export เพื่อไม่ชนกับ react-refresh/only-export-components
   - อยู่ระดับโมดูล ทำให้ไม่ต้องใส่ใน deps ของ useCallback
------------------------------------------- */
const REGION_OPTIONS = [
  { value: '', label: 'ทุกภาค' },
  { value: 'north', label: 'เหนือ' },
  { value: 'northeast', label: 'อีสาน' },
  { value: 'central', label: 'กลาง' },
  { value: 'east', label: 'ตะวันออก' },
  { value: 'west', label: 'ตะวันตก' },
  { value: 'south', label: 'ใต้' },
  { value: 'bkk', label: 'กรุงเทพฯ' },
];

const REGION_SETS = {
  north: new Set(['เชียงใหม่','เชียงราย','แม่ฮ่องสอน','ลำพูน','ลำปาง','แพร่','น่าน','พะเยา','อุตรดิตถ์','ตาก']),
  northeast: new Set(['เลย','หนองบัวลำภู','อุดรธานี','หนองคาย','บึงกาฬ','สกลนคร','นครพนม','มุกดาหาร','ขอนแก่น','กาฬสินธุ์','มหาสารคาม','ร้อยเอ็ด','ชัยภูมิ','ยโสธร','อำนาจเจริญ','ศรีสะเกษ','อุบลราชธานี','สุรินทร์','บุรีรัมย์','นครราชสีมา']),
  central: new Set(['พระนครศรีอยุธยา','อ่างทอง','ลพบุรี','สิงห์บุรี','ชัยนาท','สระบุรี','นนทบุรี','ปทุมธานี','สมุทรปราการ','สมุทรสาคร','สมุทรสงคราม','นครปฐม','สุพรรณบุรี','นครนายก','เพชรบูรณ์']),
  east: new Set(['ฉะเชิงเทรา','ชลบุรี','ระยอง','จันทบุรี','ตราด','ปราจีนบุรี','สระแก้ว']),
  west: new Set(['กาญจนบุรี','ราชบุรี','เพชรบุรี','ประจวบคีรีขันธ์']),
  south: new Set(['ชุมพร','สุราษฎร์ธานี','นครศรีธรรมราช','กระบี่','พังงา','ภูเก็ต','ระนอง','ตรัง','พัทลุง','สงขลา','สตูล','ปัตตานี','ยะลา','นราธิวาส']),
  bkk: new Set(['กรุงเทพมหานคร']),
};

/**
 * BranchForm — เพิ่ม BusinessType + Feature Controls
 * - ใช้ Preset ได้ (ไม่ส่ง features ไป API)
 * - หรือกำหนด features เอง (mode/SN/template)
 */
const BranchForm = ({
  formData,
  setFormData,
  onSubmit,
  submitLabel = 'บันทึก',
}) => {
  const { provinces, ensureProvincesAction } = useAddressStore();

  // preload provinces
  useEffect(() => {
    if (ensureProvincesAction) ensureProvincesAction();
  }, [ensureProvincesAction]);

  const firstNonNullish = (...args) => {
    for (let i = 0; i < args.length; i++) {
      const v = args[i];
      if (v !== undefined && v !== null && v !== '') return v;
    }
    return '';
  };

  // normalize legacy address fields → codes
  useEffect(() => {
    const getStr = (v) => (v === null || v === undefined ? '' : String(v));
    const updates = {};

    if (getStr(formData?.provinceCode) === '') {
      const cand = firstNonNullish(
        formData?.provinceCode, formData?.provinceId, formData?.province_id, formData?.province
      );
      let provCode = '';
      if (cand !== '') {
        const s = String(cand);
        if (/^[0-9]+$/.test(s)) provCode = s;
        else if (Array.isArray(provinces) && provinces.length) {
          const prov = provinces.find((p) =>
            p && (p.name_th === s || p.nameTH === s || p.name_en === s || p.nameEN === s || String(p.code) === s)
          );
          if (prov) provCode = String(prov.code);
        }
      }
      if (provCode) updates.provinceCode = provCode;
    }

    if (getStr(formData?.districtCode) === '') {
      const candD = firstNonNullish(
        formData?.districtCode, formData?.districtId, formData?.district_id, formData?.district
      );
      if (candD !== '') updates.districtCode = getStr(candD);
    }

    if (getStr(formData?.subdistrictCode) === '') {
      const candS = firstNonNullish(
        formData?.subdistrictCode, formData?.subdistrictId, formData?.subdistrict_id, formData?.subdistrict
      );
      if (candS !== '') updates.subdistrictCode = getStr(candS);
    }

    if (getStr(formData?.postalCode) === '') {
      const candP = firstNonNullish(
        formData?.postalCode, formData?.zipcode, formData?.post_code, formData?.postal_code
      );
      if (candP !== '') updates.postalCode = getStr(candP);
    }

    if (Object.keys(updates).length) {
      setFormData((prev) => Object.assign({}, prev, updates));
    }
  }, [formData, provinces, setFormData]);

  // province filter for AddressForm (depends only on regionFilter)
  const provinceFilterFn = useCallback((p) => {
    if (!formData?.regionFilter) return true;
    if (!p) return false;
    const name = String(p.nameTh || p.name_th || p.name || '').trim();
    const setObj = REGION_SETS[formData.regionFilter];
    if (!setObj) return true;
    return setObj.has(name);
  }, [formData?.regionFilter]); // ✅ ไม่ต้องใส่ REGION_SETS

  const addressValue = useMemo(() => ({
    address: formData?.address ?? '',
    provinceCode: formData?.provinceCode ? String(formData.provinceCode) : '',
    districtCode: formData?.districtCode ? String(formData.districtCode) : '',
    subdistrictCode: formData?.subdistrictCode ? String(formData.subdistrictCode) : '',
    postalCode: formData?.postalCode ? String(formData.postalCode) : '',
  }), [formData?.address, formData?.provinceCode, formData?.districtCode, formData?.subdistrictCode, formData?.postalCode]);

  const handleAddressChange = (next) => {
    setFormData((prev) => {
      const merged = { ...prev, ...next };
      if (merged.provinceCode) merged.provinceCode = String(merged.provinceCode);
      if (merged.districtCode) merged.districtCode = String(merged.districtCode);
      if (merged.subdistrictCode) merged.subdistrictCode = String(merged.subdistrictCode);
      if (merged.postalCode) merged.postalCode = String(merged.postalCode);
      return merged;
    });
  };

  const setFeature = (patch) => {
    setFormData((prev) => ({
      ...prev,
      features: { ...(prev.features || {}), ...patch },
    }));
  };

  return (
    <form onSubmit={onSubmit} className="max-w-6xl mx-auto space-y-6">
      {/* ชื่อสาขา + เบอร์โทร */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">ชื่อสาขา</label>
          <input
            type="text"
            value={formData?.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">เบอร์โทร</label>
          <input
            type="text"
            value={formData?.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full border rounded px-3 py-2"
            placeholder="เช่น 02-123-4567"
          />
        </div>
      </div>

      {/* ประเภทสาขา */}
      <div>
        <label className="block text-sm font-medium mb-1">ประเภทสาขา (Business Type)</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={formData?.businessType || 'GENERAL'}
          onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
        >
          <option value="GENERAL">ทั่วไป</option>
          <option value="IT">ไอที/คอมพิวเตอร์</option>
          <option value="ELECTRONICS">อิเล็กทรอนิกส์</option>
          <option value="CONSTRUCTION">วัสดุก่อสร้าง</option>
          <option value="GROCERY">มินิมาร์ท/ของชำ</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          ใช้กำหนดค่าเริ่มต้นของ Features และกำหนด Template ที่มองเห็นได้
        </p>
      </div>

      {/* Features controls */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="usePresetFeatures"
            checked={!!formData?.usePresetFeatures}
            onChange={(e) => setFormData({ ...formData, usePresetFeatures: e.target.checked })}
          />
          <label htmlFor="usePresetFeatures" className="text-sm">
            ใช้ค่าเริ่มต้นตามประเภทสาขา (Preset)
          </label>
        </div>

        {!formData?.usePresetFeatures && (
          <div className="rounded border p-3 space-y-2 bg-gray-50">
            <div>
              <label className="block text-sm font-medium mb-1">โหมดสินค้า (Product Mode)</label>
              <div className="flex items-center gap-4 text-sm flex-wrap md:flex-nowrap">
                <label className="inline-flex items-center gap-1 whitespace-normal md:whitespace-nowrap">
                  <input
                    type="radio"
                    name="mode"
                    checked={(formData?.features?.mode || 'STRUCTURED') === 'SIMPLE'}
                    onChange={() => setFeature({ mode: 'SIMPLE' })}
                  />
                  <span>
                    SIMPLE <span className="text-gray-500">(ง่าย ใช้จำนวน ไม่ติดตาม SN)</span>
                  </span>
                </label>
                <label className="inline-flex items-center gap-1 whitespace-normal md:whitespace-nowrap">
                  <input
                    type="radio"
                    name="mode"
                    checked={(formData?.features?.mode || 'STRUCTURED') === 'STRUCTURED'}
                    onChange={() => setFeature({ mode: 'STRUCTURED' })}
                  />
                  <span>
                    STRUCTURED <span className="text-gray-500">(ซับซ้อน ใช้ Template + SN)</span>
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="trackSN"
                checked={!!formData?.features?.trackSerialNumber}
                onChange={(e) => setFeature({ trackSerialNumber: e.target.checked })}
              />
              <label htmlFor="trackSN" className="text-sm">ติดตาม Serial Number (SN)</label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enableTemplates"
                checked={formData?.features?.enableTemplates !== false}
                onChange={(e) => setFeature({ enableTemplates: e.target.checked })}
              />
              <label htmlFor="enableTemplates" className="text-sm">เปิดใช้งาน Template</label>
            </div>

            <p className="text-xs text-gray-500">
              หากปิด Preset การตั้งค่าในส่วนนี้จะถูกส่งไปยังเซิร์ฟเวอร์เมื่อกดบันทึก
            </p>
          </div>
        )}
        {formData?.usePresetFeatures && (
          <p className="text-xs text-blue-600">
            ระบบจะใช้ Preset ตามประเภทสาขาโดยอัตโนมัติ (ไม่ส่ง features ไปที่ API)
          </p>
        )}
      </div>

      {/* ที่อยู่มาตรฐานใหม่ */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">ที่อยู่สาขา</label>

        {/* ภาค (ใช้กรองจังหวัดเท่านั้น — ไม่บันทึก) */}
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-3 sm:col-span-1">
            <label className="block text-sm font-medium mb-1">ภาค</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={formData?.regionFilter || ''}
              onChange={(e) => setFormData({ ...formData, regionFilter: e.target.value })}
            >
              {REGION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              ใช้กรองจังหวัดเท่านั้น — <span className="font-medium">อ่านอย่างเดียว (ไม่บันทึก)</span>
            </p>
          </div>
        </div>

        <AddressForm
          value={addressValue}
          onChange={handleAddressChange}
          required
          provinceFilter={provinceFilterFn}
        />
        <p className="text-xs text-gray-500">
          ระบุที่อยู่/ถนน แล้วเลือก จังหวัด &rarr; อำเภอ &rarr; ตำบล ระบบจะเติมรหัสไปรษณีย์ให้อัตโนมัติ แต่สามารถแก้ไขได้
        </p>
      </div>

      {/* RBAC toggle */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="rbac-toggle"
          checked={!!formData?.RBACEnabled}
          onChange={(e) => setFormData({ ...formData, RBACEnabled: e.target.checked })}
        />
        <label htmlFor="rbac-toggle" className="text-sm">
          เปิดใช้งานระบบ RBAC (สิทธิ์เฉพาะสาขา)
        </label>
      </div>

      {/* ปุ่มบันทึก */}
      <div className="text-right">
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 min-w-[160px]"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default BranchForm;
