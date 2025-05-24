import React, { useState, useEffect } from 'react'

import { toast } from 'react-toastify';

import { createBranch } from '../api/branch';
import { useAuthStore } from '@/features/auth/store/authStore';


const initialState = {
    name: '',
    address: '',
}

const FormBranch = () => {
    //Javascript code
    const token = useAuthStore((state) => state.token)
    const [name, setName] = useState('')
    // const [categorier, setCategories] = useState([])

    const Branchs = useAlphaTechStore((state) => state.Branch)
    const getBranch = useAlphaTechStore((state) => state.getBranch)

    const [form, setForm] = useState(initialState)

    useEffect(() => {
        getBranch(token)
    }, [])

    const handleOnChang = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })

    }

    const handleSupmit = async (e) => {
        e.preventDefault()
        try {
            const res = await createBranch(token, form)                        
            console.log(res)
            toast.success(`เพิ่มข้อมูล ${res.data.name} สำเร็จ`)            
            getBranch(token)
        } catch (err) {
            console.log(err)
        }
    }



    const handleRemove = async (id) => {
        //code

        try {
            const res = await removeBranch(token, id)
            console.log(res)
            toast.success(`Deleted ${res.data.name} success`)
            getBranch(token)
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <div className='container mx-auto p-4 bg-white shadow-md'>
            <h1>Branch Management</h1>
            <form className='my-4' onSubmit={handleSupmit} >
                <input
                    className='border'
                    value={form.name}
                    onChange={handleOnChang}
                    placeholder='name'
                    name='name'
                    type='text'
                >

                </input>

                <input
                    className='border'
                    value={form.address}
                    onChange={handleOnChang}
                    placeholder='address'
                    name='address'
                    type='text'
                >

                </input>


                <button className='bg-blue-500'> Add Cate Bank </button>

            </form>

            <hr />

            <ul className='list-none' >
                {
                    Branchs.map((item, index) =>

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

export default FormBranch