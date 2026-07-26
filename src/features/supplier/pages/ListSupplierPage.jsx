// src/features/supplier/pages/ListSupplierPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, Plus } from 'lucide-react';

import {
  Alert,
  Button,
  Card,
  CardBody,
  CrudPage,
  EmptyState,
  LoadingState,
} from '@/design-system';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useBranchStore } from '@/features/branch/store/branchStore';
import SupplierTable from '../components/SupplierTable';
import useSupplierStore from '../store/supplierStore';

const ListSupplierPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { shopSlug } = useParams();
  const token = useAuthStore((state) => state.token);
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const { suppliers, fetchSuppliersAction, deleteSupplierAction } = useSupplierStore();

  const targetSlug = shopSlug || 'advancetech';
  const createSupplierPath = `/${targetSlug}/pos/purchases/suppliers/create`;

  const loadSuppliers = async () => {
    if (!selectedBranchId || !token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await fetchSuppliersAction();
    } catch (err) {
      console.error('❌ โหลดผู้ขายล้มเหลว:', err);
      setError(err?.message || 'ไม่สามารถโหลดบัญชีรายชื่อผู้ขายได้');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSupplier = async (id) => {
    try {
      setError('');
      await deleteSupplierAction(id);
      await fetchSuppliersAction();
    } catch (err) {
      console.error('❌ error ลบผู้ขาย:', err);
      setError(err?.message || 'ไม่สามารถลบข้อมูลผู้ขายได้');
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, [token, selectedBranchId, fetchSuppliersAction]);

  return (
    <CrudPage
      title="บัญชีรายชื่อผู้ขาย"
      description="จัดการบริษัทคู่ค้าและซัพพลายเออร์สำหรับใบสั่งซื้อและใบรับสินค้า"
      actions={
        selectedBranchId ? (
          <Button onClick={() => navigate(createSupplierPath)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            เพิ่มผู้ขาย
          </Button>
        ) : null
      }
      notices={
        !selectedBranchId ? (
          <Alert tone="warning" title="ยังไม่ได้เลือกสาขา">
            กรุณาเลือกสาขาของร้านค้าก่อนเรียกดูบัญชีรายชื่อผู้ขาย
          </Alert>
        ) : error ? (
          <Alert tone="danger" title="เกิดข้อผิดพลาด">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="break-words">{error}</span>
              <Button variant="secondary" size="sm" onClick={loadSuppliers} disabled={loading}>
                ลองใหม่
              </Button>
            </div>
          </Alert>
        ) : null
      }
      maxWidth="full"
      contentClassName="max-w-[1600px]"
    >
      {selectedBranchId && !error ? (
        loading ? (
          <Card>
            <CardBody>
              <LoadingState label="กำลังเรียกตรวจบัญชีทะเบียนคู่ค้าส่วนกลาง…" />
            </CardBody>
          </Card>
        ) : suppliers.length === 0 ? (
          <EmptyState
            icon={<Building2 className="h-7 w-7" aria-hidden="true" />}
            title="ยังไม่มีข้อมูลบัญชีผู้ขายในสาขานี้"
            description="ลงทะเบียนบริษัทคู่ค้าหรือซัพพลายเออร์ เพื่อใช้ผูกข้อมูลในใบสั่งซื้อและใบรับสินค้า"
            actionLabel="ลงทะเบียนผู้ขายรายแรก"
            onAction={() => navigate(createSupplierPath)}
          />
        ) : (
          <Card className="overflow-hidden">
            <SupplierTable suppliers={suppliers} onDelete={handleDeleteSupplier} />
          </Card>
        )
      ) : null}
    </CrudPage>
  );
};

export default ListSupplierPage;
