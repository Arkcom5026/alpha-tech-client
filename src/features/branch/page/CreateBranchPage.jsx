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
    provinceCode: "",
    districtCode: "",
    subdistrictCode: "",
    postalCode: "",
    region: "",
    latitude: "",
    longitude: "",
    RBACEnabled: false,
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ปัดทศนิยม lat/lng เป็นเลข 6 ตำแหน่งก่อนส่ง (invalid -> null)
  const fix6 = (x) => (x === '' || x == null ? null : (Number.isFinite(Number(x)) ? Number(Number(x).toFixed(6)) : null));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      // ✅ Map payload ให้สอดคล้องกับ BE รุ่นใหม่ (ใช้ subdistrictCode + postalCode)
      const payload = {
        name: formData.name?.trim(),
        address: formData.address?.trim(),
        phone: formData.phone?.trim() || null,
        subdistrictCode: formData.subdistrictCode ? String(formData.subdistrictCode) : null,
        postalCode: formData.postalCode ? String(formData.postalCode) : null,
        latitude: fix6(formData.latitude),
        longitude: fix6(formData.longitude),
        RBACEnabled: !!formData.RBACEnabled,
        // หมายเหตุ: provinceCode/districtCode ใช้ภายใน UI สำหรับคำนวณและเลือก ADM
        // ถ้า BE ต้องการเก็บเพิ่ม สามารถส่งไปด้วยได้ โดยเพิ่มสองบรรทัดด้านล่าง:
        // provinceCode: formData.provinceCode || null,
        // districtCode: formData.districtCode || null,
      };

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
        allowLocationDetect={true} // ✅ แสดงปุ่มใช้พิกัด
        submitLabel="บันทึกสาขาใหม่"
      />
      <ProcessingDialog open={loading} />
      {errorMessage && (
        <div className="text-red-600 text-sm text-center">{errorMessage}</div>
      )}
    </div>
  );
};

export default CreateBranchPage;







