import React, { useEffect, useState } from 'react';
import { ConfirmActionDialog } from '@/design-system/composites';
import { FieldMessage, feedback } from '@/design-system/feedback';
import { createBank, removeBank } from '../api/bank';
import useBankStore from '@/store/bankStore';
import { useAuthStore } from '@/features/auth/store/authStore';

const FormBank = () => {
  const token = useAuthStore((state) => state.token);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const banks = useBankStore((state) => state.banks);
  const fetchBanks = useBankStore((state) => state.fetchBanks);

  useEffect(() => {
    fetchBanks(token);
  }, [fetchBanks, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('กรุณาระบุชื่อธนาคาร');
      return;
    }
    setNameError('');

    try {
      const res = await createBank(token, { name: name.trim() });
      feedback.success(`เพิ่มธนาคาร ${res.data.name} แล้ว`);
      setName('');
      fetchBanks(token);
    } catch (err) {
      console.log(err);
      feedback.error(err?.response?.data?.message || 'เพิ่มธนาคารไม่สำเร็จ');
    }
  };

  const confirmRemove = async () => {
    if (!pendingDelete?.id) return;
    setDeleting(true);
    try {
      const res = await removeBank(token, pendingDelete.id);
      feedback.success(`ลบ ${res.data.name || pendingDelete.name} แล้ว`);
      setPendingDelete(null);
      fetchBanks(token);
    } catch (err) {
      console.log(err);
      feedback.error(err?.response?.data?.message || 'ลบธนาคารไม่สำเร็จ');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="container mx-auto bg-white p-4 shadow-md">
        <h1>Bank Management</h1>
        <form className="my-4" onSubmit={handleSubmit}>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError('');
            }}
            className="mr-5 rounded border border-slate-300 px-2 py-1 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            type="text"
            aria-invalid={Boolean(nameError)}
            aria-describedby={nameError ? 'admin-bank-name-error' : undefined}
          />
          <button className="rounded bg-emerald-600 px-3 py-1 text-white hover:bg-emerald-700">Add Bank</button>
          <FieldMessage id="admin-bank-name-error">{nameError}</FieldMessage>
        </form>

        <hr />

        <ul className="list-none">
          {banks.map((item) => (
            <li className="my-2 flex justify-between" key={item.id}>
              <span>{item.name}</span>
              <button
                type="button"
                className="rounded bg-red-500 px-2 py-1 text-white hover:bg-red-600"
                onClick={() => setPendingDelete(item)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      <ConfirmActionDialog
        open={Boolean(pendingDelete)}
        title="ลบธนาคาร"
        description={`ยืนยันลบ ${pendingDelete?.name || 'ธนาคารนี้'} หรือไม่?`}
        confirmLabel="ลบธนาคาร"
        intent="destructive"
        loading={deleting}
        loadingLabel="กำลังลบ..."
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmRemove}
      />
    </>
  );
};

export default FormBank;