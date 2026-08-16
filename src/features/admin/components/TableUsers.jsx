import React, { useCallback, useEffect, useState } from 'react';
import { ConfirmActionDialog } from '@/design-system/composites';
import { feedback } from '@/design-system/feedback';
import {
  changeUserStatus,
  changeUserRole,
  getListAllCustomer as getListAllUsers,
} from '../api/admin';
import { useAuthStore } from '@/features/auth/store/authStore';

const TableCustomers = () => {
  const token = useAuthStore((state) => state.token);
  const [customers, setCustomers] = useState([]);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingRoleUserId, setSavingRoleUserId] = useState(null);
  const mutating = savingStatus || Boolean(savingRoleUserId);
  const interactionLocked = mutating || Boolean(pendingStatus);

  const handleGetUsers = useCallback(() => {
    getListAllUsers(token)
      .then((res) => {
        setCustomers(res.data);
      })
      .catch((err) => {
        feedback.error(err?.response?.data?.message || 'โหลดรายการผู้ใช้ไม่สำเร็จ');
      });
  }, [token]);

  useEffect(() => {
    handleGetUsers();
  }, [handleGetUsers]);

  const requestChangeUserStatus = (userId, userStatus, email) => {
    if (interactionLocked) return;
    setPendingStatus({ userId, userStatus, email });
  };

  const confirmChangeUserStatus = async () => {
    if (!pendingStatus?.userId || mutating) return;
    const value = {
      id: pendingStatus.userId,
      enabled: !pendingStatus.userStatus,
    };

    setSavingStatus(true);
    try {
      await changeUserStatus(token, value);
      handleGetUsers();
      feedback.actionSuccess(
        pendingStatus.userStatus ? 'ปิดใช้งานผู้ใช้เรียบร้อยแล้ว' : 'เปิดใช้งานผู้ใช้เรียบร้อยแล้ว',
        `admin:user-status:${pendingStatus.userId}:success`,
      );
      setPendingStatus(null);
    } catch (err) {
      feedback.actionError(
        err,
        'อัปเดตสถานะผู้ใช้ไม่สำเร็จ',
        `admin:user-status:${pendingStatus.userId}:error`,
      );
    } finally {
      setSavingStatus(false);
    }
  };

  const handleChangUserRole = async (userId, userRole) => {
    if (interactionLocked) return;
    const value = {
      id: userId,
      Role: userRole,
    };

    setSavingRoleUserId(userId);
    try {
      await changeUserRole(token, value);
      handleGetUsers();
      feedback.actionSuccess(
        'อัปเดตสิทธิ์ผู้ใช้เรียบร้อยแล้ว',
        `admin:user-role:${userId}:success`,
      );
    } catch (err) {
      feedback.actionError(
        err,
        'อัปเดตสิทธิ์ผู้ใช้ไม่สำเร็จ',
        `admin:user-role:${userId}:error`,
      );
    } finally {
      setSavingRoleUserId(null);
    }
  };

  return (
    <>
      <div>
        <div className="container mx-auto bg-white p-4 shadow-md">
          <table className="w-full">
            <thead>
              <tr>
                <th>ลำดับ</th>
                <th>Email</th>
                <th>สิทธิ์</th>
                <th>สถานะ</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {customers?.map((item, index) => (
                <tr key={item.id || index}>
                  <td>{index + 1}</td>
                  <td>{item.email}</td>
                  <td>
                    <select
                      onChange={(e) => handleChangUserRole(item.id, e.target.value)}
                      value={item.role}
                      disabled={interactionLocked}
                      className="rounded border border-slate-300 px-2 py-1 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option>user</option>
                      <option>admin</option>
                    </select>
                  </td>
                  <td>{item.enabled ? 'Active' : 'Inactive'}</td>
                  <td>
                    <button
                      className={item.enabled
                        ? 'rounded-md bg-rose-600 p-1 text-white shadow-md hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60'
                        : 'rounded-md bg-emerald-600 p-1 text-white shadow-md hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60'}
                      disabled={interactionLocked}
                      onClick={() => requestChangeUserStatus(item.id, item.enabled, item.email)}
                    >
                      {item.enabled ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmActionDialog
        open={Boolean(pendingStatus)}
        title={pendingStatus?.userStatus ? 'ปิดใช้งานผู้ใช้' : 'เปิดใช้งานผู้ใช้'}
        description={`ยืนยัน${pendingStatus?.userStatus ? 'ปิด' : 'เปิด'}ใช้งาน ${pendingStatus?.email || 'ผู้ใช้รายนี้'} หรือไม่?`}
        confirmLabel={pendingStatus?.userStatus ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
        intent={pendingStatus?.userStatus ? 'destructive' : 'primary'}
        loading={savingStatus}
        loadingLabel="กำลังบันทึก..."
        onClose={() => {
          if (!mutating) setPendingStatus(null);
        }}
        onConfirm={confirmChangeUserStatus}
      />
    </>
  );
};

export default TableCustomers;