// ✅ src/features/productType/components/ProductTypeDeleteDialog.jsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const ProductTypeDeleteDialog = ({ open, productType, onCancel, onConfirm }) => {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ยืนยันการลบ</DialogTitle>
          <DialogDescription>
            โปรดตรวจสอบความถูกต้องก่อนยืนยันการลบประเภทสินค้า
          </DialogDescription>
        </DialogHeader>
        <div>
          คุณต้องการลบประเภทสินค้า
          <span className="font-semibold"> "{productType?.name}" </span> ใช่หรือไม่?
        </div>
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onCancel}>ยกเลิก</Button>
          <Button variant="destructive" onClick={onConfirm}>ยืนยันการลบ</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductTypeDeleteDialog;
