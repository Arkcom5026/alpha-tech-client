import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/features/auth/store/authStore";
import apiClient from "@/utils/apiClient";

const CustomerInfoForm = ({ onSubmit }) => {
  const profile = useAuthStore((state) => state.profile);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    district: "",
    province: "",
    postalCode: "",
  });

  const [status, setStatus] = useState("idle"); // idle | saving | saved | error

  useEffect(() => {
    const loadCustomer = async () => {
      try {
        const res = await apiClient.get("/customers/me");
        const data = res.data;
        setForm({
          name: data.name || "",
          phone: data.phone || "",
          address: data.address || "",
          district: data.district || "",
          province: data.province || "",
          postalCode: data.postalCode || "",
        });
      } catch (err) {
        console.error("❌ load customer profile failed:", err);
      }
    };

    loadCustomer();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("saving");
    try {
      const res = await apiClient.patch("/customers/me", form);
      if (onSubmit) onSubmit(form);
      setStatus("saved");
    } catch (err) {
      console.error("❌ update customer failed:", err);
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
          className="w-full bg-blue-500 hover:bg-blue-700 text-white py-2 rounded font-medium"
          disabled={status === "saving"}
        >
          {status === "saving" ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
        </button>
      </form>
    </div>
  );
};

export default CustomerInfoForm;
