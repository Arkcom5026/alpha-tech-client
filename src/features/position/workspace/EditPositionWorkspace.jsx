import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { feedback } from '@/design-system';
import PositionForm from '../components/PositionForm.jsx';
import { usePositionStore } from '../stores/positionStore.js';

const EditPositionPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const idNum = useMemo(() => {
    const n = Number(id);
    return Number.isFinite(n) ? n : NaN;
  }, [id]);

  const { fetchByIdAction, updateAction, current, loading, error, message, resetCurrentAction } = usePositionStore();
  const [notFound, setNotFound] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!Number.isFinite(idNum)) {
        setNotFound(true);
        feedback.error('รหัสตำแหน่งไม่ถูกต้อง', { eventKey: 'position:edit:invalid-id' });
        return;
      }
      try {
        const item = await fetchByIdAction(idNum);
        if (!cancelled && !item) setNotFound(true);
      } catch (loadError) {
        if (!cancelled) {
          setNotFound(true);
          feedback.actionError(loadError, 'โหลดข้อมูลตำแหน่งไม่สำเร็จ', 'position:edit:load:error');
        }
      }
    })();
    return () => {
      cancelled = true;
      resetCurrentAction();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idNum]);

  const handleSubmit = async (payload) => {
    if (loading || submittingRef.current || !Number.isFinite(idNum)) return;

    const positionIdSnapshot = idNum;
    const payloadSnapshot = {
      name: String(payload?.name || '').trim(),
      description: String(payload?.description || '').trim() || null,
    };
    if (!payloadSnapshot.name) return;

    submittingRef.current = true;
    try {
      const ok = await updateAction(positionIdSnapshot, payloadSnapshot);
      if (ok) {
        feedback.actionSuccess('บันทึกการแก้ไขตำแหน่งเรียบร้อยแล้ว', `position:${positionIdSnapshot}:update:success`);
        navigate(-1);
      } else {
        feedback.error(error || 'บันทึกการแก้ไขตำแหน่งไม่สำเร็จ', { eventKey: `position:${positionIdSnapshot}:update:error` });
      }
    } catch (updateError) {
      feedback.actionError(updateError, 'บันทึกการแก้ไขตำแหน่งไม่สำเร็จ', `position:${positionIdSnapshot}:update:error`);
    } finally {
      submittingRef.current = false;
    }
  };

  const showForm = !!current && !loading;

  return (
    <div className="w-full flex justify-center mt-4">
      <div className="w-[800px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">แก้ไขตำแหน่งพนักงาน</h1>
        </div>

        {message && <div className="mb-3 text-sm text-green-600">{message}</div>}

        {notFound && !loading && (
          <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">ไม่พบบันทึกนี้</div>
        )}

        {!showForm && !notFound && (
          <div className="text-sm text-zinc-600">กำลังโหลด...</div>
        )}

        {showForm && (
          <PositionForm
            key={current.id}
            initialValues={{ name: current?.name || '', description: current?.description || '' }}
            onSubmit={handleSubmit}
            onCancel={() => !loading && !submittingRef.current && navigate(-1)}
            submitting={loading}
            mutationOwnedRef={submittingRef}
            error={error}
          />
        )}
      </div>
    </div>
  );
};

export default EditPositionPage;
