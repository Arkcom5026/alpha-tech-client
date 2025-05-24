// ✅ src/components/shared/ConfirmDeleteDialog.jsx
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
  } from '@/components/ui/dialog';
  import { Button } from '@/components/ui/button';
  
  const ConfirmDeleteDialog = ({ open, itemLabel, title, description, onCancel, onConfirm }) => {
    console.log('🧩 ConfirmDeleteDialog Props:', { open, itemLabel });
  
    return (
      <Dialog open={open} onOpenChange={onCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title || 'ยืนยันการลบ'}</DialogTitle>
            <DialogDescription>
              {description || 'โปรดตรวจสอบความถูกต้องก่อนยืนยันการลบข้อมูล'}
            </DialogDescription>
          </DialogHeader>
          <div>
            คุณต้องการลบ <span className="font-semibold">"{itemLabel}"</span> ใช่หรือไม่?
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={onCancel}>ยกเลิก</Button>
            <Button variant="destructive" onClick={onConfirm}>ยืนยันการลบ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  export default ConfirmDeleteDialog;
  