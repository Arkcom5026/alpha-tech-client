import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useSupplierStore from '@/features/supplier/store/supplierStore';
// Assuming SupplierPaymentForm and ReceiptSelectionTable are in '../components/'
import SupplierPaymentForm from '../components/SupplierPaymentForm'; // This will be the updated component
import ReceiptSelectionTable from '../components/ReceiptSelectionTable'; // This will be the updated component

// Main page component
export const CreateSupplierPaymentPage = () => {
  const { supplierId } = useParams();
  const { selectedSupplier, fetchSupplierByIdAction } = useSupplierStore();
  const [shouldFetch, setShouldFetch] = useState(false);

  useEffect(() => {
    if (supplierId && shouldFetch) {
      fetchSupplierByIdAction(supplierId);
    }
  }, [supplierId, shouldFetch, fetchSupplierByIdAction]); // Added fetchSupplierByIdAction to dependency array

  const handleLoadSupplier = () => {
    setShouldFetch(true);
  };

  // Loading state: Show button to load supplier data
  if (!selectedSupplier && !shouldFetch) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-sm w-full">
          <p className="mb-6 text-gray-700 text-lg">กรุณากดปุ่มด้านล่างเพื่อโหลดข้อมูล Supplier</p>
          <button
            onClick={handleLoadSupplier}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            โหลดข้อมูล Supplier
          </button>
        </div>
      </div>
    );
  }

  // Loading state: Show loading message while fetching
  if (!selectedSupplier) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-sm w-full">
          <p className="text-gray-700 text-lg">กำลังโหลดข้อมูล Supplier...</p>
        </div>
      </div>
    );
  }

  // Main content display
  return (
    <div className="px-4 py-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-800">
        บันทึกการชำระเงินให้ <span className="text-blue-700">{selectedSupplier.name}</span>
      </h1>

      <div className="flex justify-center"> {/* Adjusted to flex justify-center for horizontal centering */}
        <div className="w-full max-w-4xl bg-white border border-gray-200 shadow-xl rounded-xl p-8"> {/* Adjusted max-w and removed col-span classes */}
          {/* Pass selectedSupplier as a prop to SupplierPaymentForm */}
          <SupplierPaymentForm supplier={selectedSupplier} />
        </div>
      </div>
    </div>
  );
};
