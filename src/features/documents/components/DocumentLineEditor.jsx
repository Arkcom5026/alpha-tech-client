// src/features/documents/components/DocumentLineEditor.jsx

import { useState } from 'react'

const emptyLine = {
  documentPrefix: '',
  documentDescription: '',
  documentSuffix: '',
}

export default function DocumentLineEditor({
  value = emptyLine,
  onSave,
  onCancel,
}) {
  const [line, setLine] = useState({
    documentPrefix: value.documentPrefix || '',
    documentDescription: value.documentDescription || '',
    documentSuffix: value.documentSuffix || '',
  })

  const update = (key, val) => setLine((p)=>({...p,[key]:val}))

  return (
    <div className="border rounded bg-slate-50 p-2 space-y-2">
      <input
        className="w-full border rounded px-2 py-1"
        placeholder="ข้อความหน้าชื่อสินค้า"
        value={line.documentPrefix}
        onChange={(e)=>update('documentPrefix',e.target.value)}
      />

      <input
        className="w-full border rounded px-2 py-1"
        placeholder="ชื่อสินค้า"
        value={line.documentDescription}
        onChange={(e)=>update('documentDescription',e.target.value)}
      />

      <input
        className="w-full border rounded px-2 py-1"
        placeholder="ข้อความท้ายชื่อสินค้า"
        value={line.documentSuffix}
        onChange={(e)=>update('documentSuffix',e.target.value)}
      />

      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="rounded border px-3 py-1"
          onClick={onCancel}
        >
          ยกเลิก
        </button>

        <button
          type="button"
          className="rounded bg-emerald-600 px-3 py-1 text-white"
          onClick={()=>onSave?.(line)}
        >
          บันทึก
        </button>
      </div>
    </div>
  )
}
