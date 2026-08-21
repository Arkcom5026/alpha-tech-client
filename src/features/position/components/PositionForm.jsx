import { useEffect, useMemo, useRef, useState } from 'react';
import { CAPABILITY_GROUPS } from './positionCapabilityCatalog';
import { TAX_PERIOD_CAPABILITY_GROUP } from './taxPeriodCapabilityGroup';
import { TAX_CLOSING_HANDOFF_CAPABILITY_GROUP } from './taxClosingHandoffCapabilityGroup';
import { ACCOUNTING_OFFICE_CAPABILITY_GROUP } from './accountingOfficeCapabilityGroup';
import { TAX_READINESS_CAPABILITY_GROUP } from './taxReadinessCapabilityGroup';
import { VAT_SETTLEMENT_CAPABILITY_GROUP } from './vatSettlementCapabilityGroup';
import { VAT_CARRY_FORWARD_CAPABILITY_GROUP } from './vatCarryForwardCapabilityGroup';
import { WITHHOLDING_TAX_CAPABILITY_GROUP } from './withholdingTaxCapabilityGroup';
import { TAX_ISSUER_PROFILE_CAPABILITY_GROUP } from './taxIssuerProfileCapabilityGroup';
import { TAX_PUBLICATION_RETRY_CAPABILITY_GROUP } from './taxPublicationRetryCapabilityGroup';

const POSITION_CAPABILITY_GROUPS = Object.freeze([
  ...CAPABILITY_GROUPS,
  TAX_PERIOD_CAPABILITY_GROUP,
  TAX_CLOSING_HANDOFF_CAPABILITY_GROUP,
  ACCOUNTING_OFFICE_CAPABILITY_GROUP,
  TAX_READINESS_CAPABILITY_GROUP,
  VAT_SETTLEMENT_CAPABILITY_GROUP,
  VAT_CARRY_FORWARD_CAPABILITY_GROUP,
  WITHHOLDING_TAX_CAPABILITY_GROUP,
  TAX_ISSUER_PROFILE_CAPABILITY_GROUP,
  TAX_PUBLICATION_RETRY_CAPABILITY_GROUP,
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
            {POSITION_CAPABILITY_GROUPS.map((group) => (
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
