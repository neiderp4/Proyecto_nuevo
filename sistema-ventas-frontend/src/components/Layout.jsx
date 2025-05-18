import React from 'react';
import { NavLink, Outlet } from "react-router-dom";
import {
  Home,
  Users,
  ShoppingCart,
  DollarSign,
  BarChart2
} from "lucide-react";

const navItems = [
  { path: '/', label: 'Inicio', icon: <Home size={18} /> },
  { path: "/clientes", label: "Clientes", icon: <Users size={18} /> },
  { path: "/productos", label: "Productos", icon: <ShoppingCart size={18} /> },
  { path: "/ventas", label: "Ventas", icon: <DollarSign size={18} /> },
  { path: "/pagos", label: "Pagos", icon: <DollarSign size={18} /> },
  { path: "/reportes", label: "Reportes", icon: <BarChart2 size={18} /> },
];

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-slate-800 text-white p-4 hidden md:flex flex-col">
        <h1 className="text-2xl font-bold mb-6">Sistema de Ventas</h1>
        <nav className="flex flex-col gap-2">
          {navItems.map(({ path, label, icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 transition-all ${
                  isActive ? 'bg-slate-700 font-semibold' : ''
                }`
              }
            >
              {icon}
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
