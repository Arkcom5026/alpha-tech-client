import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { feedback } from '@/design-system/feedback';
import { registerSchema } from '@/features/auth/schema/registerSchema';
import { registerUser } from '@/features/auth/api/authApi';

const RegisterPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      const { name, phone, email, password } = data;
      await registerUser({ name, phone, email, password, role: 'customer' });
      reset();
      feedback.actionSuccess('สมัครสำเร็จแล้ว', 'auth-customer-register-success');
      navigate('/partner-portal', { replace: true });
    } catch (error) {
      feedback.actionError(error, 'สมัครบัญชีไม่สำเร็จ กรุณาลองใหม่อีกครั้ง', 'auth-customer-register-error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4 text-center">ลงทะเบียน</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            type="text"
            placeholder="ชื่อของคุณ"
            className="w-full border px-3 py-2 rounded"
            {...register('name')}
          />

          <input
            type="tel"
            placeholder="เบอร์โทรศัพท์ (ไม่บังคับ)"
            className="w-full border px-3 py-2 rounded"
            {...register('phone')}
          />
          <input
            type="email"
            placeholder="อีเมลของคุณ"
            className="w-full border px-3 py-2 rounded"
            {...register('email')}
          />

          <input
            type="password"
            placeholder="รหัสผ่าน"
            className="w-full border px-3 py-2 rounded"
            {...register('password')}
          />

          <input
            type="password"
            placeholder="ยืนยันรหัสผ่าน"
            className="w-full border px-3 py-2 rounded"
            {...register('confirmPassword')}
          />

          {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
          {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
          {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
          {errors.confirmPassword && <p className="text-red-600 text-sm">{errors.confirmPassword.message}</p>}
          {errors.phone && <p className="text-red-600 text-sm">{errors.phone.message}</p>}

          <button
            type="submit"
            className="w-full rounded bg-emerald-600 py-2 text-white hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
