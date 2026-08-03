import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ShieldCheck, User } from 'lucide-react';
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
    setFormInfo('เลือกลูกค้าแล้ว');
    setFormError('');
  }, [hydration]);

  const handleNotFound = useCallback(({ mode, query }) => {
    setSelectedCustomer(null);
    setCustomerId(null);
    clearCustomerAndDeposit();
    setPendingCreate(true);
    editor.clearEditor(mode === 'phone' ? { phone: query } : { name: query });
    setFormInfo('ไม่พบลูกค้าในร้านนี้ สามารถเพิ่มลูกค้าใหม่ได้');
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
      editor.hydrateCustomer(updated || { ...selectedCustomer, ...editor.createPayload });
      setSelectedCustomer(updated || { ...selectedCustomer, ...editor.createPayload });
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

  return (
    <div className="w-full select-none rounded-2xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-700 shadow-sm">
      <div className="mb-2 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
        <div className="rounded-md bg-slate-900/5 p-1 text-slate-800"><User className="h-3.5 w-3.5" /></div>
        <h2 className="text-xs font-black text-slate-900">ข้อมูลรายละเอียดผู้ซื้อ</h2>
      </div>

      <SaleCustomerSearch
        query={view.search.query}
        customerLoading={view.search.loading}
        inputRef={customerSearchRef}
        onQueryChange={view.search.setQuery}
        onSubmit={view.search.submitSearch}
      />

      {view.feedback.formError && <div className="mb-2 rounded-md border border-rose-100 bg-rose-50 p-1.5 text-[10px] font-black text-rose-600">{view.feedback.formError}</div>}
      {view.feedback.formInfo && <div className="mb-2 rounded-md border border-emerald-100 bg-emerald-50 p-1.5 text-[10px] font-black text-emerald-700">{view.feedback.formInfo}</div>}

      <SaleCustomerSearchResults
        results={view.search.results}
        selectedCustomerId={view.search.selectedResultId}
        loading={view.search.loading}
        onSelect={handleSelectResult}
      />

      {(view.selection.selectedCustomer || view.selection.pendingCreate) && (
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
      )}

      <div className="mt-2 flex items-center gap-1 border-t border-slate-100 bg-slate-50/40 p-1 text-[9px] font-bold text-slate-400">
        <ShieldCheck className="h-3 w-3 text-slate-400" />
        <span>Store-scoped customer search and deposit hydration</span>
      </div>
    </div>
  );
};

export default SaleCustomerSection;
