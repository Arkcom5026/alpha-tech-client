import { Card, CardContent } from '@/components/ui/card';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, ClipboardList, Plus, ShoppingCart } from 'lucide-react';

const PurchasesDashboardPage = () => {
  const { shopSlug } = useParams();
  const purchaseOrderPath = shopSlug ? `/${shopSlug}/pos/purchases/po` : '/pos/purchases/po';

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-600">
              <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-600">Purchase Center</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">แดชบอร์ดการจัดซื้อ</h1>
              <p className="mt-2 text-sm text-slate-500">สร้างและติดตามใบสั่งซื้อสินค้าในเส้นทางจัดซื้อของสาขา</p>
            </div>
          </div>

          <Link
            to={purchaseOrderPath}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            สร้างใบสั่งซื้อสินค้า
          </Link>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Link to={purchaseOrderPath} className="group block">
            <Card className="h-full border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md">
              <CardContent className="flex items-start justify-between gap-4 p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-100">
                    <ClipboardList className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-900">รายการใบสั่งซื้อ</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">ดู PO ทั้งหมดที่สร้างไว้และเข้าสู่ขั้นตอนจัดการใบสั่งซื้อ</p>
                  </div>
                </div>
                <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-slate-300 transition group-hover:text-emerald-600" aria-hidden="true" />
              </CardContent>
            </Card>
          </Link>
        </section>
      </div>
    </div>
  );
};

export default PurchasesDashboardPage;
