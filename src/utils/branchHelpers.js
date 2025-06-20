// utils/branchHelpers.js

// ✅ ฟังก์ชันนี้จะประมาณตำแหน่งผู้ใช้ผ่าน IP และหา branch ที่อยู่ใกล้ที่สุด
// ใช้ร่วมกับ Store ที่มี allBranches และ selectedBranchId

import axios from 'axios';
import { useBranchStore } from '@/stores/branchStore';

export const fetchNearestBranchByIP = async () => {
  try {
    // 1. ดึงตำแหน่งจาก IP (ใช้ ip-api.com)
    const ipLocationRes = await axios.get('https://ip-api.com/json/');
    const { city, district, regionName, lat, lon } = ipLocationRes.data;

    // 2. ดึงข้อมูลสาขาทั้งหมดจาก Store (ต้องโหลดไว้ก่อน)
    const branches = useBranchStore.getState().allBranches;
    if (!branches || branches.length === 0) return null;

    // 3. พยายาม match จาก district ก่อน ถ้าไม่ได้ → fallback หาใกล้สุดจาก lat/lon
    const districtMatch = branches.find((b) =>
      b.district?.toLowerCase().includes(city?.toLowerCase())
    );
    if (districtMatch) return districtMatch.id;

    // 4. หากไม่พบ → คำนวณจาก lat/lon ว่าสาขาใดใกล้ที่สุด
    const withDistance = branches
      .filter((b) => b.latitude && b.longitude)
      .map((b) => {
        const dist = getDistanceFromLatLonInKm(lat, lon, b.latitude, b.longitude);
        return { ...b, distance: dist };
      });

    const nearest = withDistance.sort((a, b) => a.distance - b.distance)[0];
    return nearest?.id || null;
  } catch (err) {
    console.error('❌ fetchNearestBranchByIP error:', err);
    return null;
  }
};

// ✅ ฟังก์ชันคำนวณระยะทางระหว่าง 2 พิกัด (Haversine Formula)
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
