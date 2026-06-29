import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Bar,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { 
  Calendar, 
  UserPlus, 
  Search, 
  Filter, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  Building2,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';

interface AdminChartsProps {
  users: any[];
  bookings: any[];
}

export default function AdminCharts({ users, bookings }: AdminChartsProps) {
  // --- Date Range States for Daily New Member Registrations ---
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30); // Default: Last 30 days
    return d.toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  // Pagination State for registration list
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  // Helper to safely parse any date format from database
  const parseUserDate = (dateVal: any): Date | null => {
    if (!dateVal) return null;
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? null : d;
  };

  // Quick Filter handlers
  const handleQuickFilter = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
    setCurrentPage(1);
  };

  const handleThisMonthFilter = () => {
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth(), 1);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
    setCurrentPage(1);
  };

  const handleAllTimeFilter = () => {
    if (users.length === 0) {
      handleQuickFilter(365);
      return;
    }
    const dates = users
      .map(u => parseUserDate(u.createdAt))
      .filter((d): d is Date => d !== null);
      
    if (dates.length === 0) {
      handleQuickFilter(365);
      return;
    }
    
    const earliest = new Date(Math.min(...dates.map(d => d.getTime())));
    setStartDate(earliest.toISOString().split('T')[0]);
    setEndDate(new Date().toISOString().split('T')[0]);
    setCurrentPage(1);
  };

  // --- Filter and process user data for the selected period ---
  const filteredUsersForPeriod = useMemo(() => {
    const startBound = new Date(startDate + 'T00:00:00');
    const endBound = new Date(endDate + 'T23:59:59');

    return users.filter(user => {
      const userDate = parseUserDate(user.createdAt);
      if (!userDate) return false;
      
      // Date range check
      if (userDate < startBound || userDate > endBound) return false;
      
      // Role filter check
      if (roleFilter !== 'all' && user.role !== roleFilter) return false;
      
      // Search term check
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const name = (user.displayName || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        const mobile = (user.mobileNumber || '').toLowerCase();
        const regId = (user.registrationId || '').toLowerCase();
        
        if (!name.includes(term) && !email.includes(term) && !mobile.includes(term) && !regId.includes(term)) {
          return false;
        }
      }

      return true;
    });
  }, [users, startDate, endDate, roleFilter, searchTerm]);

  // --- Generate registration trend chart data for Recharts ---
  const chartData = useMemo(() => {
    // Generate array of all YYYY-MM-DD dates in the range
    const dates: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Prevent browser crash for accidental huge date range
    let safetyCounter = 0;
    const current = new Date(start);
    while (current <= end && safetyCounter < 366) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
      safetyCounter++;
    }

    // Map each date to registration counts
    return dates.map(dateYMD => {
      const dayUsers = users.filter(user => {
        const uDate = parseUserDate(user.createdAt);
        if (!uDate) return false;
        return uDate.toISOString().split('T')[0] === dateYMD;
      });

      const formattedLabel = format(new Date(dateYMD + 'T00:00:00'), 'dd MMM');

      return {
        dateYMD,
        date: formattedLabel,
        Owners: dayUsers.filter(u => u.role === 'owner').length,
        Providers: dayUsers.filter(u => u.role === 'provider').length,
        Total: dayUsers.length
      };
    });
  }, [users, startDate, endDate]);

  // --- Dynamic Stats calculation ---
  const stats = useMemo(() => {
    const total = filteredUsersForPeriod.length;
    const owners = filteredUsersForPeriod.filter(u => u.role === 'owner').length;
    const providers = filteredUsersForPeriod.filter(u => u.role === 'provider').length;
    
    // Days in interval
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    const avgPerDay = total / (diffDays || 1);

    return {
      total,
      owners,
      providers,
      avgPerDay: avgPerDay.toFixed(1),
      diffDays
    };
  }, [filteredUsersForPeriod, startDate, endDate]);

  // Pagination processing
  const totalPages = Math.ceil(filteredUsersForPeriod.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsersForPeriod.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsersForPeriod, currentPage]);

  const activeQuickFilter = useMemo(() => {
    const todayYMD = new Date().toISOString().split('T')[0];
    const d7 = new Date(); d7.setDate(d7.getDate() - 7); const d7YMD = d7.toISOString().split('T')[0];
    const d30 = new Date(); d30.setDate(d30.getDate() - 30); const d30YMD = d30.toISOString().split('T')[0];
    const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    if (startDate === todayYMD && endDate === todayYMD) return 'today';
    if (startDate === d7YMD && endDate === todayYMD) return '7days';
    if (startDate === d30YMD && endDate === todayYMD) return '30days';
    if (startDate === currentMonthStart && endDate === todayYMD) return 'month';
    return 'custom';
  }, [startDate, endDate]);

  return (
    <div className="space-y-10">
      {/* Existing Summary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="admin-summary-charts-grid">
        {/* User Distribution Card */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm transition-all hover:shadow-md">
          <h4 className="text-lg font-bold text-gray-900 mb-2">User Distribution</h4>
          <p className="text-xs text-gray-500 mb-6 font-medium">All-time ratio of registered Owners and Service Providers</p>
          <div className="h-[280px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height={280} debounce={50}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Owners', value: users.filter(u => u.role === 'owner').length },
                    { name: 'Providers', value: users.filter(u => u.role === 'provider').length }
                  ]}
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#f97316" /> {/* Orange for Owners */}
                  <Cell fill="#0ea5e9" /> {/* Sky Blue for Providers */}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }} 
                  itemStyle={{ fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Custom Legend */}
            <div className="flex flex-col space-y-3 pl-4">
              <div className="flex items-center space-x-3">
                <span className="w-4 h-4 rounded-full bg-orange-500 block"></span>
                <div>
                  <div className="text-xs font-bold text-gray-500">Owners</div>
                  <div className="text-sm font-black text-gray-900">
                    {users.filter(u => u.role === 'owner').length}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="w-4 h-4 rounded-full bg-sky-500 block"></span>
                <div>
                  <div className="text-xs font-bold text-gray-500">Providers</div>
                  <div className="text-sm font-black text-gray-900">
                    {users.filter(u => u.role === 'provider').length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Booking Status Card */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm transition-all hover:shadow-md">
          <h4 className="text-lg font-bold text-gray-900 mb-2">Booking Status</h4>
          <p className="text-xs text-gray-500 mb-6 font-medium">Breakdown of booking statuses and financial confirmations</p>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height={280} debounce={50}>
              <BarChart data={[
                { name: 'Total', count: bookings.length },
                { name: 'Completed', count: bookings.filter(b => {
                  const bTotal = Number(b.updatedAmount || b.totalAmount || 0);
                  const bPaid = (b.payments || []).reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
                  return (bPaid >= (bTotal - 0.1) && bTotal > 0) || b.status === 'completed' || b.status === 'paid' || b.paymentStatus === 'Paid';
                }).length },
                { name: 'Pending', count: bookings.filter(b => (!b.paymentStatus || b.paymentStatus === 'Pending') && b.status !== 'cancelled' && b.status !== 'completed' && b.status !== 'paid').length },
                { name: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#9ca3af' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip 
                  cursor={{ fill: '#f97316', opacity: 0.05 }}
                  contentStyle={{ background: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="count" fill="#f97316" radius={[8, 8, 0, 0]} barSize={40}>
                  {/* Color each bar distinctly if wanted, but orange matches style */}
                  <Cell fill="#4f46e5" /> {/* Purplish/Indigo for Total */}
                  <Cell fill="#10b981" /> {/* Green for Completed */}
                  <Cell fill="#f59e0b" /> {/* Amber for Pending */}
                  <Cell fill="#ef4444" /> {/* Red for Cancelled */}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* NEW SECTION: DAILY MEMBER REGISTRATION DASHBOARD WITH DATE FILTER */}
      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8" id="daily-member-registration-dashboard">
        {/* Header and Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 border-b border-gray-100 pb-8">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-orange-100 text-orange-600 p-2.5 rounded-2xl">
                <UserPlus size={24} />
              </div>
              <h3 className="text-2xl font-black text-gray-900">Daily Member Registrations</h3>
            </div>
            <p className="text-sm text-gray-500 font-medium">
              Monitor daily sign-ups, track owner vs. provider registrations, and analyze historical registration trends.
            </p>
          </div>

          {/* Filters Interface */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-stretch sm:items-center">
            {/* Quick Filters */}
            <div className="flex flex-wrap gap-1.5 p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
              <button 
                onClick={() => handleQuickFilter(0)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeQuickFilter === 'today' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Today
              </button>
              <button 
                onClick={() => handleQuickFilter(7)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeQuickFilter === '7days' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                7 Days
              </button>
              <button 
                onClick={() => handleQuickFilter(30)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeQuickFilter === '30days' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                30 Days
              </button>
              <button 
                onClick={handleThisMonthFilter}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeQuickFilter === 'month' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                This Month
              </button>
              <button 
                onClick={handleAllTimeFilter}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeQuickFilter === 'custom' && startDate === '2020-01-01' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All Time
              </button>
            </div>

            {/* Custom Date Inputs */}
            <div className="flex items-center space-x-2 bg-white rounded-2xl border border-gray-100 p-1.5 shadow-sm">
              <div className="flex items-center space-x-1.5 px-2">
                <Calendar size={14} className="text-gray-400" />
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={e => { setStartDate(e.target.value); setCurrentPage(1); }}
                  className="text-xs font-bold text-gray-700 focus:outline-none cursor-pointer"
                />
              </div>
              <span className="text-xs font-black text-gray-300">to</span>
              <div className="flex items-center space-x-1.5 px-2">
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={e => { setEndDate(e.target.value); setCurrentPage(1); }}
                  className="text-xs font-bold text-gray-700 focus:outline-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Key Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-3xl border border-orange-100/50 shadow-sm relative overflow-hidden">
            <div className="absolute right-4 top-4 text-orange-200">
              <UserPlus size={44} strokeWidth={1} />
            </div>
            <div className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2">Total Registrations</div>
            <div className="text-3xl font-black text-gray-900">{stats.total}</div>
            <div className="mt-2 text-xs text-gray-500 font-medium">Joined in selected {stats.diffDays} days</div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-white p-6 rounded-3xl border border-amber-100/50 shadow-sm relative overflow-hidden">
            <div className="absolute right-4 top-4 text-amber-200">
              <Building2 size={44} strokeWidth={1} />
            </div>
            <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">New Owners</div>
            <div className="text-3xl font-black text-gray-900">{stats.owners}</div>
            <div className="mt-2 text-xs text-gray-500 font-medium">
              {stats.total > 0 ? ((stats.owners / stats.total) * 100).toFixed(0) : 0}% of registrations
            </div>
          </div>

          <div className="bg-gradient-to-br from-sky-50 to-white p-6 rounded-3xl border border-sky-100/50 shadow-sm relative overflow-hidden">
            <div className="absolute right-4 top-4 text-sky-200">
              <Briefcase size={44} strokeWidth={1} />
            </div>
            <div className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-2">New Providers</div>
            <div className="text-3xl font-black text-gray-900">{stats.providers}</div>
            <div className="mt-2 text-xs text-gray-500 font-medium">
              {stats.total > 0 ? ((stats.providers / stats.total) * 100).toFixed(0) : 0}% of registrations
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-3xl border border-indigo-100/50 shadow-sm relative overflow-hidden">
            <div className="absolute right-4 top-4 text-indigo-200">
              <TrendingUp size={44} strokeWidth={1} />
            </div>
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">Sign-ups / Day</div>
            <div className="text-3xl font-black text-gray-900">{stats.avgPerDay}</div>
            <div className="mt-2 text-xs text-gray-500 font-medium">Average dynamic registration speed</div>
          </div>
        </div>

        {/* Daily Trend Registration Chart */}
        <div className="bg-gray-50/50 p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
            <div>
              <h4 className="text-base font-bold text-gray-900">Registration Speed Trend</h4>
              <p className="text-xs text-gray-500 font-medium">Daily visualization of incoming members separated by operational role</p>
            </div>
            {/* Custom chart legend */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 block"></span>
                <span>Owners</span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs font-bold text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 block"></span>
                <span>Providers</span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs font-bold text-gray-600 border-l pl-4 border-gray-200">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 block"></span>
                <span>Total Joiners</span>
              </div>
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height={280} debounce={50}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorOwners" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProviders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9ca3af' }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip 
                  contentStyle={{ background: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  labelStyle={{ fontWeight: 'black', color: '#111827', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="Owners" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorOwners)" />
                <Area type="monotone" dataKey="Providers" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorProviders)" />
                <Area type="monotone" dataKey="Total" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Registered Members Table list for period */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h4 className="text-base font-bold text-gray-900">Period Registrants Log</h4>
              <p className="text-xs text-gray-500 font-medium">Detailed roster of the {filteredUsersForPeriod.length} members matching filters</p>
            </div>
            
            {/* Table search and filters */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              {/* Role filter select */}
              <div className="relative">
                <select 
                  value={roleFilter} 
                  onChange={e => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full sm:w-auto appearance-none bg-white border border-gray-100 rounded-xl px-4 py-2.5 pr-8 text-xs font-bold text-gray-700 shadow-sm focus:outline-none focus:border-orange-300 focus:ring focus:ring-orange-100 cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="owner">Venue Owners</option>
                  <option value="provider">Service Providers</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <Filter size={12} />
                </div>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search by name, email, phone..."
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-white border border-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-gray-700 shadow-sm focus:outline-none focus:border-orange-300 focus:ring focus:ring-orange-100"
                />
              </div>
            </div>
          </div>

          {/* Members Table */}
          <div className="overflow-x-auto border border-gray-100 rounded-2xl bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">R-ID / Member</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Mobile No.</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Email Address</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Account Type</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Joining Date</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map(user => {
                    const joinDate = parseUserDate(user.createdAt);
                    const formattedJoin = joinDate ? format(joinDate, 'dd MMM yyyy, hh:mm a') : 'N/A';
                    
                    return (
                      <tr key={user.uid} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-gray-900">
                              {user.displayName || 'No Name Provided'}
                            </span>
                            <span className="font-mono text-[9px] text-gray-400 mt-0.5">
                              {user.registrationId || user.uid || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-gray-600">
                          {user.mobileNumber || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-600 font-medium">
                          {user.email || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            user.role === 'owner' 
                              ? 'bg-orange-50 text-orange-600 border border-orange-100' 
                              : 'bg-sky-50 text-sky-600 border border-sky-100'
                          }`}>
                            {user.role === 'owner' ? <Building2 size={10} /> : <Briefcase size={10} />}
                            <span className="capitalize">{user.role || 'User'}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500 font-semibold">
                          {formattedJoin}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            user.status === 'disabled'
                              ? 'bg-red-50 text-red-600 border border-red-100'
                              : 'bg-green-50 text-green-600 border border-green-100'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'disabled' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                            <span>{user.status === 'disabled' ? 'Disabled' : 'Active'}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-bold text-sm">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Users size={32} className="text-gray-300" />
                        <span>No members registered in this selected range matching the criteria.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 pt-4 px-2">
              <span className="text-xs text-gray-500 font-bold">
                Showing page <span className="text-gray-900">{currentPage}</span> of <span className="text-gray-900">{totalPages}</span> ({filteredUsersForPeriod.length} entries)
              </span>
              
              <div className="flex space-x-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="p-2 border border-gray-100 rounded-xl bg-white hover:bg-gray-50 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="p-2 border border-gray-100 rounded-xl bg-white hover:bg-gray-50 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
