import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBranchStore } from "@/features/branch/store/branchStore";
import BranchForm from "@/features/branch/components/BranchForm";

const EditBranchPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getBranchByIdAction, updateBranchAction } = useBranchStore();

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    province: "",
    district: "",
    region: "กลาง",
    latitude: "",
    longitude: "",
    RBACEnabled: false,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const branch = await getBranchByIdAction(Number(id));
      if (branch) {
        setFormData({
          name: branch.name || "",
          address: branch.address || "",
          phone: branch.phone || "",
          province: branch.province || "",
          district: branch.district || "",
          region: branch.region || "กลาง",
          latitude: branch.latitude !== null ? branch.latitude.toString() : "",
          longitude: branch.longitude !== null ? branch.longitude.toString() : "",
          RBACEnabled: branch.RBACEnabled || false,
        });
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateBranchAction(Number(id), {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      });
      navigate("/settings/branches");
    } catch (err) {
      console.error("❌ updateBranch error", err);
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
        allowLocationDetect={true} // ✅ เปิดใช้ปุ่มใช้พิกัดในหน้าแก้ไข
      />
    </div>
  );
};

export default EditBranchPage;
