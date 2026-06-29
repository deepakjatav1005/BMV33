import React, { useState, useEffect, useMemo } from 'react';
import { 
  MessageSquare, 
  HelpCircle, 
  Send, 
  CheckCircle, 
  Clock, 
  User as UserIcon, 
  Phone, 
  MapPin, 
  AlertCircle, 
  ChevronDown, 
  Filter, 
  Calendar,
  Search,
  MessageCircle,
  FileText,
  Building2,
  Bookmark,
  Reply,
  RefreshCw,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

// Dynamic database import
// We're importing from dataService so we dynamically use MySQL/Mock depending on offline mode
import { dataService as db } from '../services/dataService';

interface QueryComplaintViewProps {
  user: any;
  profile: any;
}

interface Complaint {
  id: string;
  user_id: string;
  sender_name: string;
  sender_mobile: string;
  sender_address: string;
  category: string;
  detail: string;
  status: 'pending' | 'resolved';
  remark?: string;
  created_at: string;
}

export default function QueryComplaintView({ user, profile }: QueryComplaintViewProps) {
  const isAdmin = profile?.role === 'admin';
  
  // Roster lists
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  
  // Submit state for normal users
  const [formData, setFormData] = useState({
    sender_name: profile?.displayName || profile?.name || '',
    sender_mobile: profile?.mobileNumber || '',
    sender_address: profile?.address || '',
    category: 'Complaint', // Complaint, Suggestion, Query
    detail: ''
  });

  // Admin filter and search states
  const [adminFilters, setAdminFilters] = useState({
    status: 'all', // all, pending, resolved
    category: 'all', // all, Complaint, Suggestion, Query
    search: '',
    startDate: '',
    endDate: ''
  });

  // Remarks state for Admin resolving a complaint
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [adminRemark, setAdminRemark] = useState<string>('');
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  // Fetch complaints
  const fetchComplaints = async () => {
    setLoading(true);
    try {
      let query = db.from('complaints').select('*');
      
      // If regular user, only fetch their own complaints
      if (!isAdmin) {
        query = query.eq('user_id', user?.uid);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Sort by created_at descending
        const sorted = [...data].sort((a, b) => {
          return new Date(b.created_at || b.createdAt).getTime() - new Date(a.created_at || a.createdAt).getTime();
        });
        setComplaints(sorted);
      }
    } catch (err: any) {
      console.error('Failed to load complaints:', err);
      toast.error('Could not load query/complaint history');
    } finally {
      setLoading(false);
    }
  };

  // Run initial fetch
  useEffect(() => {
    if (user?.uid) {
      fetchComplaints();
    }
  }, [user?.uid, isAdmin]);

  // Handle user submit query
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.detail.trim()) {
      toast.error('Please enter the query/complaint detail');
      return;
    }

    setSubmitting(true);
    try {
      const newRecord = {
        id: 'comp_' + Math.random().toString(36).substr(2, 9),
        user_id: user?.uid,
        sender_name: formData.sender_name,
        sender_mobile: formData.sender_mobile,
        sender_address: formData.sender_address,
        category: formData.category,
        detail: formData.detail,
        status: 'pending',
        remark: '',
        created_at: new Date().toISOString()
      };

      const { error } = await db.from('complaints').insert(newRecord);
      
      if (error) {
        throw error;
      }

      toast.success('Your message has been submitted successfully!');
      
      // Reset details but keep profile info
      setFormData(prev => ({
        ...prev,
        detail: ''
      }));
      
      // Refresh list
      fetchComplaints();
    } catch (err: any) {
      console.error('Failed to submit query/complaint:', err);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Admin submit remark and resolve
  const handleResolve = async (e: React.FormEvent, complaintId: string) => {
    e.preventDefault();
    if (!adminRemark.trim()) {
      toast.error('Please write a reply/remark before resolving');
      return;
    }

    setResolvingId(complaintId);
    try {
      const { error } = await db.from('complaints').update({
        remark: adminRemark,
        status: 'resolved'
      }).eq('id', complaintId);

      if (error) {
        throw error;
      }

      toast.success('Complaint answered and status set to Resolved!');
      setAdminRemark('');
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (err: any) {
      console.error('Failed to resolve complaint:', err);
      toast.error('Failed to submit response. Please try again.');
    } finally {
      setResolvingId(null);
    }
  };

  // Filtered complaints for Display
  const filteredComplaints = useMemo(() => {
    return complaints.filter(item => {
      // Admin filter checks
      if (isAdmin) {
        // Status check
        if (adminFilters.status !== 'all' && item.status !== adminFilters.status) {
          return false;
        }
        // Category check
        if (adminFilters.category !== 'all' && item.category !== adminFilters.category) {
          return false;
        }
        // Search check
        if (adminFilters.search.trim()) {
          const s = adminFilters.search.toLowerCase();
          const name = (item.sender_name || '').toLowerCase();
          const mobile = (item.sender_mobile || '').toLowerCase();
          const address = (item.sender_address || '').toLowerCase();
          const detail = (item.detail || '').toLowerCase();
          const remark = (item.remark || '').toLowerCase();
          if (!name.includes(s) && !mobile.includes(s) && !address.includes(s) && !detail.includes(s) && !remark.includes(s)) {
            return false;
          }
        }
        // Date check
        const dateVal = new Date(item.created_at || (item as any).createdAt);
        if (adminFilters.startDate) {
          const startBound = new Date(adminFilters.startDate + 'T00:00:00');
          if (dateVal < startBound) return false;
        }
        if (adminFilters.endDate) {
          const endBound = new Date(adminFilters.endDate + 'T23:59:59');
          if (dateVal > endBound) return false;
        }
      }
      return true;
    });
  }, [complaints, adminFilters, isAdmin]);

  return (
    <div className="space-y-8 animate-fadeIn" id="query-complaint-wrapper">
      {/* Visual Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 opacity-10">
          <MessageSquare size={200} />
        </div>
        <div className="space-y-2 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl">
              <MessageSquare size={24} />
            </div>
            <h2 className="text-2xl font-black">Query & Complaint Portal</h2>
          </div>
          <p className="text-sm text-orange-50 font-medium max-w-xl">
            {isAdmin 
              ? 'Review registered inquiries, suggestions, and complaints from members. Update status with professional remarks.' 
              : 'Submit suggestions, report issues, or query the administration. Track your request resolutions in real-time.'}
          </p>
        </div>
        
        <button 
          onClick={fetchComplaints}
          disabled={loading}
          className="flex items-center space-x-2 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all text-white px-4 py-2.5 rounded-xl font-bold text-xs"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh List</span>
        </button>
      </div>

      {loading && complaints.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-4"></div>
          <span className="text-sm font-bold text-gray-500">Retrieving queries and complaints...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* USER VIEW: Submit form + previous list */}
          {!isAdmin ? (
            <>
              {/* Submission Form Column */}
              <div className="xl:col-span-5 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6 h-fit">
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="text-lg font-black text-gray-900">New Message</h3>
                  <p className="text-xs text-gray-400 font-medium mt-1">Submit your queries or suggestion directly to the system managers.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-gray-400 block">Sender Name</label>
                    <div className="relative">
                      <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        required
                        value={formData.sender_name}
                        onChange={e => setFormData(prev => ({ ...prev, sender_name: e.target.value }))}
                        placeholder="Enter your name"
                        className="w-full bg-gray-50/50 border border-gray-100 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-100 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-wider text-gray-400 block">Mobile Number</label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="text" 
                          required
                          value={formData.sender_mobile}
                          onChange={e => setFormData(prev => ({ ...prev, sender_mobile: e.target.value }))}
                          placeholder="Your active mobile"
                          className="w-full bg-gray-50/50 border border-gray-100 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-100 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-wider text-gray-400 block">Message Category</label>
                      <div className="relative">
                        <select
                          value={formData.category}
                          onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-100 transition-all cursor-pointer appearance-none"
                        >
                          <option value="Complaint">Complaint</option>
                          <option value="Suggestion">Suggestion</option>
                          <option value="Query">Query/Inquiry</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-gray-400 block">Your Address</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                      <input 
                        type="text" 
                        value={formData.sender_address}
                        onChange={e => setFormData(prev => ({ ...prev, sender_address: e.target.value }))}
                        placeholder="Your residential / business address"
                        className="w-full bg-gray-50/50 border border-gray-100 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-100 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-gray-400 block">Query / Complaint Details</label>
                    <textarea 
                      required
                      rows={5}
                      value={formData.detail}
                      onChange={e => setFormData(prev => ({ ...prev, detail: e.target.value }))}
                      placeholder="Write your suggestions or details of your query here. Please be specific..."
                      className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-100 transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black py-3.5 rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-md shadow-orange-100 disabled:opacity-50"
                  >
                    <Send size={16} />
                    <span>{submitting ? 'Sending Message...' : 'Submit Message'}</span>
                  </button>
                </form>
              </div>

              {/* Previous History list column */}
              <div className="xl:col-span-7 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="text-lg font-black text-gray-900">Your Communication Log</h3>
                  <p className="text-xs text-gray-400 font-medium mt-1">Check administrative replies and tracking statuses here.</p>
                </div>

                <div className="space-y-4 max-h-[640px] overflow-y-auto pr-1">
                  {complaints.length > 0 ? (
                    complaints.map(item => {
                      const joinDate = new Date(item.created_at || (item as any).createdAt);
                      const formattedDate = format(joinDate, 'dd MMM yyyy, hh:mm a');
                      
                      return (
                        <div key={item.id} className="border border-gray-100 p-6 rounded-2xl bg-gray-50/20 hover:bg-gray-50/40 transition-colors space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100/60 pb-3">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                                item.category === 'Complaint' 
                                  ? 'bg-red-50 text-red-600 border-red-100'
                                  : item.category === 'Suggestion'
                                  ? 'bg-green-50 text-green-600 border-green-100'
                                  : 'bg-blue-50 text-blue-600 border-blue-100'
                              }`}>
                                {item.category}
                              </span>
                              <span className="font-mono text-[10px] text-gray-400">ID: {item.id}</span>
                            </div>
                            
                            <div className="flex items-center space-x-1.5 text-xs font-semibold">
                              <Calendar size={12} className="text-gray-400" />
                              <span className="text-gray-500">{formattedDate}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="text-xs font-black uppercase tracking-wider text-gray-400">Your Message:</div>
                            <p className="text-sm font-semibold text-gray-800 leading-relaxed whitespace-pre-line bg-white/60 p-3 rounded-xl border border-gray-100/50">
                              {item.detail}
                            </p>
                          </div>

                          {/* Dynamic status/remarks section */}
                          <div className="pt-2">
                            {item.status === 'resolved' ? (
                              <div className="bg-green-50/40 border border-green-100 p-4 rounded-xl space-y-3">
                                <div className="flex items-center space-x-1.5 text-xs font-black text-green-700">
                                  <CheckCircle size={14} />
                                  <span>RESOLVED BY ADMINISTRATION</span>
                                </div>
                                <div className="space-y-1.5">
                                  <div className="text-[10px] font-black uppercase tracking-wider text-green-500">Official Remark / Answer:</div>
                                  <p className="text-xs font-bold text-gray-700 leading-relaxed bg-white p-3 rounded-lg border border-green-100/50 whitespace-pre-line">
                                    {item.remark || 'Thank you for your feedback! No specific remark provided.'}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2 text-amber-600 bg-amber-50/40 border border-amber-100 p-3.5 rounded-xl text-xs font-bold">
                                <Clock size={14} />
                                <span>Status: Pending administrative reply. Our team is reviewing this query.</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-20 text-gray-400 font-bold border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/10">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <MessageCircle size={36} className="text-gray-300" />
                        <span>You haven't submitted any queries or complaints yet.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            
            /* ADMIN VIEW: Fully functional lists + answer remark actions */
            <div className="xl:col-span-12 space-y-6">
              
              {/* Admin filters bar */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <Filter size={18} className="text-orange-500" />
                  <span className="font-black text-gray-900 text-sm">Roster Filters</span>
                </div>

                <div className="flex flex-wrap gap-3 items-stretch sm:items-center">
                  {/* Status selection */}
                  <select
                    value={adminFilters.status}
                    onChange={e => setAdminFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="bg-gray-50 border border-gray-100 px-4 py-2 text-xs font-bold text-gray-700 rounded-xl focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="resolved">Resolved</option>
                  </select>

                  {/* Category selection */}
                  <select
                    value={adminFilters.category}
                    onChange={e => setAdminFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="bg-gray-50 border border-gray-100 px-4 py-2 text-xs font-bold text-gray-700 rounded-xl focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    <option value="all">All Categories</option>
                    <option value="Complaint">Complaints</option>
                    <option value="Suggestion">Suggestions</option>
                    <option value="Query">Queries</option>
                  </select>

                  {/* Date range selection */}
                  <div className="flex items-center space-x-1.5 bg-gray-50 rounded-xl border border-gray-100 px-3 py-1 text-xs">
                    <Calendar size={12} className="text-gray-400" />
                    <input 
                      type="date" 
                      value={adminFilters.startDate} 
                      onChange={e => setAdminFilters(prev => ({ ...prev, startDate: e.target.value }))}
                      className="bg-transparent font-bold text-gray-600 focus:outline-none cursor-pointer" 
                    />
                    <span className="font-bold text-gray-300">to</span>
                    <input 
                      type="date" 
                      value={adminFilters.endDate} 
                      onChange={e => setAdminFilters(prev => ({ ...prev, endDate: e.target.value }))}
                      className="bg-transparent font-bold text-gray-600 focus:outline-none cursor-pointer" 
                    />
                    {(adminFilters.startDate || adminFilters.endDate) && (
                      <button 
                        onClick={() => setAdminFilters(prev => ({ ...prev, startDate: '', endDate: '' }))}
                        className="text-gray-400 hover:text-red-500 transition-colors ml-1"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  {/* Text search */}
                  <div className="relative w-full sm:w-64">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text"
                      placeholder="Search name, mobile, query text..."
                      value={adminFilters.search}
                      onChange={e => setAdminFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-gray-700 shadow-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-100"
                    />
                  </div>
                </div>
              </div>

              {/* Split layout: Table on Left, Reply Area/Detail on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Table view column */}
                <div className={`lg:col-span-8 bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden`}>
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-gray-900">Roster History</h3>
                      <p className="text-xs text-gray-400 font-medium">Found {filteredComplaints.length} entries matching current criteria</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Sender Details</th>
                          <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Type</th>
                          <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Detail Summary</th>
                          <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Date</th>
                          <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredComplaints.length > 0 ? (
                          filteredComplaints.map(item => {
                            const joinDate = new Date(item.created_at || (item as any).createdAt);
                            const formattedDate = format(joinDate, 'dd MMM yyyy');
                            const isSelected = selectedComplaint?.id === item.id;
                            
                            return (
                              <tr 
                                key={item.id} 
                                onClick={() => {
                                  setSelectedComplaint(item);
                                  setAdminRemark(item.remark || '');
                                }}
                                className={`cursor-pointer transition-all hover:bg-orange-50/30 ${
                                  isSelected ? 'bg-orange-50/60 border-l-4 border-orange-500' : ''
                                }`}
                              >
                                <td className="px-5 py-4">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-black text-gray-900">{item.sender_name || 'No Name'}</span>
                                    <span className="text-[10px] font-semibold text-gray-500 mt-0.5 font-mono">{item.sender_mobile || 'No Phone'}</span>
                                  </div>
                                </td>
                                <td className="px-5 py-4">
                                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black ${
                                    item.category === 'Complaint' 
                                      ? 'bg-red-50 text-red-600 border border-red-100'
                                      : item.category === 'Suggestion'
                                      ? 'bg-green-50 text-green-600 border border-green-100'
                                      : 'bg-blue-50 text-blue-600 border border-blue-100'
                                  }`}>
                                    {item.category}
                                  </span>
                                </td>
                                <td className="px-5 py-4 max-w-[220px]">
                                  <div className="text-xs text-gray-600 font-semibold truncate">
                                    {item.detail}
                                  </div>
                                </td>
                                <td className="px-5 py-4 text-[11px] font-bold text-gray-500">
                                  {formattedDate}
                                </td>
                                <td className="px-5 py-4 text-center">
                                  <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                    item.status === 'resolved'
                                      ? 'bg-green-50 text-green-600 border border-green-100'
                                      : 'bg-amber-50 text-amber-600 border border-amber-100'
                                  }`}>
                                    <span className={`w-1 h-1 rounded-full ${item.status === 'resolved' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                                    <span>{item.status === 'resolved' ? 'Resolved' : 'Pending'}</span>
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-5 py-16 text-center text-gray-400 font-bold text-sm bg-gray-50/10">
                              <div className="flex flex-col items-center justify-center space-y-2">
                                <MessageCircle size={32} className="text-gray-300" />
                                <span>No queries or complaints found matching the filters.</span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Reply Detail card on the Right */}
                <div className="lg:col-span-4 bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm h-fit">
                  {selectedComplaint ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                        <div className="flex items-center space-x-2">
                          <Reply size={18} className="text-orange-500" />
                          <h4 className="text-sm font-black text-gray-900">Complaint Action</h4>
                        </div>
                        <button 
                          onClick={() => setSelectedComplaint(null)} 
                          className="text-gray-400 hover:text-gray-600 p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Complaint stats box */}
                      <div className="bg-gray-50 p-4 rounded-2xl space-y-3.5 border border-gray-100">
                        <div className="grid grid-cols-2 gap-3 border-b border-gray-200/50 pb-3">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Sender Name</span>
                            <span className="text-xs font-black text-gray-800">{selectedComplaint.sender_name}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Mobile No.</span>
                            <span className="text-xs font-black text-gray-800">{selectedComplaint.sender_mobile || 'N/A'}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-0.5">Address</span>
                          <span className="text-xs font-bold text-gray-600 block">{selectedComplaint.sender_address || 'No address provided'}</span>
                        </div>

                        <div className="border-t border-gray-200/50 pt-3">
                          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">Message Query Detail</span>
                          <p className="text-xs font-semibold text-gray-700 leading-relaxed max-h-[140px] overflow-y-auto whitespace-pre-line bg-white p-3 rounded-xl border border-gray-100">
                            {selectedComplaint.detail}
                          </p>
                        </div>
                      </div>

                      {/* Form response input */}
                      <form onSubmit={(e) => handleResolve(e, selectedComplaint.id)} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                            Administrative Remark / Answer
                          </label>
                          <textarea
                            required
                            rows={4}
                            value={adminRemark}
                            disabled={selectedComplaint.status === 'resolved' && selectedComplaint.remark === adminRemark}
                            onChange={e => setAdminRemark(e.target.value)}
                            placeholder="Enter the official answer, actions taken, or remarks to resolve this inquiry..."
                            className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-gray-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-100 transition-all resize-none"
                          />
                        </div>

                        {selectedComplaint.status === 'resolved' ? (
                          <div className="space-y-3">
                            <div className="flex items-center space-x-1.5 text-xs font-bold text-green-600 bg-green-50/50 p-3 rounded-xl border border-green-100">
                              <CheckCircle size={14} />
                              <span>Already Resolved</span>
                            </div>
                            
                            <button
                              type="submit"
                              disabled={resolvingId !== null || selectedComplaint.remark === adminRemark}
                              className="w-full bg-gray-800 text-white text-xs font-black py-3 rounded-xl flex items-center justify-center space-x-2 transition-all hover:bg-gray-900 disabled:opacity-50"
                            >
                              <span>Update Remark</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="submit"
                            disabled={resolvingId !== null}
                            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black py-3 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md shadow-orange-100 disabled:opacity-50"
                          >
                            <CheckCircle size={14} />
                            <span>{resolvingId === selectedComplaint.id ? 'Resolving...' : 'Submit Remark & Resolve'}</span>
                          </button>
                        )}
                      </form>
                    </div>
                  ) : (
                    <div className="text-center py-24 text-gray-400 font-bold border-2 border-dashed border-gray-100 rounded-[2rem] bg-gray-50/10">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Bookmark size={32} className="text-gray-300" />
                        <span className="text-xs">Click on any query card or row to take resolution actions.</span>
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
}
