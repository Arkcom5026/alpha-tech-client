import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { feedback } from '@/design-system/feedback';
import { useBranchStore } from '@/features/branch/store/branchStore';
import { useAuthStore } from '@/features/auth/store/authStore.js';
import BranchListWorkspace from '@/features/branch/workspace/BranchListWorkspace';
import {
  buildDocumentHeaderConfigFromForm,
  projectDocumentHeaderFormDefaults,
} from '@/features/branch/documentHeader/documentHeaderConfig';
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
  const savingRef = useRef(false);
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
    if (saving || savingRef.current) return;
    setSelectedShop(shopData);

    const defaults = {
      ...projectBranchEditDefaults(shopData),
      ...projectDocumentHeaderFormDefaults(shopData),
    };
    Object.entries(defaults).forEach(([key, value]) => setValue(key, value));
    setIsModalOpen(true);
  };

  const onSaveSubmit = async (data) => {
    const branchId = Number(selectedShop?.id || 0);
    if (!branchId || saving || savingRef.current) return;

    const payload = {
      name: data.name,
      phone: data.phone,
      address: data.address,
      documentHeaderConfig: buildDocumentHeaderConfigFromForm(data, selectedShop?.documentHeaderConfig),
    };

    savingRef.current = true;
    setSaving(true);
    try {
      await updateBranch(branchId, payload);
      feedback.actionSuccess('บันทึกข้อมูลร้านและรูปแบบหัวเอกสารเรียบร้อยแล้ว', 'branch-settings-update-success');
      setIsModalOpen(false);
      setSelectedShop(null);
    } catch (error) {
      feedback.actionError(error, 'เกิดข้อผิดพลาดในการบันทึกข้อมูลร้านหรือรูปแบบหัวเอกสาร', 'branch-settings-update-error');
    } finally {
      savingRef.current = false;
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
        if (!saving && !savingRef.current) {
          setIsModalOpen(false);
          setSelectedShop(null);
        }
      }}
      onSubmit={handleSubmit(onSaveSubmit)}
    />
  );
};

export default ListBranchPage;
