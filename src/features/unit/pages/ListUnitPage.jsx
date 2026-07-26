// src/features/unit/pages/ListUnitPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  Button,
  Card,
  ConfirmActionDialog,
  CrudPage,
  EmptyState,
  LoadingState,
} from '@/design-system';
import useUnitStore from '../store/unitStore';

const ListUnitPage = () => {
  const { shopSlug } = useParams();
  const navigate = useNavigate();
  const { units, fetchUnits, deleteUnit, isLoading } = useUnitStore();
  const [confirmId, setConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const selectedUnit = units.find((unit) => unit.id === confirmId);
  const createUnitPath = `/${shopSlug}/pos/stock/units/create`;

  const handleDelete = async () => {
    if (!confirmId || isDeleting) return;

    setIsDeleting(true);
    try {
      await deleteUnit(confirmId);
      setConfirmId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <CrudPage
      title="รายการหน่วยนับ"
      description="จัดการหน่วยนับที่ใช้กับสินค้าในระบบ"
      maxWidth="5xl"
      actions={<Button onClick={() => navigate(createUnitPath)}>เพิ่มหน่วยนับ</Button>}
    >
      <Card className="overflow-hidden">
        {isLoading ? (
          <LoadingState label="กำลังโหลดรายการหน่วยนับ…" />
        ) : units.length === 0 ? (
          <EmptyState
            title="ยังไม่มีหน่วยนับ"
            description="เพิ่มหน่วยนับรายการแรกเพื่อเริ่มใช้งานกับสินค้า"
            actionLabel="เพิ่มหน่วยนับ"
            onAction={() => navigate(createUnitPath)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[hsl(var(--ads-surface-subtle))] text-xs uppercase tracking-wide text-[hsl(var(--ads-text-muted))]">
                <tr>
                  <th className="w-20 px-5 py-3 font-semibold">#</th>
                  <th className="px-5 py-3 font-semibold">ชื่อหน่วยนับ</th>
                  <th className="px-5 py-3 text-right font-semibold">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--ads-border-default))]">
                {units.map((unit, index) => (
                  <tr
                    key={unit.id}
                    className="bg-[hsl(var(--ads-surface-raised))] transition-colors hover:bg-[hsl(var(--ads-surface-subtle))]"
                  >
                    <td className="px-5 py-4 text-[hsl(var(--ads-text-muted))]">{index + 1}</td>
                    <td className="px-5 py-4 font-medium text-[hsl(var(--ads-text-strong))]">
                      {unit.name}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/${shopSlug}/pos/stock/units/edit/${unit.id}`)}
                        >
                          แก้ไข
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => setConfirmId(unit.id)}>
                          ลบ
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmActionDialog
        open={Boolean(confirmId)}
        onClose={() => setConfirmId(null)}
        onConfirm={handleDelete}
        title="ยืนยันการลบหน่วยนับ"
        description={
          selectedUnit
            ? `คุณกำลังจะลบ “${selectedUnit.name}” การดำเนินการนี้ไม่สามารถย้อนกลับได้ โปรดตรวจสอบชื่อหน่วยนับให้ถูกต้องก่อนยืนยัน`
            : 'การดำเนินการนี้ไม่สามารถย้อนกลับได้ โปรดตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยัน'
        }
        confirmLabel="ยืนยันการลบ"
        confirmVariant="danger"
        loading={isDeleting}
        loadingLabel="กำลังลบ…"
      />
    </CrudPage>
  );
};

export default ListUnitPage;
