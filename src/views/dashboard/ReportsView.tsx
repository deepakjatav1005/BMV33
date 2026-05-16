import React from 'react';
import { Download } from 'lucide-react';
import { Booking, UserProfile } from '../../types';
import { formatDateDDMMYYYY, formatTime12h } from '../../lib/utils';
import { generateInvoice } from '../../services/invoiceService';
import { db } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface ReportsViewProps {
  bookings: Booking[];
  reportFilters: any;
  setReportFilters: (filters: any) => void;
  downloadReport: (type: 'excel' | 'pdf') => void;
  profile: UserProfile | null;
  globalSettings: any;
  fetchDashboardData: () => void;
}

const ReportsView: React.FC<ReportsViewProps> = ({ 
  bookings, 
  reportFilters, 
  setReportFilters, 
  downloadReport,
  profile,
  globalSettings,
  fetchDashboardData
}) => {
  const filteredForReport = bookings.filter(b => {
    if (reportFilters.year && !b.eventDate.startsWith(reportFilters.year)) return false;
    if (reportFilters.name && !((b.visitorName || '').toLowerCase().includes(reportFilters.name.toLowerCase()) || (b.partyName || '').toLowerCase().includes(reportFilters.name.toLowerCase()))) return false;
    if (reportFilters.mobile && !(b.visitorMobile || '').includes(reportFilters.mobile)) return false;
    if (reportFilters.startDate && b.eventDate < reportFilters.startDate) return false;
    if (reportFilters.endDate && b.eventDate > reportFilters.endDate) return false;
    if (reportFilters.paymentMode && b.paymentMode !== reportFilters.paymentMode) return false;
    if (reportFilters.bookingType === 'Order' && b.isManual) return false;
    if (reportFilters.bookingType === 'Manual' && !b.isManual) return false;
    return true;
  });

  const aggregates = filteredForReport.reduce((acc, b) => {
    const total = Math.floor(Number(b.updatedAmount) || Number(b.totalAmount) || 0);
    const totalReceived = Math.floor((b.payments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0));
    const discountOnly = Math.floor((b.payments || []).filter(p => p.paymentType === 'Discount').reduce((sum, p) => sum + (Number(p.amount) || 0), 0));
    const cashPaid = Math.max(0, totalReceived - discountOnly);
    
    const pending = Math.max(0, total - totalReceived);
    const isPaid = (pending <= 0 && total > 0) || (b.status || '').toLowerCase() === 'paid' || (b.status || '').toLowerCase() === 'completed' || b.paymentStatus === 'Paid';
    
    return {
      total: (Number(acc.total) || 0) + total,
      paid: (Number(acc.paid) || 0) + cashPaid,
      discount: (Number(acc.discount) || 0) + discountOnly,
      pending: (Number(acc.pending) || 0) + pending,
      count: (Number(acc.count) || 0) + 1,
      completeCount: (Number(acc.completeCount) || 0) + (isPaid ? 1 : 0)
    };
  }, { total: 0, paid: 0, discount: 0, pending: 0, count: 0, completeCount: 0 });

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Booking Reports</h3>
          <div className="flex space-x-4">
            <button onClick={() => downloadReport('excel')} className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-green-700 transition-colors">
              <Download size={18} />
              <span>Excel</span>
            </button>
            <button onClick={() => downloadReport('pdf')} className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-red-700 transition-colors">
              <Download size={18} />
              <span>PDF</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-blue-50/70 p-5 rounded-3xl border border-blue-100 flex flex-col items-center shadow-sm">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 text-center">Total Bookings ({aggregates.count})</span>
            <span className="text-xl font-black text-blue-900">₹{(aggregates.total || 0).toLocaleString()}</span>
          </div>
          <div className="bg-green-50/70 p-5 rounded-3xl border border-green-100 flex flex-col items-center shadow-sm">
            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Total Received</span>
            <span className="text-xl font-black text-green-900">₹{(aggregates.paid || 0).toLocaleString()}</span>
          </div>
          <div className="bg-purple-50/70 p-5 rounded-3xl border border-purple-100 flex flex-col items-center shadow-sm">
            <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">Total Discount</span>
            <span className="text-xl font-black text-purple-900">₹{(aggregates.discount || 0).toLocaleString()}</span>
          </div>
          <div className="bg-red-50/70 p-5 rounded-3xl border border-red-100 flex flex-col items-center shadow-sm">
            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Total Pending</span>
            <span className="text-xl font-black text-red-900">₹{(aggregates.pending || 0).toLocaleString()}</span>
          </div>
          <div className="bg-indigo-50/70 p-5 rounded-3xl border border-indigo-100 flex flex-col items-center shadow-sm">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Complete Count</span>
            <span className="text-xl font-black text-indigo-900">{aggregates.completeCount || 0}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Year</label>
            <select 
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold"
              value={reportFilters.year}
              onChange={(e) => setReportFilters({...reportFilters, year: e.target.value})}
            >
              <option value="">All Years</option>
              {Array.from(new Set(bookings.map(b => b.eventDate.split('-')[0]))).sort((a,b) => b.localeCompare(a)).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-1">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Search Name</label>
            <input 
              type="text" 
              placeholder="Customer name..."
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              value={reportFilters.name}
              onChange={(e) => setReportFilters({...reportFilters, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Mobile</label>
            <input 
              type="text" 
              placeholder="Mobile number..."
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              value={reportFilters.mobile}
              onChange={(e) => setReportFilters({...reportFilters, mobile: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Start Date</label>
            <input 
              type="date" 
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              value={reportFilters.startDate}
              onChange={(e) => setReportFilters({...reportFilters, startDate: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">End Date</label>
            <input 
              type="date" 
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              value={reportFilters.endDate}
              onChange={(e) => setReportFilters({...reportFilters, endDate: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Payment Mode</label>
            <select 
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              value={reportFilters.paymentMode}
              onChange={(e) => setReportFilters({...reportFilters, paymentMode: e.target.value})}
            >
              <option value="">All Modes</option>
              <option value="Cash">Cash</option>
              <option value="Online">Online</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Booking Type</label>
            <select 
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              value={reportFilters.bookingType}
              onChange={(e) => setReportFilters({...reportFilters, bookingType: e.target.value})}
            >
              <option value="">All Types</option>
              <option value="Order">Order</option>
              <option value="Manual">Manual</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto pb-4">
          <div className="min-w-[1200px]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 pb-4">
                  <th className="py-4 font-bold text-gray-400 text-sm uppercase tracking-wider">S.No</th>
                  <th className="py-4 font-bold text-gray-400 text-sm uppercase tracking-wider">Status</th>
                  <th className="py-4 font-bold text-gray-400 text-sm uppercase tracking-wider">Customer</th>
                  <th className="py-4 font-bold text-gray-400 text-sm uppercase tracking-wider">Mobile</th>
                  <th className="py-4 font-bold text-gray-400 text-sm uppercase tracking-wider">Address</th>
                  <th className="py-4 font-bold text-gray-400 text-sm uppercase tracking-wider">Date & Time</th>
                  <th className="py-4 font-bold text-gray-400 text-sm uppercase tracking-wider">Invoice No</th>
                  <th className="py-4 font-bold text-gray-400 text-sm uppercase tracking-wider">Total</th>
                  <th className="py-4 font-bold text-gray-400 text-sm uppercase tracking-wider text-orange-600">Paid Amount</th>
                  <th className="py-4 font-bold text-gray-400 text-sm uppercase tracking-wider text-green-600">Discount</th>
                  <th className="py-4 font-bold text-gray-400 text-sm uppercase tracking-wider text-blue-600">Pending Amount</th>
                  <th className="py-4 font-bold text-gray-400 text-sm uppercase tracking-wider">Type</th>
                  <th className="py-4 font-bold text-gray-400 text-sm uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredForReport.map((b, index) => {
                  const subTotal = Math.floor(Number(b.updatedAmount) || Number(b.totalAmount) || 0);
                  const totalReceived = Math.floor((b.payments || []).reduce((acc, p) => acc + (Number(p.amount) || 0), 0));
                  const discountTotal = Math.floor((b.payments || []).filter(p => p.paymentType === 'Discount').reduce((acc, p) => acc + (Number(p.amount) || 0), 0));
                  const cashPaidTotal = Math.max(0, totalReceived - discountTotal);
                  const pending = Math.max(0, subTotal - totalReceived);
                  const isPaid = (pending <= 0 && subTotal > 0) || (b.status || '').toLowerCase() === 'paid' || (b.status || '').toLowerCase() === 'completed' || b.paymentStatus === 'Paid';
                  
                  return (
                    <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 text-sm text-gray-500">{index + 1}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                          isPaid ? 'bg-green-100 text-green-600' : 
                          b.status === 'confirmed' || b.status === 'approved' ? 'bg-blue-100 text-blue-600' : 
                          b.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {isPaid ? 'Completed' : (b.status || 'PENDING').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 font-bold text-gray-900">{b.partyName || b.visitorName || 'N/A'}</td>
                      <td className="py-4 text-sm text-gray-600">{b.visitorMobile || 'N/A'}</td>
                      <td className="py-4 text-xs text-gray-500 max-w-[150px] truncate">{b.partyAddress || 'N/A'}</td>
                      <td className="py-4 text-sm text-gray-600">
                        {formatDateDDMMYYYY(b.eventDate)} {b.startTime ? formatTime12h(b.startTime) : ''}
                      </td>
                      <td className="py-4 text-xs font-mono text-gray-500">
                        {(b.transaction_id || ('INV-' + (b.id || '').substring(0, 8))).toUpperCase()}
                      </td>
                      <td className="py-4 font-bold text-gray-900">₹{(subTotal || 0).toLocaleString()}</td>
                      <td className="py-4 font-bold text-orange-600">₹{(cashPaidTotal || 0).toLocaleString()}</td>
                      <td className="py-4 font-bold text-green-600">₹{(discountTotal || 0).toLocaleString()}</td>
                      <td className="py-4 font-black text-blue-600">₹{(pending || 0).toLocaleString()}</td>
                      <td className="py-4 text-xs font-bold text-gray-500 uppercase">{b.isManual ? 'Manual' : 'Order'}</td>
                      <td className="py-4">
                        <button 
                          onClick={async () => {
                            try {
                              const pdfBlob = await generateInvoice(b, 0, profile, bookings, globalSettings);
                              const url = URL.createObjectURL(pdfBlob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = `Invoice-${b.id.substring(0, 8).toUpperCase()}.pdf`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              URL.revokeObjectURL(url);
                              toast.success('Invoice downloaded successfully');
                              
                              // Mark as generated
                              db.from('bookings').update({ is_invoice_generated: true }).eq('id', b.id).then(() => {
                                 fetchDashboardData();
                              });
                            } catch (err) {
                              console.error('Download error:', err);
                              toast.error('Failed to generate invoice');
                            }
                          }}
                          className="p-2 text-orange-600 hover:bg-orange-100 rounded-xl transition-all"
                          title="Download PDF Invoice"
                        >
                          <Download size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
