import React, { useState, useRef, useEffect } from 'react';
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
  Eye,
  Download,
  Calendar,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  MapPin,
  Shield,
  Moon,
  Globe,
  UserPlus,
  ClipboardList,
  Wrench,
  FileText,
  Database,
  Users,
  History,
  AlertCircle,
  FileSpreadsheet
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
import jsPDF from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';
import { logoBase64 } from './logoBase64';

// --- Types ---

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minStock: number;
  price: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Under Repair' | 'Assigned';
  location?: string;
  description?: string;
}

interface AssetAssignment {
  id: string;
  itemId: string;
  itemName: string;
  workStationArea: string;
  assignedDate: string;
  returnDate: string | null;
  status: 'Assigned' | 'Returned' | 'Lost' | 'Damaged';
}

interface MaintenanceRecord {
  id: string;
  itemId: string;
  itemName: string;
  requestDate: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Under Repair' | 'Fixed';
  remarks: string;
}

interface AssetRequest {
  id: string;
  workStationArea: string;
  itemName: string;
  requestDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  adminRemarks: string;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  avatar: string | null;
}

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
  categories,
  initialData 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onSave: (item: Partial<InventoryItem>) => void,
  categories: string[],
  initialData?: InventoryItem
}) => {
  const [formData, setFormData] = useState<Partial<InventoryItem>>(
    initialData || { name: '', sku: '', category: '', quantity: 0, minStock: 0, price: 0, location: '', description: '' }
  );

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || { name: '', sku: '', category: '', quantity: 0, minStock: 0, price: 0, location: '', description: '' });
    }
  }, [initialData, isOpen]);

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
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
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
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 tracking-tight">Location</label>
              <select 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime outline-none bg-white"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              >
                <option value="" disabled>Select Location</option>
                <option value="IT Department">IT Department</option>
                <option value="HR Department">HR Department</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1 tracking-tight">Description</label>
              <textarea 
                rows={2}
                placeholder="Item description..."
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime outline-none resize-none"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

const LoginPage = ({ onLogin, onNavigateToSignUp }: { onLogin: (user: User) => void, onNavigateToSignUp: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        onLogin(data);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F9FAFB]">
      {/* Left Side: Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img 
          src="https://prstation-dev.s3.ap-northeast-1.amazonaws.com/uploads/companies/336/1724250725.jpg/PthOW1RBwXeQstR8lgCcitE5tGGgMD6OHbr9n0jZ.jpg" 
          alt="Login Background" 
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-brand-lime/20 backdrop-blur-[1px]"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white bg-black/40 backdrop-blur-[2px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-center max-w-lg"
          >
            <h2 className="text-6xl font-bold mb-6 font-display leading-[1.1] tracking-tight drop-shadow-lg">
              Streamline Your<br />
              <span className="text-brand-lime">Inventory Flow</span>
            </h2>
            <p className="text-xl opacity-90 font-medium leading-relaxed drop-shadow-md">
              The most efficient way to manage your assets, track stock levels, and generate professional reports.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-12 overflow-y-auto">
        {/* Logo Section */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="https://cdn.digitalmindsbpo.com/storage/2021/11/cropped-Digital_Minds_Logo_Original.png" 
              alt="Digital Minds Logo" 
              className="h-20 lg:h-24 w-auto object-contain"
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
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-lg">
                {error}
              </div>
            )}
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
              disabled={isLoading}
              className="w-full bg-brand-lime hover:bg-[#93B200] text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-brand-lime/20 disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
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
    </div>
  );
};

const SignUpPage = ({ onSignUp, onNavigateToLogin }: { onSignUp: (user: User) => void, onNavigateToLogin: () => void }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        onSignUp(data);
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F9FAFB]">
      {/* Left Side: Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img 
          src="https://prstation-dev.s3.ap-northeast-1.amazonaws.com/uploads/companies/336/1724250725.jpg/PthOW1RBwXeQstR8lgCcitE5tGGgMD6OHbr9n0jZ.jpg" 
          alt="Signup Background" 
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-brand-lime/20 backdrop-blur-[1px]"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white bg-black/40 backdrop-blur-[2px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-center max-w-lg"
          >
            <h2 className="text-6xl font-bold mb-6 font-display leading-[1.1] tracking-tight drop-shadow-lg">
              Join Our Professional<br />
              <span className="text-brand-lime">Network</span>
            </h2>
            <p className="text-xl opacity-90 font-medium leading-relaxed drop-shadow-md">
              Create an account to start managing your inventory with our state-of-the-art system.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-12 overflow-y-auto">
        {/* Logo Section */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="https://cdn.digitalmindsbpo.com/storage/2021/11/cropped-Digital_Minds_Logo_Original.png" 
              alt="Digital Minds Logo" 
              className="h-20 lg:h-24 w-auto object-contain"
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
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-lg">
                {error}
              </div>
            )}
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
              disabled={isLoading}
              className="w-full bg-brand-lime hover:bg-[#93B200] text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-brand-lime/20 mt-2 disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
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
    </div>
  );
};

const ItemDetailsModal = ({ 
  isOpen, 
  onClose, 
  onEdit,
  item 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onEdit: (item: InventoryItem) => void,
  item?: InventoryItem 
}) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-800 font-display">{item.name}</h3>
            <p className="text-xs text-slate-400 font-mono mt-1">SKU: {item.sku}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Item Information</label>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-sm text-slate-500">Category</span>
                  <span className="text-sm font-bold text-slate-800">{item.category}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-sm text-slate-500">Location</span>
                  <span className="text-sm font-bold text-slate-800">{item.location || 'Not Specified'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-sm text-slate-500">Unit Price</span>
                  <span className="text-sm font-bold text-slate-800">${item.price.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Stock Details</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-400 mb-1">Current Quantity</p>
                  <p className="text-2xl font-bold text-slate-800">{item.quantity}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-400 mb-1">Minimum Stock</p>
                  <p className="text-2xl font-bold text-slate-800">{item.minStock}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description</label>
              <div className="p-4 bg-slate-50 rounded-xl min-h-[100px]">
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.description || 'No description provided for this item.'}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Current Status</label>
              <div className="flex items-center gap-3">
                <StatusBadge status={item.status} />
                <span className="text-xs text-slate-400 italic">Last updated: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
          >
            Close
          </button>
          <button 
            onClick={() => {
              onClose();
              onEdit(item);
            }}
            className="px-6 py-2 bg-brand-lime text-white rounded-lg text-sm font-bold hover:bg-[#93B200] transition-colors shadow-lg shadow-brand-lime/20"
          >
            Edit Item
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Dashboard = ({ user, onLogout, onUpdateUser }: { user: User, onLogout: () => void, onUpdateUser: (user: User) => void }) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [sortConfig, setSortConfig] = useState<{ key: keyof InventoryItem, direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'assignments' | 'maintenance' | 'requests' | 'reports' | 'settings'>('dashboard');
  const [assignments, setAssignments] = useState<AssetAssignment[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [userAvatar, setUserAvatar] = useState<string | null>(user.avatar);
  const [profileName, setProfileName] = useState(user.fullName);
  const [profileEmail, setProfileEmail] = useState(user.email);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [settingsTab, setSettingsTab] = useState('Profile');
  const [categories, setCategories] = useState<string[]>([]);
  const [assignmentView, setAssignmentView] = useState<'active' | 'history'>('active');
  const [reportStartDate, setReportStartDate] = useState<string>('');
  const [reportEndDate, setReportEndDate] = useState<string>('');

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800 * 1024) {
        alert('File size exceeds 800K limit');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setUserAvatar(base64);
        // Auto-save avatar
        try {
          const response = await fetch(`/api/users/${user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...user, avatar: base64 }),
          });
          const updatedUser = await response.json();
          onUpdateUser(updatedUser);
        } catch (err) {
          console.error('Failed to update avatar:', err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, fullName: profileName, email: profileEmail, avatar: userAvatar }),
      });
      const updatedUser = await response.json();
      onUpdateUser(updatedUser);
      alert('Profile updated successfully');
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | undefined>(undefined);

  useEffect(() => {
    fetchInventory();
    fetchActivity();
    fetchAssignments();
    fetchMaintenance();
    fetchRequests();
    fetchCategories();
  }, []);

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/inventory');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/assignments');
      const data = await response.json();
      setAssignments(data);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    }
  };

  const fetchMaintenance = async () => {
    try {
      const response = await fetch('/api/maintenance');
      const data = await response.json();
      setMaintenance(data);
    } catch (error) {
      console.error('Failed to fetch maintenance:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/requests');
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
  };

  const fetchActivity = async () => {
    try {
      const response = await fetch('/api/activity');
      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error('Failed to fetch activity:', error);
    }
  };

  const stats = {
    total: items.length,
    lowStock: items.filter(i => i.status === 'Low Stock').length,
    outOfStock: items.filter(i => i.status === 'Out of Stock').length,
    totalValue: items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0)
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    const aValue = a[key];
    const bValue = b[key];

    if (aValue === undefined || bValue === undefined) return 0;

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const paginatedItems = sortedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const requestSort = (key: keyof InventoryItem) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const downloadCSV = () => {
    const headers = ['Name', 'SKU', 'Category', 'Quantity', 'Min Stock', 'Price', 'Status', 'Location'];
    const csvContent = [
      headers.join(','),
      ...filteredItems.map(item => [
        `"${item.name}"`,
        `"${item.sku}"`,
        `"${item.category}"`,
        item.quantity,
        item.minStock,
        item.price,
        `"${item.status}"`,
        `"${item.location || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = async (reportTitle: string = 'Inventory Report') => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    try {
      // --- Header Section ---
      // Add logo (centered)
      const imgWidth = 60;
      const imgHeight = 15;
      const xPos = (pageWidth - imgWidth) / 2;
      doc.addImage(logoBase64, 'PNG', xPos, 15, imgWidth, imgHeight);
      
      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59); // slate-800
      const titleWidth = doc.getTextWidth(reportTitle);
      doc.text(reportTitle, (pageWidth - titleWidth) / 2, 45);
      
      // Separator Line
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.5);
      doc.line(14, 52, pageWidth - 14, 52);

      // --- Meta Information ---
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139); // slate-500
      
      const dateText = (reportStartDate && reportEndDate) 
        ? `Date Range: ${reportStartDate} to ${reportEndDate}`
        : `Generated on: ${new Date().toLocaleDateString()}`;
      doc.text(dateText, 14, 60);
      
      doc.text(`Generated by: ${user.fullName} (Admin)`, pageWidth - 14, 60, { align: 'right' });

      // --- Summary Section (Optional based on report type) ---
      let startY = 70;
      if (reportTitle === 'Inventory Report' || reportTitle === 'Asset Summary Report' || reportTitle === 'Inventory Valuation' || reportTitle === 'Full System Report') {
        const totalItems = filteredItems.reduce((acc, item) => acc + item.quantity, 0);
        const totalValue = filteredItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        
        doc.setFillColor(248, 250, 252); // slate-50
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.roundedRect(14, 65, pageWidth - 28, 20, 2, 2, 'FD');
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text(`Total Assets: ${filteredItems.length}`, 20, 73);
        doc.text(`Total Items in Stock: ${totalItems}`, 20, 80);
        
        doc.text(`Total Inventory Value: $${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth / 2, 76);
        
        startY = 95;
      }

      // --- Table Data ---
      let tableColumn: string[] = [];
      let tableRows: any[] = [];

      if (reportTitle === 'Assignment History') {
        tableColumn = ["Asset Name", "Work Station Area", "Assigned Date", "Return Date", "Status"];
        tableRows = assignments.map(a => [
          a.itemName,
          a.workStationArea,
          new Date(a.assignedDate).toLocaleDateString(),
          a.returnDate ? new Date(a.returnDate).toLocaleDateString() : '-',
          a.status
        ]);
      } else if (reportTitle === 'Maintenance Report') {
        tableColumn = ["Asset Name", "Request Date", "Remarks", "Status"];
        tableRows = maintenance.map(m => [
          m.itemName,
          new Date(m.requestDate).toLocaleDateString(),
          m.remarks,
          m.status
        ]);
      } else {
        // Default to Inventory Summary
        tableColumn = ["Name", "SKU", "Category", "Qty", "Price", "Total Value", "Status"];
        tableRows = filteredItems.map(item => [
          item.name,
          item.sku,
          item.category,
          item.quantity.toString(),
          `$${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          `$${(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          item.status
        ]);
      }

      // --- Table Rendering ---
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: startY,
        theme: 'grid',
        styles: { 
          fontSize: 9, 
          cellPadding: 4,
          font: 'helvetica',
          lineColor: [226, 232, 240], // slate-200
          lineWidth: 0.1,
          textColor: [71, 85, 105] // slate-600
        },
        headStyles: { 
          fillColor: [241, 245, 249], // slate-100
          textColor: [30, 41, 59], // slate-800
          fontStyle: 'bold',
          halign: 'left'
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250]
        },
        didDrawPage: function (data: any) {
          // --- Footer ---
          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.5);
          doc.line(14, pageHeight - 20, pageWidth - 14, pageHeight - 20);
          
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(148, 163, 184); // slate-400
          
          doc.text('Digital Minds BPO Services Incorporated', 14, pageHeight - 12);
          doc.text(`Page ${data.pageNumber}`, pageWidth - 14, pageHeight - 12, { align: 'right' });
        }
      });

      doc.save(`${reportTitle.toLowerCase().replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
    }
  };

  const handleSaveItem = async (data: Partial<InventoryItem>) => {
    const status = calculateStatus(data.quantity || 0, data.minStock || 0);
    
    try {
      if (editingItem) {
        const updatedItem = { ...editingItem, ...data, status };
        await fetch(`/api/inventory/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedItem),
        });
      } else {
        const newItem: InventoryItem = {
          id: Math.random().toString(36).substr(2, 9),
          name: data.name || '',
          sku: data.sku || '',
          category: data.category || '',
          quantity: data.quantity || 0,
          minStock: data.minStock || 0,
          price: data.price || 0,
          location: data.location || '',
          description: data.description || '',
          status
        };
        await fetch('/api/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItem),
        });
      }
      await fetchInventory();
      await fetchActivity();
    } catch (error) {
      console.error('Failed to save item:', error);
    }
    
    setIsModalOpen(false);
    setEditingItem(undefined);
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
        await fetchInventory();
        await fetchActivity();
      } catch (error) {
        console.error('Failed to delete item:', error);
      }
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

  const openDetailsModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDetailsModalOpen(true);
  };

  const openDetailsById = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      setSelectedItem(item);
      setIsDetailsModalOpen(true);
    }
  };

  const handleUpdateAssignment = async (id: string, status: AssetAssignment['status']) => {
    try {
      await fetch(`/api/assignments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, returnDate: status !== 'Assigned' ? new Date().toISOString() : null }),
      });
      fetchAssignments();
      fetchInventory();
      fetchActivity();
    } catch (error) {
      console.error('Failed to update assignment:', error);
    }
  };

  const handleUpdateMaintenance = async (id: string, status: MaintenanceRecord['status']) => {
    try {
      await fetch(`/api/maintenance/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchMaintenance();
      fetchInventory();
      fetchActivity();
    } catch (error) {
      console.error('Failed to update maintenance:', error);
    }
  };

  const handleUpdateRequest = async (id: string, status: AssetRequest['status']) => {
    const adminRemarks = prompt('Enter admin remarks (optional):') || '';
    try {
      await fetch(`/api/requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminRemarks }),
      });
      fetchRequests();
      fetchActivity();
    } catch (error) {
      console.error('Failed to update request:', error);
    }
  };

  const handleAssignAsset = async (item: InventoryItem) => {
    const workStationArea = prompt('Enter work station area to assign this asset:');
    if (!workStationArea) return;

    try {
      await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: Math.random().toString(36).substr(2, 9),
          itemId: item.id,
          itemName: item.name,
          workStationArea,
          status: 'Assigned'
        }),
      });
      fetchAssignments();
      fetchInventory();
      fetchActivity();
    } catch (error) {
      console.error('Failed to assign asset:', error);
    }
  };

  const handleRequestMaintenance = async (item: InventoryItem) => {
    const remarks = prompt('Enter maintenance remarks:');
    if (!remarks) return;

    try {
      await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: Math.random().toString(36).substr(2, 9),
          itemId: item.id,
          itemName: item.name,
          status: 'Pending',
          remarks
        }),
      });
      fetchMaintenance();
      fetchInventory();
      fetchActivity();
    } catch (error) {
      console.error('Failed to request maintenance:', error);
    }
  };

  const handleAddCategory = async () => {
    const name = prompt('Enter new category name:');
    if (name && !categories.includes(name)) {
      try {
        await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });
        fetchCategories();
      } catch (error) {
        console.error('Failed to add category:', error);
      }
    }
  };

  const handleDeleteCategory = async (name: string) => {
    if (confirm(`Are you sure you want to delete the category "${name}"?`)) {
      try {
        await fetch(`/api/categories/${encodeURIComponent(name)}`, {
          method: 'DELETE',
        });
        fetchCategories();
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  // Chart Data

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
            icon={<UserPlus size={20} />} 
            label="Assignments" 
            active={activeTab === 'assignments'} 
            isOpen={isSidebarOpen} 
            onClick={() => { setActiveTab('assignments'); setIsMobileMenuOpen(false); }}
          />
          <SidebarItem 
            icon={<Wrench size={20} />} 
            label="Maintenance" 
            active={activeTab === 'maintenance'} 
            isOpen={isSidebarOpen} 
            onClick={() => { setActiveTab('maintenance'); setIsMobileMenuOpen(false); }}
          />
          <SidebarItem 
            icon={<ClipboardList size={20} />} 
            label="Requests" 
            active={activeTab === 'requests'} 
            isOpen={isSidebarOpen} 
            onClick={() => { setActiveTab('requests'); setIsMobileMenuOpen(false); }}
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
                <p className="text-sm font-bold text-slate-800">{user.fullName}</p>
                <p className="text-xs text-slate-500">Inventory Manager</p>
              </div>
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-brand-lime rounded-full flex items-center justify-center text-white font-bold text-sm lg:text-base overflow-hidden">
                {userAvatar ? (
                  <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-brand-lime border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-slate-600">Loading Database...</p>
              </div>
            </div>
          )}
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
                    <button 
                      onClick={() => setActiveTab('reports')}
                      className="text-brand-lime text-sm font-bold hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {activities.length > 0 ? (
                      activities.map((activity, i) => (
                        <div key={i} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm">
                            {activity.user[0]}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-slate-800">
                              <span className="font-bold">{activity.user}</span> {activity.action} <span className="font-bold text-brand-lime">{activity.item}</span>
                            </p>
                            <p className="text-xs text-slate-400">
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <ChevronRight size={16} className="text-slate-300" />
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-400 text-sm italic">
                        No recent activity recorded.
                      </div>
                    )}
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
                      <button 
                        onClick={downloadCSV}
                        className="hidden sm:flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                      >
                        <Download size={16} /> Export
                      </button>
                      <div className="relative">
                        <button 
                          onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                          className={`flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-sm font-semibold transition-all ${isFilterMenuOpen || filterCategory !== 'All' || filterStatus !== 'All' ? 'bg-brand-lime/10 border-brand-lime text-brand-lime' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                          <Filter size={16} /> Filter
                          {(filterCategory !== 'All' || filterStatus !== 'All') && (
                            <span className="w-2 h-2 bg-brand-lime rounded-full"></span>
                          )}
                        </button>
                        
                        <AnimatePresence>
                          {isFilterMenuOpen && (
                            <>
                              <div className="fixed inset-0 z-[60]" onClick={() => setIsFilterMenuOpen(false)}></div>
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 z-[70] p-4 space-y-4"
                              >
                                <div>
                                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                                  <select 
                                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-lime/20"
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                  >
                                    <option value="All">All Categories</option>
                                    {categories.map(cat => (
                                      <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</label>
                                  <select 
                                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-lime/20"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                  >
                                    <option value="All">All Statuses</option>
                                    <option value="In Stock">In Stock</option>
                                    <option value="Low Stock">Low Stock</option>
                                    <option value="Out of Stock">Out of Stock</option>
                                    <option value="Under Repair">Under Repair</option>
                                    <option value="Assigned">Assigned</option>
                                  </select>
                                </div>
                                <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                                  <button 
                                    onClick={() => {
                                      setFilterCategory('All');
                                      setFilterStatus('All');
                                      setIsFilterMenuOpen(false);
                                    }}
                                    className="text-xs font-bold text-slate-400 hover:text-slate-600"
                                  >
                                    Reset Filters
                                  </button>
                                  <button 
                                    onClick={() => setIsFilterMenuOpen(false)}
                                    className="px-3 py-1.5 bg-brand-lime text-white rounded-lg text-xs font-bold"
                                  >
                                    Apply
                                  </button>
                                </div>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
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
                          <th 
                            className="px-4 lg:px-6 py-4 font-semibold cursor-pointer hover:text-brand-lime transition-colors"
                            onClick={() => requestSort('name')}
                          >
                            <div className="flex items-center gap-1">
                              Item Name {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                            </div>
                          </th>
                          <th 
                            className="px-4 lg:px-6 py-4 font-semibold cursor-pointer hover:text-brand-lime transition-colors"
                            onClick={() => requestSort('sku')}
                          >
                            <div className="flex items-center gap-1">
                              SKU {sortConfig?.key === 'sku' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                            </div>
                          </th>
                          <th 
                            className="px-4 lg:px-6 py-4 font-semibold cursor-pointer hover:text-brand-lime transition-colors"
                            onClick={() => requestSort('category')}
                          >
                            <div className="flex items-center gap-1">
                              Category {sortConfig?.key === 'category' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                            </div>
                          </th>
                          <th 
                            className="px-4 lg:px-6 py-4 font-semibold cursor-pointer hover:text-brand-lime transition-colors"
                            onClick={() => requestSort('quantity')}
                          >
                            <div className="flex items-center gap-1">
                              Quantity {sortConfig?.key === 'quantity' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                            </div>
                          </th>
                          <th 
                            className="px-4 lg:px-6 py-4 font-semibold cursor-pointer hover:text-brand-lime transition-colors"
                            onClick={() => requestSort('price')}
                          >
                            <div className="flex items-center gap-1">
                              Price {sortConfig?.key === 'price' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                            </div>
                          </th>
                          <th 
                            className="px-4 lg:px-6 py-4 font-semibold cursor-pointer hover:text-brand-lime transition-colors"
                            onClick={() => requestSort('status')}
                          >
                            <div className="flex items-center gap-1">
                              Status {sortConfig?.key === 'status' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                            </div>
                          </th>
                          <th className="px-4 lg:px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paginatedItems.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-4 lg:px-6 py-4">
                              <div 
                                className="font-semibold text-slate-800 text-sm lg:text-base cursor-pointer hover:text-brand-lime transition-colors"
                                onClick={() => openDetailsModal(item)}
                              >
                                {item.name}
                              </div>
                              {item.location && <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5"><MapPin size={10} /> {item.location}</div>}
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
                              <div className="flex items-center justify-end gap-1 lg:gap-2 transition-opacity">
                                <button 
                                  onClick={() => openDetailsModal(item)}
                                  className="p-2 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <Eye size={16} />
                                </button>
                                <button 
                                  onClick={() => openEditModal(item)}
                                  className="p-2 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors"
                                  title="Edit Item"
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
                    <p>Showing {Math.min(paginatedItems.length, itemsPerPage)} of {filteredItems.length} items</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-white transition-colors"
                      >
                        Previous
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === page ? 'bg-brand-lime text-white' : 'hover:bg-slate-100 text-slate-500'}`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="px-3 py-1 border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-white transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'assignments' && (
              <motion.div
                key="assignments-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <h3 className="font-bold text-slate-800 font-display">Asset Assignments</h3>
                      <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button 
                          onClick={() => setAssignmentView('active')}
                          className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${assignmentView === 'active' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          Active
                        </button>
                        <button 
                          onClick={() => setAssignmentView('history')}
                          className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${assignmentView === 'history' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          History
                        </button>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsAssignModalOpen(true)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-lime text-white rounded-lg text-sm font-bold hover:bg-[#93B200] transition-colors shadow-lg shadow-brand-lime/20"
                    >
                      <Plus size={16} /> Assign Asset
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                          <th className="px-6 py-4 font-semibold">Asset Name</th>
                          <th className="px-6 py-4 font-semibold">Work Station Area</th>
                          <th className="px-6 py-4 font-semibold">Assigned Date</th>
                          {assignmentView === 'history' && <th className="px-6 py-4 font-semibold">Returned Date</th>}
                          <th className="px-6 py-4 font-semibold">Status</th>
                          <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {assignments.filter(a => assignmentView === 'active' ? a.status === 'Assigned' : a.status !== 'Assigned').map((assignment) => (
                          <tr key={assignment.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-semibold text-slate-800">{assignment.itemName}</td>
                            <td className="px-6 py-4 text-slate-600">{assignment.workStationArea}</td>
                            <td className="px-6 py-4 text-slate-500 text-sm">{new Date(assignment.assignedDate).toLocaleDateString()}</td>
                            {assignmentView === 'history' && (
                              <td className="px-6 py-4 text-slate-500 text-sm">
                                {assignment.returnDate ? new Date(assignment.returnDate).toLocaleDateString() : '-'}
                              </td>
                            )}
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
                                assignment.status === 'Assigned' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                assignment.status === 'Returned' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                'bg-red-50 text-red-600 border-red-100'
                              }`}>
                                {assignment.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {assignment.status === 'Assigned' && (
                                  <>
                                    <button 
                                      onClick={() => handleUpdateAssignment(assignment.id, 'Returned')}
                                      className="text-xs font-bold text-brand-lime hover:underline"
                                    >
                                      Return
                                    </button>
                                    <button 
                                      onClick={() => handleUpdateAssignment(assignment.id, 'Lost')}
                                      className="text-xs font-bold text-red-500 hover:underline"
                                    >
                                      Lost/Damaged
                                    </button>
                                  </>
                                )}
                                <button 
                                  onClick={() => openDetailsById(assignment.itemId)}
                                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"
                                  title="View Asset Details"
                                >
                                  <History size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'maintenance' && (
              <motion.div
                key="maintenance-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800 font-display">Maintenance & Repairs</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                          <th className="px-6 py-4 font-semibold">Asset Name</th>
                          <th className="px-6 py-4 font-semibold">Request Date</th>
                          <th className="px-6 py-4 font-semibold">Status</th>
                          <th className="px-6 py-4 font-semibold">Remarks</th>
                          <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {maintenance.map((record) => (
                          <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-semibold text-slate-800">{record.itemName}</td>
                            <td className="px-6 py-4 text-slate-500 text-sm">{new Date(record.requestDate).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
                                record.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                record.status === 'Under Repair' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                record.status === 'Fixed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                'bg-red-50 text-red-600 border-red-100'
                              }`}>
                                {record.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-500 text-sm">{record.remarks}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {record.status === 'Pending' && (
                                  <>
                                    <button 
                                      onClick={() => handleUpdateMaintenance(record.id, 'Approved')}
                                      className="px-3 py-1 bg-emerald-500 text-white rounded text-xs font-bold"
                                    >
                                      Approve
                                    </button>
                                    <button 
                                      onClick={() => handleUpdateMaintenance(record.id, 'Rejected')}
                                      className="px-3 py-1 bg-red-500 text-white rounded text-xs font-bold"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                {record.status === 'Approved' && (
                                  <button 
                                    onClick={() => handleUpdateMaintenance(record.id, 'Under Repair')}
                                    className="px-3 py-1 bg-blue-500 text-white rounded text-xs font-bold"
                                  >
                                    Start Repair
                                  </button>
                                )}
                                {record.status === 'Under Repair' && (
                                  <button 
                                    onClick={() => handleUpdateMaintenance(record.id, 'Fixed')}
                                    className="px-3 py-1 bg-emerald-500 text-white rounded text-xs font-bold"
                                  >
                                    Mark Fixed
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'requests' && (
              <motion.div
                key="requests-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800 font-display">Work Station Area Asset Requests</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                          <th className="px-6 py-4 font-semibold">Work Station Area</th>
                          <th className="px-6 py-4 font-semibold">Requested Asset</th>
                          <th className="px-6 py-4 font-semibold">Request Date</th>
                          <th className="px-6 py-4 font-semibold">Status</th>
                          <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {requests.map((request) => (
                          <tr key={request.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-semibold text-slate-800">{request.workStationArea}</td>
                            <td className="px-6 py-4 text-slate-600">{request.itemName}</td>
                            <td className="px-6 py-4 text-slate-500 text-sm">{new Date(request.requestDate).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
                                request.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                request.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                'bg-red-50 text-red-600 border-red-100'
                              }`}>
                                {request.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {request.status === 'Pending' && (
                                  <>
                                    <button 
                                      onClick={() => handleUpdateRequest(request.id, 'Approved')}
                                      className="px-3 py-1 bg-emerald-500 text-white rounded text-xs font-bold"
                                    >
                                      Approve
                                    </button>
                                    <button 
                                      onClick={() => handleUpdateRequest(request.id, 'Rejected')}
                                      className="px-3 py-1 bg-red-500 text-white rounded text-xs font-bold"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                                  <Edit2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center max-w-4xl mx-auto">
                  <div className="w-16 h-16 bg-brand-lime/10 text-brand-lime rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2 font-display">System Reports</h3>
                  <p className="text-slate-500 mb-8">Generate and export comprehensive reports for your inventory and assets.</p>
                  
                  <div className="mb-8 p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={18} className="text-slate-400" />
                      <span className="text-sm font-bold text-slate-700">Date Range:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="date" 
                        value={reportStartDate}
                        onChange={(e) => setReportStartDate(e.target.value)}
                        className="px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-lime/20"
                      />
                      <span className="text-slate-400">to</span>
                      <input 
                        type="date" 
                        value={reportEndDate}
                        onChange={(e) => setReportEndDate(e.target.value)}
                        className="px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-lime/20"
                      />
                    </div>
                    {(reportStartDate || reportEndDate) && (
                      <button 
                        onClick={() => { setReportStartDate(''); setReportEndDate(''); }}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600 underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    {[
                      { title: 'Asset Summary Report', desc: 'Complete list of current stock levels and asset status', icon: <Package size={20} /> },
                      { title: 'Assignment History', desc: 'Track all asset movements and work station assignments', icon: <History size={20} /> },
                      { title: 'Maintenance Report', desc: 'Summary of all repairs, requests, and maintenance costs', icon: <Wrench size={20} /> },
                      { title: 'Inventory Valuation', desc: 'Financial breakdown of current inventory value', icon: <TrendingUp size={20} /> },
                    ].map((report, i) => (
                      <button 
                        key={i} 
                        onClick={() => downloadPDF(report.title)}
                        className="p-5 border border-slate-100 rounded-xl hover:border-brand-lime hover:bg-slate-50 transition-all group text-left flex items-start gap-4"
                      >
                        <div className="p-3 bg-slate-50 text-slate-400 group-hover:bg-brand-lime/10 group-hover:text-brand-lime rounded-lg transition-colors">
                          {report.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-800 group-hover:text-brand-lime transition-colors">{report.title}</span>
                            <Download size={18} className="text-slate-300 group-hover:text-brand-lime" />
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">{report.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button 
                      onClick={downloadCSV}
                      className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition-colors"
                    >
                      <FileSpreadsheet size={18} />
                      Export to CSV
                    </button>
                    <button 
                      onClick={() => downloadPDF('Inventory Report')}
                      className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition-colors"
                    >
                      <FileText size={18} />
                      Export to PDF
                    </button>
                    <button 
                      onClick={() => downloadPDF('Full System Report')}
                      className="w-full sm:w-auto px-8 py-3 bg-brand-lime text-white rounded-lg font-bold hover:bg-[#93B200] transition-colors shadow-lg shadow-brand-lime/20"
                    >
                      Generate Full Report
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
                {/* Module Tabs */}
                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit mb-6">
                  {['Profile', 'System', 'Categories', 'Users'].map((tab) => (
                    <button 
                      key={tab}
                      onClick={() => setSettingsTab(tab)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${settingsTab === tab ? 'bg-white text-brand-lime shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {settingsTab === 'Categories' && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-800 font-display">Manage Asset Categories</h3>
                      <button 
                        onClick={handleAddCategory}
                        className="text-brand-lime text-sm font-bold hover:underline flex items-center gap-1"
                      >
                        <Plus size={14} /> Add Category
                      </button>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {categories.map(cat => (
                          <div key={cat} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between group">
                            <span className="text-sm font-medium text-slate-700">{cat}</span>
                            <button 
                              onClick={() => handleDeleteCategory(cat)}
                              className="text-slate-300 hover:text-red-500 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {settingsTab === 'Profile' && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                      <h3 className="text-lg font-bold text-slate-800 font-display">Profile Settings</h3>
                    </div>
                    <div className="p-6 space-y-6">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-brand-lime rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                          {userAvatar ? (
                            <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
                          )}
                        </div>
                        <div>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleAvatarChange} 
                            className="hidden" 
                            accept="image/*"
                          />
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors"
                          >
                            Change Avatar
                          </button>
                          <p className="text-xs text-slate-400 mt-2">JPG, GIF or PNG. Max size of 800K</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                          <input 
                            type="text" 
                            value={profileName} 
                            onChange={(e) => setProfileName(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-brand-lime/20" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                          <input 
                            type="email" 
                            value={profileEmail} 
                            onChange={(e) => setProfileEmail(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-brand-lime/20" 
                          />
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end">
                        <button 
                          onClick={handleSaveProfile}
                          disabled={isSavingProfile}
                          className="px-6 py-2 bg-brand-lime text-white rounded-lg font-bold hover:bg-[#93B200] transition-colors shadow-lg shadow-brand-lime/20 disabled:opacity-50"
                        >
                          {isSavingProfile ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {settingsTab === 'System' && (
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
                        { icon: <Database size={20} />, title: 'System Configuration', desc: 'Manage global system settings and defaults', value: 'Configure' },
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
                            <button className="text-sm font-bold text-brand-lime hover:underline">{item.value}</button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {settingsTab === 'Users' && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">User Management</h3>
                    <p className="text-sm text-slate-500 mb-6">Manage system users, roles, and permissions.</p>
                    <button className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">
                      Coming Soon
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <ItemModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSave={handleSaveItem}
            categories={categories}
            initialData={editingItem}
          />

          <ItemDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            onEdit={(item) => {
              setEditingItem(item);
              setIsModalOpen(true);
            }}
            item={selectedItem}
          />

          {isAssignModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
              >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-800 font-display">Assign Asset</h3>
                  <button onClick={() => setIsAssignModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const itemId = formData.get('itemId') as string;
                  const workStationArea = formData.get('workStationArea') as string;
                  const item = items.find(i => i.id === itemId);
                  if (!item || !workStationArea) return;

                  try {
                    await fetch('/api/assignments', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        id: Math.random().toString(36).substr(2, 9),
                        itemId: item.id,
                        itemName: item.name,
                        workStationArea,
                        status: 'Assigned'
                      }),
                    });
                    fetchAssignments();
                    fetchInventory();
                    fetchActivity();
                    setIsAssignModalOpen(false);
                  } catch (error) {
                    console.error('Failed to assign asset:', error);
                  }
                }} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Select Asset</label>
                    <select 
                      name="itemId"
                      required
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime outline-none bg-white"
                    >
                      <option value="">Choose an available asset...</option>
                      {items.filter(i => i.quantity > 0).map(item => (
                        <option key={item.id} value={item.id}>{item.name} ({item.sku}) - Qty: {item.quantity}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Work Station Area</label>
                    <input 
                      type="text" 
                      name="workStationArea"
                      required
                      placeholder="Enter work station area"
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime outline-none"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button"
                      onClick={() => setIsAssignModalOpen(false)}
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 px-4 py-2 bg-brand-lime text-white rounded-lg font-bold hover:bg-[#93B200] transition-colors shadow-lg shadow-brand-lime/20"
                    >
                      Assign
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
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
    'Out of Stock': 'bg-red-50 text-red-600 border-red-100',
    'Under Repair': 'bg-purple-50 text-purple-600 border-purple-100',
    'Assigned': 'bg-blue-50 text-blue-600 border-blue-100'
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border tracking-wider uppercase font-display ${styles[status]}`}>
      {status}
    </span>
  );
};

export default function App() {
  const [view, setView] = useState<'login' | 'signup' | 'dashboard'>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('login');
  };

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
              onLogin={handleAuthSuccess} 
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
              onSignUp={handleAuthSuccess} 
              onNavigateToLogin={() => setView('login')}
            />
          </motion.div>
        )}
        {view === 'dashboard' && currentUser && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Dashboard 
              user={currentUser} 
              onLogout={handleLogout} 
              onUpdateUser={setCurrentUser}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
