import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const AlertDialog = ({ open, name = 'แจ้งเตือน', message, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent aria-describedby="alert-dialog-description">
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
        </DialogHeader>
        <div id="alert-dialog-description" className="py-2">
          {message}
        </div>
        <div className="pt-4 flex justify-end">
          <Button onClick={onClose}>ปิด</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AlertDialog;
