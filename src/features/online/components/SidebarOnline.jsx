import React, { useState, useEffect } from 'react';
import { useProductOnlineStore } from '../productOnline/store/productOnlineStore';
import { useBranchStore } from '@/features/branch/store/branchStore';
import CascadingFilterGroupOnline from '@/components/shared/form/CascadingFilterGroupOnline';

/**

Fetches the driving distance and duration from the Google Maps Directions API.

@param {object} origin - The starting point { latitude, longitude }.

@param {object} destination - The ending point { latitude, longitude }.

@returns {Promise<object>} A promise that resolves to { distance: number, duration: number }.
*/
const fetchDrivingDistance = async (origin, destination) => {
// --- สิ่งสำคัญ ---
// กรุณาแทนที่ 'YOUR_GOOGLE_MAPS_API_KEY' ด้วย API Key ของคุณ
// คุณสามารถขอรับ API Key ได้จาก Google Cloud Platform

const apiKey = 'AIzaSyBGOsNlFU4Hv1sV-fgsuEuPskS39FwUWYw';

const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${apiKey}`;

// --- โค้ดส่วนนี้คือการเรียกใช้งาน API จริง ---
try {
  const response = await fetch(url);
  if (!response.ok) {
  // หากการเชื่อมต่อล้มเหลว ให้โยน Error
  throw new Error('Network response was not ok');
  }
  const data = await response.json();
  
  if (data.status === 'OK' && data.routes.length > 0) {
    const leg = data.routes[0].legs[0];
    return {
      distance: leg.distance.value / 1000, // แปลงเมตรเป็นกิโลเมตร
      duration: leg.duration.value, // ระยะเวลาเป็นวินาที
    };
  } else {
    // หาก API ตอบกลับมาว่าไม่สามารถหาเส้นทางได้
    throw new Error(data.error_message || 'ไม่สามารถคำนวณเส้นทางได้');
  }
  
  } catch (error) {
  console.error('Error fetching driving distance:', error);
  // ส่งต่อ Error เพื่อให้ Component ที่เรียกใช้จัดการต่อ
  throw error;
  }
  

};

const SidebarOnline = () => {
  const dropdowns = useProductOnlineStore((state) => state.dropdowns);
  const setFilters = useProductOnlineStore((state) => state.setFilters);
  const setSearchText = useProductOnlineStore((state) => state.setSearchText);
  
  const branches = useBranchStore((state) => state.branches);
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const currentBranch = useBranchStore((state) => state.currentBranch);
  
  const [filters, setLocalFilters] = useState({});
  const [searchText, setLocalSearchText] = useState('');
  
  // State สำหรับจัดการการคำนวณระยะทางแบบ Asynchronous
  const [drivingDistance, setDrivingDistance] = useState(null);
  const [isLoadingDistance, setIsLoadingDistance] = useState(false);
  const [distanceError, setDistanceError] = useState(null);
  
  const selectedBranch = React.useMemo(() =>
  branches.find((b) => b.id === selectedBranchId),
  [branches, selectedBranchId]
  );
  
  // useEffect สำหรับดึงข้อมูลระยะทางเมื่อมีการเปลี่ยนสาขา
  useEffect(() => {
  // ตรวจสอบว่ามีข้อมูลพิกัดครบถ้วนหรือไม่
  if (
  currentBranch?.latitude && currentBranch?.longitude &&
  selectedBranch?.latitude && selectedBranch?.longitude
  ) {
  // หากสาขาที่เลือกคือสาขาเดียวกับตำแหน่งปัจจุบัน ระยะทางคือ 0
  if (currentBranch.id === selectedBranch.id) {
  setDrivingDistance(0);
  setIsLoadingDistance(false);
  setDistanceError(null);
  return;
  }
  
    const getDistance = async () => {
      setIsLoadingDistance(true);
      setDistanceError(null);
      setDrivingDistance(null);
  
      try {
        const userLocation = { latitude: currentBranch.latitude, longitude: currentBranch.longitude };
        const branchLocation = { latitude: selectedBranch.latitude, longitude: selectedBranch.longitude };
  
        const result = await fetchDrivingDistance(userLocation, branchLocation);
        setDrivingDistance(result.distance.toFixed(2)); // จัดรูปแบบทศนิยม 2 ตำแหน่ง
      } catch (error) {
        setDistanceError('ไม่สามารถคำนวณระยะทางได้');
        console.error(error);
      } finally {
        setIsLoadingDistance(false);
      }
    };
  
    getDistance();
  } else {
    // รีเซ็ตค่าหากข้อมูลไม่ครบ
    setDrivingDistance(null);
  }
  
  }, [currentBranch, selectedBranch]); // คำนวณใหม่เมื่อตำแหน่งผู้ใช้หรือสาขาที่เลือกเปลี่ยนไป
  
  const handleFilterChange = (newFilters) => {
  setLocalFilters(newFilters);
  setFilters(newFilters);
  };
  
  const handleSearchTextChange = (e) => {
  const text = e.target.value;
  setLocalSearchText(text);
  setSearchText(text);
  };
  
  return (
  <div className="space-y-2 px-2 py-2">
  <div className="bg-green-50 border border-green-300 text-green-800 px-3 py-2 rounded text-sm">
  <div className="font-bold">ดูสินค้าของสาขา</div>
  {selectedBranch?.name || 'กรุณาเลือกสาขา'}
  <div className="mt-2">
  <select
  value={selectedBranchId || ''}
  onChange={(e) => {
  const newId = Number(e.target.value);
  if (!newId) return;
  useBranchStore.setState({ selectedBranchId: newId, version: useBranchStore.getState().version + 1 });
  }}
  className="w-full border border-gray-300 rounded px-2 py-1"
  >
  <option value="">-- เลือกสาขา --</option>
  {branches.map((b) => (
  <option key={b.id} value={b.id}>{b.name}</option>
  ))}
  </select>
  
        {/* UI สำหรับแสดงสถานะการโหลด, ข้อผิดพลาด, และผลลัพธ์ */}
        <div className="text-xs text-gray-500 mt-1 h-4">
          {isLoadingDistance && <span>กำลังคำนวณระยะทาง...</span>}
          {distanceError && <span className="text-red-500">{distanceError}</span>}
          {drivingDistance !== null && !isLoadingDistance && (
            <span>ระยะทางขับรถประมาณ {drivingDistance} กม.</span>
          )}
        </div>
      </div>
    </div>
  
    <input
      type="text"
      value={searchText}
      onChange={handleSearchTextChange}
      placeholder="ค้นหาชื่อสินค้า..."
      className="border px-3 py-2 rounded w-full"
    />
  
    <CascadingFilterGroupOnline
      value={filters}
      onChange={handleFilterChange}
      dropdowns={dropdowns || {}}
      showReset
    />
  </div>
  
  );
  };
  
  export default SidebarOnline;