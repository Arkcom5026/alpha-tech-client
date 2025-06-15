
// ✅ แก้ไข SupplierForm: เพิ่ม field จาก model Supplier ให้ครบถ้วน
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { getAllBanks } from '@/features/bank/api/bankApi';

const SupplierForm = ({ defaultValues = {}, onSubmit, isEdit = false, showCreditFields = false }) => {
  const [banks, setBanks] = useState([]);
  const [internalDefaults, setInternalDefaults] = useState(defaultValues || null);
  const [formSynced, setFormSynced] = useState(false);
    const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: {} });

  useEffect(() => {
    if (internalDefaults && Object.keys(internalDefaults).length > 0 && banks.length > 0 && !formSynced) {
      console.log('✅ reset with:', internalDefaults);
      reset({ ...internalDefaults });
      setFormSynced(true);
    }
  }, [internalDefaults, banks, reset, formSynced]);



  useEffect(() => {
    const loadBanks = async () => {
      try {
        const data = await getAllBanks();

        setBanks(data);
        setInternalDefaults(defaultValues || null);
        setFormSynced(false);
      } catch (err) {
        console.error('โหลดธนาคารล้มเหลว', err);
      }
    };
    loadBanks();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อผู้ขาย <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('name', { required: 'กรุณาระบุชื่อผู้ขาย' })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ติดต่อ</label>
            <input
              type="text"
              {...register('contactPerson')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              เบอร์โทร <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('phone', { required: 'กรุณาระบุเบอร์โทร' })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
            />
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              {...register('email')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">เลขผู้เสียภาษี</label>
            <input
              type="text"
              placeholder="เช่น 0123456789123"
              {...register('taxId')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">จังหวัด</label>
            <input
              type="text"
              {...register('province')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสไปรษณีย์</label>
            <input
              type="text"
              {...register('postalCode')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ประเทศ</label>
            <input
              type="text"
              {...register('country')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
            />
          </div>

          {/* ✅ เพิ่ม dropdown เลือกธนาคาร */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ธนาคาร</label>
            <select
              {...register('bankId')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring focus:ring-blue-200"
            >
              <option value="">-- เลือกธนาคาร --</option>
              {banks.map((bank) => (
                <option key={bank.id} value={bank.id.toString()}>
                  {bank.name}
                </option>
              ))}
            </select>
          </div>

          

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">เลขที่บัญชี</label>
            <input
              type="text"
              {...register('accountNumber')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทบัญชี</label>
            <input
              type="text"
              {...register('accountType')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
            />
          </div>

          {showCreditFields && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">วงเงินเครดิตสูงสุด (บาท)</label>
                <input
                  type="number"
                  {...register('creditLimit', { valueAsNumber: true, min: 0 })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ยอดหนี้ปัจจุบัน (บาท)</label>
                <input
                  type="number"
                  disabled
                  {...register('creditBalance')}
                  className="w-full border border-gray-300 bg-gray-100 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ระยะเวลาผ่อนชำระ (วัน)</label>
                <input
                  type="number"
                  {...register('paymentTerms', { valueAsNumber: true, min: 0 })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
                <textarea
                  rows={3}
                  {...register('notes')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                ></textarea>
              </div>
            </>
          )}

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่</label>
            <textarea
              {...register('address')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
            />
          </div>
        </div>

        <Button type="submit" className="w-full mt-6">
          {isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มผู้ขาย'}
        </Button>
      </form>
    </div>
  );
};

export default SupplierForm;

  



