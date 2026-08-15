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

  const rawBranches = useBranchStore((state) => state.branches) || [];
  const loading = useBranchStore((state) => state.isLoading) || false;
  const fetchBranches = useBranchStore((state) => state.fetchBranchesAction);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    if (typeof fetchBranches === 'function') {
      fetchBranches();
    }
  }, [fetchBranches]);

  const filteredBranches = useMemo(() => filterBranchesForShop({
    branches: rawBranches,
    shopSlug,
    isSuperAdmin,
  }), [rawBranches, shopSlug, isSuperAdmin]);

  const openEditModal = (shopData) => {
    setSelectedShop(shopData);
    const defaults = projectBranchEditDefaults(shopData);
    setValue('name', defaults.name);
    setValue('phone', defaults.phone);
    setValue('address', defaults.address);
    setIsModalOpen(true);
  };

  const onSaveSubmit = async (data) => {
    try {
      console.log('💾 Saving Shop Update Payload:', { id: selectedShop?.id, ...data });
      await new Promise((resolve) => setTimeout(resolve, 600));

      if (selectedShop) {
        selectedShop.name = data.name;
        selectedShop.phone = data.phone;
        selectedShop.address = data.address;
      }

      feedback.success('แก้ไขข้อมูลร้าน/บริษัทเรียบร้อยแล้ว');
      setIsModalOpen(false);
    } catch (err) {
      feedback.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  return (
    <BranchListWorkspace
      shopSlug={shopSlug}
      isSuperAdmin={isSuperAdmin}
      branches={filteredBranches}
      loading={loading}
      isModalOpen={isModalOpen}
      register={register}
      errors={errors}
      onOpenEdit={openEditModal}
      onRefresh={() => fetchBranches?.()}
      onCloseModal={() => setIsModalOpen(false)}
      onSubmit={handleSubmit(onSaveSubmit)}
    />
  );
};

export default ListBranchPage;