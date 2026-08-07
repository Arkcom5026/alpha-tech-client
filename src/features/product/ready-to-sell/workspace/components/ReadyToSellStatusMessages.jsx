const ReadyToSellStatusMessages = ({ branchId, productId, loading, errorMessage, scanMessage }) => (
  <div className="space-y-2">
    {scanMessage && (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900" role="status">
        <div className="font-medium">{scanMessage}</div>
      </div>
    )}

    {!branchId && (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900" role="alert">
        <div className="font-semibold">ยังไม่ได้เลือกสาขา</div>
        <div className="text-sm opacity-90">กรุณาเลือกสาขาก่อน</div>
      </div>
    )}

    {!productId && (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800" role="alert">
        <div className="font-semibold">ลิงก์ไม่ถูกต้อง</div>
        <div className="text-sm opacity-90">ไม่พบ productId</div>
      </div>
    )}

    {loading && (
      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-blue-800" role="status">
        <div className="font-semibold">กำลังโหลดรายละเอียด…</div>
      </div>
    )}

    {!loading && errorMessage && (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800" role="alert">
        <div className="font-semibold">โหลดข้อมูลไม่สำเร็จ</div>
        <div className="text-sm opacity-90 whitespace-pre-line">{String(errorMessage)}</div>
      </div>
    )}
  </div>
);

export default ReadyToSellStatusMessages;
