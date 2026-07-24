import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  User,
  UserPlus,
  X,
} from 'lucide-react';
import useCustomerDepositStore from '@/features/customerDeposit/store/customerDepositStore';
import useCustomerStore from '@/features/customer/store/customerStore';

const EMPTY_DRAFT = {
  name: '',
  phone: '',
  email: '',
  type: 'INDIVIDUAL',
  companyName: '',
  taxId: '',
  addressDetail: '',
};

const normalizeCustomerPayload = (payload) => {
  const customer = payload?.customer || payload?.data?.customer || payload?.data || payload;
  return customer?.id ? customer : null;
};

const normalizeResults = (payload) => {
  const source = payload?.results || payload?.items || payload?.data?.results || payload?.data || payload;
  const rows = Array.isArray(source) ? source : source ? [source] : [];
  return rows.map(normalizeCustomerPayload).filter(Boolean);
};

const customerLabel = (customer) => {
  const organization = customer?.companyName || customer?.organizationName;
  return organization || customer?.name || customer?.user?.name || `ลูกค้า #${customer?.id || '-'}`;
};

const customerPhone = (customer) => customer?.phone || customer?.user?.phone || '';

const RepairCustomerSection = ({
  selectedCustomer,
  loading,
  onSelectCustomer,
  onClearCustomer,
}) => {
  const [searchMode, setSearchMode] = useState('phone');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [pendingCreate, setPendingCreate] = useState(false);
  const [editingSelected, setEditingSelected] = useState(false);
  const [formError, setFormError] = useState('');
  const [formInfo, setFormInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const queryRef = useRef(null);

  const searchByPhone = useCustomerDepositStore(
    (state) => state.searchCustomerByPhoneAndDepositAction
  );
  const searchByName = useCustomerDepositStore(
    (state) => state.searchCustomerByNameAndDepositAction
  );
  const searchByCustomerId = useCustomerDepositStore(
    (state) => state.searchCustomerByCustomerIdAndDepositAction
  );
  const createCustomer = useCustomerStore((state) => state.createCustomerAction);
  const updateCustomer = useCustomerStore((state) => state.updateCustomerProfilePosAction);

  const effectiveLoading = busy || loading;

  useEffect(() => {
    if (!selectedCustomer) {
      const timer = setTimeout(() => queryRef.current?.focus(), 120);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [selectedCustomer]);

  useEffect(() => {
    if (!selectedCustomer) return;
    setDraft({
      name: selectedCustomer.name || selectedCustomer.user?.name || '',
      phone: customerPhone(selectedCustomer),
      email: selectedCustomer.email || selectedCustomer.user?.email || '',
      type: selectedCustomer.type || 'INDIVIDUAL',
      companyName: selectedCustomer.companyName || '',
      taxId: selectedCustomer.taxId || '',
      addressDetail: selectedCustomer.addressDetail || selectedCustomer.address || '',
    });
  }, [selectedCustomer]);

  const displayType = useMemo(() => {
    if (!selectedCustomer) return '';
    if (selectedCustomer.type === 'ORGANIZATION') return 'นิติบุคคล';
    if (selectedCustomer.type === 'GOVERNMENT') return 'หน่วยงาน';
    return 'บุคคลทั่วไป';
  }, [selectedCustomer]);

  const resetDraft = (next = {}) => setDraft({ ...EMPTY_DRAFT, ...next });

  const deliverSelectedCustomer = async (candidate) => {
    const baseCustomer = normalizeCustomerPayload(candidate);
    if (!baseCustomer?.id) throw new Error('ไม่พบ Customer ID จากผลการค้นหา');

    let hydrated = baseCustomer;
    if (searchByCustomerId) {
      try {
        const payload = await searchByCustomerId(baseCustomer.id);
        hydrated = normalizeCustomerPayload(payload) || baseCustomer;
      } catch {
        hydrated = baseCustomer;
      }
    }

    setResults([]);
    setPendingCreate(false);
    setEditingSelected(false);
    setFormInfo('เลือกลูกค้าแล้ว ระบบกำลังโหลดสินค้าที่มีประกัน');
    await onSelectCustomer(hydrated);
  };

  const selectCustomer = async (candidate) => {
    setBusy(true);
    setFormError('');
    try {
      await deliverSelectedCustomer(candidate);
    } catch (error) {
      setFormError(error?.message || 'ไม่สามารถเลือกลูกค้าได้');
    } finally {
      setBusy(false);
    }
  };

  const submitSearch = async (event) => {
    event?.preventDefault();
    setFormError('');
    setFormInfo('');
    setResults([]);
    setPendingCreate(false);

    const text = String(query || '').trim();
    if (!text) {
      setFormError(searchMode === 'phone' ? 'กรุณากรอกเบอร์โทรลูกค้า' : 'กรุณากรอกชื่อหรือบริษัท');
      return;
    }

    setBusy(true);
    try {
      if (searchMode === 'phone') {
        const cleanPhone = text.replace(/\D/g, '');
        if (!/^[0-9]{10}$/.test(cleanPhone)) {
          setFormError('กรุณากรอกเบอร์โทรให้ครบ 10 หลัก');
          return;
        }

        const found = normalizeCustomerPayload(await searchByPhone(cleanPhone));
        if (found) {
          await deliverSelectedCustomer(found);
          return;
        }

        resetDraft({ phone: cleanPhone });
        setPendingCreate(true);
        setFormInfo('ไม่พบลูกค้า สามารถเพิ่มลูกค้าใหม่ในหน้านี้ได้ทันที');
        return;
      }

      const found = normalizeResults(await searchByName(text));
      if (found.length > 0) {
        setResults(found);
        return;
      }

      resetDraft({ name: text });
      setPendingCreate(true);
      setFormInfo('ไม่พบลูกค้า สามารถเพิ่มลูกค้าใหม่ในหน้านี้ได้ทันที');
    } catch (error) {
      setFormError(error?.message || 'ค้นหาลูกค้าไม่สำเร็จ');
    } finally {
      setBusy(false);
    }
  };

  const submitCreate = async () => {
    setFormError('');
    setFormInfo('');

    if (!draft.name.trim()) {
      setFormError('กรุณากรอกชื่อลูกค้า');
      return;
    }

    const cleanPhone = String(draft.phone || '').replace(/\D/g, '');
    if (cleanPhone && !/^[0-9]{10}$/.test(cleanPhone)) {
      setFormError('กรุณากรอกเบอร์โทรให้ครบ 10 หลัก');
      return;
    }

    setBusy(true);
    try {
      const createdPayload = await createCustomer({
        name: draft.name.trim(),
        phone: cleanPhone || null,
        email: draft.email.trim() || null,
        type: draft.type,
        companyName: draft.type === 'INDIVIDUAL' ? null : draft.companyName.trim() || null,
        taxId: draft.type === 'INDIVIDUAL' ? null : draft.taxId.trim() || null,
        addressDetail: draft.addressDetail.trim() || null,
      });
      const created = normalizeCustomerPayload(createdPayload);
      if (!created) throw new Error('ระบบไม่ได้ส่งข้อมูลลูกค้าที่สร้างกลับมา');
      setFormInfo('เพิ่มลูกค้าใหม่สำเร็จ');
      await deliverSelectedCustomer(created);
    } catch (error) {
      setFormError(error?.message || 'เพิ่มลูกค้าไม่สำเร็จ');
    } finally {
      setBusy(false);
    }
  };

  const submitUpdate = async () => {
    if (!selectedCustomer?.id || !updateCustomer) return;
    setBusy(true);
    setFormError('');
    setFormInfo('');
    try {
      await updateCustomer(selectedCustomer.id, {
        name: draft.name.trim(),
        email: draft.email.trim() || null,
        type: draft.type,
        companyName: draft.type === 'INDIVIDUAL' ? null : draft.companyName.trim() || null,
        taxId: draft.type === 'INDIVIDUAL' ? null : draft.taxId.trim() || null,
        addressDetail: draft.addressDetail.trim() || null,
      });
      setEditingSelected(false);
      setFormInfo('อัปเดตข้อมูลลูกค้าสำเร็จ');
      await onSelectCustomer({ ...selectedCustomer, ...draft });
    } catch (error) {
      setFormError(error?.message || 'อัปเดตข้อมูลลูกค้าไม่สำเร็จ');
    } finally {
      setBusy(false);
    }
  };

  const clear = () => {
    setQuery('');
    setResults([]);
    setPendingCreate(false);
    setEditingSelected(false);
    setFormError('');
    setFormInfo('');
    resetDraft();
    onClearCustomer?.();
    setTimeout(() => queryRef.current?.focus(), 50);
  };

  const renderCustomerForm = ({ updateMode = false } = {}) => (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap gap-4 text-xs font-black text-slate-600">
        {[
          ['INDIVIDUAL', 'บุคคลทั่วไป'],
          ['ORGANIZATION', 'นิติบุคคล'],
          ['GOVERNMENT', 'หน่วยงาน'],
        ].map(([value, label]) => (
          <label key={value} className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              checked={draft.type === value}
              onChange={() => setDraft((current) => ({ ...current, type: value }))}
            />
            {label}
          </label>
        ))}
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {draft.type !== 'INDIVIDUAL' ? (
          <>
            <input
              value={draft.companyName}
              onChange={(event) => setDraft((current) => ({ ...current, companyName: event.target.value }))}
              placeholder="ชื่อบริษัทหรือหน่วยงาน"
              className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 outline-none focus:border-emerald-500"
            />
            <input
              value={draft.taxId}
              onChange={(event) => setDraft((current) => ({ ...current, taxId: event.target.value }))}
              placeholder="เลขผู้เสียภาษี"
              className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 outline-none focus:border-emerald-500"
            />
          </>
        ) : null}
        <input
          value={draft.name}
          onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
          placeholder="ชื่อ-นามสกุล *"
          className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 outline-none focus:border-emerald-500"
        />
        <input
          value={draft.phone}
          onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))}
          placeholder="เบอร์โทร 10 หลัก"
          disabled={updateMode}
          className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 outline-none focus:border-emerald-500 disabled:bg-slate-100"
        />
        <input
          value={draft.email}
          onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
          placeholder="อีเมล"
          className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 outline-none focus:border-emerald-500"
        />
        <input
          value={draft.addressDetail}
          onChange={(event) => setDraft((current) => ({ ...current, addressDetail: event.target.value }))}
          placeholder="ที่อยู่ติดต่อ"
          className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 outline-none focus:border-emerald-500 md:col-span-2"
        />
      </div>

      <div className="mt-3 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={updateMode ? submitUpdate : submitCreate}
          disabled={effectiveLoading}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-700 px-5 font-black text-white disabled:opacity-50"
        >
          {effectiveLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          {updateMode ? 'บันทึกการแก้ไข' : 'บันทึกลูกค้าใหม่'}
        </button>
        <button
          type="button"
          onClick={() => (updateMode ? setEditingSelected(false) : setPendingCreate(false))}
          className="min-h-10 rounded-xl border border-slate-300 bg-white px-5 font-black text-slate-700"
        >
          ยกเลิก
        </button>
      </div>
    </div>
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Customer Intake</p>
          <h2 className="mt-1 text-lg font-black text-slate-950">ค้นหาและเพิ่มลูกค้า</h2>
          <p className="mt-1 text-xs text-slate-500">
            ใช้ Customer authority เดิม: ค้นจากเบอร์โทรหรือชื่อ เลือกลูกค้า และเพิ่มลูกค้าได้เมื่อไม่พบ
          </p>
        </div>
        {selectedCustomer ? (
          <button
            type="button"
            onClick={clear}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-black text-slate-700"
          >
            <X className="h-4 w-4" /> เปลี่ยนลูกค้า
          </button>
        ) : null}
      </div>

      {formError ? <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700">{formError}</div> : null}
      {formInfo ? <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-800">{formInfo}</div> : null}

      {selectedCustomer ? (
        <>
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <div className="rounded-xl bg-white p-2 text-emerald-700 shadow-sm">
                  {selectedCustomer.type === 'INDIVIDUAL' ? <User className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-black text-emerald-950">{customerLabel(selectedCustomer)}</p>
                    <span className="rounded-full bg-white px-2 py-1 text-[11px] font-black text-emerald-700">{displayType}</span>
                  </div>
                  <p className="mt-2 flex items-center gap-2 text-sm text-emerald-900">
                    <Phone className="h-4 w-4" /> {customerPhone(selectedCustomer) || 'ไม่มีเบอร์โทร'}
                  </p>
                  {selectedCustomer.email ? (
                    <p className="mt-1 flex items-center gap-2 text-sm text-emerald-800"><Mail className="h-4 w-4" /> {selectedCustomer.email}</p>
                  ) : null}
                  {(selectedCustomer.addressDetail || selectedCustomer.customerAddress) ? (
                    <p className="mt-1 flex items-start gap-2 text-xs font-bold text-emerald-700"><MapPin className="mt-0.5 h-4 w-4" /> {selectedCustomer.addressDetail || selectedCustomer.customerAddress}</p>
                  ) : null}
                  <p className="mt-2 flex items-center gap-2 text-xs font-black text-emerald-700"><CheckCircle2 className="h-4 w-4" /> เลือกลูกค้าแล้ว · Customer ID {selectedCustomer.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingSelected((current) => !current)}
                className="min-h-10 rounded-xl border border-emerald-300 bg-white px-4 text-sm font-black text-emerald-800"
              >
                {editingSelected ? 'ปิดการแก้ไข' : 'แก้ไขข้อมูลลูกค้า'}
              </button>
            </div>
          </div>
          {editingSelected ? renderCustomerForm({ updateMode: true }) : null}
        </>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap gap-4 text-xs font-black text-slate-500">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="radio" checked={searchMode === 'phone'} onChange={() => { setSearchMode('phone'); setQuery(''); setResults([]); }} />
              ค้นจากเบอร์โทร
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input type="radio" checked={searchMode === 'name'} onChange={() => { setSearchMode('name'); setQuery(''); setResults([]); }} />
              ค้นจากชื่อ/บริษัท
            </label>
          </div>

          <form onSubmit={submitSearch} className="mt-3 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              {searchMode === 'phone' ? <Phone className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" /> : <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />}
              <input
                ref={queryRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchMode === 'phone' ? 'เบอร์โทรลูกค้า 10 หลัก' : 'ชื่อ นามสกุล หรือชื่อบริษัท'}
                inputMode={searchMode === 'phone' ? 'tel' : 'text'}
                className="min-h-12 w-full rounded-xl border border-slate-300 pl-10 pr-4 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </div>
            <button type="submit" disabled={effectiveLoading} className="min-h-12 rounded-xl bg-emerald-700 px-6 font-black text-white disabled:opacity-50">
              {effectiveLoading ? 'กำลังค้นหา' : 'ค้นหาลูกค้า'}
            </button>
          </form>

          {results.length > 0 ? (
            <div className="mt-3 space-y-2">
              <p className="text-xs font-black text-slate-500">พบลูกค้า {results.length} รายการ</p>
              {results.map((customer) => (
                <button key={customer.id} type="button" onClick={() => selectCustomer(customer)} className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-3 text-left hover:border-emerald-300 hover:bg-emerald-50">
                  <div className="min-w-0">
                    <p className="truncate font-black text-slate-900">{customerLabel(customer)}</p>
                    <p className="mt-1 text-xs font-bold text-slate-500">{customerPhone(customer) || 'ไม่มีเบอร์โทร'}</p>
                  </div>
                  <span className="ml-3 text-xs font-black text-emerald-700">เลือก</span>
                </button>
              ))}
            </div>
          ) : null}

          {pendingCreate ? renderCustomerForm() : null}
        </>
      )}
    </section>
  );
};

export default RepairCustomerSection;
