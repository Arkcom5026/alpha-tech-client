import React, { useState, useEffect } from 'react'

import { SwiperSlide } from 'swiper/react'

import SwiperShowProducts from '@/utils/SwiperShowProducts'

import ProductCard from '@/features/online/components/ProductCard'


const BestSeller = () => {
/*
    const [data, setData] = useState([])

    useEffect(() => {

        loadData()
    }, [])

    const loadData = () => {
        listProductFilters('sold', 'desc', 3)
            .then((res) => {
               // console.log('res ', res)
                setData(res.data)
            })
            .catch((err) => {
                console.log('loadData err --> ', err)
            })
    }
*/
    return (
       <div>
        BestSeller

       

       {/*}
       <SwiperShowProducts>

            {data?.map((item, index) => (
                <SwiperSlide>
                    <ProductCard item={item} key={index} />
                </SwiperSlide>

            ))}

        </SwiperShowProducts>
        */}
        </div>

    )
}

export default BestSeller