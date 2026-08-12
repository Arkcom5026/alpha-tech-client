import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PencilLine, UserRound } from 'lucide-react';
import useSalesStore from '@/features/sales/store/salesStore';
import useCustomerDepositStore from '@/features/customerDeposit/store/customerDepositStore';
import useCustomerStore from '@/features/customer/store/customerStore';
import { useAddressStore } from '@/features/address/store/addressStore';
import SaleCustomerSearch from './components/SaleCustomerSearch';
import SaleCustomerSearchResults from './components/SaleCustomerSearchResults';
import SaleCustomerDetailsForm from './components/SaleCustomerDetailsForm';
import { useSaleCustomerEditor } from './hooks/useSaleCustomerEditor';
import { useSaleCustomerHydration } from './hooks/useSaleCustomerHydration';
import { useSaleCustomerSearch } from './hooks/useSaleCustomerSearch';
import { projectSaleCustomerSection } from './projections/saleCustomerSectionProjection';

const SaleCustomerSection = ({ productSearchRef, clearTrigger, onClearFinish, onSaleModeSelect }) => {
  const customerSearchRef = useRef(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [pendingCreate, setPendingCreate] = useState(false);
  const [editingSelectedCustomer, setEditingSelectedCustomer] = useState(false);
  const [formInfo, setFormInfo] = useState('');
  const [formError, setFormError] = useState('');

  const ensureProvincesAction = useAddressStore((state) => state.ensureProvincesAction);
  const searchCustomers = useCustomerStore((state) => state.searchStoreCustomersAction);
  const searchByCustomerId = useCustomerDepositStore(
    (state) => state.searchCustomerByCustomerIdAndDepositAction
  );
  const setDepositAmount = useCustomerDepositStore((state) => state.setCustomerDepositAmount);
  const setSelectedDeposit = useCustomerDepositStore((state) => state.setSelectedDeposit);
  const clearCustomerAndDeposit = useCustomerDepositStore((state) => state.clearCustomerAndDeposit);
  const createCustomer = useCustomerStore((state) => state.createCustomerAction);
  const updateCustomer = useCustomerStore((state) => state.updateCustomerProfilePosAction);
  const setCustomerId = useSalesStore((state) => state.setCustomerIdAction);

  const editor = useSaleCustomerEditor();
  const hydration = useSaleCustomerHydration({
    searchByCustomerId,
    setCustomerId,
    setDepositAmount,
    setSelectedDeposit,
    hydrateEditor: editor.hydrateCustomer,
    onSaleModeSelect,
    productSearchRef,
  });

  const handleFound = useCallback(async (payload) => {
    const hydrated = await hydration.hydrateSelection(payload);
    if (!hydrated) return;
    setSelectedCustomer(hydrated);
    setPendingCreate(false);
    setEditingSelectedCustomer(false);
    setFormInfo('เลือกลูกค้าสำหรับรายการขายแล้ว');
    setFormError('');
  }, [hydration]);

  const handleNotFound = useCallback(({ mode, query }) => {
    setSelectedCustomer(null);
    setCustomerId(null);
    clearCustomerAndDeposit();
    setPendingCreate(true);
    setEditingSelectedCustomer(false);
    editor.clearEditor(mode === 'phone' ? { phone: query } : { name: query });
    setFormInfo('ไม่พบลูกค้าในร้านนี้ สามารถเพิ่มข้อมูลลูกค้าใหม่ได้');
    setFormError('');
    setTimeout(() => document.getElementById('customer-name-input')?.focus(), 80);
  }, [clearCustomerAndDeposit, editor, setCustomerId]);

  const search = useSaleCustomerSearch({
    searchCustomers,
    onCustomerNotFound: handleNotFound,
  });

  useEffect(() => {
    ensureProvincesAction?.().catch(() => {});
    const timer = setTimeout(() => customerSearchRef.current?.focus(), 120);
    return () => clearTimeout(timer);
  }, [ensureProvincesAction]);

  useEffect(() => {
    if (!clearTrigger) return;
    search.clearSearch();
    editor.clearEditor();
    setSelectedCustomer(null);
    setPendingCreate(false);
    setEditingSelectedCustomer(false);
    setFormInfo('');
    setFormError('');
    setCustomerId(null);
    clearCustomerAndDeposit();
    onClearFinish?.();
    setTimeout(() => customerSearchRef.current?.focus(), 80);
  }, [clearCustomerAndDeposit, clearTrigger, editor, onClearFinish, search, setCustomerId]);

  const handleSelectResult = async (candidate) => {
    search.setSelectedResultId(candidate.id);
    await handleFound(candidate);
  };

  const handleCreate = async () => {
    const validationError = editor.validateForSave();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    try {
      const created = await createCustomer(editor.createPayload);
      await handleFound(created);
      setFormInfo('เพิ่มลูกค้าใหม่สำเร็จ');
    } catch (error) {
      setFormError(error?.message || 'เพิ่มลูกค้าไม่สำเร็จ');
    }
  };

  const handleUpdate = async () => {
    if (!selectedCustomer?.id) return;
    const validationError = editor.validateForSave();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    try {
      const updated = await updateCustomer(selectedCustomer.id, editor.createPayload);
      const nextCustomer = updated || { ...selectedCustomer, ...editor.createPayload };
      editor.hydrateCustomer(nextCustomer);
      setSelectedCustomer(nextCustomer);
      setEditingSelectedCustomer(false);
      setFormInfo('อัปเดตข้อมูลลูกค้าสำเร็จ');
      setFormError('');
    } catch (error) {
      setFormError(error?.message || 'อัปเดตข้อมูลลูกค้าไม่สำเร็จ');
    }
  };

  const handleCancelCreate = () => {
    setPendingCreate(false);
    editor.clearEditor();
    search.clearSearch();
    setFormInfo('');
    setFormError('');
    setTimeout(() => customerSearchRef.current?.focus(), 80);
  };

  const view = projectSaleCustomerSection({
    search,
    editor,
    selection: { selectedCustomer, pendingCreate },
    feedback: { formError: formError || search.error, formInfo },
  });

  const provinceFilter = useMemo(() => undefined, []);
  const compactCustomerName =
    view.editor.editor.companyName || view.editor.editor.name || selectedCustomer?.name || 'ลูกค้าที่เลือก';
  const compactContactName =
    view.editor.editor.companyName && view.editor.editor.name ? view.editor.editor.name : '';
  const compactPhone = view.editor.editor.phone || selectedCustomer?.phone || '-';
  const compactDetail = [compactContactName, view.editor.editor.departmentName]
    .filter(Boolean)
    .join(' · ');

  return (
    <section className="w-full space-y-3 rounded-2xl border border-slate-200 bg-white p-3 md:p-4">
      <div className="flex items-start gap-3 border-b border-slate-100 pb-3">
        <div className="rounded-xl bg-teal-100 p-2 text-teal-800">
          <UserRound className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-900">ข้อมูลลูกค้า</h2>
          <p className="mt-0.5 text-xs leading-5 text-slate-500">
            ค้นหา เลือก หรือเพิ่มลูกค้าสำหรับรายการขายปัจจุบัน
          </p>
        </div>
      </div>

      <SaleCustomerSearch
        query={view.search.query}
        customerLoading={view.search.loading}
        inputRef={customerSearchRef}
        onQueryChange={view.search.setQuery}
        onSubmit={view.search.submitSearch}
      />

      {view.feedback.formError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-800">
          {view.feedback.formError}
        </div>
      ) : null}

      {view.feedback.formInfo ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
          {view.feedback.formInfo}
        </div>
      ) : null}

      {!view.selection.selectedCustomer ? (
        <SaleCustomerSearchResults
          results={view.search.results}
          selectedCustomerId={view.search.selectedResultId}
          loading={view.search.loading}
          onSelect={handleSelectResult}
        />
      ) : null}

      {view.selection.selectedCustomer && !editingSelectedCustomer ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{compactCustomerName}</p>
            <p className="mt-0.5 text-xs font-medium text-slate-600">โทร {compactPhone}</p>
            {compactDetail ? (
              <p className="mt-1 truncate text-xs text-slate-500">{compactDetail}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingSelectedCustomer(true);
              setFormInfo('');
              setFormError('');
            }}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
          >
            <PencilLine className="h-3.5 w-3.5" />
            แก้ไข
          </button>
        </div>
      ) : null}

      {(view.selection.selectedCustomer && editingSelectedCustomer) || view.selection.pendingCreate ? (
        <SaleCustomerDetailsForm
          editor={view.editor.editor}
          selectedCustomer={view.selection.selectedCustomer}
          isModified={view.editor.isModified}
          pendingCreate={view.selection.pendingCreate}
          provinceFilter={provinceFilter}
          onPatch={view.editor.patchEditor}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onCancelCreate={handleCancelCreate}
        />
      ) : null}
    </section>
  );
};

export default SaleCustomerSection;
