import React, { useState, useEffect } from 'react'


import { numberFormat } from '@/utils/number';

import { dateFormat } from '@/utils/dataformat';
import { getStatusCocor } from '@/utils/getStatusCocor';
import { getOrders } from '@/features/customer/api/user';
import { useAuthStore } from '@/features/auth/store/authStore';


const HistoryCard = () => {
    const token = useAuthStore((start) => start.token)
    const [order, setOrder] = useState([])

    useEffect(() => {
        //code
        handleGetOrders(token)
    }, [])

    const handleGetOrders = (token => {
        getOrders(token)
            .then((res) => {
               // console.log(res)
                setOrder(res.data.orders)
            })
            .catch((err) => {
                console.log('handleGetOrders --> ', err)
            })
    })


    return (

        <div className='space-y-4'>
            <h1 className='text-2xl font-bold'> ประวัติการสั่งซื้อ </h1>

            {/* คลุม ทั้งหมด */}
            <div className='space-y-4'>

                {/* Card Loop Order */}
                {
                    order?.map((item, index) => {

                        //  console.log('item -->', item)

                        return (
                            <div
                                key={index}
                                className='bg-blue-100 p-4 rounded-md shadow-md '>

                                {/* ทีมงาน header */}
                                <div className='flex justify-between mb-2'>
                                    {/* ทีมงานซ้าย */}
                                    <div>
                                        <p className='text-sm'>Order date</p>
                                        <p className='font-bold'>{dateFormat(item.updatedAt)}</p>
                                    </div>

                                    {/* ทีมงานขวา */}
                                    <div>
                                    <span className = {`${getStatusCocor(item.orderStatus)} px-4 py-1 rounded-full`}>
                                         {item.orderStatus}  
                                    </span>
                                    </div>
                                </div>

                                {/* ทีมงาน table */}
                                <div>
                                    <table className='border w-full '>
                                        <thead>
                                            <tr className='bg-blue-200'>
                                                <th>สินค้า</th>
                                                <th>ราคา</th>
                                                <th>จำนวน</th>
                                                <th>รวม</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {
                                                item.products?.map((product, index) => {
                                                   // console.log('product -->', product)
                                                    return (
                                                        <tr key={index}>
                                                            <td> {product.product.title} </td>
                                                            <td> {numberFormat(product.product.retailPrice )} </td>
                                                            <td> {product.count} </td>
                                                            <td> {numberFormat(product.count * product.retailPrice )} </td>
                                                        </tr>
                                                    )
                                                })
                                            }

                                        </tbody>


                                    </table>
                                </div>

                                {/* ทีมงาน i;, */}
                                <div>
                                    <div className='text-right'>
                                        <p>ราคาสุทธิ</p>
                                        <p>{numberFormat(item.cartTotal)}</p>
                                    </div>
                                </div>


                            </div>
                        )
                    })
                }


            </div>

        </div>

    )
}

export default HistoryCard
