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

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    provinceCode: "",
    districtCode: "",
    subdistrictCode: "",
    postalCode: "",
    businessType: "GENERAL",
    usePresetFeatures: true,
    features: { mode: "STRUCTURED", trackSerialNumber: false, enableTemplates: true },
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

    (async () => {
      try {
        await ensureProvincesAction();
        const branch = await getBranchByIdAction(numericId);
        if (!branch) {
          setErrorMessage("ไม่พบข้อมูลสาขา");
          return;
        }
        setFormData({
          name: branch.name || "",
          address: branch.address || "",
          phone: branch.phone || "",
          provinceCode: branch.provinceCode ? String(branch.provinceCode) : "",
          districtCode: branch.districtCode ? String(branch.districtCode) : "",
          subdistrictCode: branch.subdistrictCode ? String(branch.subdistrictCode) : "",
          postalCode: branch.postalCode ? String(branch.postalCode) : "",
          businessType: (branch.businessType || "GENERAL").toUpperCase(),
          usePresetFeatures: branch.features ? false : true,
          features: branch.features ? {
            mode: branch.features.mode === "SIMPLE" ? "SIMPLE" : "STRUCTURED",
            trackSerialNumber: !!branch.features.trackSerialNumber,
            enableTemplates: branch.features.enableTemplates !== false,
          } : { mode: "STRUCTURED", trackSerialNumber: false, enableTemplates: true },
          RBACEnabled: !!branch.RBACEnabled,
        });
      } catch (err) {
        console.error("❌ getBranchByIdAction error", err);
        setErrorMessage("ไม่สามารถโหลดข้อมูลสาขาได้");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, getBranchByIdAction]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
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
        setSaving(false);
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
        key={`edit-${id}-${formData.provinceCode}-${formData.districtCode}-${formData.subdistrictCode}-${formData.businessType}`}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        submitLabel="บันทึกการเปลี่ยนแปลง"
        isEdit
      />
      <ProcessingDialog open={saving} />
      {errorMessage && (
        <div className="text-red-600 text-sm text-center">{errorMessage}</div>
      )}
    </div>
  );
};

export default EditBranchPage;


