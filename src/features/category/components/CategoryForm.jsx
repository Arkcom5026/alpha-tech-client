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
import { useCallback } from 'react';

// มาตรฐานฟอร์มระบบ (Unified Form Style)
// - ไม่ใช้ alert/confirm
// - ปิดการอินพุต/ปุ่มเมื่อกำลังบันทึก
// - แสดง error ผ่าน FormMessage หรือ banner ด้านบนเมื่อมี serverError
// - sanitize ข้อมูลก่อนส่ง: trim + รวมช่องว่างซ้ำให้เป็นช่องเดียว
// - รองรับ Ctrl/Cmd+Enter เพื่อส่งฟอร์ม

const Required = () => <span className="text-red-500" aria-hidden="true">*</span>;

const CategoryForm = ({
  form,
  mode = 'create',
  onSubmit,
  onCancel,
  submitting = false,
  serverError = '', // error จาก server (ถ้ามี)
}) => {
  const isBusy = submitting || form.formState.isSubmitting;

  // หลีกเลี่ยง regex เพื่อความเข้ากันของ build/replace ในโปรเจกต์
  const sanitize = useCallback((v) => {
    const s = String(v ?? '').trim();
    // รวมช่องว่างซ้ำให้เหลือช่องเดียว
    return s.split(' ').filter(Boolean).join(' ');
  }, []);

  const handleSubmit = useCallback(
    (data) => {
      const payload = { name: sanitize(data?.name) };
      form.setValue('name', payload.name, { shouldValidate: true, shouldDirty: true });
      onSubmit?.(payload);
    },
    [form, onSubmit, sanitize]
  );

  const onKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      form.handleSubmit(handleSubmit)();
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        onKeyDown={onKeyDown}
        className="space-y-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl"
        aria-busy={isBusy}
      >
        {serverError && (
          <div className="p-3 rounded-md border text-sm bg-rose-50 border-rose-200 text-rose-800" role="alert">
            {serverError}
          </div>
        )}

        <FormField
          control={form.control}
          name="name"
          rules={{ required: 'กรุณาระบุชื่อหมวดหมู่' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="category-name">
                ชื่อหมวดหมู่สินค้า <Required />
              </FormLabel>
              <FormControl>
                <Input
                  id="category-name"
                  {...field}
                  onBlur={(e) => field.onChange(sanitize(e.target.value))}
                  placeholder="เช่น คอมพิวเตอร์, สำนักงาน ฯลฯ"
                  required
                  autoComplete="off"
                  autoFocus
                  maxLength={100}
                  aria-invalid={!!form.formState.errors?.name}
                  disabled={isBusy}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isBusy}>
              ยกเลิก
            </Button>
          )}
          <Button type="submit" disabled={isBusy || !(form.watch('name') ?? '').trim()}>
            {isBusy ? 'กำลังบันทึก…' : mode === 'edit' ? 'บันทึกการแก้ไข' : 'บันทึก'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CategoryForm;

