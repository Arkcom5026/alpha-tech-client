import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBranchStore } from "@/features/branch/store/branchStore";
import BranchForm from "../components/BranchForm";
import ProcessingDialog from "@/components/shared/dialogs/ProcessingDialog";

const CreateBranchPage = () => {
  const navigate = useNavigate();
  const { createBranchAction } = useBranchStore();

  // ฟิลด์ตาม Address ใหม่ + ประเภทสาขา + ตัวเลือก Preset
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    provinceCode: "",
    districtCode: "",
    subdistrictCode: "",
    postalCode: "",
    businessType: "GENERAL",
    usePresetFeatures: true, // true = ไม่ส่ง features ให้ BE → ใช้ preset อัตโนมัติ
    features: { mode: "STRUCTURED", trackSerialNumber: false, enableTemplates: true },
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
        name: formData.name?.trim() || "",
        address: formData.address?.trim() || "",
        phone: formData.phone?.trim() || null,
        subdistrictCode: formData.subdistrictCode ? String(formData.subdistrictCode) : null,
        RBACEnabled: !!formData.RBACEnabled,
        businessType: (formData.businessType || "GENERAL").toUpperCase(),
      };

      if (!payload.name || !payload.address || !payload.subdistrictCode) {
        setErrorMessage("กรุณากรอกข้อมูลให้ครบ: ชื่อสาขา, ที่อยู่ และ จังหวัด/อำเภอ/ตำบล");
        return;
      }

      if (!formData.usePresetFeatures && formData.features) {
        const f = formData.features;
        payload.features = {
          mode: f.mode === "SIMPLE" ? "SIMPLE" : "STRUCTURED",
          trackSerialNumber: !!f.trackSerialNumber,
          enableTemplates: f.enableTemplates !== false,
        };
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
