// --- filepath: src/features/position/pages/EditPositionPage.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

  // Load data by id (and log for debugging)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!Number.isFinite(idNum)) {
        console.warn('[EditPositionPage] invalid id param:', id);
        setNotFound(true);
        return;
      }
      console.debug('[EditPositionPage] fetching id=', idNum);
      const item = await fetchByIdAction(idNum);
      console.debug('[EditPositionPage] fetched item=', item);
      if (!cancelled && !item) setNotFound(true);
    })();
    return () => {
      cancelled = true;
      resetCurrentAction();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idNum]);

  const handleSubmit = async (payload) => {
    const ok = await updateAction(idNum, payload);
    if (ok) navigate(-1);
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
            key={current.id} // ensure re-mount when current changes
            initialValues={{ name: current?.name || '', description: current?.description || '' }}
            onSubmit={handleSubmit}
            onCancel={() => navigate(-1)}
            submitting={loading}
            error={error}
          />
        )}
      </div>
    </div>
  );
};

export default EditPositionPage;
