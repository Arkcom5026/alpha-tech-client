import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { feedback as toast } from '@/design-system';
import { useBranchStore } from '@/features/branch/store/branchStore';
import { listTaxPeriods } from '@/features/tax/periods/api/taxPeriodApi';
import {
  getTaxDocumentDetail,
  getTaxIntakeErrorDetails,
  getTaxIntakeErrorMessage,
  listTaxCandidates,
  listTaxDocuments,
  refreshDraftTaxRecipient,
  transitionTaxDocument,
  issueOutputTaxDocument,
} from '../api/taxIntakeApi';

const normalizeList = (result, key) => (
  Array.isArray(result?.[key])
    ? result[key]
    : Array.isArray(result)
      ? result
      : []
);

const normalizeQueryFilter = (value) => String(value || '').trim();
const normalizeUpperQueryFilter = (value) => normalizeQueryFilter(value).toUpperCase();

const useTaxIntakeWorkspaceController = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const currentBranch = useBranchStore((state) => state.currentBranch);
  const ensureSelectedBranchAction = useBranchStore((state) => state.ensureSelectedBranchAction);
  const branchId = Number(selectedBranchId || currentBranch?.id || 0) || null;

  const [candidates, setCandidates] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [taxPeriods, setTaxPeriods] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [periodsLoading, setPeriodsLoading] = useState(false);
  const [error, setError] = useState('');
  const [candidateStatus, setCandidateStatus] = useState('');
  const [taxPeriodId, setTaxPeriodId] = useState(() => normalizeQueryFilter(searchParams.get('taxPeriodId')));
  const [documentStatus, setDocumentStatus] = useState(() => normalizeUpperQueryFilter(searchParams.get('documentStatus')));
  const [documentType, setDocumentType] = useState(() => normalizeUpperQueryFilter(searchParams.get('documentType')));
  const [transitioning, setTransitioning] = useState(false);
  const [transitionError, setTransitionError] = useState(null);
  const transitionRef = useRef(false);
  const branchIdRef = useRef(branchId);
  const loadRequestRef = useRef(0);
  branchIdRef.current = branchId;

  const updateQueryFilter = useCallback((key, value) => {
    const next = new URLSearchParams(searchParams);
    const normalized = normalizeQueryFilter(value);
    if (normalized) next.set(key, normalized);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleTaxPeriodChange = useCallback((value) => {
    const normalized = normalizeQueryFilter(value);
    setTaxPeriodId(normalized);
    updateQueryFilter('taxPeriodId', normalized);
  }, [updateQueryFilter]);

  const handleDocumentStatusChange = useCallback((value) => {
    const normalized = normalizeUpperQueryFilter(value);
    setDocumentStatus(normalized);
    updateQueryFilter('documentStatus', normalized);
  }, [updateQueryFilter]);

  const handleDocumentTypeChange = useCallback((value) => {
    const normalized = normalizeUpperQueryFilter(value);
    setDocumentType(normalized);
    updateQueryFilter('documentType', normalized);
  }, [updateQueryFilter]);

  const loadPeriods = useCallback(async () => {
    if (!branchId) return;
    setPeriodsLoading(true);
    try {
      const result = await listTaxPeriods({ branchId });
      setTaxPeriods(normalizeList(result, 'periods'));
    } catch (requestError) {
      toast.error(getTaxIntakeErrorMessage(requestError));
    } finally {
      setPeriodsLoading(false);
    }
  }, [branchId]);

  const loadData = useCallback(async ({ reportError = true } = {}) => {
    if (!branchId) return { ok: false, skipped: true };

    const requestId = ++loadRequestRef.current;
    const branchIdSnapshot = branchId;
    const taxPeriodIdSnapshot = taxPeriodId;
    const candidateStatusSnapshot = candidateStatus;
    const documentStatusSnapshot = documentStatus;
    const documentTypeSnapshot = documentType;

    setLoading(true);
    setError('');

    try {
      const [candidateResult, documentResult] = await Promise.all([
        listTaxCandidates({
          branchId: branchIdSnapshot,
          taxPeriodId: taxPeriodIdSnapshot || undefined,
          status: candidateStatusSnapshot || undefined,
        }),
        listTaxDocuments({
          branchId: branchIdSnapshot,
          taxPeriodId: taxPeriodIdSnapshot || undefined,
          status: documentStatusSnapshot || undefined,
          documentType: documentTypeSnapshot || undefined,
        }),
      ]);

      if (requestId !== loadRequestRef.current || branchIdRef.current !== branchIdSnapshot) {
        return { ok: false, stale: true };
      }

      setCandidates(normalizeList(candidateResult, 'candidates'));
      setDocuments(normalizeList(documentResult, 'documents'));
      return { ok: true };
    } catch (requestError) {
      if (requestId !== loadRequestRef.current || branchIdRef.current !== branchIdSnapshot) {
        return { ok: false, stale: true, error: requestError };
      }

      const message = getTaxIntakeErrorMessage(requestError);
      setError(message);
      if (reportError) toast.error(message);
      return { ok: false, error: requestError, message };
    } finally {
      if (requestId === loadRequestRef.current) setLoading(false);
    }
  }, [branchId, candidateStatus, documentStatus, documentType, taxPeriodId]);

  useEffect(() => {
    if (!branchId) {
      Promise.resolve(ensureSelectedBranchAction?.()).catch(() => {});
      return;
    }
    loadPeriods();
  }, [branchId, ensureSelectedBranchAction, loadPeriods]);

  useEffect(() => {
    if (branchId) loadData();
  }, [branchId, loadData]);

  useEffect(() => {
    setSelectedDocument(null);
    setTransitionError(null);
  }, [branchId, documentStatus, documentType, taxPeriodId]);

  const openDocument = useCallback(async (document) => {
    if (!branchId || !document?.id || transitionRef.current) return;

    try {
      const detail = await getTaxDocumentDetail({
        branchId,
        taxDocumentId: document.id,
      });
      setSelectedDocument(detail);
      setTransitionError(null);
    } catch (requestError) {
      toast.error(getTaxIntakeErrorMessage(requestError));
    }
  }, [branchId]);

  const refreshAfterMutation = useCallback(async ({
    branchIdSnapshot,
    taxDocumentId,
    successMessage,
    eventKey,
  }) => {
    toast.actionSuccess(successMessage, `${eventKey}:success`);

    if (branchIdRef.current !== branchIdSnapshot) {
      const contextError = new Error('Tax Intake branch changed after persistence');
      toast.actionError(
        contextError,
        'ดำเนินการเอกสารภาษีสำเร็จแล้ว แต่มีการเปลี่ยนสาขาก่อนรีเฟรชข้อมูลล่าสุด',
        `${eventKey}:context-changed:error`,
      );
      return { ok: false, stale: true, error: contextError };
    }

    try {
      const detail = await getTaxDocumentDetail({
        branchId: branchIdSnapshot,
        taxDocumentId,
      });
      if (branchIdRef.current === branchIdSnapshot) setSelectedDocument(detail);
    } catch (refreshError) {
      toast.actionError(
        refreshError,
        'ดำเนินการเอกสารภาษีสำเร็จแล้ว แต่โหลดรายละเอียดเอกสารล่าสุดไม่สำเร็จ',
        `${eventKey}:detail-refresh:error`,
      );
    }

    if (branchIdRef.current !== branchIdSnapshot) {
      return { ok: false, stale: true };
    }

    const listRefresh = await loadData({ reportError: false });
    if (!listRefresh.ok && !listRefresh.stale) {
      toast.actionError(
        listRefresh.error,
        'ดำเนินการเอกสารภาษีสำเร็จแล้ว แต่รีเฟรชรายการ Tax Intake ล่าสุดไม่สำเร็จ',
        `${eventKey}:refresh:error`,
      );
    }
    return listRefresh;
  }, [loadData]);

  const handleRefreshRecipient = useCallback(async () => {
    const branchIdSnapshot = branchId;
    const taxDocumentId = selectedDocument?.id;
    if (!branchIdSnapshot || !taxDocumentId || transitioning || transitionRef.current) return;

    const eventKey = `tax-intake:${branchIdSnapshot}:document:${taxDocumentId}:recipient-refresh`;
    transitionRef.current = true;
    setTransitioning(true);
    setTransitionError(null);
    try {
      await refreshDraftTaxRecipient({
        branchId: branchIdSnapshot,
        taxDocumentId,
      });
      await refreshAfterMutation({
        branchIdSnapshot,
        taxDocumentId,
        successMessage: 'อัปเดตข้อมูลผู้รับจากลูกค้าล่าสุดแล้ว',
        eventKey,
      });
    } catch (requestError) {
      const message = getTaxIntakeErrorMessage(requestError);
      if (branchIdRef.current === branchIdSnapshot) {
        setTransitionError({ message, details: getTaxIntakeErrorDetails(requestError) });
      }
      toast.actionError(requestError, message, `${eventKey}:error`);
    } finally {
      transitionRef.current = false;
      setTransitioning(false);
    }
  }, [branchId, refreshAfterMutation, selectedDocument?.id, transitioning]);

  const handleTransition = useCallback(async (targetStatus) => {
    const branchIdSnapshot = branchId;
    const taxDocumentId = selectedDocument?.id;
    const targetStatusSnapshot = targetStatus;
    if (!branchIdSnapshot || !taxDocumentId || transitioning || transitionRef.current) return;

    const eventKey = `tax-intake:${branchIdSnapshot}:document:${taxDocumentId}:transition:${targetStatusSnapshot}`;
    transitionRef.current = true;
    setTransitioning(true);
    setTransitionError(null);

    try {
      await transitionTaxDocument({
        branchId: branchIdSnapshot,
        taxDocumentId,
        targetStatus: targetStatusSnapshot,
      });

      await refreshAfterMutation({
        branchIdSnapshot,
        taxDocumentId,
        successMessage: `เปลี่ยนสถานะเป็น ${targetStatusSnapshot} แล้ว`,
        eventKey,
      });
    } catch (requestError) {
      const message = getTaxIntakeErrorMessage(requestError);
      if (branchIdRef.current === branchIdSnapshot) {
        setTransitionError({
          message,
          details: getTaxIntakeErrorDetails(requestError),
        });
      }
      toast.actionError(requestError, message, `${eventKey}:error`);
    } finally {
      transitionRef.current = false;
      setTransitioning(false);
    }
  }, [branchId, refreshAfterMutation, selectedDocument?.id, transitioning]);

  const handleIssue = useCallback(async (taxInvoiceKind) => {
    const branchIdSnapshot = branchId;
    const taxDocumentId = selectedDocument?.id;
    const taxInvoiceKindSnapshot = taxInvoiceKind;
    if (!branchIdSnapshot || !taxDocumentId || transitioning || transitionRef.current) return;

    const eventKey = `tax-intake:${branchIdSnapshot}:document:${taxDocumentId}:issue:${taxInvoiceKindSnapshot}`;
    transitionRef.current = true;
    setTransitioning(true);
    setTransitionError(null);
    try {
      await issueOutputTaxDocument({
        branchId: branchIdSnapshot,
        taxDocumentId,
        taxInvoiceKind: taxInvoiceKindSnapshot,
      });
      await refreshAfterMutation({
        branchIdSnapshot,
        taxDocumentId,
        successMessage: 'ออกเลขใบกำกับภาษีเรียบร้อยแล้ว',
        eventKey,
      });
    } catch (requestError) {
      const message = getTaxIntakeErrorMessage(requestError);
      if (branchIdRef.current === branchIdSnapshot) {
        setTransitionError({ message, details: getTaxIntakeErrorDetails(requestError) });
      }
      toast.actionError(requestError, message, `${eventKey}:error`);
    } finally {
      transitionRef.current = false;
      setTransitioning(false);
    }
  }, [branchId, refreshAfterMutation, selectedDocument?.id, transitioning]);

  const selectedTaxPeriod = useMemo(
    () => taxPeriods.find((period) => String(period.id) === String(taxPeriodId)) || null,
    [taxPeriodId, taxPeriods],
  );

  const totals = useMemo(() => ({
    candidates: candidates.length,
    documents: documents.length,
  }), [candidates.length, documents.length]);

  return {
    branchId,
    currentBranch,
    candidates,
    documents,
    taxPeriods,
    taxPeriodId,
    selectedTaxPeriod,
    selectedDocument,
    loading,
    periodsLoading,
    error,
    candidateStatus,
    documentStatus,
    documentType,
    transitioning,
    transitionError,
    totals,
    setCandidateStatus,
    handleTaxPeriodChange,
    handleDocumentStatusChange,
    handleDocumentTypeChange,
    loadData,
    openDocument,
    handleRefreshRecipient,
    handleTransition,
    handleIssue,
  };
};

export default useTaxIntakeWorkspaceController;
