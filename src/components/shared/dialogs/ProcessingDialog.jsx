// ✅ src/components/shared/dialogs/ProcessingDialog.jsx
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
  } from '@/components/ui/dialog';
  import { Loader2, CheckCircle2 } from 'lucide-react';
  
  const ProcessingDialog = ({ open, isLoading, message = '', onClose }) => {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle className="flex justify-center items-center gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  <span>กำลังดำเนินการ</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="text-green-500 w-5 h-5" />
                  <span>สำเร็จ</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription>{message}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  };
  
  export default ProcessingDialog;
  