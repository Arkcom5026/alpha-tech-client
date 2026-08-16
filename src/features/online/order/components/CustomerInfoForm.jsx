import React, { useEffect, useRef, useState } from "react";
import { feedback } from "@/design-system";
import useCustomerStore from "@/features/customer/store/customerStore";

const CustomerInfoForm = ({ onSubmit, onChange }) => {
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
  const savingRef = useRef(false);

  useEffect(() => {
    getMyCustomerProfileOnline();
  }, [getMyCustomerProfileOnline]);

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
    if (savingRef.current) return;
    const updated = { ...form, [e.target.name]: e.target.value };
    setForm(updated);
    setHasChanged(true);
    if (typeof onChange === "function") {
      onChange(updated);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === "saving" || savingRef.current || !hasChanged) return;

    const payload = { ...form };
    savingRef.current = true;
    setStatus("saving");
    try {
      await updateCustomerProfileAction(payload, "online");
      setStatus("saved");
      setHasChanged(false);
      feedback.actionSuccess(
        "บันทึกข้อมูลลูกค้าเรียบร้อยแล้ว",
        "online-customer-profile:save:success",
      );
    } catch (err) {
      setStatus("error");
      feedback.actionError(
        err,
        "ไม่สามารถบันทึกข้อมูลลูกค้าได้",
        "online-customer-profile:save:error",
      );
      return;
    } finally {
      savingRef.current = false;
    }

    if (typeof onSubmit === "function") {
      try {
        await Promise.resolve(onSubmit(payload));
      } catch (callbackError) {
        feedback.actionError(
          callbackError,
          "บันทึกข้อมูลลูกค้าสำเร็จแล้ว แต่ขั้นตอนถัดไปไม่สำเร็จ",
          "online-customer-profile:post-save:error",
        );
      }
    }
  };

  const saving = status === "saving" || savingRef.current;

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow p-6 space-y-4">
      <h2 className="text-xl font-semibold text-center">ข้อมูลลูกค้า</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <fieldset disabled={saving} className="space-y-3 disabled:opacity-60">
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
        </fieldset>

        {status === "saved" && (
          <p className="text-green-600 text-sm">✅ บันทึกข้อมูลเรียบร้อยแล้ว</p>
        )}
        {status === "error" && (
          <p className="text-red-600 text-sm">❌ ไม่สามารถบันทึกข้อมูลได้</p>
        )}

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-700 text-white py-2 rounded font-medium disabled:opacity-50"
          disabled={saving || !hasChanged}
        >
          {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
        </button>
      </form>
    </div>
  );
};

export default CustomerInfoForm;
