import { useEffect, useState } from 'react';

import { getAllBanks } from '@/features/bank/api/bankApi';
import { useBranchStore } from '@/features/branch/store/branchStore';

const useSupplierFormRuntime = () => {
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const [banks, setBanks] = useState([]);

  useEffect(() => {
    let active = true;

    const loadBanks = async () => {
      try {
        const data = await getAllBanks();
        if (active) setBanks(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('❌ โหลดธนาคารล้มเหลว', err);
        if (active) setBanks([]);
      }
    };

    loadBanks();
    return () => {
      active = false;
    };
  }, []);

  return {
    banks,
    branchId: selectedBranchId,
    formSyncReady: banks.length > 0,
  };
};

export default useSupplierFormRuntime;
