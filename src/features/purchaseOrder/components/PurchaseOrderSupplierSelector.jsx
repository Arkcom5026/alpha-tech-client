import React from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import useSupplierStore from '@/features/supplier/store/supplierStore';
import { useBranchStore } from '@/features/branch/store/branchStore';


const PurchaseOrderSupplierSelector = ({ value, onChange }) => {
  const { suppliers, loading,fetchSuppliersAction  } = useSupplierStore();
  const { selectedBranchId } = useBranchStore();

  React.useEffect(() => {
    if (selectedBranchId) {
      fetchSuppliersAction(selectedBranchId);
    }
  }, [fetchSuppliersAction, selectedBranchId]);

  return (
    <div className="w-full">
      <Select
        value={value?.id?.toString() || ''}
        onValueChange={(val) => {
          const selected = suppliers.find((s) => s.id.toString() === val);
          onChange(selected);
        }}
        disabled={loading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="เลือก Supplier" />
        </SelectTrigger>

        <SelectContent>
          {suppliers.map((supplier) => (
            <SelectItem key={supplier.id} value={supplier.id.toString()}>
              {supplier.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PurchaseOrderSupplierSelector;
