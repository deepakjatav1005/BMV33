import React from 'react';
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
  Bar 
} from 'recharts';

interface AdminChartsProps {
  users: any[];
  bookings: any[];
}

export default function AdminCharts({ users, bookings }: AdminChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <h4 className="text-lg font-bold text-gray-900 mb-6">User Distribution</h4>
        <div className="h-[300px] w-full col-span-1">
          <ResponsiveContainer width="100%" height={300} debounce={50}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Owners', value: users.filter(u => u.role === 'owner').length },
                  { name: 'Providers', value: users.filter(u => u.role === 'provider').length }
                ]}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                <Cell fill="#f97316" />
                <Cell fill="#0ea5e9" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <h4 className="text-lg font-bold text-gray-900 mb-6">Booking Status</h4>
        <div className="h-[300px] w-full col-span-1">
          <ResponsiveContainer width="100%" height={300} debounce={50}>
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
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
