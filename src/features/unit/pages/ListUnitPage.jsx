// features/unit/pages/ListUnitPage.jsx
import { useEffect, useState } from 'react';
import { fetchUnits, deleteUnit } from '../api/unitApi';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ListUnitPage = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadUnits = async () => {
    try {
      const data = await fetchUnits();
      setUnits(data);
    } catch (err) {
      console.error('loadUnits error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('คุณต้องการลบหน่วยนับนี้หรือไม่?')) return;
    try {
      await deleteUnit(id);
      await loadUnits();
    } catch (err) {
      console.error('handleDelete error:', err);
    }
  };

  useEffect(() => {
    loadUnits();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">รายการหน่วยนับ</h1>
        <Button onClick={() => navigate('/pos/stock/units/create')}>
          ➕ เพิ่มหน่วยนับ
        </Button>
      </div>

      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : (
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">#</th>
              <th className="p-2 border text-left">ชื่อหน่วยนับ</th>
              <th className="p-2 border">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {units.map((unit, index) => (
              <tr key={unit.id} className="border-t">
                <td className="p-2 text-center">{index + 1}</td>
                <td className="p-2">{unit.name}</td>
                <td className="p-2 text-center">
                  <Button
                    variant="outline"
                    className="mr-2"
                    onClick={() => navigate(`/pos/stock/units/edit/${unit.id}`)}
                  >
                    ✏️ แก้ไข
                  </Button>
                  <Button variant="destructive" onClick={() => handleDelete(unit.id)}>
                    🗑️ ลบ
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ListUnitPage;
