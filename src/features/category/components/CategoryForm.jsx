// ✅ src/features/category/components/CategoryForm.jsx
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const CategoryForm = ({ form, mode, onSubmit, onCancel }) => {
  return (
    <Form methods={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>ชื่อหมวดหมู่สินค้า <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input {...field} placeholder="เช่น คอมพิวเตอร์, สำนักงาน ฯลฯ" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex justify-end gap-2">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>ยกเลิก</Button>}
        <Button type="submit">{mode === 'edit' ? 'บันทึกการแก้ไข' : 'บันทึก'}</Button>
      </div>
    </Form>
  );
};

export default CategoryForm;
