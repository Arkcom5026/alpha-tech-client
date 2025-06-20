// ✅ src/pages/RegisterEmployee.jsx

import useEmployeeStore from '@/features/employee/store/employeeStore';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const RegisterEmployeeForm = () => {
  const navigate = useNavigate();
  const actionRegisterEmployee = useEmployeeStore((state) => state.actionRegisterEmployee);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    branchId: '',
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await actionRegisterEmployee(form);
      toast.success('Registration successful! Please login.');
      navigate('/pos/login');
    } catch (err) {
      console.error(err);
      toast.error('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full shadow-md bg-white p-8 max-w-md">
        <h1 className="text-2xl text-center my-4 font-bold">Register as Employee</h1>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              placeholder="Name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className="border w-full px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              placeholder="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="border w-full px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              placeholder="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="border w-full px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              placeholder="Branch ID"
              name="branchId"
              type="text"
              value={form.branchId}
              onChange={handleChange}
              className="border w-full px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="bg-green-500 rounded-md w-full text-white font-bold py-2 shadow hover:bg-green-700"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterEmployeeForm;