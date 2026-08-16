import { useCallback, useEffect, useRef, useState } from 'react';
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
  const savingRef = useRef(false);
  const savingPayeeRef = useRef(false);
  const savingCategoryRef = useRef(false);

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
    if (savingCategoryRef.current) return null;
    savingCategoryRef.current = true;
    setSavingCategory(true);
    try {
      const created = await createTaxExpenseCategory({ ...payload });
      setCategories((current) => [...current.filter((item) => item.id !== created.id), created]
        .sort((left, right) => left.code.localeCompare(right.code)));
      feedback.actionSuccess(
        'เพิ่มหมวดค่าใช้จ่ายแล้ว',
        `tax-expense-category:${created.id || created.code || 'new'}:create:success`,
      );
      return created;
    } catch (requestError) {
      feedback.actionError(
        requestError,
        'ไม่สามารถเพิ่มหมวดค่าใช้จ่ายได้',
        'tax-expense-category:create:error',
      );
      throw requestError;
    } finally {
      savingCategoryRef.current = false;
      setSavingCategory(false);
    }
  }, []);

  const submitPayee = useCallback(async (payload) => {
    if (savingPayeeRef.current) return null;
    savingPayeeRef.current = true;
    setSavingPayee(true);
    try {
      const created = await createExpensePayee({ ...payload });
      setPayees((current) => [created, ...current.filter((item) => item.id !== created.id)]);
      feedback.actionSuccess(
        'เพิ่มผู้รับเงินค่าใช้จ่ายแล้ว',
        `tax-expense-payee:${created.id || 'new'}:create:success`,
      );
      return created;
    } catch (requestError) {
      feedback.actionError(
        requestError,
        'ไม่สามารถเพิ่มผู้รับเงินค่าใช้จ่ายได้',
        'tax-expense-payee:create:error',
      );
      throw requestError;
    } finally {
      savingPayeeRef.current = false;
      setSavingPayee(false);
    }
  }, []);

  const submitExpense = useCallback(async (payload) => {
    if (savingRef.current) return null;
    savingRef.current = true;
    setSaving(true);
    try {
      const created = await createTaxExpense({ ...payload });
      setExpenses((current) => [created, ...current]);
      feedback.actionSuccess(
        'บันทึกค่าใช้จ่ายแล้ว',
        `tax-expense:${created.id || 'new'}:create:success`,
      );
      return created;
    } catch (requestError) {
      feedback.actionError(
        requestError,
        'ไม่สามารถบันทึกค่าใช้จ่ายได้',
        'tax-expense:create:error',
      );
      throw requestError;
    } finally {
      savingRef.current = false;
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