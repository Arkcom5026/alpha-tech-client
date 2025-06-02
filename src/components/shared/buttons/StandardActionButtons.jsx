import { Button } from '@/components/ui/button';
import { PlusCircle, Pencil, Trash2, Printer, XCircle, Save, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const StandardActionButtons = ({
  onAdd,
  onEdit,
  onDelete,
  onPrint,
  onCancel,
  onSave,
  onViewLink,
  onEditLink,
  onPrintLink,
  showCreate = false,
  disableEdit = false,
  disableDelete = false,
  disablePrint = false,
  disableSave = false,
}) => {
  return (
    <div className="flex gap-2 flex-wrap">
      {(onAdd || showCreate) && (
        <Button
          onClick={onAdd}
          variant="default"
          className="bg-zinc-800 text-white hover:bg-zinc-900 border border-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-800"
        >
          <PlusCircle className="w-4 h-4 mr-2" /> เพิ่ม
        </Button>
      )}

      {onViewLink && (
        <Link to={onViewLink}>
          <Button variant="outline" className="bg-zinc-100 text-zinc-800 border border-zinc-300 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-600 dark:hover:bg-zinc-700">
            <Eye className="w-4 h-4 mr-2" /> ดู
          </Button>
        </Link>
      )}

      {onEdit && (
        <Button
          onClick={onEdit}
          variant="outline"
          disabled={disableEdit}
          className="bg-zinc-100 text-zinc-800 border border-zinc-400 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-600 dark:hover:bg-zinc-700"
        >
          <Pencil className="w-4 h-4 mr-2" /> แก้ไข
        </Button>
      )}

      {onEditLink && (
        <Link to={onEditLink}>
          <Button variant="outline" className="bg-zinc-100 text-zinc-800 border border-zinc-400 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-600 dark:hover:bg-zinc-700">
            <Pencil className="w-4 h-4 mr-2" /> แก้ไข
          </Button>
        </Link>
      )}

      {onDelete && (
        <Button
          onClick={onDelete}
          variant="outline"
          disabled={disableDelete}
          className="bg-zinc-100 text-red-700 border border-red-300 hover:bg-red-100 dark:bg-zinc-800 dark:text-red-400 dark:border-red-600 dark:hover:bg-zinc-700"
        >
          <Trash2 className="w-4 h-4 mr-2" /> ลบ
        </Button>
      )}

      {onPrint && (
        <Button
          onClick={onPrint}
          variant="outline"
          disabled={disablePrint}
          className="bg-zinc-100 text-zinc-800 border border-zinc-300 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-600 dark:hover:bg-zinc-700"
        >
          <Printer className="w-4 h-4 mr-2" /> พิมพ์
        </Button>
      )}

      {onPrintLink && (
        <Link to={onPrintLink} target="_blank">
          <Button variant="outline" className="bg-zinc-100 text-zinc-800 border border-zinc-300 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-600 dark:hover:bg-zinc-700">
            <Printer className="w-4 h-4 mr-2" /> พิมพ์
          </Button>
        </Link>
      )}

      {onSave && (
        <Button
          onClick={onSave}
          variant="default"
          disabled={disableSave}
          className="bg-zinc-900 text-white hover:bg-zinc-800 border border-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-700"
        >
          <Save className="w-4 h-4 mr-2" /> บันทึก
        </Button>
      )}

      {onCancel && (
        <Button
          onClick={onCancel}
          variant="outline"
          className="bg-zinc-100 text-zinc-800 border border-zinc-300 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-600 dark:hover:bg-zinc-700"
        >
          <XCircle className="w-4 h-4 mr-2" /> ยกเลิก
        </Button>
      )}
    </div>
  );
};

export default StandardActionButtons;
