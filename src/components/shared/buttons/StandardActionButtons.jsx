// ✅ src/components/shared/buttons/StandardActionButtons.jsx
import { Button } from '@/components/ui/button';

const StandardActionButtons = ({
  onAdd,
  onEdit,
  onDelete,
  disableEdit = false,
  disableDelete = false,
}) => {
  
  return (
    <div className="flex gap-2">
      {onAdd && (
        <Button onClick={onAdd} variant="default">
          เพิ่ม
        </Button>
      )}
      {onEdit && (
        <Button onClick={onEdit} variant="outline" disabled={disableEdit}>
          แก้ไข
        </Button>
      )}
      {onDelete && (
        <Button
          onClick={onDelete}
          variant="ghost"
          disabled={disableDelete}
          className="text-red-600 hover:bg-red-100"
        >
          ลบ
        </Button>
      )}
    </div>
  );
};

export default StandardActionButtons;