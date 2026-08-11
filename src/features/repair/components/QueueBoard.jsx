import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { formatDateTime } from '../utils/repairRuntime';

const getRepairAsset = (item) => {
  if (item.repairAsset) return item.repairAsset;

  if (item.stockItem) {
    return {
      sourceType: 'STOCK_ITEM',
      displayName:
        item.stockItem?.product?.name || item.deviceModel || 'สินค้าในร้าน',
      brand: item.stockItem?.product?.brand || null,
      category: item.stockItem?.product?.productType || null,
      model: item.deviceModel || null,
      barcode: item.stockItem?.barcode || item.device?.barcode || null,
      serialNumber:
        item.stockItem?.serialNumber || item.device?.serialNumber || null,
      imei: item.device?.imei || null,
    };
  }

  if (item.device) {
    return {
      sourceType: 'CUSTOMER_DEVICE',
      displayName:
        [item.device.brand, item.device.model].filter(Boolean).join(' ') ||
        item.deviceModel ||
        'อุปกรณ์ของลูกค้า',
      brand: item.device.brand || null,
      category: item.device.category || null,
      model: item.device.model || item.deviceModel || null,
      barcode: item.device.barcode || null,
      serialNumber: item.device.serialNumber || null,
      imei: item.device.imei || null,
    };
  }

  return {
    sourceType: 'DESCRIBED_DEVICE',
    displayName: item.deviceModel || 'อุปกรณ์ที่ลูกค้านำมาซ่อม',
    brand: null,
    category: null,
    model: item.deviceModel || null,
    barcode: null,
    serialNumber: null,
    imei: null,
  };
};

const getClaimAsset = (item) => {
  if (item.claimAsset) return item.claimAsset;

  return getRepairAsset({
    ...item,
    deviceModel: item.repairJob?.deviceModel,
  });
};

const getAssetMeta = (asset) =>
  [asset.brand, asset.category].filter(Boolean).join(' • ');

const getAssetIdentity = (asset) =>
  [
    asset.barcode ? `Barcode: ${asset.barcode}` : null,
    asset.serialNumber ? `Serial: ${asset.serialNumber}` : null,
    asset.imei ? `IMEI: ${asset.imei}` : null,
  ].filter(Boolean);

const getAssetSourceLabel = (sourceType) => {
  if (sourceType === 'STOCK_ITEM') return 'สินค้าที่ซื้อจากร้าน';
  if (sourceType === 'CUSTOMER_DEVICE') return 'อุปกรณ์ของลูกค้า';
  return 'ข้อมูลจากใบรับซ่อม';
};

const CLAIM_LANE_STYLES = {
  DRAFT: 'border-slate-200 bg-slate-100/70',
  SUBMITTED: 'border-blue-200 bg-blue-50/70',
  IN_TRANSIT: 'border-cyan-200 bg-cyan-50/70',
  RECEIVED_BY_PROVIDER: 'border-violet-200 bg-violet-50/70',
  INSPECTING: 'border-amber-200 bg-amber-50/70',
  APPROVED: 'border-emerald-200 bg-emerald-50/70',
  REPAIRING: 'border-orange-200 bg-orange-50/70',
  REPLACEMENT_PENDING: 'border-teal-200 bg-teal-50/70',
  CREDIT_PENDING: 'border-slate-300 bg-slate-100/80',
  RESOLVED: 'border-green-200 bg-green-50/70',
  REJECTED: 'border-red-200 bg-red-50/70',
  CANCELLED: 'border-zinc-300 bg-zinc-100/80',
};

const ClaimDetail = ({ label, value }) =>
  value ? (
    <p className="mt-1 line-clamp-1 text-[11px] text-slate-500">
      <span className="font-black text-slate-600">{label}:</span> {value}
    </p>
  ) : null;

const getRepairLaneTimestamp = (item) =>
  item?.queueStatus === 'EXTERNAL_REPAIR'
    ? item?.activeSubcontract?.sentAt || item?.updatedAt || item?.createdAt
    : item?.updatedAt || item?.createdAt;

const toDayKey = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return 'UNKNOWN';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDayLabel = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return 'ไม่ทราบวันที่';
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const groupRepairItemsByDay = (items = []) => {
  const groups = new Map();

  for (const item of items) {
    const timestamp = getRepairLaneTimestamp(item);
    const key = toDayKey(timestamp);
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        timestamp,
        label: formatDayLabel(timestamp),
        items: [],
      });
    }
    groups.get(key).items.push(item);
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      items: [...group.items].sort(
        (left, right) =>
          new Date(getRepairLaneTimestamp(right) || 0).getTime() -
          new Date(getRepairLaneTimestamp(left) || 0).getTime()
      ),
    }))
    .sort(
      (left, right) =>
        new Date(right.timestamp || 0).getTime() -
        new Date(left.timestamp || 0).getTime()
    );
};

const RepairCompactRow = ({ item, expanded, onToggle }) => {
  const customerName =
    item?.customer?.name || item?.customerName || `ลูกค้า #${item?.customerId}`;
  const asset = getRepairAsset(item);

  return (
    <button
      type="button"
      onClick={() => onToggle(item.id)}
      className={`grid min-h-9 w-full grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-3 rounded-lg border px-2.5 py-1.5 text-left text-xs transition focus:outline-none focus:ring-2 focus:ring-blue-200 ${
        expanded
          ? 'border-blue-200 bg-blue-50/70'
          : 'border-transparent hover:border-blue-200 hover:bg-blue-50/70'
      }`}
      aria-expanded={expanded}
      title={`${customerName} • ${asset.displayName}`}
    >
      <span className="truncate font-black text-slate-800">{customerName}</span>
      <span className="truncate text-slate-600">{asset.displayName}</span>
    </button>
  );
};

const RepairPreviewCard = ({ item, onOpen }) => {
  const customer = item.customer;
  const customerName = customer?.name || item.customerName || `ลูกค้า #${item.customerId}`;
  const customerContact = customer?.phone || customer?.email || null;
  const asset = getRepairAsset(item);
  const assetMeta = getAssetMeta(asset);
  const assetIdentity = getAssetIdentity(asset);
  const external = item.activeSubcontract;

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className="mx-1 mb-2 w-[calc(100%-0.5rem)] rounded-xl border border-blue-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-200"
      aria-label={`เปิดรายละเอียดงาน ${item.jobNo}`}
    >
      <p className="font-black text-slate-950">{item.jobNo}</p>

      {customerName ? (
        <div className="mt-2 rounded-lg bg-slate-50 px-2.5 py-2">
          <p className="line-clamp-1 text-sm font-black text-slate-800">
            {customerName}
          </p>
          {customerContact ? (
            <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
              {customerContact}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-2 rounded-lg border border-slate-100 px-2.5 py-2">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 text-sm font-black text-slate-800">
            {asset.displayName}
          </p>
          <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-black text-blue-700">
            {getAssetSourceLabel(asset.sourceType)}
          </span>
        </div>
        {assetMeta ? (
          <p className="mt-1 line-clamp-1 text-xs text-slate-500">{assetMeta}</p>
        ) : null}
        {assetIdentity.length ? (
          <div className="mt-1 space-y-0.5 text-[11px] text-slate-500">
            {assetIdentity.map((value) => (
              <p key={value} className="line-clamp-1">{value}</p>
            ))}
          </div>
        ) : null}
      </div>

      {item.reportedSymptoms ? (
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
          อาการ: {item.reportedSymptoms}
        </p>
      ) : null}

      {external?.active ? (
        <div className="mt-2 rounded-lg bg-violet-50 px-2.5 py-2 text-[11px] text-violet-800">
          <p className="font-black">ส่งให้: {external.providerName || '-'}</p>
          {external.workScope ? (
            <p className="mt-1 line-clamp-2">งาน: {external.workScope}</p>
          ) : null}
          {external.sentAt ? (
            <p className="mt-1 text-violet-600">
              ส่งออก {formatDateTime(external.sentAt)}
            </p>
          ) : null}
        </div>
      ) : null}

      <p className="mt-2 text-xs text-slate-400">
        {formatDateTime(item.updatedAt || item.createdAt)}
      </p>
    </button>
  );
};

const RepairDayGroup = ({
  group,
  initiallyOpen,
  selectedItemId,
  onToggleItem,
  onOpen,
}) => {
  const [open, setOpen] = useState(initiallyOpen);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-9 w-full items-center justify-between gap-2 bg-slate-50 px-2.5 py-1.5 text-left"
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-1.5 text-xs font-black text-slate-700">
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <span className="truncate">{group.label}</span>
        </span>
        <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-slate-600">
          {group.items.length} งาน
        </span>
      </button>

      {open ? (
        <div className="divide-y divide-slate-100 py-1">
          {group.items.map((item) => {
            const expanded = selectedItemId === item.id;
            return (
              <React.Fragment key={item.id}>
                <RepairCompactRow
                  item={item}
                  expanded={expanded}
                  onToggle={onToggleItem}
                />
                {expanded ? <RepairPreviewCard item={item} onOpen={onOpen} /> : null}
              </React.Fragment>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

const RepairLane = ({ lane, onOpen }) => {
  const groups = useMemo(() => groupRepairItemsByDay(lane.items), [lane.items]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const toggleItem = (itemId) =>
    setSelectedItemId((current) => (current === itemId ? null : itemId));

  return (
    <section
      className={`rounded-2xl border p-3 ${
        lane.key === 'EXTERNAL_REPAIR'
          ? 'border-violet-200 bg-violet-50/50'
          : 'border-slate-200 bg-slate-100/70'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="truncate font-black text-slate-950">{lane.label}</h2>
          <p className="mt-1 line-clamp-2 text-xs text-slate-500">{lane.description}</p>
        </div>
        <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-black text-slate-700 shadow-sm">
          {lane.items.length}
        </span>
      </div>

      <div className="mt-3 space-y-2">
        {groups.length ? (
          groups.map((group, index) => (
            <RepairDayGroup
              key={group.key}
              group={group}
              initiallyOpen={index === 0}
              selectedItemId={selectedItemId}
              onToggleItem={toggleItem}
              onOpen={onOpen}
            />
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-4 text-center text-xs text-slate-400">
            ไม่มีรายการ
          </div>
        )}
      </div>
    </section>
  );
};

const RepairQueueBoard = ({ lanes, onOpen }) => (
  <div className="overflow-x-auto pb-2">
    <div className="grid min-w-[1420px] grid-cols-6 gap-4">
      {lanes.map((lane) => (
        <RepairLane key={lane.key} lane={lane} onOpen={onOpen} />
      ))}
    </div>
  </div>
);

const ClaimQueueBoard = ({ lanes, onOpen }) => (
  <div className="overflow-x-auto pb-2">
    <div className="grid min-w-[1180px] grid-cols-5 gap-4">
      {lanes.map((lane) => (
        <section
          key={lane.key}
          className={`rounded-2xl border p-3 ${
            CLAIM_LANE_STYLES[lane.key] || 'border-slate-200 bg-slate-100/70'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="font-black text-slate-950">{lane.label}</h2>
              <p className="mt-1 text-xs text-slate-500">{lane.description}</p>
            </div>
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-slate-700 shadow-sm">
              {lane.items.length}
            </span>
          </div>

          <div className="mt-3 space-y-3">
            {lane.items.length ? (
              lane.items.map((item) => {
                const customer = item.repairJob?.customer;
                const customerName =
                  customer?.name || item.repairJob?.customerName || null;
                const customerContact = customer?.phone || customer?.email || null;
                const asset = getClaimAsset(item);
                const assetMeta = getAssetMeta(asset);
                const assetIdentity = getAssetIdentity(asset);
                const source = item.source;
                const supplierName = item.supplier?.name || item.serviceProvider;

                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => onOpen(item)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-black text-slate-950">{item.claimNo}</p>
                      {source ? (
                        <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-black text-indigo-700">
                          {source.label}
                        </span>
                      ) : null}
                    </div>

                    {source?.referenceNo ? (
                      <p className="mt-1 text-[11px] font-bold text-indigo-600">
                        {source.referenceNo}
                      </p>
                    ) : null}

                    {customerName ? (
                      <div className="mt-2 rounded-lg bg-slate-50 px-2.5 py-2">
                        <p className="line-clamp-1 text-sm font-black text-slate-800">
                          {customerName}
                        </p>
                        {customerContact ? (
                          <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                            {customerContact}
                          </p>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="mt-2 rounded-lg border border-slate-100 px-2.5 py-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-2 text-sm font-black text-slate-800">
                          {asset.displayName}
                        </p>
                        <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-black text-blue-700">
                          {getAssetSourceLabel(asset.sourceType)}
                        </span>
                      </div>
                      {assetMeta ? (
                        <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                          {assetMeta}
                        </p>
                      ) : null}
                      {assetIdentity.length ? (
                        <div className="mt-1 space-y-0.5 text-[11px] text-slate-500">
                          {assetIdentity.map((value) => (
                            <p key={value} className="line-clamp-1">{value}</p>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-2 rounded-lg bg-indigo-50/60 px-2.5 py-2">
                      <ClaimDetail label="Supplier/ศูนย์" value={supplierName} />
                      <ClaimDetail label="Tracking" value={item.trackingNumber} />
                      <ClaimDetail label="เลขอ้างอิง" value={item.externalClaimRef} />
                      <ClaimDetail
                        label="เหตุผล"
                        value={item.reason || item.repairJob?.reportedSymptoms}
                      />
                    </div>

                    <p className="mt-2 text-xs text-slate-400">
                      {formatDateTime(item.updatedAt || item.openedAt)}
                    </p>
                  </button>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-5 text-center text-xs text-slate-400">
                ไม่มีรายการ
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  </div>
);

const QueueBoard = ({ lanes, type, onOpen }) =>
  type === 'repair' ? (
    <RepairQueueBoard lanes={lanes} onOpen={onOpen} />
  ) : (
    <ClaimQueueBoard lanes={lanes} onOpen={onOpen} />
  );

export default QueueBoard;
