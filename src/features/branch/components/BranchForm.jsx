import React from "react";

const provinceToRegion = (province) => {
  if (!province) return "กลาง";

  const cleaned = province.replace(/^จังหวัด\s*/i, "").trim();

  if ([
    "กรุงเทพมหานคร", "นนทบุรี", "ปทุมธานี", "สมุทรปราการ", "สมุทรสาคร",
    "พระนครศรีอยุธยา", "สระบุรี", "นครปฐม", "ลพบุรี", "อ่างทอง",
    "ชัยนาท", "สิงห์บุรี"
  ].includes(cleaned)) return "กลาง";

  if ([
    "เชียงใหม่", "เชียงราย", "ลำปาง", "ลำพูน", "น่าน", "พะเยา",
    "แพร่", "แม่ฮ่องสอน", "ตาก", "อุตรดิตถ์"
  ].includes(cleaned)) return "เหนือ";

  if ([
    "นครราชสีมา", "อุบลราชธานี", "ขอนแก่น", "อุดรธานี", "มหาสารคาม",
    "ร้อยเอ็ด", "ศรีสะเกษ", "สุรินทร์", "บุรีรัมย์", "เลย",
    "หนองคาย", "หนองบัวลำภู", "ชัยภูมิ", "สกลนคร", "นครพนม",
    "กาฬสินธุ์", "ยโสธร", "อำนาจเจริญ", "มุกดาหาร", "บึงกาฬ"
  ].includes(cleaned)) return "อีสาน";

  if ([
    "ชลบุรี", "ระยอง", "จันทบุรี", "ตราด", "ปราจีนบุรี",
    "สระแก้ว", "ฉะเชิงเทรา", "นครนายก"
  ].includes(cleaned)) return "ตะวันออก";

  if ([
    "เพชรบุรี", "ประจวบคีรีขันธ์", "ราชบุรี",
    "กาญจนบุรี", "สุพรรณบุรี"
  ].includes(cleaned)) return "ตะวันตก";

  if ([
    "สุราษฎร์ธานี", "สงขลา", "นครศรีธรรมราช", "ยะลา",
    "ปัตตานี", "นราธิวาส", "ตรัง", "พัทลุง", "สตูล",
    "ภูเก็ต", "กระบี่", "พังงา", "ชุมพร"
  ].includes(cleaned)) return "ใต้";

  return "กลาง";
};

const BranchForm = ({ formData, setFormData, onSubmit, isEdit = false, allowLocationDetect = false, submitLabel = "บันทึก" }) => {
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setFormData({
          ...formData,
          latitude: lat.toString(),
          longitude: lng.toString(),
        });

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=th`);
          const data = await res.json();
          const address = data.address || {};

          console.log("🌍 address from nominatim:", address);

          const province =
            (address.province && address.province.replace(/^จังหวัด\s*/, '')) ||
            address.state ||
            formData.province;

          const district =
            address.town ||
            address.village ||
            formData.district;

          console.log("✅ resolved district:", district);
          console.log("✅ resolved province:", province);

          setFormData((prev) => ({
            ...prev,
            province,
            district,
            region: provinceToRegion(province),
          }));
        } catch (err) {
          console.warn("ไม่สามารถดึงจังหวัด/อำเภอจากพิกัดได้", err);
        }
      },
      (error) => {
        console.error("ไม่สามารถดึงตำแหน่งได้", error);
        alert("ไม่สามารถดึงตำแหน่งได้ กรุณาอนุญาตการเข้าถึงตำแหน่ง");
      }
    );
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">ชื่อสาขา</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full border rounded px-3 py-2"
          disabled={isEdit} // ✅ แยกเงื่อนไขโหมด Edit
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">ที่อยู่</label>
        <textarea
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          rows={3}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">เบอร์โทร</label>
        <input
          type="text"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">อำเภอ</label>
          <input
            type="text"
            value={formData.district}
            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">จังหวัด</label>
          <input
            type="text"
            value={formData.province}
            onChange={(e) => setFormData({ ...formData, province: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">ภาค</label>
        <select
          value={formData.region}
          onChange={(e) => setFormData({ ...formData, region: e.target.value })}
          className="w-full border rounded px-3 py-2"
        >
          <option value="กลาง">กลาง</option>
          <option value="เหนือ">เหนือ</option>
          <option value="ใต้">ใต้</option>
          <option value="อีสาน">อีสาน</option>
          <option value="ตะวันออก">ตะวันออก</option>
          <option value="ตะวันตก">ตะวันตก</option>
        </select>
      </div>


      <div className="grid grid-cols-2 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Latitude</label>
          <input
            type="number"
            value={formData.latitude}
            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
            className="w-full border rounded px-3 py-2"
            disabled={!allowLocationDetect}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Longitude</label>
          <input
            type="number"
            value={formData.longitude}
            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
            className="w-full border rounded px-3 py-2"
            disabled={!allowLocationDetect}
          />

          
        </div>
        
        <div className="flex items-center space-x-2 ">
          <input
            type="checkbox"
            id="rbac-toggle"
            checked={formData.RBACEnabled}
            onChange={(e) => setFormData({ ...formData, RBACEnabled: e.target.checked })}
          />
          <label htmlFor="rbac-toggle" className="text-sm">
            เปิดใช้งานระบบ RBAC (สิทธิ์เฉพาะสาขา)
          </label>
        </div>

        {allowLocationDetect && (
          <div className="flex items-end ">
            <button
              type="button"
              onClick={handleDetectLocation}
              className="text-sm text-green-600 px-6 py-2 border border-green-600 rounded hover:bg-green-50 min-w-[100px] "
            >
              📍 ใช้พิกัด
            </button>
          </div>
        )}

      </div>
      <div className="text-right">
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 min-w-[160px]"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default BranchForm;
