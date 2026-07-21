import React from 'react';
import useProductTraceRuntimeController from '../hooks/useProductTraceRuntimeController';
import ProductTraceSearchBar from '../components/ProductTraceSearchBar';
import ProductTraceStatePanel from '../components/ProductTraceStatePanel';
import ProductTraceOperationalSummary from '../components/ProductTraceOperationalSummary';
import ProductTraceIdentityCard from '../components/ProductTraceIdentityCard';
import ProductTraceCurrentSummary from '../components/ProductTraceCurrentSummary';
import ProductTraceHealthCard from '../components/ProductTraceHealthCard';
import ProductTraceRiskCard from '../components/ProductTraceRiskCard';
import ProductTraceWarrantyCard from '../components/ProductTraceWarrantyCard';
import ProductTraceCurrentOwnerCard from '../components/ProductTraceCurrentOwnerCard';
import ProductTraceJourney from '../components/ProductTraceJourney';
import ProductTraceEventCounter from '../components/ProductTraceEventCounter';
import ProductTraceOwnershipHistory from '../components/ProductTraceOwnershipHistory';
import ProductTraceFinancialStory from '../components/ProductTraceFinancialStory';
import ProductTraceProcurementCard from '../components/ProductTraceProcurementCard';
import ProductTraceSalesCard from '../components/ProductTraceSalesCard';
import ProductTraceIncidentHistory from '../components/ProductTraceIncidentHistory';
import ProductTraceAttachments from '../components/ProductTraceAttachments';
import ProductTraceTimeline from '../components/ProductTraceTimeline';
import { formatProductTraceDateTime } from '../utils/productTraceFormat';

const ProductTracePage = () => {
  const {
    lookup,
    trace,
    loading,
    error,
    errorCode,
    searched,
    lastLoadedAt,
    handleLookupChange,
    handleSearch,
    handleReset,
    reloadTraceAction,
  } = useProductTraceRuntimeController();

  const returns = Array.isArray(trace?.returns) ? trace.returns : [];
  const claims = Array.isArray(trace?.claims) ? trace.claims : [];
  const repairs = Array.isArray(trace?.repairs) ? trace.repairs : [];
  const timeline = Array.isArray(trace?.timeline) ? trace.timeline : [];

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-5 lg:px-8">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
            Product Digital Passport
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-950">ประวัติสินค้า</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">
            ตรวจสอบตัวตน เจ้าของปัจจุบัน ประกัน ความเสี่ยง มูลค่า เหตุการณ์ และหลักฐานของสินค้ารายชิ้น
          </p>
        </div>

        {lastLoadedAt ? (
          <div className="text-xs text-slate-500">
            โหลดล่าสุด {formatProductTraceDateTime(lastLoadedAt)}
          </div>
        ) : null}
      </div>

      <ProductTraceSearchBar
        value={lookup}
        loading={loading}
        onChange={handleLookupChange}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      <div className="mt-5">
        <ProductTraceStatePanel
          loading={loading}
          searched={searched}
          error={error}
          errorCode={errorCode}
          onRetry={reloadTraceAction}
        />
      </div>

      {!loading && !error && trace ? (
        <div className="mt-5 space-y-5">
          <ProductTraceOperationalSummary trace={trace} />

          <ProductTraceIdentityCard identity={trace.identity} query={trace.query} />

          <div className="grid gap-5 xl:grid-cols-[1.5fr_0.7fr]">
            <ProductTraceCurrentSummary
              identity={trace.identity}
              summary={trace.summary}
            />
            <ProductTraceHealthCard
              identity={trace.identity}
              returns={returns}
              claims={claims}
              repairs={repairs}
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            <ProductTraceCurrentOwnerCard trace={trace} />
            <ProductTraceWarrantyCard trace={trace} />
            <ProductTraceRiskCard
              identity={trace.identity}
              returns={returns}
              claims={claims}
              repairs={repairs}
              timeline={timeline}
            />
          </div>

          <ProductTraceJourney timeline={timeline} identity={trace.identity} />

          <ProductTraceEventCounter timeline={timeline} />

          <ProductTraceOwnershipHistory
            identity={trace.identity}
            timeline={timeline}
            procurement={trace.procurement}
            sales={trace.sales}
          />

          <ProductTraceFinancialStory summary={trace.summary} />

          <div className="grid gap-5 xl:grid-cols-2">
            <ProductTraceSalesCard sales={trace.sales} />
            <ProductTraceProcurementCard procurement={trace.procurement} />
          </div>

          <ProductTraceIncidentHistory
            returns={returns}
            claims={claims}
            repairs={repairs}
            timeline={timeline}
          />

          <ProductTraceAttachments trace={trace} />

          <ProductTraceTimeline timeline={timeline} />
        </div>
      ) : null}
    </div>
  );
};

export default ProductTracePage;
