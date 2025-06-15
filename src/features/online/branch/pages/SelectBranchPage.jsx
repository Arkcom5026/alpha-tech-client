import { useEffect, useState } from "react";
import BranchSelector from "../../branch/components/BranchSelector";
import { useNavigate } from "react-router-dom";

const SelectBranchPage = () => {
  const [branches, setBranches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ เรียก API ดึงรายชื่อสาขา
    const fetchBranches = async () => {
      try {
        const res = await fetch("/api/branches");
        const data = await res.json();
        setBranches(data);
      } catch (err) {
        console.error("ไม่สามารถโหลดรายชื่อสาขาได้", err);
      }
    };
    fetchBranches();
  }, []);

  const handleNext = () => {
    navigate("/online/products"); // ✅ ไปยังหน้าเลือกสินค้า
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <h1 className="text-xl font-semibold mb-6">เลือกสาขาก่อนเริ่มสั่งซื้อสินค้า</h1>

      <BranchSelector branches={branches} />

      <button
        onClick={handleNext}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
      >
        ดำเนินการต่อ
      </button>
    </div>
  );
};

export default SelectBranchPage;
