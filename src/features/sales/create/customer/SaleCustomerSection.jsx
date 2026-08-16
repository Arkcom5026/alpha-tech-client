import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PencilLine, UserRound } from 'lucide-react';
import useSalesStore from '@/features/sales/store/salesStore';
import useCustomerDepositStore from '@/features/customerDeposit/store/customerDepositStore';
import useCustomerStore from '@/features/customer/store/customerStore';
import { useAddressStore } from '@/features/address/store/addressStore';
import { feedback } from '@/design-system';
import SaleCustomerSearch from './components/SaleCustomerSearch';
import SaleCustomerSearchResults from './components/SaleCustomerSearchResults';
import SaleCustomerDetailsForm from './components/SaleCustomerDetailsForm';
import { useSaleCustomerEditor } from './hooks/useSaleCustomerEditor';
import { useSaleCustomerHydration } from './hooks/useSaleCustomerHydration';
import { useSaleCustomerSearch } from './hooks/useSaleCustomerSearch';
import { projectSaleCustomerSection } from './projections/saleCustomerSectionProjection';

const SaleCustomerSection = ({ productSearchRef, clearTrigger, onClearFinish, onSaleModeSelect }) => {
  const customerSearchRef = useRef(null);
  const customerMutationRef = useRef(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [pendingCreate, setPendingCreate] = useState(false);
  const [editingSelectedCustomer, setEditingSelectedCustomer] = useState(false);
  const [customerMutationAction, setCustomerMutationAction] = useState(null);
  const [formInfo, setFormInfo] = useState('');
  const [formError, setFormError] = useState('');
  const customerMutationBusy = Boolean(customerMutationAction) || customerMutationRef.current;

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
    setFormInfo('');
    setFormError('');
  }, [hydration]);

  const handleNotFound = useCallback(({ mode, query }) => {
    if (customerMutationRef.current) return;
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
    if (!clearTrigger || customerMutationRef.current) return;
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
    if (customerMutationRef.current) return;
    search.setSelectedResultId(candidate.id);
    await handleFound(candidate);
  };

  const handleCreate = async () => {
    if (customerMutationRef.current) return;
    const validationError = editor.validateForSave();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const payloadSnapshot = { ...editor.createPayload };
    customerMutationRef.current = true;
    setCustomerMutationAction('create');
    try {
      const created = await createCustomer(payloadSnapshot);
      if (!created?.id) {
        throw new Error('Server ไม่ได้ส่งรหัสลูกค้าที่สร้างกลับมา');
      }
      await handleFound(created);
      setFormInfo('เพิ่มลูกค้าใหม่สำเร็จ');
      setFormError('');
      feedback.actionSuccess(
        'เพิ่มลูกค้าใหม่เรียบร้อยแล้ว',
        `sales:customer:${created.id}:create:success`,
      );
    } catch (error) {
      setFormInfo('');
      setFormError(error?.message || 'เพิ่มลูกค้าไม่สำเร็จ');
      feedback.actionError(
        error,
        'เพิ่มลูกค้าใหม่ไม่สำเร็จ',
        'sales:customer:create:error',
      );
    } finally {
      customerMutationRef.current = false;
      setCustomerMutationAction(null);
    }
  };

  const handleUpdate = async () => {
    if (!selectedCustomer?.id || customerMutationRef.current) return;
    const validationError = editor.validateForSave();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const customerIdSnapshot = selectedCustomer.id;
    const payloadSnapshot = { ...editor.createPayload };
    const selectedCustomerSnapshot = { ...selectedCustomer };
    customerMutationRef.current = true;
    setCustomerMutationAction('update');
    try {
      const updated = await updateCustomer(customerIdSnapshot, payloadSnapshot);
      const nextCustomer = updated || { ...selectedCustomerSnapshot, ...payloadSnapshot };
      editor.hydrateCustomer(nextCustomer);
      setSelectedCustomer(nextCustomer);
      setEditingSelectedCustomer(false);
      setFormInfo('อัปเดตข้อมูลลูกค้าสำเร็จ');
      setFormError('');
      feedback.actionSuccess(
        'อัปเดตข้อมูลลูกค้าเรียบร้อยแล้ว',
        `sales:customer:${customerIdSnapshot}:update:success`,
      );
    } catch (error) {
      setFormInfo('');
      setFormError(error?.message || 'อัปเดตข้อมูลลูกค้าไม่สำเร็จ');
      feedback.actionError(
        error,
        'อัปเดตข้อมูลลูกค้าไม่สำเร็จ',
        `sales:customer:${customerIdSnapshot}:update:error`,
      );
    } finally {
      customerMutationRef.current = false;
      setCustomerMutationAction(null);
    }
  };

  const handleCancelCreate = () => {
    if (customerMutationRef.current) return;
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
  const customerName = view.editor.editor.companyName
    ? selectedCustomer?.customerName || selectedCustomer?.displayName || ''
    : view.editor.editor.name || selectedCustomer?.name || '-';
  const organizationName = view.editor.editor.companyName || selectedCustomer?.companyName || '-';
  const departmentName = view.editor.editor.departmentName || selectedCustomer?.departmentName || '-';
  const contactName = view.editor.editor.companyName
    ? view.editor.editor.name || selectedCustomer?.contactName || selectedCustomer?.name || '-'
    : selectedCustomer?.contactName || '-';
  const compactPhone = view.editor.editor.phone || selectedCustomer?.phone || '-';

  return (
    <section className="h-full w-full space-y-2.5 rounded-[20px] border border-slate-200 bg-white p-3">
      <div className="flex flex-col gap-2.5 border-b border-slate-100 pb-2.5 lg:flex-row lg:items-center">
        <div className="flex shrink-0 items-center gap-2">
          <div className="rounded-lg bg-teal-100 p-1.5 text-teal-800">
            <UserRound className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-semibold text-slate-900">ข้อมูลลูกค้า</h2>
        </div>
        <div className="min-w-0 flex-1">
          <SaleCustomerSearch
            query={view.search.query}
            customerLoading={view.search.loading || customerMutationBusy}
            inputRef={customerSearchRef}
            onQueryChange={customerMutationBusy ? () => {} : view.search.setQuery}
            onSubmit={customerMutationBusy ? () => {} : view.search.submitSearch}
          />
        </div>
      </div>

      {view.feedback.formError ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
          {view.feedback.formError}
        </div>
      ) : null}

      {view.feedback.formInfo ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          {view.feedback.formInfo}
        </div>
      ) : null}

      {!view.selection.selectedCustomer ? (
        <SaleCustomerSearchResults
          results={view.search.results}
          selectedCustomerId={view.search.selectedResultId}
          loading={view.search.loading || customerMutationBusy}
          onSelect={customerMutationBusy ? () => {} : handleSelectResult}
        />
      ) : null}

      {view.selection.selectedCustomer && !editingSelectedCustomer ? (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-2.5">
          <div className="min-w-0 flex-1">
            <div className="grid gap-x-5 gap-y-1.5 text-sm sm:grid-cols-2 xl:grid-cols-3">
              <p className="min-w-0 text-slate-700">
                <span className="font-semibold text-slate-500">ชื่อลูกค้า :</span>{' '}
                <span className="font-semibold text-slate-950">{customerName}</span>
              </p>
              <p className="min-w-0 text-slate-700">
                <span className="font-semibold text-slate-500">ชื่อหน่วยงาน :</span>{' '}
                <span className="font-semibold text-slate-950">{organizationName}</span>
              </p>
              <p className="min-w-0 text-slate-700">
                <span className="font-semibold text-slate-500">แผนก :</span>{' '}
                <span className="font-semibold text-slate-950">{departmentName}</span>
              </p>
              <p className="min-w-0 text-slate-700">
                <span className="font-semibold text-slate-500">ชื่อผู้ติดต่อ :</span>{' '}
                <span className="font-semibold text-slate-950">{contactName}</span>
              </p>
              <p className="min-w-0 text-slate-700">
                <span className="font-semibold text-slate-500">โทร :</span>{' '}
                <span className="font-mono font-semibold text-slate-950">{compactPhone}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={customerMutationBusy}
            onClick={() => {
              if (customerMutationRef.current) return;
              setEditingSelectedCustomer(true);
              setFormInfo('');
              setFormError('');
            }}
            className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg border border-emerald-300 bg-white px-2.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
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
          disabled={customerMutationBusy}
          mutationAction={customerMutationAction}
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