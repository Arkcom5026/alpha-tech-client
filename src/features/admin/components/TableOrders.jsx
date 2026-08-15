import React, { useCallback, useEffect, useState } from 'react';
import { ConfirmActionDialog } from '@/design-system/composites';
import { feedback } from '@/design-system/feedback';
import { numberFormat } from '@/utils/number';
import { changeOrderStatus, getOrdersAdmin } from '../api/admin';
import { dateFormat } from '@/utils/dataformat';
import { getStatusCocor } from '@/utils/getStatusCocor';
import { useAuthStore } from '@/features/auth/store/authStore';

const TableOrders = () => {
  const token = useAuthStore((state) => state.token);
  const [orders, setOrders] = useState([]);
  const [pendingCancellation, setPendingCancellation] = useState(null);
  const [savingStatus, setSavingStatus] = useState(false);

  const handleGetOrder = useCallback(() => {
    getOrdersAdmin(token)
      .then((res) => {
        setOrders(res.data);
      })
      .catch((err) => {
        console.log('handleGetOrder err --> ', err);
        feedback.error(err?.response?.data?.message || 'โหลดรายการคำสั่งซื้อไม่สำเร็จ');
      });
  }, [token]);

  useEffect(() => {
    handleGetOrder();
  }, [handleGetOrder]);

  const applyOrderStatus = async (orderId, orderStatus) => {
    if (savingStatus) return;
    setSavingStatus(true);
    try {
      await changeOrderStatus(token, orderId, orderStatus);
      feedback.actionSuccess(
        orderStatus === 'Cancelled' ? 'ยกเลิกคำสั่งซื้อเรียบร้อยแล้ว' : 'อัปเดตสถานะคำสั่งซื้อเรียบร้อยแล้ว',
        `admin:order-status:${orderId}:${orderStatus}:success`,
      );
      handleGetOrder();
      setPendingCancellation(null);
    } catch (err) {
      console.log('handleChangeOrderStatus err --> ', err);
      feedback.actionError(
        err,
        'อัปเดตสถานะคำสั่งซื้อไม่สำเร็จ',
        `admin:order-status:${orderId}:${orderStatus}:error`,
      );
    } finally {
      setSavingStatus(false);
    }
  };

  const handleChangeOrderStatus = (order, nextStatus) => {
    if (savingStatus || nextStatus === order.orderStatus) return;
    if (nextStatus === 'Cancelled') {
      setPendingCancellation({ order, nextStatus });
      return;
    }
    applyOrderStatus(order.id, nextStatus);
  };

  return (
    <>
      <div>
        <div className="container mx-auto bg-white p-4 shadow-md">
          <table className="w-full">
            <thead>
              <tr className="border bg-emerald-100">
                <th>ลำดับ</th>
                <th>ผู้ใช้งาน</th>
                <th>วันที่</th>
                <th>สินค้า</th>
                <th>รวม</th>
                <th>สถานะ</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {orders?.map((item, index) => (
                <tr key={item.id || index} className="border">
                  <td className="text-center">{index + 1}</td>
                  <td>
                    <p>{item.orderedBy.email}</p>
                    <p>{item.orderedBy.address}</p>
                  </td>
                  <td>{dateFormat(item.createdAt)}</td>
                  <td className="px-2 py-4">
                    <ul>
                      {item.products?.map((product, productIndex) => (
                        <li key={product.id || productIndex}>
                          {product.product.name}{'  '}
                          <span className="text-sm">{product.count} x {numberFormat(product.product.retailPrice)}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>{numberFormat(item.cartTotal)}</td>
                  <td>
                    <span className={`${getStatusCocor(item.orderStatus)} px-4 py-1 rounded-full`}>
                      {item.orderStatus}
                    </span>
                  </td>
                  <td>
                    <select
                      value={item.orderStatus}
                      onChange={(e) => handleChangeOrderStatus(item, e.target.value)}
                      disabled={savingStatus}
                      className="rounded border border-slate-300 px-2 py-1 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option>Not Process</option>
                      <option>Processing</option>
                      <option>Completed</option>
                      <option>Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmActionDialog
        open={Boolean(pendingCancellation)}
        title="ยกเลิกคำสั่งซื้อ"
        description={`ยืนยันยกเลิกคำสั่งซื้อ #${pendingCancellation?.order?.id || ''} หรือไม่?`}
        confirmLabel="ยกเลิกคำสั่งซื้อ"
        intent="destructive"
        loading={savingStatus}
        loadingLabel="กำลังยกเลิก..."
        onClose={() => {
          if (!savingStatus) setPendingCancellation(null);
        }}
        onConfirm={() => pendingCancellation && applyOrderStatus(pendingCancellation.order.id, pendingCancellation.nextStatus)}
      />
    </>
  );
};

export default TableOrders;
