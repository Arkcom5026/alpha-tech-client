import React, { useEffect, useState } from 'react'

import { toast } from 'react-toastify';
import { numberFormat } from '@/utils/number';


import { changeOrderStatus, getOrdersAdmin } from '../api/admin';
import { dateFormat } from '@/utils/dataformat';
import { getStatusCocor } from '@/utils/getStatusCocor';
import { useAuthStore } from '@/features/auth/store/authStore';


const TableOrders = () => {
  const token = useAuthStore((state) => state.token)
  const [orders, setOrders] = useState([])


  useEffect(() => {
    // code body
    handleGetOrder(token)

  }, [token])

  const handleGetOrder = (token) => {
    getOrdersAdmin(token)
      .then((res) => {
        setOrders(res.data)
        //console.log('handleGetOrder -->',res)
      })
      .catch((err) => {
        console.log('handleGetOrder err --> ', err)
      })
  }

  const handleChangeOrderStatus = (token, orderId, orderStatus) => {

    changeOrderStatus(token, orderId, orderStatus)
      .then(() => {
        //console.log('handleChangeOrderStatus -->', res)
        toast.success('Update Status Success ')
        handleGetOrder(token)
      })
      .catch((err) => {
        console.log('handleChangeOrderStatus err --> ', err)
      })

  }

return (
  <div>
    <div className='container mx-auto p-4 bg-white shadow-md'>

      <table className='w-full'>
        <thead>
          <tr className='bg-blue-200 border '>
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
          {
            orders?.map((item, index) => {
              return (
                <tr key={index} className='border'>
                  <td className='text-center'>{index + 1}</td>
                  <td>
                    <p> {item.orderedBy.email} </p>
                    <p> {item.orderedBy.address} </p>
                  </td>

                  <td>
                    {dateFormat(item.createdAt)}
                  </td>

                  <td className='px-2 py-4'>
                    <ul>
                      {
                        item.products?.map((product, index) => (
                          <li key={index}>
                            {product.product.title} {"  "}
                            <span className='text-sm'> {product.count} x {numberFormat(product.product.retailPrice)} </span>
                          </li>
                        )
                        )
                      }
                    </ul>
                  </td>

                  <td>{numberFormat(item.cartTotal)}</td>

                  <td>
                    <span className = {`${getStatusCocor(item.orderStatus)} px-4 py-1 rounded-full`}>
                      {item.orderStatus}
                    </span>
                  </td>

                  <td>
                    <select
                      value={item.orderStatus}
                      onChange={(e) =>
                        handleChangeOrderStatus(token, item.id, e.target.value)
                      }
                    >
                      <option>Not Process</option>
                      <option>Processing</option>
                      <option>Completed</option>
                      <option>Cancelled</option>

                    </select>

                  </td>

                </tr>
              )
            })
          }
        </tbody>
      </table>
    </div>
  </div>
)
}

export default TableOrders