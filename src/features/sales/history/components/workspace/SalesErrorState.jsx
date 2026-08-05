import React from 'react';
import SalesWorkspaceButton from './SalesWorkspaceButton';

const SalesErrorState = ({ message, onRetry, retrying = false }) => {
  if (!message) return null;
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-rose-900">โหลดข้อมูลไม่สำเร็จ</p>
        <p className="mt-1 text-sm text-rose-700">{String(message)}</p>
      </div>
      {onRetry && <SalesWorkspaceButton onClick={onRetry} disabled={retrying}>{retrying ? 'กำลังลองใหม่...' : 'ลองใหม่'}</SalesWorkspaceButton>}
    </div>
  );
};

export default SalesErrorState;
