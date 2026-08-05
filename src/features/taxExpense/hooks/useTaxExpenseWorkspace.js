import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useBranchStore } from '@/features/branch/store/branchStore';
import {
  createExpensePayee,
  createTaxExpense,
  listExpensePayees,
  listTaxExpenseCategories,
  listTaxExpenses,
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
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPayee, setSavingPayee] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async ({ payeeQuery = '' } = {}) => {
    if (!branchId) return;
    setLoading(true);
    setError('');
    try {
      const [expenseData, categoryData, payeeData] = await Promise.all([
        listTaxExpenses(),
        listTaxExpenseCategories(),
        listExpensePayees({ q: payeeQuery }),
      ]);
      setExpenses(list(expenseData));
      setCategories(list(categoryData));
      setPayees(list(payeeData));
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

  const searchPayees = useCallback(async (q) => {
    setLoading(true);
    try {
      setPayees(list(await listExpensePayees({ q })));
    } catch (requestError) {
      const message = requestError?.response?.data?.message || 'ไม่สามารถค้นหาผู้รับเงินค่าใช้จ่ายได้';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const submitPayee = useCallback(async (payload) => {
    setSavingPayee(true);
    try {
      const created = await createExpensePayee(payload);
      setPayees((current) => [created, ...current.filter((item) => item.id !== created.id)]);
      toast.success('เพิ่มผู้รับเงินค่าใช้จ่ายแล้ว');
      return created;
    } catch (requestError) {
      const message = requestError?.response?.data?.message || 'ไม่สามารถเพิ่มผู้รับเงินค่าใช้จ่ายได้';
      toast.error(message);
      throw requestError;
    } finally {
      setSavingPayee(false);
    }
  }, []);

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

  return {
    branchId,
    currentBranch,
    expenses,
    categories,
    payees,
    loading,
    saving,
    savingPayee,
    error,
    load,
    searchPayees,
    submitPayee,
    submitExpense,
  };
};

export default useTaxExpenseWorkspace;
