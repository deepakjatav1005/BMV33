import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface UserDistributionChartProps {
  users: any[];
}

export const UserDistributionChart = ({ users }: UserDistributionChartProps) => {
  const data = [
    { name: 'Owners', value: users.filter(u => u.role === 'owner').length },
    { name: 'Providers', value: users.filter(u => u.role === 'provider').length }
  ];

  return (
    <ResponsiveContainer width="100%" height={300} debounce={50}>
      <PieChart>
        <Pie
          data={data}
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
  );
};

interface BookingStatusChartProps {
  bookings: any[];
}

export const BookingStatusChart = ({ bookings }: BookingStatusChartProps) => {
  const data = [
    { name: 'Total', count: bookings.length },
    { name: 'Completed', count: bookings.filter(b => {
      const bTotal = Number(b.updatedAmount || b.totalAmount || 0);
      const bPaid = (b.payments || []).reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
      return (bPaid >= (bTotal - 0.1) && bTotal > 0) || b.status === 'completed' || b.status === 'paid' || b.paymentStatus === 'Paid';
    }).length },
    { name: 'Pending', count: bookings.filter(b => (!b.paymentStatus || b.paymentStatus === 'Pending') && b.status !== 'cancelled' && b.status !== 'completed' && b.status !== 'paid').length },
    { name: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length }
  ];

  return (
    <ResponsiveContainer width="100%" height={300} debounce={50}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};
