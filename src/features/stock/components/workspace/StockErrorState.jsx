import StockWorkspaceButton from './StockWorkspaceButton';

const StockErrorState = ({ message, onRetry, retrying = false }) => {
  if (!message) return null;

  return (
    <section className="mb-4 flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-rose-900">โหลดข้อมูลไม่สำเร็จ</h3>
        <p className="mt-1 text-sm leading-6 text-rose-700">{String(message)}</p>
      </div>
      {onRetry && (
        <StockWorkspaceButton variant="secondary" onClick={onRetry} disabled={retrying}>
          {retrying ? 'กำลังลองใหม่...' : 'ลองใหม่'}
        </StockWorkspaceButton>
      )}
    </section>
  );
};

export default StockErrorState;
