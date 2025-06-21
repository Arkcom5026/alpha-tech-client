import React, { useEffect } from "react";

import { useNavigate } from "react-router-dom";
import { useBranchStore } from "../store/branchStore";

const ListBranchPage = () => {
  const navigate = useNavigate();
  const branches = useBranchStore((state) => state.branches);
  const loadAllBranchesAction = useBranchStore((state) => state.loadAllBranchesAction);

  useEffect(() => {
    loadAllBranchesAction();
  }, [loadAllBranchesAction]);

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">จัดการสาขา</h1>
        <button
          onClick={() => navigate("/pos/settings/branches/create")}                                   
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + เพิ่มสาขา
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-2 border-b">ชื่อสาขา</th>
              <th className="text-left px-4 py-2 border-b">ที่อยู่</th>
              <th className="text-left px-4 py-2 border-b">เบอร์โทร</th>
              <th className="text-center px-4 py-2 border-b">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {branches.map((branch) => (
              <tr key={branch.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap">{branch.name}</td>
                <td className="px-4 py-2 whitespace-pre-line text-sm text-gray-700">{branch.address || '-'}</td>
                <td className="px-4 py-2">{branch.phone || '-'}</td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => navigate(`/pos/settings/branches/edit/${branch.id}`)}
                    className="text-blue-600 hover:underline"
                  >
                    แก้ไข
                  </button>
                </td>
              </tr>
            ))}
            {branches.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-8 text-gray-400">
                  ไม่มีข้อมูลสาขา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListBranchPage;
