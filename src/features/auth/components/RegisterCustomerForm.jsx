import React, { useState } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import useEmployeeStore from "@/store/employeeStore";


const RegisterCustomerForm = () => {

  const actionLoginEmployee = useEmployeeStore((state) => state.actionLoginEmployee)

  const employee = useEmployeeStore((state) => state.employee)
  const navigate = useNavigate()



  const [form, setForm] = useState({

    email: "",
    password: "",

  })

  const handleChange = async (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const roleRedirect = (role) => {
    if (role === 'admin') {
      navigate('/pos')
    } else {
      navigate('/pos')
    }

  }

  const handleRegisterClick = (e) => {

    navigate('/pos/registerpos')

  };


  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await actionLoginEmployee(form)

      const role = res.data.payload.role            
      const token = res.data.token         
      roleRedirect(role)

      toast.success("Welcome back")
      //console.log('employee form zustand', token)
    } catch (err) {
      console.log(err)
      //const errMsg = err.response.data.message
      // toast.error(err)      
    }

  }


  return (
    <div
      className="min-h-screen flex 
  items-center justify-center bg-gray-100"
    >
      <div className="w-full shadow-md bg-white p-8 max-w-md">
        <h1 className="text-2xl text-center my-4 font-bold">Login</h1>
        <form onSubmit={handleSubmit} >
          <div className="space-y-4">
            <input
              placeholder="Email"
              className='border w-full px-3 py-2 rounded
          focus:outline-none focus:ring-2 focus:ring-blue-500
          focus:border-transparent'
              onChange={handleChange}
              name='email'
              type='email'
            />

            <input
              placeholder="Password"
              className='border w-full px-3 py-2 rounded
          focus:outline-none focus:ring-2 focus:ring-blue-500
          focus:border-transparent'
              onChange={handleChange}
              name='password'
              type='text'
            />


            <button
              className="bg-blue-500 rounded-md
           w-full text-white font-bold py-2 shadow
           hover:bg-blue-700
           ">
              Login
            </button>

            <button
              onClick={handleRegisterClick}
              className="bg-green-500 rounded-md
           w-full text-white font-bold py-2 shadow
           hover:bg-green-700
           ">
              Register
            </button>

          </div>
        </form>
      </div>

    </div>
  )
}

export default RegisterCustomerForm