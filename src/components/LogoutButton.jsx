
// ✅ src/components/LogoutButton.jsx
import { useAuthStore } from '@/features/auth/store/authStore';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">
      ออกจากระบบ
    </button>
  );
};

export default LogoutButton;