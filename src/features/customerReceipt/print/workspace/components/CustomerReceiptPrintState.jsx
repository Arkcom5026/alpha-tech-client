import React from 'react'

const CustomerReceiptPrintState = ({ id, detailLoading = false, printLoading = false, error = '', hasReceipt = false }) => {
  if (!id) {
    return (
      <div className="min-h-screen bg-slate-900 p-8 text-center font-bold text-rose-400">
        ไม่พบเลขที่ใบรับเงิน
      </div>
    )
  }

  if (detailLoading || printLoading) {
    return (
      <div className="min-h-screen bg-slate-900 p-8 text-center font-bold text-zinc-400">
        กำลังโหลดข้อมูลใบรับเงิน...
      </div>
    )
  }

  if (error) {
    return (
      <div role="alert" className="min-h-screen bg-slate-900 p-8 text-center font-bold text-rose-400">
        เกิดข้อผิดพลาด: {error}
      </div>
    )
  }

  if (!hasReceipt) {
    return (
      <div className="min-h-screen bg-slate-900 p-8 text-center font-bold text-zinc-400">
        ไม่พบข้อมูลใบรับเงินตามรหัสอ้างอิง
      </div>
    )
  }

  return null
}

export default CustomerReceiptPrintState
