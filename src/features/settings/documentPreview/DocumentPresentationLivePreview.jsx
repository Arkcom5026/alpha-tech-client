import React, { useMemo } from 'react'
import { LockKeyhole } from 'lucide-react'

import { buildStoreDocumentHeader } from '@/features/branch/documentHeader/documentHeaderConfig'
import { upsertDocumentPresentationLayer } from '@/features/printing/presentation/presentationConfig'
import { getDocumentPreviewFixture } from './documentPreviewFixtures'

const nameSizeClass = Object.freeze({
  sm: 'text-[10px]',
  md: 'text-[12px]',
  lg: 'text-[14px]',
  xl: 'text-[16px]',
})

const PreviewHeader = ({ header, compact = false }) => {
  const logoSize = compact
    ? Math.min(58, Math.max(34, Math.round(Number(header?.headerStyle?.logoSize || 56) * 0.55)))
    : Math.min(76, Math.max(42, Math.round(Number(header?.headerStyle?.logoSize || 56) * 0.65)))
  const logoPosition = header?.headerStyle?.logoPosition || 'left'
  const textAlign = header?.headerStyle?.textAlign || 'left'
  const containerClass = logoPosition === 'right'
    ? 'flex-row-reverse'
    : logoPosition === 'center'
      ? 'flex-col items-center'
      : 'flex-row'
  const alignClass = textAlign === 'center' ? 'text-center' : textAlign === 'right' ? 'text-right' : 'text-left'

  return (
    <div className={`flex min-h-[64px] items-center gap-3 border-b border-slate-400 pb-2 ${containerClass}`}>
      {header?.logoUrl ? (
        <img
          src={header.logoUrl}
          alt="ตัวอย่างโลโก้เอกสาร"
          className="shrink-0 object-contain"
          style={{ width: logoSize, height: logoSize }}
        />
      ) : null}
      <div className={`min-w-0 flex-1 leading-tight text-slate-800 ${alignClass}`}>
        {header?.branchName ? (
          <div className={`${nameSizeClass[header?.headerStyle?.storeNameSize] || nameSizeClass.md} font-black text-slate-950`}>
            {header.branchName}
          </div>
        ) : null}
        {header?.address ? <div className="mt-1 text-[8px] leading-snug">{header.address}</div> : null}
        {header?.phone ? <div className="mt-0.5 text-[8px]">โทร: {header.phone}</div> : null}
        {header?.taxId ? <div className="mt-0.5 text-[8px]">เลขประจำตัวผู้เสียภาษี: {header.taxId}</div> : null}
        {header?.headerStyle?.headerNote ? (
          <div className="mt-1 whitespace-pre-line text-[8px] font-semibold text-slate-600">{header.headerStyle.headerNote}</div>
        ) : null}
      </div>
    </div>
  )
}

const A4Preview = ({ fixture, header, footer }) => (
  <div
    data-testid="document-presentation-live-preview-canvas"
    data-renderer-family="A4"
    className="mx-auto aspect-[1/1.414] w-full max-w-[560px] overflow-hidden rounded-xl border border-slate-300 bg-white p-4 text-slate-800 shadow-inner"
  >
    <PreviewHeader header={header} />

    <div className="py-3 text-center">
      <div className="text-[15px] font-black text-slate-950">{fixture.title}</div>
      <div className="mt-0.5 text-[7px] font-bold tracking-[0.18em] text-slate-500">{fixture.englishTitle}</div>
    </div>

    {fixture.lockedAuthority ? (
      <div className="mb-2 flex items-center justify-center gap-1 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[7px] font-bold text-amber-800">
        <LockKeyhole className="h-2.5 w-2.5" /> ข้อมูลทางกฎหมายในตัวอย่างนี้เป็นข้อมูลล็อกโดยระบบ
      </div>
    ) : null}

    <div className="grid grid-cols-[1.45fr_1fr] gap-2 text-[7.5px] leading-relaxed">
      <div className="rounded border border-slate-400 p-2">
        <div><b>{fixture.counterpartyLabel}:</b> {fixture.counterpartyName}</div>
        {fixture.counterpartyAddress ? <div className="mt-0.5">{fixture.counterpartyAddress}</div> : null}
        <div className="mt-0.5">โทร: 02-000-0000</div>
      </div>
      <div className="rounded border border-slate-400 p-2">
        <div className="grid grid-cols-[1fr_1.25fr] gap-x-1">
          <span className="font-semibold">เลขที่:</span><span>{fixture.documentNo}</span>
          {fixture.meta.map(([label, value]) => (
            <React.Fragment key={`${label}-${value}`}>
              <span className="font-semibold">{label}:</span><span>{value}</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>

    <table className="mt-2 w-full table-fixed border-collapse text-[7px] leading-tight">
      <thead>
        <tr>
          <th className="w-[7%] border border-slate-400 px-1 py-1">#</th>
          <th className="w-[43%] border border-slate-400 px-1 py-1 text-left">รายการ / รายละเอียด</th>
          <th className="w-[10%] border border-slate-400 px-1 py-1">จำนวน</th>
          <th className="w-[10%] border border-slate-400 px-1 py-1">หน่วย</th>
          <th className="w-[14%] border border-slate-400 px-1 py-1">ราคา</th>
          <th className="w-[16%] border border-slate-400 px-1 py-1">จำนวนเงิน</th>
        </tr>
      </thead>
      <tbody>
        {fixture.items.map((item, index) => (
          <tr key={`${fixture.documentNo}-${index}`}>
            <td className="border border-slate-300 px-1 py-1 text-center">{index + 1}</td>
            <td className="border border-slate-300 px-1 py-1 font-medium">{item.description}</td>
            <td className="border border-slate-300 px-1 py-1 text-center">{item.quantity}</td>
            <td className="border border-slate-300 px-1 py-1 text-center">{item.unit}</td>
            <td className="border border-slate-300 px-1 py-1 text-right">{item.price}</td>
            <td className="border border-slate-300 px-1 py-1 text-right font-semibold">{item.amount}</td>
          </tr>
        ))}
        <tr>
          <td className="h-[54px] border border-slate-300" colSpan="6" />
        </tr>
      </tbody>
    </table>

    <div className="mt-2 grid grid-cols-[1.35fr_1fr] gap-2 text-[7px]">
      <div className="min-h-[72px] overflow-hidden rounded border border-dashed border-slate-300 p-1.5">
        {footer || <span className="text-slate-300">พื้นที่เงื่อนไข / หมายเหตุ / ข้อความท้ายเอกสาร</span>}
      </div>
      <div className="rounded border border-slate-400">
        {fixture.totals.map(([label, value], index) => (
          <div key={`${label}-${value}`} className={`flex justify-between gap-2 px-2 py-1 ${index < fixture.totals.length - 1 ? 'border-b border-slate-300' : 'font-black'}`}>
            <span>{label}</span><span>{value}</span>
          </div>
        ))}
      </div>
    </div>

    {fixture.signatures.length ? (
      <div className={`mt-8 grid gap-4 text-center text-[7px] text-slate-500 ${fixture.signatures.length >= 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {fixture.signatures.map((label) => <div key={label} className="border-t border-slate-400 pt-1.5">{label}</div>)}
      </div>
    ) : null}
  </div>
)

const ThermalPreview = ({ fixture, header, footer }) => (
  <div className="mx-auto max-w-[300px] rounded-2xl border border-slate-300 bg-slate-100 p-3 shadow-inner">
    <div
      data-testid="document-presentation-live-preview-canvas"
      data-renderer-family="THERMAL"
      className="mx-auto min-h-[540px] w-[80mm] max-w-full bg-white px-3 py-4 font-mono text-slate-800 shadow-sm"
    >
      <PreviewHeader header={header} compact />
      <div className="py-3 text-center">
        <div className="text-[12px] font-black">{fixture.title}</div>
        <div className="text-[7px] font-bold tracking-[0.12em]">{fixture.englishTitle}</div>
      </div>
      <div className="border-y border-dashed border-slate-400 py-2 text-[7px] leading-relaxed">
        <div>เลขที่: {fixture.documentNo}</div>
        {fixture.meta.map(([label, value]) => <div key={`${label}-${value}`}>{label}: {value}</div>)}
        <div>{fixture.counterpartyLabel}: {fixture.counterpartyName}</div>
      </div>
      <div className="py-2 text-[7px]">
        {fixture.items.map((item, index) => (
          <div key={`${fixture.documentNo}-${index}`} className="mb-2">
            <div className="font-semibold">{index + 1}. {item.description}</div>
            <div className="flex justify-between"><span>{item.quantity} {item.unit} × {item.price}</span><span>{item.amount}</span></div>
          </div>
        ))}
      </div>
      <div className="border-y border-dashed border-slate-400 py-2 text-[7px]">
        {fixture.totals.map(([label, value], index) => (
          <div key={`${label}-${value}`} className={`flex justify-between ${index === fixture.totals.length - 1 ? 'mt-1 text-[9px] font-black' : ''}`}>
            <span>{label}</span><span>{value}</span>
          </div>
        ))}
      </div>
      {footer ? <div className="mt-3 text-[7px]">{footer}</div> : null}
      <div className="mt-8 text-center text-[7px] text-slate-400">*** ตัวอย่างเอกสาร Thermal 80mm ***</div>
    </div>
  </div>
)

const DocumentPresentationLivePreview = ({
  branch,
  documentPurpose,
  draftLayer,
  footer,
  title = 'ตัวอย่างเอกสาร',
  description = 'ตัวอย่างใช้ข้อมูลจำลองและ presentation resolver เดียวกับเอกสารจริง',
}) => {
  const fixture = useMemo(() => getDocumentPreviewFixture(documentPurpose), [documentPurpose])
  const previewBranch = useMemo(() => {
    if (!branch || !draftLayer) return branch
    return {
      ...branch,
      documentHeaderConfig: upsertDocumentPresentationLayer(
        branch.documentHeaderConfig,
        documentPurpose,
        draftLayer,
      ),
    }
  }, [branch, documentPurpose, draftLayer])

  const header = useMemo(() => buildStoreDocumentHeader({
    branch: previewBranch,
    documentType: documentPurpose,
    legacyConfig: {
      branchName: previewBranch?.name || previewBranch?.branchName || 'ชื่อร้าน / บริษัท',
      address: previewBranch?.address || 'ที่อยู่สถานประกอบการ',
      phone: previewBranch?.phone || '02-000-0000',
      taxId: previewBranch?.taxId || '0100000000000',
      logoUrl: previewBranch?.logoUrl || '',
    },
  }), [documentPurpose, previewBranch])

  return (
    <section
      data-testid="document-presentation-live-preview"
      data-document-purpose={documentPurpose}
      className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-black text-slate-800">{title}</p>
          <p className="mt-0.5 text-[10px] font-medium leading-relaxed text-slate-400">{description}</p>
        </div>
        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[9px] font-black text-slate-500">
          SAMPLE · {fixture.rendererFamily}
        </span>
      </div>

      {fixture.rendererFamily === 'THERMAL'
        ? <ThermalPreview fixture={fixture} header={header} footer={footer} />
        : <A4Preview fixture={fixture} header={header} footer={footer} />}
    </section>
  )
}

export default DocumentPresentationLivePreview
