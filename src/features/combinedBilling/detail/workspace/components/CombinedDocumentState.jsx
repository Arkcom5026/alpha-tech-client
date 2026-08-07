import React from 'react';

const CombinedDocumentState = ({ status = 'loading', message = '' }) => {
  if (status === 'error') {
    return <div className="p-8 text-center text-red-500">เกิดข้อผิดพลาด: {message}</div>;
  }

  if (status === 'empty') {
    return <div className="p-8 text-center">ไม่พบข้อมูลเอกสาร</div>;
  }

  return <div className="p-8 text-center">กำลังโหลดข้อมูลเอกสาร...</div>;
};

export default CombinedDocumentState;
