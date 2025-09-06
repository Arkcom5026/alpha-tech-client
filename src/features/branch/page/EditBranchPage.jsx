
// EditBranchPage.jsx (updated for new Address model)

import React, { useEffect, useState } from "react";
import { useAddressStore } from "@/features/address/store/addressStore";
import { useParams, useNavigate } from "react-router-dom";
import { useBranchStore } from "@/features/branch/store/branchStore";
import BranchForm from "@/features/branch/components/BranchForm";
import ProcessingDialog from "@/components/shared/dialogs/ProcessingDialog";

const EditBranchPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getBranchByIdAction, updateBranchAction } = useBranchStore();
  const { ensureProvincesAction } = useAddressStore();

  // ✅ ใช้ฟิลด์ตามมาตรฐานใหม่ของ Address
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    // UI-only for AddressForm control; BE uses only subdistrictCode
    provinceCode: "",
    districtCode: "",
    subdistrictCode: "",
    postalCode: "",
    RBACEnabled: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const numericId = Number(id);
    if (!numericId) {
      setErrorMessage("ไม่พบรหัสสาขาที่ถูกต้อง");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        // Ensure provinces are loaded before setting codes so dropdowns can bind correctly
        await ensureProvincesAction();
        const branch = await getBranchByIdAction(numericId);
        if (branch) {
          setFormData({
            name: branch.name || "",
            address: branch.address || "",
            phone: branch.phone || "",
            provinceCode: (branch.provinceCode != null && branch.provinceCode !== "") ? String(branch.provinceCode) : "",
            districtCode: (branch.districtCode != null && branch.districtCode !== "") ? String(branch.districtCode) : "",
            subdistrictCode: (branch.subdistrictCode != null && branch.subdistrictCode !== "") ? String(branch.subdistrictCode) : "",
            postalCode: (branch.postalCode != null && branch.postalCode !== "") ? String(branch.postalCode) : "",
            RBACEnabled: !!branch.RBACEnabled,
          });
        } else {
          setErrorMessage("ไม่พบข้อมูลสาขา");
        }
      } catch (err) {
        console.error("❌ getBranchByIdAction error", err);
        setErrorMessage("ไม่สามารถโหลดข้อมูลสาขาได้");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, getBranchByIdAction]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
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
        setSaving(false);
        return;
      }


      await updateBranchAction(Number(id), payload);
      navigate("/pos/settings/branches?refresh=1");
    } catch (err) {
      console.error("❌ updateBranch error", err);
      setErrorMessage("บันทึกการเปลี่ยนแปลงไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <BranchForm
        key={`edit-${id}-${formData.provinceCode}-${formData.districtCode}-${formData.subdistrictCode}`}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        submitLabel="บันทึกการเปลี่ยนแปลง"
      />
      <ProcessingDialog open={saving} />
      {errorMessage && (
        <div className="text-red-600 text-sm text-center">{errorMessage}</div>
      )}
    </div>
  );
};

export default EditBranchPage;




