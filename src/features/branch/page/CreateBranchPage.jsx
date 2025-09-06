// CreateBranchPage.jsx (updated for new Address model)

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBranchStore } from "@/features/branch/store/branchStore";
import BranchForm from "../components/BranchForm";
import ProcessingDialog from "@/components/shared/dialogs/ProcessingDialog";

const CreateBranchPage = () => {
  const navigate = useNavigate();
  const { createBranchAction } = useBranchStore();

  // ✅ ใช้ฟิลด์ตามมาตรฐานใหม่
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    // ใช้สำหรับควบคุม AddressForm ใน UI เท่านั้น (ฝั่ง BE ใช้แค่ subdistrictCode)
    provinceCode: "",
    districtCode: "",
    subdistrictCode: "",
    postalCode: "",
    RBACEnabled: false,
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const payload = {
        name: formData.name?.trim(),
        address: formData.address?.trim(),
        phone: formData.phone?.trim() || null,
        subdistrictCode: formData.subdistrictCode ? String(formData.subdistrictCode) : null,
        RBACEnabled: !!formData.RBACEnabled,
      };

      if (!payload.name || !payload.address || !payload.subdistrictCode) {
        setErrorMessage("กรุณากรอกข้อมูลให้ครบ: ชื่อสาขา, ที่อยู่ และ จังหวัด/อำเภอ/ตำบล");
        return;
      }

      await createBranchAction(payload);
      navigate("/pos/settings/branches?refresh=1");
    } catch (err) {
      console.error("❌ createBranchAction error", err);
      setErrorMessage("ไม่สามารถบันทึกสาขาใหม่ได้ กรุณาลองอีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <BranchForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        submitLabel="บันทึกสาขาใหม่"
        isEdit={false}
      />
      <ProcessingDialog open={loading} />
      {errorMessage && (
        <div className="text-red-600 text-sm text-center">{errorMessage}</div>
      )}
    </div>
  );
};

export default CreateBranchPage;









