import React from 'react';
import { Home, Users, ShoppingBag, Settings, LogOut, Menu, X } from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar, handleLogout, activeMenu, setActiveMenu }) => {
    const menuItems = [
      { icon: <Home size={20} color="#4ADE80" />, title: 'Dashboard', id: 'dashboard', textColor: 'text-emerald-400' },
      { icon: <Users size={20} color="#60A5FA" />, title: 'Users', id: 'users', textColor: 'text-blue-400' },
      { icon: <ShoppingBag size={20} color="#F87171" />, title: 'Products', id: 'products', textColor: 'text-red-400' },
    ];
  
    return (
      <div className={`fixed left-0 top-0 h-full bg-gray-800 text-white transition-all duration-300 
        ${isOpen ? 'w-64' : 'w-20'} 
        md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        z-50`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h1 className={`font-bold ${isOpen ? 'block' : 'hidden'}`} style={{fontFamily:'Quicksand',color:'#F2F2F2'}}>AdminBPF</h1>
          <button onClick={toggleSidebar} className="p-2 rounded hover:bg-gray-700">
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
  
        <nav className="mt-4" style={{marginTop:'70px'}}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`flex items-center w-full px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors ${
                activeMenu === item.id ? 'bg-gray-700' : ''
              }`}
            >
              <span className="mr-4">{item.icon}</span>
              <span className={`${isOpen ? 'block' : 'hidden'}`} style={{color:'#F2F2F2', fontFamily:'Quicksand'}}>{item.title}</span>
            </button>
          ))}
          
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 mt-4 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          >
            <span className="mr-4"><LogOut size={20} /></span>
            <span className={`${isOpen ? 'block' : 'hidden'}`}>Logout</span>
          </button>
        </nav>
      </div>
    );
  };

  export default Sidebar;