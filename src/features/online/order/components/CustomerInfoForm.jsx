import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/features/auth/store/authStore";
import useCustomerStore from "@/features/customer/store/customerStore";

const CustomerInfoForm = ({ onSubmit }) => {
  const profile = useAuthStore((state) => state.profile);
  const customer = useCustomerStore((state) => state.customer);
  const getMyCustomerProfileOnline = useCustomerStore((state) => state.getMyCustomerProfileOnline);
  const updateCustomerProfileAction = useCustomerStore((state) => state.updateCustomerProfileAction);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    district: "",
    province: "",
    postalCode: "",
  });

  const [status, setStatus] = useState("idle");
  const [hasChanged, setHasChanged] = useState(false);

  // โหลดโปรไฟล์เมื่อตอน mount
  useEffect(() => {
    getMyCustomerProfileOnline();
  }, []);

  // อัปเดต form เมื่อ customer store มีข้อมูลใหม่
  useEffect(() => {
    if (customer) {
      const initialForm = {
        name: customer.name || "",
        phone: customer.phone || "",
        address: customer.address || "",
        district: customer.district || "",
        province: customer.province || "",
        postalCode: customer.postalCode || "",
      };
      setForm(initialForm);
      setHasChanged(false);
    }
  }, [customer]);

  const handleChange = (e) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    setForm(updated);
    setHasChanged(true);
    if (typeof onChange === 'function') {
      onChange(updated);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("saving");
    try {
      await updateCustomerProfileAction(form, "online");
      if (onSubmit) onSubmit(form);
      setStatus("saved");
      setHasChanged(false);
    } catch (err) {
      console.error("❌ update customer failed via store:", err);
      setStatus("error");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow p-6 space-y-4">
      <h2 className="text-xl font-semibold text-center">ข้อมูลลูกค้า</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="name"
          placeholder="ชื่อ-นามสกุล"
          value={form.name}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <input
          type="text"
          name="phone"
          placeholder="เบอร์โทรศัพท์"
          value={form.phone}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <textarea
          name="address"
          placeholder="ที่อยู่จัดส่ง"
          value={form.address}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          rows={3}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            name="district"
            placeholder="อำเภอ"
            value={form.district}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />

          <input
            type="text"
            name="province"
            placeholder="จังหวัด"
            value={form.province}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <input
          type="text"
          name="postalCode"
          placeholder="รหัสไปรษณีย์"
          value={form.postalCode}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />

        {status === "saved" && (
          <p className="text-green-600 text-sm">✅ บันทึกข้อมูลเรียบร้อยแล้ว</p>
        )}
        {status === "error" && (
          <p className="text-red-600 text-sm">❌ ไม่สามารถบันทึกข้อมูลได้</p>
        )}

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-700 text-white py-2 rounded font-medium disabled:opacity-50"
          disabled={status === "saving" || !hasChanged}
        >
          {status === "saving" ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
        </button>
      </form>
    </div>
  );
};

export default CustomerInfoForm;


