
// ✅ src/utils/apiClient.js
import axios from 'axios';

// ฟังก์ชันดึง token จาก localStorage (หรือจากแหล่งอื่น เช่น cookie/store ได้)
function getToken() {
  try {
    const token = localStorage.getItem('token');
    //console.log('🔐 แนบ Token:', token); // เพิ่มบรรทัดนี้
    return token ? `Bearer ${token}` : null;
  } catch (error) {
    console.error('❌ ไม่สามารถอ่าน token จาก localStorage:', error);
    return null;
  }
}

// ✅ ตั้งค่า axios instance
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
    },
);

// ✅ Interceptor: ใส่ Authorization ทุกครั้งที่เรียก
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
