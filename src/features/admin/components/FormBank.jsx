import React, { useState, useEffect } from 'react'

import { toast } from 'react-toastify';
import { createBank } from '../api/bank';
import useBankStore from '@/store/bankStore';
import { useAuthStore } from '@/features/auth/store/authStore';


const FormBank = () => {
    //Javascript code
    const token = useAuthStore((state) => state.token)
    const [name, setName] = useState('')
   // const [categorier, setCategories] = useState([])

   const Banks = useBankStore((state)=>state.banks)
   const getBank = useBankStore((state)=>state.getBank)

    useEffect(() => {
        getBank(token)
    }, [])



    const handleSupmit = async (e) => {
        //code
        e.preventDefault()
        if (!name) {
            return toast.warning('Please fill data')
        }
        //console.log(token,{name})
        try {
            const res = await createBank(token, { name })
            console.log(res.data.name)
            toast.success(`Add Bank ${res.data.name} Success!!!`)
            getBank(token)
        } catch (err) {
            console.log(err)
        }
    }

    const handleRemove = async (id) => {
        //code

        try {
            const res = await removeBank(token,id)
            console.log(res)
            toast.success(`Deleted ${res.data.name} success`)
            getBank(token)
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <div className='container mx-auto p-4 bg-white shadow-md'>
            <h1>Bank Management</h1>
            <form className='my-4' onSubmit={handleSupmit} >
                <input
                    onChange={(e) => setName(e.target.value)}
                    className='border mr-5'
                    type='text'
                >

                </input>

                <button className='bg-blue-500'> Add Cate Bank </button>

            </form>

            <hr />

            <ul className='list-none' >
                {
                    Banks.map((item, index) =>

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

export default FormBank