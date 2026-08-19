import React from 'react';
import { UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import SaleCustomerDetailsForm from './SaleCustomerDetailsForm';

const SaleCustomerCreateDialog = ({
  open,
  disabled = false,
  editor,
  provinceFilter,
  mutationAction = null,
  onOpenChange,
  onPatch,
  onCreate,
  onCancel,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto border-slate-200 bg-white p-0 shadow-2xl">
      <DialogHeader className="border-b border-slate-100 px-5 pb-4 pt-5 pr-12">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-teal-100 p-2 text-teal-800">
            <UserPlus className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <DialogTitle className="text-base font-semibold text-slate-950">
              เพิ่มข้อมูลลูกค้าใหม่
            </DialogTitle>
            <DialogDescription className="mt-1 text-xs leading-5 text-slate-500">
              กรอกข้อมูลลูกค้าที่ต้องใช้สำหรับการขายและเอกสาร โดยไม่ออกจากหน้าขายสินค้า
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="p-4 md:p-5">
        <SaleCustomerDetailsForm
          editor={editor}
          selectedCustomer={null}
          isModified={false}
          pendingCreate
          provinceFilter={provinceFilter}
          disabled={disabled}
          mutationAction={mutationAction}
          onPatch={onPatch}
          onCreate={onCreate}
          onCancelCreate={onCancel}
        />
      </div>
    </DialogContent>
  </Dialog>
);

export default SaleCustomerCreateDialog;
