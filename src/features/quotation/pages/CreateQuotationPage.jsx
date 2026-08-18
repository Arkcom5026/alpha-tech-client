import React, { useState } from 'react';
import { ArrowLeft, FilePlus2, Search, UserRound, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { feedback } from '@/design-system';
import useCustomerStore from '@/features/customer/store/customerStore';
import { getCustomerDisplayName } from '@/features/customer/utils/customerDisplayName';
import { createQuotation } from '../api/quotationApi';

const CreateQuotationPage = () => {
  const { shopSlug } = useParams();
  const navigate = useNavigate();
  const prefix = `/${shopSlug || 'advancetech'}/pos/sales/quotations`;
  const searchCustomers = useCustomerStore((state) => state.searchStoreCustomersAction);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleSearch = async (event) => {
    event?.preventDefault?.();
    const normalized = query.trim();
    if (!normalized) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const payload = await searchCustomers(normalized);
      setResults(Array.isArray(payload?.results) ? payload.results : []);
    } catch (error) {
      feedback.actionError(error, 'ค้นหาลูกค้าไม่สำเร็จ', 'quotation:create:customer-search:error');
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleCreate = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const quotation = await createQuotation({ customerId: selectedCustomer?.id || null });
      if (!quotation?.id) throw new Error('Server ไม่ได้ส่งรหัสใบเสนอราคากลับมา');
      feedback.actionSuccess(
        selectedCustomer ? 'สร้างใบเสนอราคาและผูกข้อมูลลูกค้าแล้ว' : 'สร้างใบเสนอราคาเปล่าแล้ว',
        `quotation:${quotation.id}:create:success`,
      );
      navigate(`${prefix}/${quotation.id}`);
    } catch (error) {
      feedback.actionError(error, 'สร้างใบเสนอราคาไม่สำเร็จ', 'quotation:create:error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1380px] space-y-4 p-4 text-slate-800">
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={() => navigate(prefix)} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50">
          <ArrowLeft className="h-4 w-4" /> กลับ
        </button>
        <div className="text-right">
          <h1 className="text-lg font-bold text-slate-950">สร้างใบเสนอราคา</h1>
          <p className="text-sm text-slate-500">สร้างเอกสารก่อน แล้วค่อยกรอกรายละเอียดทั้งหมดในหน้าเอกสาร</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="rounded-lg bg-teal-100 p-2 text-teal-800"><UserRound className="h-4 w-4" /></div>
            <div>
              <h2 className="font-semibold text-slate-950">ค้นหาลูกค้า</h2>
              <p className="text-xs text-slate-500">เป็นตัวช่วยเท่านั้น ไม่จำเป็นต้องเลือกลูกค้าก่อนสร้าง Draft</p>
            </div>
          </div>

          {selectedCustomer ? (
            <div className="flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <div>
                <p className="font-semibold text-emerald-950">{getCustomerDisplayName(selectedCustomer)}</p>
                <p className="mt-1 text-sm text-emerald-800">{[selectedCustomer.phone, selectedCustomer.email, selectedCustomer.taxId].filter(Boolean).join(' · ') || 'ไม่มีข้อมูลติดต่อเพิ่มเติม'}</p>
              </div>
              <button type="button" onClick={() => setSelectedCustomer(null)} className="rounded-lg p-2 text-emerald-800 hover:bg-emerald-100" aria-label="ยกเลิกลูกค้าที่เลือก"><X className="h-4 w-4" /></button>
            </div>
          ) : (
            <form onSubmit={handleSearch} className="space-y-3">
              <div className="flex gap-2">
                <label className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ชื่อ เบอร์โทร หน่วยงาน หรือเลขผู้เสียภาษี" className="h-11 w-full rounded-xl border border-slate-300 pl-10 pr-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
                </label>
                <button type="submit" disabled={searching} className="rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50">{searching ? 'กำลังค้นหา...' : 'ค้นหา'}</button>
              </div>
              {results.length > 0 ? (
                <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-teal-100 bg-teal-50/40 p-2">
                  {results.map((customer) => (
                    <button key={customer.id} type="button" onClick={() => { setSelectedCustomer(customer); setResults([]); }} className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left hover:border-teal-300 hover:bg-teal-50">
                      <p className="font-semibold text-slate-900">{getCustomerDisplayName(customer)}</p>
                      <p className="mt-1 text-xs text-slate-500">{[customer.phone, customer.email, customer.taxId].filter(Boolean).join(' · ') || 'ไม่มีข้อมูลติดต่อเพิ่มเติม'}</p>
                    </button>
                  ))}
                </div>
              ) : null}
            </form>
          )}
        </section>

        <section className="flex flex-col justify-between rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-5 shadow-sm">
          <div>
            <div className="inline-flex rounded-xl bg-white p-2 text-teal-800 shadow-sm"><FilePlus2 className="h-5 w-5" /></div>
            <h2 className="mt-4 text-lg font-bold text-slate-950">เริ่มจากเอกสารเปล่าได้</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">ไม่ต้องเพิ่มสินค้า ไม่ต้องมีสต๊อก และไม่ต้องกรอกรายการใดในหน้านี้ ระบบจะสร้าง Draft แล้วพาไปยังหน้าเอกสารซึ่งเป็นพื้นที่ทำงานหลักของใบเสนอราคา</p>
            <div className="mt-4 rounded-xl border border-teal-100 bg-white/80 p-3 text-sm text-slate-600">
              {selectedCustomer ? <>ลูกค้าที่เลือก: <strong className="text-slate-900">{getCustomerDisplayName(selectedCustomer)}</strong></> : <>ลูกค้า: <strong className="text-slate-900">ยังไม่ระบุ</strong> — สามารถกรอกภายหลังได้</>}
            </div>
          </div>
          <button type="button" onClick={handleCreate} disabled={creating} data-testid="quotation-create-empty-draft" className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 text-base font-semibold text-white shadow-sm hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50">
            <FilePlus2 className="h-5 w-5" />
            {creating ? 'กำลังสร้างเอกสาร...' : 'สร้างใบเสนอราคา'}
          </button>
        </section>
      </div>
    </div>
  );
};

export default CreateQuotationPage;