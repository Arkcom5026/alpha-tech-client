// --- filepath: src/features/position/pages/CreatePositionPage.jsx
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PositionForm from '../components/PositionForm.jsx';
import { usePositionStore } from '../stores/positionStore.js';

const CreatePositionPage = () => {
  const navigate = useNavigate();
  const { createAction, loading, error, message, resetCurrentAction } = usePositionStore();
  const didMountRef = useRef(false);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      resetCurrentAction();
    }
    return () => resetCurrentAction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (payload) => {
    const ok = await createAction(payload);
    if (ok) navigate(-1);
  };

  return (
    <div className="w-full flex justify-center mt-4">
      <div className="w-[800px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">เพิ่มตำแหน่งพนักงาน</h1>
        </div>

        {message && <div className="mb-3 text-sm text-green-600">{message}</div>}

        <PositionForm
          initialValues={{ name: '', description: '' }}
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
          submitting={loading}
          error={error}
        />
      </div>
    </div>
  );
};

export default CreatePositionPage;
