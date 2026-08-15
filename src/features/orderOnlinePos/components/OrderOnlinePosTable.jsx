// ===== components/OrderOnlinePosTable.jsx =====

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ConfirmActionDialog } from '@/design-system/composites';
import { feedback } from '@/design-system/feedback';
import OrderOnlinePosStatusBadge from './OrderOnlinePosStatusBadge';
import { useOrderOnlinePosStore } from '../store/orderOnlinePosStore';

const ACTION_COPY = {
  approve: {
    title: 'อนุมัติสลิปคำสั่งซื้อ',
    description: 'ยืนยันการอนุมัติสลิปคำสั่งซื้อนี้?',
    confirmLabel: 'อนุมัติสลิป',
    intent: 'primary',
    success: 'อนุมัติสลิปเรียบร้อยแล้ว',
  },
  reject: {
    title: 'ปฏิเสธสลิปคำสั่งซื้อ',
    description: 'ยืนยันการปฏิเสธสลิปคำสั่งซื้อนี้?',
    confirmLabel: 'ปฏิเสธสลิป',
    intent: 'destructive',
    success: 'ปฏิเสธสลิปเรียบร้อยแล้ว',
  },
  delete: {
    title: 'ลบคำสั่งซื้อ',
    description: 'คุณต้องการลบคำสั่งซื้อนี้หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้',
    confirmLabel: 'ลบคำสั่งซื้อ',
    intent: 'destructive',
    success: 'ลบคำสั่งซื้อเรียบร้อยแล้ว',
  },
};

const OrderOnlinePosTable = ({ orders }) => {
  const navigate = useNavigate();
  const { shopSlug } = useParams();
  const targetSlug = shopSlug || 'advancetech';
  const [pendingAction, setPendingAction] = useState(null);
  const [runningAction, setRunningAction] = useState(false);

  const {
    approveOrderOnlineSlipAction,
    rejectOrderOnlineSlipAction,
    deleteOrderOnlineAction,
  } = useOrderOnlinePosStore();

  const requestAction = (type, id) => {
    if (runningAction) return;
    setPendingAction({ type, id });
  };

  const confirmAction = async () => {
    if (!pendingAction || runningAction) return;
    const copy = ACTION_COPY[pendingAction.type];
    const action = pendingAction.type === 'approve'
      ? approveOrderOnlineSlipAction
      : pendingAction.type === 'reject'
        ? rejectOrderOnlineSlipAction
        : deleteOrderOnlineAction;

    setRunningAction(true);
    try {
      await action(pendingAction.id);
      feedback.actionSuccess(
        copy.success,
        `order-online:${pendingAction.id}:${pendingAction.type}:success`,
      );
      setPendingAction(null);
    } catch (error) {
      feedback.actionError(
        error,
        'ดำเนินการคำสั่งซื้อไม่สำเร็จ',
        `order-online:${pendingAction.id}:${pendingAction.type}:error`,
      );
    } finally {
      setRunningAction(false);
    }
  };

  const formatMoney = (amount) => typeof amount === 'number' ? amount.toFixed(2) : '-';
  const pendingCopy = pendingAction ? ACTION_COPY[pendingAction.type] : null;

  return (
    <>
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">รหัสคำสั่งซื้อ</th>
            <th className="border p-2">ลูกค้า</th>
            <th className="border p-2">วันที่</th>
            <th className="border p-2">ยอดรวม</th>
            <th className="border p-2">สถานะ</th>
            <th className="border p-2">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan="6" className="p-4 text-center text-gray-500">ไม่พบคำสั่งซื้อ</td>
            </tr>
          ) : (
            orders.map((order) => {
              const customerName = order.customer?.customerType === 'GOVERNMENT'
                ? order.customer?.companyName || '-'
                : order.customer?.name || '-';

              return (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="border p-2">{order.code}</td>
                  <td className="border p-2">{customerName}</td>
                  <td className="border p-2">{order.createdAt?.slice(0, 10)}</td>
                  <td className="border p-2 text-right">฿{formatMoney(order.totalAmount)}</td>
                  <td className="border p-2"><OrderOnlinePosStatusBadge status={order.status} /></td>
                  <td className="space-y-1 border p-2 text-center">
                    <button
                      className="block w-full text-emerald-700 hover:underline"
                      onClick={() => navigate(`/${targetSlug}/pos/sales/order-online/${order.id}`)}
                    >
                      ดูรายละเอียด
                    </button>
                    {order.status === 'WAITING_APPROVAL' && (
                      <>
                        <button disabled={runningAction} className="block w-full text-emerald-600 hover:underline disabled:opacity-50" onClick={() => requestAction('approve', order.id)}>
                          อนุมัติสลิป
                        </button>
                        <button disabled={runningAction} className="block w-full text-red-600 hover:underline disabled:opacity-50" onClick={() => requestAction('reject', order.id)}>
                          ปฏิเสธสลิป
                        </button>
                      </>
                    )}
                    <button disabled={runningAction} className="block w-full text-gray-500 hover:underline disabled:opacity-50" onClick={() => requestAction('delete', order.id)}>
                      ลบ
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      <ConfirmActionDialog
        open={Boolean(pendingAction)}
        title={pendingCopy?.title}
        description={pendingCopy?.description}
        confirmLabel={pendingCopy?.confirmLabel}
        intent={pendingCopy?.intent}
        loading={runningAction}
        loadingLabel="กำลังดำเนินการ..."
        onClose={() => !runningAction && setPendingAction(null)}
        onConfirm={confirmAction}
      />
    </>
  );
};

export default OrderOnlinePosTable;