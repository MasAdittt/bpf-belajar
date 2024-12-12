import React from 'react';
import { Bell, ChevronDown, Menu } from 'lucide-react';

const Header = ({ isOpen, activeMenu, toggleSidebar }) => {
  const getTitleFromMenu = (menu) => {
    const titles = {
      dashboard: 'Dashboard',
      users: 'Users Management',
      products: 'Products Management',
      settings: 'Settings'
    };
    return titles[menu] || 'Dashboard';
  };

  return (
    <header className={`fixed top-0 right-0 bg-white shadow-md h-20 transition-all duration-300 
      ${isOpen ? 'md:left-64' : 'md:left-20'} 
      left-0
      flex items-center justify-between px-6 z-40`}
    >
      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleSidebar} 
          className="text-gray-600 hover:bg-gray-100 p-2 rounded-lg md:hidden"
        >
          <Menu size={24} />
        </button>
        <h2 className="text-xl font-semibold text-gray-800" style={{color:'#3A3A3A',fontFamily:'Quicksand'}}>
          {getTitleFromMenu(activeMenu)}
        </h2>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
          <Bell size={20} />
        </button>
        
      
      </div>
    </header>
  );
};

export default Header;