import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutGrid, CheckSquare, LogOut, Search, Compass } from 'lucide-react';

const navItems = [
  { to: '/workspace', icon: LayoutGrid, label: 'Workspace' },
  { to: '/spaces',    icon: Compass,    label: 'Spaces'  },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-[260px] flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* User Workspace Dropdown Area */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white shadow-sm">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900 leading-none">{user?.name}'s Tasks</p>
            <p className="text-xs text-slate-400 mt-1 capitalize">{user?.role} Workspace</p>
          </div>
        </div>

        {/* Global Search (Placeholder) */}
        {/* <div className="px-4 py-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-400">
            <Search size={14} />
            <span className="text-xs font-medium">Search...</span>
             <span className="ml-auto rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-400 shadow-sm">
              
            </span> 
          </div>
        </div> */}

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
