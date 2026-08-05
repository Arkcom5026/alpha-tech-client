import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useBranchStore } from '@/features/branch/store/branchStore';
import {
  createTaxExpense,
  createTaxExpenseCategory,
  enableSupplierAsExpensePayee,
  listExpensePayeeSuppliers,
  listTaxExpenseCategories,
  listTaxExpenses,
  listTaxExpenseSupplierCandidates,
} from '../api/taxExpenseApi';

const list = (value) => Array.isArray(value) ? value : [];

const useTaxExpenseWorkspace = () => {
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const currentBranch = useBranchStore((state) => state.currentBranch);
  const ensureSelectedBranchAction = useBranchStore((state) => state.ensureSelectedBranchAction);
  const branchId = Number(selectedBranchId || currentBranch?.id || 0) || null;
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [payees, setPayees] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [setupBusy, setSetupBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    setError('');
    try {
      const [expenseData, categoryData, payeeData, supplierData] = await Promise.all([
        listTaxExpenses(),
        listTaxExpenseCategories(),
        listExpensePayeeSuppliers(),
        listTaxExpenseSupplierCandidates(),
      ]);
      setExpenses(list(expenseData));
      setCategories(list(categoryData));
      setPayees(list(payeeData));
      setSuppliers(list(supplierData));
    } catch (requestError) {
      const message = requestError?.response?.data?.message || 'ไม่สามารถโหลดข้อมูลค่าใช้จ่ายได้';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    if (!branchId) {
      Promise.resolve(ensureSelectedBranchAction?.()).catch(() => {});
      return;
    }
    load();
  }, [branchId, ensureSelectedBranchAction, load]);

  const submitExpense = useCallback(async (payload) => {
    setSaving(true);
    try {
      const created = await createTaxExpense(payload);
      setExpenses((current) => [created, ...current]);
      toast.success('บันทึกค่าใช้จ่ายแล้ว');
      return created;
    } catch (requestError) {
      const message = requestError?.response?.data?.message || 'ไม่สามารถบันทึกค่าใช้จ่ายได้';
      toast.error(message);
      throw requestError;
    } finally {
      setSaving(false);
    }
  }, []);

  const addCategory = useCallback(async (payload) => {
    setSetupBusy(true);
    try {
      const created = await createTaxExpenseCategory(payload);
      setCategories((current) => [...current, created].sort((a, b) => a.code.localeCompare(b.code)));
      toast.success('เพิ่มหมวดค่าใช้จ่ายแล้ว');
      return created;
    } catch (requestError) {
      toast.error(requestError?.response?.data?.message || 'ไม่สามารถเพิ่มหมวดค่าใช้จ่ายได้');
      throw requestError;
    } finally {
      setSetupBusy(false);
    }
  }, []);

  const enablePayee = useCallback(async (supplierId) => {
    setSetupBusy(true);
    try {
      await enableSupplierAsExpensePayee(supplierId);
      const [payeeData, supplierData] = await Promise.all([
        listExpensePayeeSuppliers(),
        listTaxExpenseSupplierCandidates(),
      ]);
      setPayees(list(payeeData));
      setSuppliers(list(supplierData));
      toast.success('กำหนด Supplier เป็นผู้รับเงินแล้ว');
    } catch (requestError) {
      toast.error(requestError?.response?.data?.message || 'ไม่สามารถกำหนดผู้รับเงินได้');
      throw requestError;
    } finally {
      setSetupBusy(false);
    }
  }, []);

  return {
    branchId, currentBranch, expenses, categories, payees, suppliers,
    loading, saving, setupBusy, error, load, submitExpense, addCategory, enablePayee,
  };
};

export default useTaxExpenseWorkspace;
