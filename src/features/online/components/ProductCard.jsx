import React from 'react'
import { ShoppingCart } from 'lucide-react';
import { numberFormat } from '@/utils/number';
import { motion } from "framer-motion";
import useCartStore from '../store/cartStore';


const ProductCard = ({ item }) => {
    const actionAddtoCart = useCartStore((state) => state.actionAddtoCart)


    return (

        <motion.div
            initial={{
                opacity: 0,
                scale: 0.5,
            }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
        >
            <div className='border rounded-md shadow-md p-2 w-48'>

                <div>
                 
                    {
                        

                        item.images && item.images.length > 0
                            ? <img src={item.images[0].url}
                                className='rounded-md w-full object-cover hover:scale-110 hover:duration-200 h-30' />
                            : <div className='w-full h-24 bg-blue-100 rounded-md text-center flex items-center justify-center shadow h-30'>
                                No Image
                            </div>
                    }

                </div>

                <div className='py-2'>

                    <p className='text-xl truncate'>{item.title}</p>
                    <p className='text-sm text-gray-500 truncate'>{item.description}</p>

                </div>


                <div className='flex justify-between items-end'>

                    <span className='text-sm font-bold truncate max-w-[100px]'>{numberFormat(item.retailPrice)}</span>

                    <button
                        onClick={() => actionAddtoCart(item)}
                        className='bg-blue-400 rounded-md p-2 hover:bg-blue-700 shadow-sm '> <ShoppingCart />
                    </button>


                </div>

            </div>
        </motion.div>
    )
}

export default ProductCard