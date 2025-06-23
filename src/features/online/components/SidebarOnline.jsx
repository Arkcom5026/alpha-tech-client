import React, { useEffect, useState } from 'react';
import haversine from 'haversine-distance';
import { useProductOnlineStore } from '../productOnline/store/productOnlineStore';
import { useBranchStore } from '@/features/branch/store/branchStore';
import CascadingFilterGroupOnline from '@/components/shared/form/CascadingFilterGroupOnline';

const SidebarOnline = () => {
  const dropdowns = useProductOnlineStore((state) => state.dropdowns);
  const loadDropdownsAction = useProductOnlineStore((state) => state.loadDropdownsAction);
  const loadProductsAction = useProductOnlineStore((state) => state.loadProductsAction);

  const branches = useBranchStore((state) => state.branches);
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const setSelectedBranchId = useBranchStore((state) => state.setSelectedBranchId);
  const getBranchNameById = useBranchStore((state) => state.getBranchNameById);

  const [filters, setFilters] = useState({
    categoryId: '',
    productTypeId: '',
    productProfileId: '',
    templateId: '',
  });

  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadDropdownsAction();
  }, [loadDropdownsAction]);

  useEffect(() => {
    if (selectedBranchId) {
      loadProductsAction({
        branchId: selectedBranchId,
        ...filters,
        searchText,
      });
    }
  }, [selectedBranchId, filters, searchText, loadProductsAction]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const currentBranch = useBranchStore((state) => state.currentBranch);
const selectedBranch = branches.find((b) => b.id === selectedBranchId);

let distanceInKm = null;
if (
  currentBranch?.latitude &&
  currentBranch?.longitude &&
  selectedBranch?.latitude &&
  selectedBranch?.longitude
) {
  const userLoc = {
    latitude: currentBranch.latitude,
    longitude: currentBranch.longitude,
  };
  const branchLoc = {
    latitude: selectedBranch.latitude,
    longitude: selectedBranch.longitude,
  };
  const distance = haversine(userLoc, branchLoc);
  distanceInKm = (distance / 1000).toFixed(2);
}

return (
    <div className="space-y-2 px-2 py-2">
      <div className="bg-green-50 border border-green-300 text-green-800 px-3 py-2 rounded text-sm">
        <div className="font-bold">สาขาที่ใกล้ที่สุด</div>
        {getBranchNameById(selectedBranchId)}
        <div className="mt-2">
          <select
            value={selectedBranchId || ''}
            onChange={(e) => setSelectedBranchId(Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-2 py-1"
          >
            <option value="">-- เลือกสาขาอื่น --</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        {distanceInKm && (
            <div className="text-xs text-gray-500 mt-1">
              {/* ระยะห่าง {distanceInKm} กม. {Number(distanceInKm) <= 10 ? "(ส่งฟรี)" : ""} */}
              ระยะห่าง {distanceInKm} กม. 
            </div>
          )}
        </div>
      </div>
      

      <input
        type="text"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder="ค้นหาชื่อสินค้า..."
        className="border px-3 py-2 rounded w-full"
      />

      <CascadingFilterGroupOnline
        value={filters}
        onChange={handleFilterChange}
        dropdowns={dropdowns || {}}
        showReset
      />
    </div>
  );
};

export default SidebarOnline;
