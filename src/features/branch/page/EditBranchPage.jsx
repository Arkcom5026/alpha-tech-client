// EditBranchPage.jsx (updated for new Address model)

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBranchStore } from "@/features/branch/store/branchStore";
import BranchForm from "@/features/branch/components/BranchForm";
import ProcessingDialog from "@/components/shared/dialogs/ProcessingDialog";

const EditBranchPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getBranchByIdAction, updateBranchAction } = useBranchStore();

  // ✅ ใช้ฟิลด์ตามมาตรฐานใหม่ของ Address
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
        const branch = await getBranchByIdAction(numericId);
        if (branch) {
          setFormData({
            name: branch.name || "",
            address: branch.address || "",
            phone: branch.phone || "",
            // ถ้ามี provinceCode/districtCode จาก BE จะถูกตั้งค่า; ถ้าไม่มีให้เป็นค่าว่าง (ผู้ใช้เลือกใหม่ได้)
            provinceCode: branch.provinceCode || "",
            districtCode: branch.districtCode || "",
            subdistrictCode: branch.subdistrictCode || "",
            postalCode: branch.postalCode || "",
            region: branch.region || "",
            latitude: branch.latitude !== null && branch.latitude !== undefined ? String(branch.latitude) : "",
            longitude: branch.longitude !== null && branch.longitude !== undefined ? String(branch.longitude) : "",
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

  // ปัดทศนิยม lat/lng เป็นเลข 6 ตำแหน่งก่อนส่ง (invalid -> null)
  const fix6 = (x) => (x === '' || x == null ? null : (Number.isFinite(Number(x)) ? Number(Number(x).toFixed(6)) : null));

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
        postalCode: formData.postalCode ? String(formData.postalCode) : null,
        latitude: fix6(formData.latitude),
        longitude: fix6(formData.longitude),
        RBACEnabled: !!formData.RBACEnabled,
        // ถ้า BE ต้องการเก็บ code ระดับบนเพิ่ม สามารถส่งไปด้วยได้:
        // provinceCode: formData.provinceCode || null,
        // districtCode: formData.districtCode || null,
      };

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
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        submitLabel="บันทึกการเปลี่ยนแปลง"
        isEdit={true}
        allowLocationDetect={true}
      />
      <ProcessingDialog open={saving} />
      {errorMessage && (
        <div className="text-red-600 text-sm text-center">{errorMessage}</div>
      )}
    </div>
  );
};

export default EditBranchPage;

