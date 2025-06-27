// CreateBranchPage.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBranchStore } from "@/features/branch/store/branchStore";
import BranchForm from "../components/BranchForm";
import ProcessingDialog from "@/components/shared/dialogs/ProcessingDialog";

const CreateBranchPage = () => {
  const navigate = useNavigate();
  const { createBranchAction } = useBranchStore();

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

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      await createBranchAction({
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      });
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
