
// ✅ src/components/shared/dialogs/ConfirmActionDialog.jsx
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
  } from '@/components/ui/dialog';
  import { Button } from '@/components/ui/button';
  
  const ConfirmActionDialog = ({ open, title, description, onCancel, onConfirm }) => {
    console.log('🧩 ConfirmActionDialog Props:', { open });
  
    return (
      <Dialog open={open} onOpenChange={onCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title || 'ยืนยันการดำเนินการ'}</DialogTitle>
            <DialogDescription>
              {description || 'โปรดตรวจสอบความถูกต้องก่อนดำเนินการนี้'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={onCancel}>ยกเลิก</Button>
            <Button onClick={onConfirm}>ยืนยัน</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  export default ConfirmActionDialog;