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
import React, { useEffect, useRef } from 'react';

const ConfirmActionDialog = ({ open, name, description, onCancel, onConfirm }) => {
  // log เฉพาะตอนค่า open เปลี่ยนจริง ๆ
  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current !== open) {
      console.debug('🧩 ConfirmActionDialog open changed:', { open });
      prevOpen.current = open;
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{name || 'ยืนยันการดำเนินการ'}</DialogTitle>
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

export default React.memo(ConfirmActionDialog);
