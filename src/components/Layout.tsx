import React from 'react';
import { useAuth } from '../AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  UserRound, 
  Calendar, 
  FileText, 
  LogOut, 
  PlusCircle,
  Stethoscope,
  CreditCard,
  ClipboardList,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, onClick, active }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-colors ${
      active ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

export const Layout: React.FC<{ children: React.ReactNode; activeTab: string; setActiveTab: (tab: string) => void }> = ({ 
  children, 
  activeTab, 
  setActiveTab 
}) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const menuItems = React.useMemo(() => {
    if (!user) return [];
    const items = [];
    
    if (user.role === 'admin') {
      items.push(
        { id: 'dashboard', label: 'Бошқарув панели', icon: <LayoutDashboard size={20} /> },
        { id: 'doctors', label: 'Шифокорлар', icon: <Stethoscope size={20} /> },
        { id: 'patients', label: 'Беморлар', icon: <Users size={20} /> },
        { id: 'appointments', label: 'Навбатлар', icon: <Calendar size={20} /> }
      );
    } else if (user.role === 'doctor') {
      items.push(
        { id: 'dashboard', label: 'Иш жадвали', icon: <Calendar size={20} /> },
        { id: 'profile', label: 'Профилим', icon: <UserRound size={20} /> }
      );
    } else if (user.role === 'patient') {
      items.push(
        { id: 'dashboard', label: 'Асосий', icon: <LayoutDashboard size={20} /> },
        { id: 'book_appointment', label: 'Навбат олиш', icon: <PlusCircle size={20} /> },
        { id: 'doctors_list', label: 'Шифокорлар', icon: <Stethoscope size={20} /> },
        { id: 'my_appointments', label: 'Навбатларим', icon: <Calendar size={20} /> },
        { id: 'medical_history', label: 'Тиббий тарих', icon: <FileText size={20} /> },
        { id: 'services_list', label: 'Хизматлар', icon: <ClipboardList size={20} /> },
        { id: 'billing', label: 'Тўловлар', icon: <CreditCard size={20} /> }
      );
    }
    return items;
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-2 text-blue-600 font-bold text-xl">
          <PlusCircle size={28} />
          <span>Шифохона</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(isMobileMenuOpen || window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r p-6 flex flex-col h-full transition-transform md:translate-x-0 ${
              isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="hidden md:flex items-center space-x-2 text-blue-600 font-bold text-2xl mb-10">
              <PlusCircle size={32} />
              <span>Шифохона</span>
            </div>

            <nav className="flex-1 space-y-2">
              {menuItems.map((item) => (
                <SidebarItem
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  active={activeTab === item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                />
              ))}
            </nav>

            <div className="mt-auto pt-6 border-t">
              <div className="flex items-center space-x-3 mb-6 p-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {user?.name?.[0]}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-3 w-full p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={20} />
                <span className="font-medium">Чиқиш</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
