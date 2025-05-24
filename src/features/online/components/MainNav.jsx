// ✅ src/features/online/components/MainNav.jsx
import { Link } from 'react-router-dom';

const MainNav = () => {
  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">
          <Link to="/online">Online Shop</Link>
        </h1>
        <nav className="space-x-4">
          <Link to="/online" className="hover:underline">Home</Link>
          <Link to="/online/login" className="hover:underline">Login</Link>
          <Link to="/online/register" className="hover:underline">Register</Link>
        </nav>
      </div>
    </header>
  );
};

export default MainNav;
