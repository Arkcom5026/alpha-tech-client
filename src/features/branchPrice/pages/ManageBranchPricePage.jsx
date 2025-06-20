// 📄 ManageBranchPricePage.jsx
import React, { useEffect } from 'react';

import BranchPriceForm from '../components/BranchPriceForm';
import useBranchPriceStore from '../store/branchPriceStore';

const ManageBranchPricePage = () => {
  const {
    allProductsWithPrice,
    loading,
    error,
    fetchAllProductsWithPriceAction,
  } = useBranchPriceStore();

  useEffect(() => {
    fetchAllProductsWithPriceAction();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">จัดการราคาสินค้าสาขานี้</h1>

      {loading && <p>กำลังโหลด...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && allProductsWithPrice.length === 0 && (
        <p className="text-gray-500">ยังไม่มีสินค้าในระบบ</p>
      )}

      {!loading && allProductsWithPrice.length > 0 && (
        <div className="space-y-6">
          {allProductsWithPrice.map((entry) => (
            <div key={entry.product.id} className="border rounded p-4 bg-white shadow">
              <h2 className="text-lg font-medium mb-2">{`ตั้งราคาสำหรับ: ${entry.product.name}`}</h2>
              <BranchPriceForm
                productId={entry.product.id}
                defaultValues={entry.branchPrice || {}}
                rawPrices={entry.rawPrices}
                latestCostPrice={entry.latestCostPrice}
                avgCostPrice={entry.avgCostPrice}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageBranchPricePage;
