import React, { useState } from 'react';
import { 
  Package, 
  LayoutDashboard, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2,
  LogOut,
  User,
  Settings,
  Bell,
  Menu,
  X,
  Edit2,
  Trash2,
  Download,
  Calendar,
  ChevronRight,
  Shield,
  Moon,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';

// --- Types ---

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minStock: number;
  price: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

// --- Mock Data ---

const INITIAL_ITEMS: InventoryItem[] = [
  { id: '1', name: 'Dell OptiPlex 7090', sku: 'SYS-DL-001', category: 'System Unit', quantity: 15, minStock: 5, price: 1200, status: 'In Stock' },
  { id: '2', name: 'Samsung 27" Odyssey', sku: 'MON-SM-002', category: 'Monitor', quantity: 8, minStock: 10, price: 350, status: 'Low Stock' },
  { id: '3', name: 'Logitech G Pro X', sku: 'KBD-LG-003', category: 'Keyboard', quantity: 25, minStock: 5, price: 129, status: 'In Stock' },
  { id: '4', name: 'Razer DeathAdder V3', sku: 'MSE-RZ-004', category: 'Mouse', quantity: 0, minStock: 5, price: 69, status: 'Out of Stock' },
  { id: '5', name: 'Jabra Evolve2 65', sku: 'HDS-JB-005', category: 'Headset', quantity: 12, minStock: 3, price: 249, status: 'In Stock' },
];

// --- Helpers ---

const calculateStatus = (quantity: number, minStock: number): InventoryItem['status'] => {
  if (quantity <= 0) return 'Out of Stock';
  if (quantity <= minStock) return 'Low Stock';
  return 'In Stock';
};

// --- Components ---

const ItemModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onSave: (item: Partial<InventoryItem>) => void,
  initialData?: InventoryItem
}) => {
  const [formData, setFormData] = useState<Partial<InventoryItem>>(
    initialData || { name: '', sku: '', category: '', quantity: 0, minStock: 0, price: 0 }
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800 font-display">
            {initialData ? 'Edit Inventory Item' : 'Add New Item'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          onSave(formData);
        }} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1 tracking-tight">Item Name</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime outline-none"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 tracking-tight">SKU</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime outline-none"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 tracking-tight">Category</label>
              <select 
                required
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime outline-none bg-white"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">Select Category</option>
                <option value="System Unit">System Unit</option>
                <option value="Monitor">Monitor</option>
                <option value="Keyboard">Keyboard</option>
                <option value="Mouse">Mouse</option>
                <option value="Headset">Headset</option>
                <option value="Webcam">Webcam</option>
                <option value="RAM">RAM</option>
                <option value="IP Phone">IP Phone</option>
                <option value="Printer">Printer</option>
                <option value="UPS">UPS</option>
                <option value="Chair">Chair</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 tracking-tight">Quantity</label>
              <input 
                type="number" 
                required
                min="0"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime outline-none"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 tracking-tight">Min. Stock</label>
              <input 
                type="number" 
                required
                min="0"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime outline-none"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1 tracking-tight">Price ($)</label>
              <input 
                type="number" 
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime outline-none"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-2 bg-brand-lime text-white rounded-lg font-bold hover:bg-[#93B200] transition-colors shadow-lg shadow-brand-lime/20"
            >
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const LoginPage = ({ onLogin, onNavigateToSignUp }: { onLogin: () => void, onNavigateToSignUp: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#F9FAFB]">
      {/* Logo Section */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <img 
            src="https://cdn.digitalmindsbpo.com/storage/2021/11/cropped-Digital_Minds_Logo_Original.png" 
            alt="Digital Minds Logo" 
            className="h-24 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        <h1 className="text-slate-500 font-semibold text-lg tracking-tight">Inventory Management System</h1>
        <p className="text-slate-400 text-sm mt-1 font-medium">Efficient • Reliable • Professional</p>
      </div>

      {/* Login Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl w-full max-w-md card-shadow border border-slate-100"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 tracking-tight">Email Address</label>
            <input 
              type="email" 
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <input 
              type="password" 
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-brand-lime hover:bg-[#93B200] text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-brand-lime/20"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <button className="text-brand-lime font-semibold text-sm hover:underline">Forgot your password?</button>
          <p className="text-slate-500 text-sm">
            Don't have an account? <button onClick={onNavigateToSignUp} className="text-brand-lime font-semibold hover:underline">Sign up</button>
          </p>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="mt-12 text-center text-slate-400 text-xs space-y-4">
        <p>© 2026 Digital Minds BPO Services Inc. All rights reserved.</p>
        <div className="flex items-center justify-center gap-4">
          <button className="hover:text-slate-600 transition-colors">Privacy Policy</button>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <button className="hover:text-slate-600 transition-colors">Terms of Service</button>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <button className="hover:text-slate-600 transition-colors">Contact Support</button>
        </div>
      </div>
    </div>
  );
};

const SignUpPage = ({ onSignUp, onNavigateToLogin }: { onSignUp: () => void, onNavigateToLogin: () => void }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignUp();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#F9FAFB]">
      {/* Logo Section */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <img 
            src="https://cdn.digitalmindsbpo.com/storage/2021/11/cropped-Digital_Minds_Logo_Original.png" 
            alt="Digital Minds Logo" 
            className="h-24 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        <h1 className="text-slate-500 font-semibold text-lg tracking-tight">Inventory Management System</h1>
        <p className="text-slate-400 text-sm mt-1 font-medium">Efficient • Reliable • Professional</p>
      </div>

      {/* Sign Up Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl w-full max-w-md card-shadow border border-slate-100"
      >
        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center tracking-tight">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 tracking-tight">Full Name</label>
            <input 
              type="text" 
              placeholder="Enter your full name"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime transition-all"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
            <input 
              type="email" 
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <input 
              type="password" 
              placeholder="Create a password"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-brand-lime hover:bg-[#93B200] text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-brand-lime/20 mt-2"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            Already have an account? <button onClick={onNavigateToLogin} className="text-brand-lime font-semibold hover:underline">Sign in</button>
          </p>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="mt-12 text-center text-slate-400 text-xs space-y-4">
        <p>© 2026 Digital Minds BPO Services Inc. All rights reserved.</p>
        <div className="flex items-center justify-center gap-4">
          <button className="hover:text-slate-600 transition-colors">Privacy Policy</button>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <button className="hover:text-slate-600 transition-colors">Terms of Service</button>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <button className="hover:text-slate-600 transition-colors">Contact Support</button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_ITEMS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'reports' | 'settings'>('dashboard');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | undefined>(undefined);

  const stats = {
    total: items.length,
    lowStock: items.filter(i => i.status === 'Low Stock').length,
    outOfStock: items.filter(i => i.status === 'Out of Stock').length,
    totalValue: items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0)
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveItem = (data: Partial<InventoryItem>) => {
    const status = calculateStatus(data.quantity || 0, data.minStock || 0);
    
    if (editingItem) {
      setItems(items.map(item => 
        item.id === editingItem.id ? { ...item, ...data, status } as InventoryItem : item
      ));
    } else {
      const newItem: InventoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: data.name || '',
        sku: data.sku || '',
        category: data.category || '',
        quantity: data.quantity || 0,
        minStock: data.minStock || 0,
        price: data.price || 0,
        status
      };
      setItems([...items, newItem]);
    }
    setIsModalOpen(false);
    setEditingItem(undefined);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const openAddModal = () => {
    setEditingItem(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  // Chart Data
  const categories = [
    'System Unit', 'Monitor', 'Keyboard', 'Mouse', 'Headset', 
    'Webcam', 'RAM', 'IP Phone', 'Printer', 'UPS', 'Chair'
  ];

  const categoryData = categories.map(cat => ({
    name: cat,
    value: items.filter(i => i.category === cat).length
  })).filter(data => data.value > 0);

  const COLORS = [
    '#A4C600', '#1A1A1A', '#64748B', '#94A3B8', '#CBD5E1', 
    '#E2E8F0', '#F1F5F9', '#334155', '#475569', '#1E293B', '#0F172A'
  ];

  const stockTrendData = [
    { month: 'Jan', stock: 120 },
    { month: 'Feb', stock: 150 },
    { month: 'Mar', stock: 140 },
    { month: 'Apr', stock: 180 },
    { month: 'May', stock: 170 },
    { month: 'Jun', stock: 200 },
  ];

  return (
    <div className="flex h-screen bg-[#F3F4F6] relative overflow-hidden">
      {/* Modals */}
      <ItemModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveItem}
        initialData={editingItem}
      />
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isSidebarOpen ? 'lg:w-64' : 'lg:w-20'} 
        bg-brand-dark text-white flex flex-col
      `}>
        <div className={`p-6 flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <img 
              src="https://cdn.digitalmindsbpo.com/storage/2021/11/cropped-Digital_Minds_Logo_Original.png" 
              alt="Digital Minds Logo" 
              className={`${isSidebarOpen ? 'h-10' : 'h-8'} w-auto object-contain brightness-0 invert`}
              referrerPolicy="no-referrer"
            />
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 hover:bg-white/10 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            isOpen={isSidebarOpen} 
            onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
          />
          <SidebarItem 
            icon={<Package size={20} />} 
            label="Inventory" 
            active={activeTab === 'inventory'} 
            isOpen={isSidebarOpen} 
            onClick={() => { setActiveTab('inventory'); setIsMobileMenuOpen(false); }}
          />
          <SidebarItem 
            icon={<TrendingUp size={20} />} 
            label="Reports" 
            active={activeTab === 'reports'} 
            isOpen={isSidebarOpen} 
            onClick={() => { setActiveTab('reports'); setIsMobileMenuOpen(false); }}
          />
          <SidebarItem 
            icon={<Settings size={20} />} 
            label="Settings" 
            active={activeTab === 'settings'} 
            isOpen={isSidebarOpen} 
            onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}
          />
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white h-16 border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0 z-30">
          <div className="flex items-center gap-2 lg:gap-4">
            <button 
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setIsMobileMenuOpen(true);
                } else {
                  setIsSidebarOpen(!isSidebarOpen);
                }
              }} 
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg lg:text-xl font-bold text-slate-800 truncate font-display capitalize">{activeTab} Overview</h2>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-brand-lime/20 w-32 md:w-64 text-sm transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-4 border-l border-slate-200">
              <div className="text-right hidden lg:block">
                <p className="text-sm font-bold text-slate-800">Admin User</p>
                <p className="text-xs text-slate-500">Inventory Manager</p>
              </div>
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-brand-lime rounded-full flex items-center justify-center text-white font-bold text-sm lg:text-base">
                AU
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  <StatCard label="Total Items" value={stats.total} icon={<Package className="text-blue-500" />} />
                  <StatCard label="Low Stock" value={stats.lowStock} icon={<AlertTriangle className="text-amber-500" />} subtext="Needs attention" />
                  <StatCard label="Out of Stock" value={stats.outOfStock} icon={<X className="text-red-500" />} subtext="Urgent restock" />
                  <StatCard label="Inventory Value" value={`$${stats.totalValue.toLocaleString()}`} icon={<TrendingUp className="text-emerald-500" />} />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 font-display">Stock by Category</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {categoryData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center gap-2 text-xs text-slate-500">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                          <span>{entry.name} ({entry.value})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 font-display">Inventory Trend</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stockTrendData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                          <Tooltip cursor={{ fill: '#F8FAFC' }} />
                          <Bar dataKey="stock" fill="#A4C600" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800 font-display">Recent Activity</h3>
                    <button className="text-brand-lime text-sm font-bold hover:underline">View All</button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {[
                      { user: 'AU', action: 'Added new item', item: 'Dell Latitude 5420', time: '2 hours ago' },
                      { user: 'JD', action: 'Updated quantity', item: 'Logitech MX Master', time: '5 hours ago' },
                      { user: 'SM', action: 'Deleted item', item: 'Old Projector', time: '1 day ago' },
                    ].map((activity, i) => (
                      <div key={i} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm">
                          {activity.user}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-slate-800">
                            <span className="font-bold">Admin</span> {activity.action} <span className="font-bold text-brand-lime">{activity.item}</span>
                          </p>
                          <p className="text-xs text-slate-400">{activity.time}</p>
                        </div>
                        <ChevronRight size={16} className="text-slate-300" />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'inventory' && (
              <motion.div
                key="inventory-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Table Section */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="p-4 lg:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="font-bold text-slate-800 font-display">Stock List</h3>
                    <div className="flex items-center gap-2 lg:gap-3">
                      <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                        <Filter size={16} /> Filter
                      </button>
                      <button 
                        onClick={openAddModal}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-brand-lime text-white rounded-lg text-sm font-bold hover:bg-[#93B200] transition-colors shadow-lg shadow-brand-lime/20"
                      >
                        <Plus size={16} /> Add Item
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    <table className="w-full text-left min-w-[800px]">
                      <thead>
                        <tr className="bg-slate-50/50 text-slate-500 text-[10px] lg:text-xs uppercase tracking-wider">
                          <th className="px-4 lg:px-6 py-4 font-semibold">Item Name</th>
                          <th className="px-4 lg:px-6 py-4 font-semibold">SKU</th>
                          <th className="px-4 lg:px-6 py-4 font-semibold">Category</th>
                          <th className="px-4 lg:px-6 py-4 font-semibold">Quantity</th>
                          <th className="px-4 lg:px-6 py-4 font-semibold">Price</th>
                          <th className="px-4 lg:px-6 py-4 font-semibold">Status</th>
                          <th className="px-4 lg:px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredItems.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-4 lg:px-6 py-4">
                              <div className="font-semibold text-slate-800 text-sm lg:text-base">{item.name}</div>
                            </td>
                            <td className="px-4 lg:px-6 py-4 text-xs lg:text-sm text-slate-500 font-mono">{item.sku}</td>
                            <td className="px-4 lg:px-6 py-4">
                              <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[9px] lg:text-[10px] font-bold uppercase tracking-wider">
                                {item.category}
                              </span>
                            </td>
                            <td className="px-4 lg:px-6 py-4">
                              <div className="text-sm font-semibold text-slate-800">{item.quantity}</div>
                              <div className="text-[9px] lg:text-[10px] text-slate-400">Min: {item.minStock}</div>
                            </td>
                            <td className="px-4 lg:px-6 py-4 text-sm font-semibold text-slate-800">${item.price}</td>
                            <td className="px-4 lg:px-6 py-4">
                              <StatusBadge status={item.status} />
                            </td>
                            <td className="px-4 lg:px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1 lg:gap-2 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => openEditModal(item)}
                                  className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs lg:text-sm text-slate-500">
                    <p>Showing {filteredItems.length} of {items.length} items</p>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-white transition-colors" disabled>Previous</button>
                      <button className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-white transition-colors">Next</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'reports' && (
              <motion.div
                key="reports-view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center max-w-2xl mx-auto">
                  <div className="w-16 h-16 bg-brand-lime/10 text-brand-lime rounded-full flex items-center justify-center mx-auto mb-6">
                    <TrendingUp size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2 font-display">Generate Reports</h3>
                  <p className="text-slate-500 mb-8">Select the type of report you want to generate and download.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    {[
                      { title: 'Inventory Summary', desc: 'Complete list of current stock levels' },
                      { title: 'Low Stock Alert', desc: 'Items currently below minimum threshold' },
                      { title: 'Valuation Report', desc: 'Financial breakdown of current inventory' },
                      { title: 'Activity Log', desc: 'History of all inventory movements' },
                    ].map((report, i) => (
                      <button key={i} className="p-4 border border-slate-100 rounded-xl hover:border-brand-lime hover:bg-slate-50 transition-all group text-left">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-slate-800 group-hover:text-brand-lime transition-colors">{report.title}</span>
                          <Download size={18} className="text-slate-300 group-hover:text-brand-lime" />
                        </div>
                        <p className="text-xs text-slate-400">{report.desc}</p>
                      </button>
                    ))}
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg text-sm text-slate-600">
                      <Calendar size={16} />
                      <span>Last 30 Days</span>
                    </div>
                    <button className="w-full sm:w-auto px-8 py-3 bg-brand-lime text-white rounded-lg font-bold hover:bg-[#93B200] transition-colors shadow-lg shadow-brand-lime/20">
                      Download All Reports
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 font-display">Profile Settings</h3>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-brand-lime rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        AU
                      </div>
                      <div>
                        <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">Change Avatar</button>
                        <p className="text-xs text-slate-400 mt-2">JPG, GIF or PNG. Max size of 800K</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                        <input type="text" defaultValue="Admin User" className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-brand-lime/20" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                        <input type="email" defaultValue="admin@digitalminds.com" className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-brand-lime/20" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 font-display">System Preferences</h3>
                  </div>
                  <div className="p-6 divide-y divide-slate-100">
                    {[
                      { icon: <Bell size={20} />, title: 'Notifications', desc: 'Manage stock alerts and system updates', toggle: true },
                      { icon: <Shield size={20} />, title: 'Security', desc: 'Two-factor authentication and password policy', toggle: false },
                      { icon: <Moon size={20} />, title: 'Dark Mode', desc: 'Switch between light and dark themes', toggle: false },
                      { icon: <Globe size={20} />, title: 'Language', desc: 'Select your preferred system language', value: 'English' },
                    ].map((item, i) => (
                      <div key={i} className="py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-slate-50 text-slate-500 rounded-lg">{item.icon}</div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{item.title}</p>
                            <p className="text-xs text-slate-400">{item.desc}</p>
                          </div>
                        </div>
                        {item.toggle !== undefined ? (
                          <div className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${item.toggle ? 'bg-brand-lime' : 'bg-slate-200'}`}>
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${item.toggle ? 'left-6' : 'left-1'}`}></div>
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-slate-500">{item.value}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button className="px-8 py-3 bg-brand-lime text-white rounded-lg font-bold hover:bg-[#93B200] transition-colors shadow-lg shadow-brand-lime/20">
                    Save All Changes
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

// --- Sub-components ---

const SidebarItem = ({ 
  icon, 
  label, 
  active = false, 
  isOpen = true,
  onClick
}: { 
  icon: React.ReactNode, 
  label: string, 
  active?: boolean, 
  isOpen?: boolean,
  onClick?: () => void
}) => (
  <button 
    onClick={onClick}
    className={`
      flex items-center gap-3 w-full p-3 rounded-lg transition-all
      ${active ? 'bg-brand-lime text-white shadow-lg shadow-brand-lime/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}
    `}
  >
    <span className="shrink-0">{icon}</span>
    {isOpen && <span className="font-semibold text-sm">{label}</span>}
  </button>
);

const StatCard = ({ label, value, icon, subtext }: { label: string, value: string | number, icon: React.ReactNode, subtext?: string }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 bg-slate-50 rounded-xl">
        {icon}
      </div>
      {subtext && <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest font-display">{subtext}</span>}
    </div>
    <h4 className="text-slate-500 text-sm font-semibold mb-1">{label}</h4>
    <p className="text-2xl font-bold text-slate-800 tracking-tight font-display">{value}</p>
  </div>
);

const StatusBadge = ({ status }: { status: InventoryItem['status'] }) => {
  const styles = {
    'In Stock': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'Low Stock': 'bg-amber-50 text-amber-600 border-amber-100',
    'Out of Stock': 'bg-red-50 text-red-600 border-red-100'
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border tracking-wider uppercase font-display ${styles[status]}`}>
      {status}
    </span>
  );
};

export default function App() {
  const [view, setView] = useState<'login' | 'signup' | 'dashboard'>('login');

  return (
    <div className="font-sans">
      <AnimatePresence mode="wait">
        {view === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoginPage 
              onLogin={() => setView('dashboard')} 
              onNavigateToSignUp={() => setView('signup')}
            />
          </motion.div>
        )}
        {view === 'signup' && (
          <motion.div
            key="signup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SignUpPage 
              onSignUp={() => setView('dashboard')} 
              onNavigateToLogin={() => setView('login')}
            />
          </motion.div>
        )}
        {view === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Dashboard onLogout={() => setView('login')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
