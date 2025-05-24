import React, { useState, useEffect } from 'react'

import { SwiperSlide } from 'swiper/react'


import SwiperShowProducts from '@/utils/SwiperShowProducts'

import ProductCard from '@/features/online/components/ProductCard'
//import { listProductFilters } from '@/features/product/api'



const NewProduct = () => {
<div>
NewProduct
   {/* const [data, setData] = useState([])

    useEffect(() => {

        loadData()
    }, [])

    const loadData = () => {
        listProductFilters('updatedAt', 'desc', 3)
            .then((res) => {
             //   console.log('res ', res)
                setData(res.data)
            })
            .catch((err) => {
                console.log('loadData err --> ', err)
            })
    }

    return (
        <SwiperShowProducts>

            {data?.map((item, index) => (
                <SwiperSlide>
                    <ProductCard item={item} key={index} />
                </SwiperSlide>

            ))}

        </SwiperShowProducts>

    )
        */}
        </div>
}

export default NewProduct