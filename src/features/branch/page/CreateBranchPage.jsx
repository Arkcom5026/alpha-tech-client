// CreateBranchPage.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBranchStore } from "@/features/branch/store/branchStore";
import BranchForm from "../components/BranchForm";



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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createBranchAction({
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      });
      navigate("/pos/settings/branches");
    } catch (err) {
      console.error("❌ createBranchAction error", err);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <BranchForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        submitLabel="บันทึกสาขาใหม่"
      />
    </div>
  );
};

export default CreateBranchPage;
