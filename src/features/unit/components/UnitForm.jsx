  // features/unit/components/UnitForm.jsx
  import { useForm } from 'react-hook-form';
  import { zodResolver } from '@hookform/resolvers/zod';
  import * as z from 'zod';
  import { Input } from '@/components/ui/input';
  import { Button } from '@/components/ui/button';
  
  const unitSchema = z.object({
    name: z.string().min(1, 'กรุณากรอกชื่อหน่วยนับ'),
  });
  
  const UnitForm = ({ defaultValues = { name: '' }, onSubmit, isSubmitting }) => {
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm({
      resolver: zodResolver(unitSchema),
      defaultValues,
    });
  
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">ชื่อหน่วยนับ</label>
          <Input {...register('name')} placeholder="เช่น ชิ้น, กล่อง, ตัว" />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>
  
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'กำลังบันทึก...' : '💾 บันทึก'}
        </Button>
      </form>
    );
  };
  
  export default UnitForm;
  