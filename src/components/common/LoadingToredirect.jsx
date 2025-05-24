import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LoadingToredirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate('/online/login'); // หรือปรับตาม role
    }, 2000);

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen text-center">
      <div>
        <p className="text-xl font-semibold mb-2">🔒 กำลังตรวจสอบสิทธิ์การเข้าถึง...</p>
        <p className="text-sm text-gray-500">ระบบจะนำคุณกลับไปที่หน้าเข้าสู่ระบบภายในไม่กี่วินาที</p>
      </div>
    </div>
  );
};

export default LoadingToredirect;
