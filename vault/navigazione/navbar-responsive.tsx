import React, { useState } from 'react';
import { Menu, X, Search } from 'lucide-react';

export const HeaderNavbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('Home');

  const menuItems = ['Home', 'Servizi', 'Progetti', 'Contatti'];

  return (
    <header className="w-full bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">
              R
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-900">ReactCraft</span>
          </div>

          {/* Link Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <button
                key={item}
                onClick={() => setActiveItem(item)}
                className={`text-sm font-semibold transition-colors duration-200 cursor-pointer ${
                  activeItem === item ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {item}
              </button>
            ))}
          </nav>

          {/* Controlli Destra */}
          <div className="flex items-center gap-3">
            
            <button className="p-2 bg-slate-50 text-slate-500 hover:text-slate-800 rounded-xl transition-all duration-200 hidden sm:block">
              <Search size={16} />
            </button>
            

            
            <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center cursor-pointer text-xs font-bold text-slate-600">
              JD
            </div>
            

            {/* Menu Mobile Trigger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-slate-500 hover:text-slate-800 rounded-xl"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Drawer Mobile */}
      {mobileOpen && (
        <div className="md:hidden bg-slate-50 border-t border-slate-100 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item}
              onClick={() => {
                setActiveItem(item);
                setMobileOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeItem === item
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
