
import useAuthStore from '@/features/auth/store/authStore';
import { createProductType } from '@/features/productType/api/productTypeApi';

import React, { useState, useEffect } from 'react'

import { toast } from 'react-toastify';

const FormPosition = () => {
    //Javascript code
    const token = useAuthStore((state) => state.token)
   // const [categorier, setCategories] = useState([])
   
   const getProductType = useProductTypeStore((state)=>state.getProductType)
   

   const [name, setName] = useState('')

    useEffect(() => {
        getProductType(token)
    }, [])



    const handleSupmit = async (e) => {
        //code
        e.preventDefault()
        if (!name) {
            return toast.warning('Please fill data')
        }
        //console.log(token,{name})
        try {
            const res = await createProductType(token, { name })
            console.log(res.data.name)
            toast.success(`Add ProductType ${res.data.name} Success!!!`)
            getProductType(token)
        } catch (err) {
            console.log(err)
        }
    }

    const handleRemove = async (id) => {
        //code

        try {
            const res = await removeProductType(token,id)
            console.log(res)
            toast.success(`Deleted ${res.data.name} success`)
            getProductType(token)
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <div className='container mx-auto p-4 bg-white shadow-md'>
            <h1>ProductType Management</h1>
            <form className='my-4' onSubmit={handleSupmit} >
                <input
                    onChange={(e) => setName(e.target.value)}
                    className='border mr-5'
                    type='text'
                >

                </input>

                <button className='bg-blue-500'> Add Cate ProductType </button>

            </form>

            <hr />

            <ul className='list-none' >
                {
                    categorier.map((item, index) =>

                        <li className='flex justify-between my-2' key={index}>
                            <span>
                                {item.name}
                            </span>

                            <button
                                className='bg-red-500 '
                                onClick={() => handleRemove(item.id)}
                            >
                                Delete</button>
                        </li>
                    )
                }

            </ul>



        </div >
    )
}

export default FormPosition