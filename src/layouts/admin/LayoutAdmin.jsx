// ✅ LayoutAdmin.jsx
import { Outlet } from 'react-router-dom';
import UnifiedMainNav from '../../components/common/UnifiedMainNav';


const LayoutAdmin = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <UnifiedMainNav />
      <main className="flex-1 container mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default LayoutAdmin;