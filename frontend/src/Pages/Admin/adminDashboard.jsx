import React, { useState } from 'react';
import { 
  FiHome, 
  FiUsers, 
  FiShoppingBag, 
  FiSettings, 
  FiBarChart2, 
  FiMessageSquare, 
  FiLogOut,
  FiMenu,
  FiX
} from 'react-icons/fi';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Dashboard components
const DashboardHome = () => (
  <div className="p-6">
    <h2 className="text-4xl font-bold text-[#333333] mb-8">Dashboard Overview</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        title="Total Users" 
        value="1,245" 
        icon={<FiUsers className="text-[#347486] text-2xl" />} 
        bgColor="bg-[#347486]/10"
      />
      <StatCard 
        title="Total Orders" 
        value="342" 
        icon={<FiShoppingBag className="text-[#BC4626] text-2xl" />} 
        bgColor="bg-[#BC4626]/10"
      />
      <StatCard 
        title="Revenue" 
        value="$12,345" 
        icon={<FiBarChart2 className="text-[#DFA55D] text-2xl" />} 
        bgColor="bg-[#DFA55D]/10"
      />
      <StatCard 
        title="Messages" 
        value="24" 
        icon={<FiMessageSquare className="text-[#347486] text-2xl" />} 
        bgColor="bg-[#347486]/10"
      />
    </div>
    
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-2xl font-bold text-[#333333] mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="flex items-center border-b border-gray-100 pb-4">
              <div className="w-12 h-12 rounded-full bg-[#347486]/10 flex items-center justify-center mr-4">
                <FiUsers className="text-[#347486] text-xl" />
              </div>
              <div>
                <p className="text-base font-medium text-gray-900">New user registered</p>
                <p className="text-base text-gray-500">2 hours ago</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-2xl font-bold text-[#333333] mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          <button className="p-6 bg-[#347486]/10 rounded-xl flex flex-col items-center justify-center hover:bg-[#347486]/20 transition-all duration-300">
            <FiUsers className="text-[#347486] text-2xl mb-3" />
            <span className="text-base font-medium text-gray-900">Add User</span>
          </button>
          <button className="p-6 bg-[#BC4626]/10 rounded-xl flex flex-col items-center justify-center hover:bg-[#BC4626]/20 transition-all duration-300">
            <FiShoppingBag className="text-[#BC4626] text-2xl mb-3" />
            <span className="text-base font-medium text-gray-900">New Product</span>
          </button>
          <button className="p-6 bg-[#DFA55D]/10 rounded-xl flex flex-col items-center justify-center hover:bg-[#DFA55D]/20 transition-all duration-300">
            <FiBarChart2 className="text-[#DFA55D] text-2xl mb-3" />
            <span className="text-base font-medium text-gray-900">View Reports</span>
          </button>
          <button className="p-6 bg-[#347486]/10 rounded-xl flex flex-col items-center justify-center hover:bg-[#347486]/20 transition-all duration-300">
            <FiSettings className="text-[#347486] text-2xl mb-3" />
            <span className="text-base font-medium text-gray-900">Settings</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Stat Card Component
const StatCard = ({ title, value, icon, bgColor }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm flex items-center">
    <div className={`rounded-xl w-14 h-14 flex items-center justify-center ${bgColor} mr-4`}>
      {icon}
    </div>
    <div>
      <p className="text-base text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-[#333333]">{value}</p>
    </div>
  </div>
);

// Sidebar Item Component
const SidebarItem = ({ icon, text, to, active, onClick, isButton = false }) => {
  const Component = isButton ? 'button' : Link;
  return (
    <Component 
      to={!isButton ? to : undefined}
      onClick={onClick}
      className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-300 w-full ${
        active ? 'bg-[#347486] text-white' : 'text-gray-600 hover:bg-[#347486]/10'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-base font-medium">{text}</span>
    </Component>
  );
};

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('dashboard');
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    
    toast.success("Logged out successfully");
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div 
        className={`bg-white shadow-sm transition-all duration-300 ${
          isSidebarOpen ? 'w-72' : 'w-0 -ml-72'
        } md:ml-0 fixed h-full z-10`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-[#347486]">Admin Panel</h1>
            <button 
              className="md:hidden text-gray-500 hover:text-gray-700"
              onClick={toggleSidebar}
            >
              <FiX className="text-2xl" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-2">
              <SidebarItem 
                icon={<FiHome />} 
                text="Dashboard" 
                to="/admin" 
                active={activeItem === 'dashboard'} 
                onClick={() => setActiveItem('dashboard')}
              />
              <SidebarItem 
                icon={<FiUsers />} 
                text="Users" 
                to="/admin/users" 
                active={activeItem === 'users'} 
                onClick={() => setActiveItem('users')}
              />
              <SidebarItem 
                icon={<FiShoppingBag />} 
                text="Products" 
                to="/admin/products" 
                active={activeItem === 'products'} 
                onClick={() => setActiveItem('products')}
              />
              <SidebarItem 
                icon={<FiBarChart2 />} 
                text="Services" 
                to="/admin/services" 
                active={activeItem === 'analytics'} 
                onClick={() => setActiveItem('analytics')}
              />
              <SidebarItem 
                icon={<FiMessageSquare />} 
                text="Pets" 
                to="/admin/AllPets" 
                active={activeItem === 'messages'} 
                onClick={() => setActiveItem('messages')}
              />
              <SidebarItem 
                icon={<FiSettings />} 
                text="Settings" 
                to="/admin/settings" 
                active={activeItem === 'settings'} 
                onClick={() => setActiveItem('settings')}
              />
            </div>
          </div>
          
          <div className="p-6 border-t border-gray-100">
            <SidebarItem 
              icon={<FiLogOut />} 
              text="Logout" 
              isButton={true}
              active={false}
              onClick={handleLogout}
            />
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${
        isSidebarOpen ? 'md:ml-72' : 'ml-0'
      }`}>
        {/* Page Content */}
        <main className="p-6">
          <Outlet />
          {/* Render default dashboard if no child route is active */}
          {location.pathname === '/admin' && <DashboardHome />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
