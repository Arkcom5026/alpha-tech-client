// ✅ src/features/category/components/CategoryDeleteDialog.jsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const CategoryDeleteDialog = ({ open, category, onCancel, onConfirm }) => {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ยืนยันการลบ</DialogTitle>
          <DialogDescription>
            โปรดตรวจสอบความถูกต้องก่อนยืนยันการลบหมวดหมู่สินค้า
          </DialogDescription>
        </DialogHeader>
        <div>
          คุณต้องการลบหมวดหมู่สินค้า
          <span className="font-semibold"> "{category?.name}" </span> ใช่หรือไม่?
        </div>
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onCancel}>ยกเลิก</Button>
          <Button variant="destructive" onClick={onConfirm}>ยืนยันการลบ</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDeleteDialog;
