import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { feedback } from '@/design-system/feedback';
import { useBranchStore } from '@/features/branch/store/branchStore';
import { useAuthStore } from '@/features/auth/store/authStore.js';
import BranchListWorkspace from '@/features/branch/workspace/BranchListWorkspace';
import {
  filterBranchesForShop,
  isBranchSuperAdmin,
  projectBranchEditDefaults,
} from '@/features/branch/workspace/branchWorkspacePolicy';

const ListBranchPage = () => {
  const { shopSlug } = useParams();
  const role = useAuthStore((state) => state.role);
  const isSuperAdmin = isBranchSuperAdmin(role);

  const rawBranches = useBranchStore((state) => state.branches);
  const loading = useBranchStore((state) => state.isLoading) || false;
  const fetchBranches = useBranchStore((state) => state.fetchBranchesAction);
  const updateBranch = useBranchStore((state) => state.updateBranchAction);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    if (typeof fetchBranches === 'function') {
      fetchBranches();
    }
  }, [fetchBranches]);

  const filteredBranches = useMemo(() => filterBranchesForShop({
    branches: rawBranches || [],
    shopSlug,
    isSuperAdmin,
  }), [rawBranches, shopSlug, isSuperAdmin]);

  const openEditModal = (shopData) => {
    if (saving) return;
    setSelectedShop(shopData);
    const defaults = projectBranchEditDefaults(shopData);
    setValue('name', defaults.name);
    setValue('phone', defaults.phone);
    setValue('address', defaults.address);
    setIsModalOpen(true);
  };

  const onSaveSubmit = async (data) => {
    if (!selectedShop?.id || saving) return;

    setSaving(true);
    try {
      await updateBranch(selectedShop.id, {
        name: data.name,
        phone: data.phone,
        address: data.address,
      });
      feedback.actionSuccess('แก้ไขข้อมูลร้าน/บริษัทเรียบร้อยแล้ว', 'branch-settings-update-success');
      setIsModalOpen(false);
      setSelectedShop(null);
    } catch (error) {
      feedback.actionError(error, 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'branch-settings-update-error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <BranchListWorkspace
      shopSlug={shopSlug}
      isSuperAdmin={isSuperAdmin}
      branches={filteredBranches}
      loading={loading || saving}
      isModalOpen={isModalOpen}
      register={register}
      errors={errors}
      onOpenEdit={openEditModal}
      onRefresh={() => fetchBranches?.()}
      onCloseModal={() => {
        if (!saving) {
          setIsModalOpen(false);
          setSelectedShop(null);
        }
      }}
      onSubmit={handleSubmit(onSaveSubmit)}
    />
  );
};

export default ListBranchPage;
