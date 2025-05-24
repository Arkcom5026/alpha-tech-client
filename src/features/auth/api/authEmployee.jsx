import axios from 'axios';
import { toast } from 'react-toastify';


// ✅ แก้ไขใน authEmployee.jsx
export const loginEmployee = async (form) => {
    try {
      const res = await axios.post('http://localhost:5000/api/loginemployee', form, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true, // ✅ สำคัญ!
      });
  
      console.log('loginEmployee :', res);
      return res;
    } catch (err) {
      console.error('Login Action Error:', err.response?.data);
      throw err;
    }
  };



export const currentEmployee = async(token) => await axios.post('http://localhost:5000/api/current-employee',
    {}, {
    headers: {
        Authorization: `Bearer ${token}`
    }
})

export const currentAdminEmployee = async(token) => await axios.post('http://localhost:5000/api/current-admin-employee',
    {}, {
    headers: {
        Authorization: `Bearer ${token}`
    }
})
