import React, { useState,  } from 'react'

import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';


import { numberFormat } from '@/utils/number';
import { useAuthStore } from '@/features/auth/store/authStore';


const SummaryCard = () => {
  const token = useAuthStore((start) => start.token)

  const [products, setProducts] = useState([])
  const [cartTotal, setcartTotal] = useState(0)

  const [address, setAddress] = useState('')
  const [addressSave, setAddressSave] = useState(false)

  const navigate = useNavigate()
  


  const handleGoToPayment = () => {
    if(!addressSave){
      return toast.warning('กรุณากรอกที่อยู่')
    }
    navigate('/user/payment')
    
  }


  return (
    <div className='mx-auto'>
      <div className='flex flex-wrap '>
        {/* Left */}
        <div className='w-2/4 p-2'>
          <div className='bg-blue-100 p-4 rounded-md border shadow-md space-y-2'>
            <h1 className='font-bold text-lg'> ที่อยู่ในการจัดส่ง </h1>

            <textarea
              required
              onChange={(e) => setAddress(e.target.value)}
              placeholder='กรุณากรอกที่อยู่จัดส่ง'
              className='w-full px-2 rounded-md'
            />



          </div>
        </div>


        {/* Left */}
        <div className='w-2/4 p-2'>
          <div className='bg-blue-100 p-4 rounded-md border shadow-md space-y-4'>
            <h1 className='text-lg font-bold'> รายการสั่งซื้อ </h1>

            {/* Item List*/}

            {
              products?.map((item, index) =>
                <div key={index}>
                  <div className='flex justify-between items-end '>
                    {/* left */}
                    <div>
                      <p className='font-bold'> {item.product.title} </p>
                      <p className='text-sm'> {item.count} x {numberFormat(item.product.retailPrice )}</p>
                    </div>

                    {/* rigth */}
                    <div>
                      <p className='text-blue-700 font-bold'> {numberFormat(item.count * item.product.retailPrice )} </p>
                    </div>

                  </div>
                </div>
              )
            }


            <div className='flex justify-between'>
              <p>ค่าจัดส่ง</p>
              <p>0.00</p>
            </div>

            <div className='flex justify-between'>
              <p>ส่วนลด</p>
              <p>0.00</p>
            </div>
            <div className='flex justify-between font-bold '>
              <p className='font-bold'>ยอดรวมสุทธิ</p>
              <p className='text-lg text-blue-700'>{numberFormat(cartTotal)}</p>
            </div>
            <hr />
            <div>
              <button
                onClick={handleGoToPayment}
               
                className='bg-blue-500 w-full p-2 rounded-md shadow-md text-white hover:bg-blue-700'>
                  ดำเนินการชำระเงิน
              </button>
            </div>
          </div>

        </div>

      </div>


    </div>
  )
}

export default SummaryCard

