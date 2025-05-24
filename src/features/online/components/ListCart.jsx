import React from 'react'
import { ListCheck, User } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";


import { toast } from 'react-toastify';
import { numberFormat } from '@/utils/number';
import { createUserCart } from '@/features/customer/api/user';
import useCartStore from '@/features/online/store/cartStore';
import useCustomerStore from '@/features/customer/store/customerStore';
import { useAuthStore } from '@/features/auth/store/authStore';


const ListCart = () => {
    const cart = useCartStore((state) => state.carts);
    const customer = useCustomerStore((state) => state.customer);
    const token = useAuthStore((state) => state.token);
    const navigate = useNavigate()

    const getTotalPrice = useCartStore((state) => state.getTotalPrice);

    console.log('----------------------------------------------------------------  ListCart')   
    const handleSaveCart = async ()=>{
        await createUserCart(token,{ cart })
        .then((res)=>{
            console.log({res})
            toast.success('บันทึกรายการเรียบร้อยแล้ว')
            navigate('/Checkout')
        })
        .catch((err)=>{
            console.log('handleSaveCart -->',err)
            toast.warning(err.response.data.message)
        })
    }


    return (
        <div className='bg-blue-100 rounded-sm p-4'>
            {/* Header */}
            <div className='flex gap-4 mb-4'>
                <ListCheck size={36} />
                <p className='text-2xl font-bold'> รายการสินค้า {cart.length} รายการ</p>
            </div>

            {/* List */}
            <div className='grid grid-cols-1 md:grid-cols-3'>

                {/* Left */}
                <div className="col-span-2 p-2">
                    {
                        cart.map((item, index) =>
                            <div key={index} className="bg-white p-2 rounded-md shadow-md mb-2">
                                <div className="flex justify-between mb-2">
                                    {
                                        item.images && item.images.length > 0
                                            ? <img src={item.images[0].url} className="w-16 h-16 rounded-md" />
                                            : <div className="w-16 h-16 bg-blue-200 rounded-md text-center items-center" >
                                                No Image
                                            </div>
                                    }

                                    <div className="flex gap-2 items-center">
                                        <div>
                                            <p className="font-bold">{item.title}</p>
                                            <p className="text-sm">{numberFormat(item.retailPrice)} x {item.count} </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 items-center">
                                        <div>
                                            <p className="text-sm">{numberFormat(item.retailPrice*item.count)} </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                </div>

                {/* Right */}
                <div className="font-bold bg-white p-4 rounded-md shodow-md space-y-2 ">

                    <p>ยอดรวม</p>

                    <div className='flex justify-between' >
                        <p> รวมสุทธิ </p>
                        <p className='font-bold'> {numberFormat(getTotalPrice())} </p>

                    </div>


                    <div className='flex flex-col gap-2'>

                        {
                            customer
                                ? <Link to={'/shoponline'}>
                                    <button 
                                     disabled= {cart.length  < 1}
                                     onClick={handleSaveCart}
                                     className='bg-blue-500 w-full rounded-md text-white py-2 shadow-md hover:bg-blue-600'> สั่งซื้อ 
                                     
                                     </button>
                                </Link>
                                : <Link to={'/login'}>
                                    <button className='bg-blue-500 w-full rounded-md text-white py-2 shadow-md hover:bg-blue-600'> Login </button>
                                </Link>
                        }
                        <Link to={'/shoponline'}>
                            <button className='bg-gray-400 w-full rounded-md text-white py-2 shadow-md hover:bg-gray-600'> แก้ไขรายการ </button>
                        </Link>
                    </div>

                </div>


            </div >
        </div>
    )
}

export default ListCart