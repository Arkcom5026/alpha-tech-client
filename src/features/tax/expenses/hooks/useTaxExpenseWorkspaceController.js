import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useBranchStore } from '@/features/branch/store/branchStore';
import {
  createTaxExpense,
  createTaxExpenseCategory,
  getTaxExpenseDetail,
  getTaxExpenseErrorMessage,
  listTaxExpenseCategories,
  listTaxExpenses,
  recordTaxExpense,
} from '../api/taxExpenseApi';

const listValue = (result, key) => (Array.isArray(result?.[key]) ? result[key] : []);

const useTaxExpenseWorkspaceController = () => {
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const currentBranch = useBranchStore((state) => state.currentBranch);
  const ensureSelectedBranchAction = useBranchStore((state) => state.ensureSelectedBranchAction);
  const branchId = Number(selectedBranchId || currentBranch?.id || 0) || null;

  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [filters, setFilters] = useState({ status: '', documentNumber: '' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadWorkspace = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    setError('');
    try {
      const [categoryResult, expenseResult] = await Promise.all([
        listTaxExpenseCategories({ branchId, activeOnly: true }),
        listTaxExpenses({ branchId, ...filters }),
      ]);
      setCategories(listValue(categoryResult, 'categories'));
      setExpenses(listValue(expenseResult, 'expenses'));
    } catch (requestError) {
      const message = getTaxExpenseErrorMessage(requestError);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [branchId, filters]);

  useEffect(() => {
    if (!branchId) {
      Promise.resolve(ensureSelectedBranchAction?.()).catch(() => {});
      return;
    }
    loadWorkspace();
  }, [branchId, ensureSelectedBranchAction, loadWorkspace]);

  useEffect(() => {
    setSelectedExpense(null);
  }, [branchId]);

  const openExpense = useCallback(async (expense) => {
    if (!branchId || !expense?.id) return;
    try {
      setSelectedExpense(await getTaxExpenseDetail({ branchId, taxExpenseId: expense.id }));
    } catch (requestError) {
      toast.error(getTaxExpenseErrorMessage(requestError));
    }
  }, [branchId]);

  const submitExpense = useCallback(async (payload) => {
    if (!branchId) return;
    setSaving(true);
    try {
      const result = await createTaxExpense({ branchId, ...payload });
      toast.success('บันทึกร่างค่าใช้จ่ายแล้ว');
      await loadWorkspace();
      if (result?.expense) setSelectedExpense(result.expense);
      return result?.expense || null;
    } catch (requestError) {
      const message = getTaxExpenseErrorMessage(requestError);
      toast.error(message);
      throw requestError;
    } finally {
      setSaving(false);
    }
  }, [branchId, loadWorkspace]);

  const submitCategory = useCallback(async (payload) => {
    if (!branchId) return;
    setSaving(true);
    try {
      await createTaxExpenseCategory({ branchId, ...payload });
      toast.success('เพิ่มหมวดค่าใช้จ่ายแล้ว');
      await loadWorkspace();
    } catch (requestError) {
      toast.error(getTaxExpenseErrorMessage(requestError));
      throw requestError;
    } finally {
      setSaving(false);
    }
  }, [branchId, loadWorkspace]);

  const recordExpense = useCallback(async () => {
    if (!branchId || !selectedExpense?.id) return;
    setSaving(true);
    try {
      const result = await recordTaxExpense({ branchId, taxExpenseId: selectedExpense.id });
      setSelectedExpense(result?.expense || null);
      await loadWorkspace();
      toast.success('บันทึกรายการค่าใช้จ่ายแล้ว');
    } catch (requestError) {
      toast.error(getTaxExpenseErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }, [branchId, loadWorkspace, selectedExpense?.id]);

  return {
    branchId,
    currentBranch,
    categories,
    expenses,
    selectedExpense,
    filters,
    loading,
    saving,
    error,
    setFilters,
    loadWorkspace,
    openExpense,
    submitExpense,
    submitCategory,
    recordExpense,
  };
};

export default useTaxExpenseWorkspaceController;
