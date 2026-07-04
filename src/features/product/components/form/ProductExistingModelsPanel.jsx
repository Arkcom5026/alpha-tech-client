import React, { useEffect, useMemo, useState } from 'react';

import { getExistingProductModels } from '@/features/product/api/productExistingModelsApi';

const toId = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const ProductExistingModelsPanel = ({ productTypeId, brandId }) => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const ptId = toId(productTypeId);
  const brId = toId(brandId);
  const isReady = Boolean(ptId && brId);

  useEffect(() => {
    let cancelled = false;

    if (!isReady) {
      setItems([]);
      setSearch('');
      setLoading(false);
      setError('');
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    setError('');

    getExistingProductModels({ productTypeId: ptId, brandId: brId })
      .then((result) => {
        if (cancelled) return;
        setItems(Array.isArray(result?.items) ? result.items : []);
      })
      .catch((err) => {
        if (cancelled) return;
        setItems([]);
        setError(err?.message || 'โหลดรายการรุ่นสินค้าไม่สำเร็จ');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isReady, ptId, brId]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    const source = Array.isArray(items) ? items : [];

    if (!query) return source;

    return source.filter((item) =>
      String(item?.name ?? '').toLowerCase().includes(query)
    );
  }, [items, search]);

  if (!isReady) {
    return (
      <section className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
        <div className="font-medium text-gray-800">รายการรุ่นสินค้าที่มีอยู่แล้ว</div>
        <div className="mt-1">เลือกประเภทสินค้าและแบรนด์ก่อน ระบบจะแสดงชื่อรุ่นที่มีอยู่แล้วเพื่อช่วยป้องกันการเพิ่มซ้ำ</div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 shadow-sm">
      <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="font-semibold text-amber-950">รายการรุ่นสินค้าที่มีอยู่แล้ว</div>
          <div className="text-sm text-amber-800">
            ตรวจสอบชื่อรุ่นก่อนสร้างสินค้าใหม่ เพื่อลดการเพิ่มข้อมูลซ้ำ
          </div>
        </div>
        <div className="text-xs text-amber-700">
          {loading ? 'กำลังโหลด...' : `${items.length} รายการ`}
        </div>
      </div>

      <div className="mt-3">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="ค้นหาชื่อรุ่นในแบรนด์นี้..."
          className="w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
        />
      </div>

      {error ? (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {!error && !loading && items.length === 0 ? (
        <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          ยังไม่พบรุ่นสินค้าในประเภทและแบรนด์นี้ สามารถสร้างสินค้าใหม่ได้
        </div>
      ) : null}

      {!error && items.length > 0 ? (
        <div className="mt-3 max-h-56 overflow-auto rounded-md border border-amber-200 bg-white">
          {filteredItems.length === 0 ? (
            <div className="px-3 py-3 text-sm text-gray-500">ไม่พบชื่อรุ่นที่ตรงกับคำค้นหา</div>
          ) : (
            filteredItems.slice(0, 80).map((item) => (
              <div
                key={`existing_product_${String(item.id)}`}
                className="border-b border-gray-100 px-3 py-2 text-sm text-gray-800 last:border-b-0"
              >
                {item.name}
              </div>
            ))
          )}
        </div>
      ) : null}
    </section>
  );
};

export default ProductExistingModelsPanel;
