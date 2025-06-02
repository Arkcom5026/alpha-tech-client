import axios from 'axios';

// ✅ ฟังก์ชันดึง token จาก employee-storage (Zustand Persist)
function getToken() {
  try {
    const persisted = localStorage.getItem('employee-storage');
    if (!persisted) return null;
    const parsed = JSON.parse(persisted);
    const token = parsed?.state?.token;
    return token ? `Bearer ${token}` : null;
  } catch (error) {
    console.error('❌ ไม่สามารถอ่าน token จาก employee-storage:', error);
    return null;
  }
}

// ✅ baseURL ใช้จาก .env (รองรับทุก environment)
const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`, // <<<<<< จุดนี้สำคัญ!
  timeout: 10000,
});

// ✅ Interceptor: แนบ Authorization token ทุก request ถ้ามี
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
