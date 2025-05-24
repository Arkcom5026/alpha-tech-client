// ✅ src/components/shared/dialogs/InfoDialog.jsx
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
  } from '@/components/ui/dialog';
  import { Button } from '@/components/ui/button';
  
  const InfoDialog = ({ open, title = 'ข้อมูลเพิ่มเติม', description, onClose }) => {
    console.log('ℹ️ InfoDialog Props:', { open });
  
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          <div className="pt-4 flex justify-end">
            <Button onClick={onClose}>ตกลง</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };
  
  export default InfoDialog;