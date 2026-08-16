import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  const mutationRef = useRef(false);
  const mutating = savingStatus || Boolean(savingRoleUserId);
  const interactionLocked = mutating || Boolean(pendingStatus);

  const handleGetUsers = useCallback(() => {
    return getListAllUsers(token)
      .then((res) => {
        setCustomers(res.data);
        return { ok: true };
      })
      .catch((err) => {
        feedback.error(err?.response?.data?.message || 'โหลดรายการผู้ใช้ไม่สำเร็จ');
        return { ok: false, error: err };
      });
  }, [token]);

  useEffect(() => {
    handleGetUsers();
  }, [handleGetUsers]);

  const requestChangeUserStatus = (userId, userStatus, email) => {
    if (interactionLocked || mutationRef.current) return;
    setPendingStatus({ userId, userStatus, email });
  };

  const confirmChangeUserStatus = async () => {
    if (!pendingStatus?.userId || mutating || mutationRef.current) return;

    const pendingSnapshot = { ...pendingStatus };
    const tokenSnapshot = token;
    const value = {
      id: pendingSnapshot.userId,
      enabled: !pendingSnapshot.userStatus,
    };

    mutationRef.current = true;
    setSavingStatus(true);
    try {
      await changeUserStatus(tokenSnapshot, value);
      feedback.actionSuccess(
        pendingSnapshot.userStatus ? 'ปิดใช้งานผู้ใช้เรียบร้อยแล้ว' : 'เปิดใช้งานผู้ใช้เรียบร้อยแล้ว',
        `admin:user-status:${pendingSnapshot.userId}:success`,
      );
      setPendingStatus(null);

      const refreshResult = await handleGetUsers();
      if (!refreshResult?.ok) {
        feedback.actionError(
          refreshResult?.error,
          'อัปเดตสถานะสำเร็จแล้ว แต่รีเฟรชรายการผู้ใช้ไม่สำเร็จ',
          `admin:user-status:${pendingSnapshot.userId}:refresh:error`,
        );
      }
    } catch (err) {
      feedback.actionError(
        err,
        'อัปเดตสถานะผู้ใช้ไม่สำเร็จ',
        `admin:user-status:${pendingSnapshot.userId}:error`,
      );
    } finally {
      mutationRef.current = false;
      setSavingStatus(false);
    }
  };

  const handleChangUserRole = async (userId, userRole) => {
    if (interactionLocked || mutationRef.current) return;

    const userIdSnapshot = userId;
    const userRoleSnapshot = userRole;
    const tokenSnapshot = token;
    const value = {
      id: userIdSnapshot,
      Role: userRoleSnapshot,
    };

    mutationRef.current = true;
    setSavingRoleUserId(userIdSnapshot);
    try {
      await changeUserRole(tokenSnapshot, value);
      feedback.actionSuccess(
        'อัปเดตสิทธิ์ผู้ใช้เรียบร้อยแล้ว',
        `admin:user-role:${userIdSnapshot}:success`,
      );

      const refreshResult = await handleGetUsers();
      if (!refreshResult?.ok) {
        feedback.actionError(
          refreshResult?.error,
          'อัปเดตสิทธิ์สำเร็จแล้ว แต่รีเฟรชรายการผู้ใช้ไม่สำเร็จ',
          `admin:user-role:${userIdSnapshot}:refresh:error`,
        );
      }
    } catch (err) {
      feedback.actionError(
        err,
        'อัปเดตสิทธิ์ผู้ใช้ไม่สำเร็จ',
        `admin:user-role:${userIdSnapshot}:error`,
      );
    } finally {
      mutationRef.current = false;
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
          if (!mutating && !mutationRef.current) setPendingStatus(null);
        }}
        onConfirm={confirmChangeUserStatus}
      />
    </>
  );
};

export default TableCustomers;
