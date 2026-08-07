import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  getCanonicalProductGroupApi,
  materializeCanonicalProductGroupsApi,
} from '../api/templateCandidateApi';
import { getBusinessTypeLabel } from '../utils/businessType';
import CanonicalGroupDetailHeader from '../workspace/components/CanonicalGroupDetailHeader';
import CanonicalGroupDetailSummary from '../workspace/components/CanonicalGroupDetailSummary';
import CanonicalGroupMaterializationPanel from '../workspace/components/CanonicalGroupMaterializationPanel';
import CanonicalGroupReviewReasons from '../workspace/components/CanonicalGroupReviewReasons';
import CanonicalGroupSourceProducts from '../workspace/components/CanonicalGroupSourceProducts';

const statusLabel = (status) =>
  status === 'READY' ? 'พร้อมตรวจ' : 'ต้องตรวจ Product Type';

const statusClass = (status) =>
  status === 'READY'
    ? 'bg-emerald-50 text-emerald-700'
    : 'bg-amber-50 text-amber-700';

const CanonicalGroupDetailPage = () => {
  const navigate = useNavigate();
  const { groupKey } = useParams();
  const [searchParams] = useSearchParams();
  const businessType = searchParams.get('businessType') || '';
  const [detail, setDetail] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [materializing, setMaterializing] = React.useState(false);
  const [materializeResult, setMaterializeResult] = React.useState(null);
  const [materializeError, setMaterializeError] = React.useState(null);

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    getCanonicalProductGroupApi(groupKey, { businessType })
      .then((response) => {
        if (!active) return;
        setDetail(response?.data || response);
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [groupKey, businessType]);

  const materializeGroup = async () => {
    setMaterializing(true);
    setMaterializeError(null);
    setMaterializeResult(null);
    try {
      const response = await materializeCanonicalProductGroupsApi({
        businessType,
        apply: true,
        limit: 500,
        groupKey,
      });
      setMaterializeResult(response?.data || response);
    } catch (requestError) {
      setMaterializeError(requestError);
    } finally {
      setMaterializing(false);
    }
  };

  if (loading) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm font-bold text-slate-500">กำลังโหลดรายละเอียด Canonical Group...</div>;
  }

  if (error || !detail) {
    return (
      <div className="space-y-4">
        <button type="button" onClick={() => navigate(-1)} className="min-h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700">ย้อนกลับ</button>
        <div role="alert" className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm font-bold text-red-700">{error?.message || 'ไม่พบ Canonical Group'}</div>
      </div>
    );
  }

  const group = detail.group || detail;
  const sourceProducts = group.sourceProducts || detail.sourceProducts || [];
  const sourceBranches = detail.sourceBranches || group.sourceBranches || [];
  const templateBranch = detail.templateBranch || null;
  const canMaterialize = group.reviewStatus === 'READY';

  return (
    <div className="min-h-screen space-y-5 bg-slate-50 p-4 xl:p-6">
      <CanonicalGroupDetailHeader
        group={group}
        groupKey={groupKey}
        statusLabel={statusLabel}
        statusClass={statusClass}
        onBack={() => navigate(-1)}
      />

      <CanonicalGroupDetailSummary
        businessTypeLabel={getBusinessTypeLabel(detail.businessType || businessType)}
        templateBranch={templateBranch}
        categoryId={detail.categoryId}
        sourceProductCount={group.sourceProductCount ?? sourceProducts.length}
        sourceBranchCount={group.sourceBranchCount ?? sourceBranches.length}
      />

      <CanonicalGroupMaterializationPanel
        canMaterialize={canMaterialize}
        materializing={materializing}
        materializeError={materializeError}
        materializeResult={materializeResult}
        onMaterialize={materializeGroup}
      />

      <CanonicalGroupReviewReasons reasons={group.reviewReasons || []} />
      <CanonicalGroupSourceProducts sourceProducts={sourceProducts} />
    </div>
  );
};

export default CanonicalGroupDetailPage;
