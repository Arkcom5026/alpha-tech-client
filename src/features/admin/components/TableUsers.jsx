import React, { useState, useEffect } from 'react';

import { changeUserStatus,changeUserRole } from '../api/admin';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/features/auth/store/authStore';



const TableCustomers = () => {

    const token = useAuthStore((state) => state.token)
    const [customers, setCustomers] = useState([])


    useEffect(() => {
        //code
        handleGetUsers(token)

    }, [])


    const handleGetUsers = (token) => {
        getListAllUsers(token)
            .then((res) => {
                setCustomers(res.data)
            })
            .catch((err) => {
                console.log('handleGetUsers err --> ', err)
            })
    }

    const handleChangUserStatue = (userId, userStatus) => {
        console.log('handleChangUserStatue -->', userId, userStatus)
        const value = {
            id: userId,
            enabled: !userStatus
        }

        changeUserStatus(token, value)
            .then((res) => {
                // console.log('changeUserStatus --> ', res)
                handleGetUsers(token)
                toast.success('Update Status Success')
            })
            .catch((err) => {
                console.log('changeUserStatus err --> ', err)
            })

    }


    const handleChangUserRole = (userId, userRole) => {
        console.log('handleChangUserRole -->', userId, userRole)
        const value = {
            id: userId,
            Role: userRole
        }

        changeUserRole(token, value)
            .then((res) => {
                 console.log('changeUserRole --> ', res)
                 handleGetUsers(token)
                 toast.success('Update Role Success')
            })
            .catch((err) => {
                console.log('changeUserRole err --> ', err)
            })
    }

    return (
        <div>
            <div className='container mx-auto p-4 bg-white shadow-md'>

                <table className='w-full'>
                    <thead>
                        <tr>
                            <th>ลำดับ</th>
                            <th>Email</th>
                            {/* <th>วันที่แก้ไขล่าสุด</th> */}
                            <th>สิทธิ์</th>
                            <th>สถานะ</th>
                            <th>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            customers?.map((item, index) =>
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item.email}</td>
                                    {/*  <td>{item.updateAt}</td> */}

                                    <td>                                       
                                        <select 
                                        onChange={(e)=>handleChangUserRole(item.id,e.target.value)}
                                        value={item.role}
                                        >
                                            <option>user</option>
                                            <option>admin</option>
                                        </select>
                                    </td>
                                    <td>
                                        {item.enabled ? 'Active' : 'Inactive'}
                                    </td>
                                    <td>
                                        <button

                                            className='bg-blue-500 rounded-md shadow-md p-1'
                                            onClick={() => handleChangUserStatue(item.id, item.enabled)}
                                        >
                                            {item.enabled ? 'Disable' : 'Enable'}
                                            

                                        </button>
                                    </td>
                                </tr>
                            )

                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default TableCustomers