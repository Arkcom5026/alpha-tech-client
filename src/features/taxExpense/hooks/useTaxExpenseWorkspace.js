import { useCallback, useEffect, useState } from 'react';
import { feedback } from '@/design-system/feedback';
import { useBranchStore } from '@/features/branch/store/branchStore';
import {
  createExpensePayee,
  createTaxExpense,
  createTaxExpenseCategory,
  listExpensePayees,
  listTaxExpenseCategories,
  listTaxExpenses,
  listRepairExpenseReasons,
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
  const [repairReasons, setRepairReasons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPayee, setSavingPayee] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async ({ payeeQuery = '' } = {}) => {
    if (!branchId) return;
    setLoading(true);
    setError('');
    try {
      const [expenseData, categoryData, payeeData, repairReasonData] = await Promise.all([
        listTaxExpenses(),
        listTaxExpenseCategories(),
        listExpensePayees({ q: payeeQuery }),
        listRepairExpenseReasons(),
      ]);
      setExpenses(list(expenseData));
      setCategories(list(categoryData));
      setPayees(list(payeeData));
      setRepairReasons(list(repairReasonData));
    } catch (requestError) {
      const message = requestError?.response?.data?.message || 'ไม่สามารถโหลดข้อมูลค่าใช้จ่ายได้';
      setError(message);
      feedback.error(message);
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
      feedback.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const submitCategory = useCallback(async (payload) => {
    setSavingCategory(true);
    try {
      const created = await createTaxExpenseCategory(payload);
      setCategories((current) => [...current.filter((item) => item.id !== created.id), created]
        .sort((left, right) => left.code.localeCompare(right.code)));
      feedback.success('เพิ่มหมวดค่าใช้จ่ายแล้ว');
      return created;
    } catch (requestError) {
      const message = requestError?.response?.data?.message || 'ไม่สามารถเพิ่มหมวดค่าใช้จ่ายได้';
      feedback.error(message);
      throw requestError;
    } finally {
      setSavingCategory(false);
    }
  }, []);

  const submitPayee = useCallback(async (payload) => {
    setSavingPayee(true);
    try {
      const created = await createExpensePayee(payload);
      setPayees((current) => [created, ...current.filter((item) => item.id !== created.id)]);
      feedback.success('เพิ่มผู้รับเงินค่าใช้จ่ายแล้ว');
      return created;
    } catch (requestError) {
      const message = requestError?.response?.data?.message || 'ไม่สามารถเพิ่มผู้รับเงินค่าใช้จ่ายได้';
      feedback.error(message);
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
      feedback.success('บันทึกค่าใช้จ่ายแล้ว');
      return created;
    } catch (requestError) {
      const message = requestError?.response?.data?.message || 'ไม่สามารถบันทึกค่าใช้จ่ายได้';
      feedback.error(message);
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
    repairReasons,
    loading,
    saving,
    savingPayee,
    savingCategory,
    error,
    load,
    searchPayees,
    submitCategory,
    submitPayee,
    submitExpense,
  };
};

export default useTaxExpenseWorkspace;