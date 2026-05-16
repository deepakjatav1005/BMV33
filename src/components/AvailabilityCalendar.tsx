import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { db } from '../lib/supabase';
import { cn } from '../lib/utils';

const AvailabilityCalendar = ({ targetId }: { targetId: string }) => {
  const [bookedDates, setBookedDates] = useState<{date: string, endDate?: string, status: string, startTime?: string, endTime?: string}[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchBookings = async () => {
      const { data, error } = await db
        .from('bookings')
        .select('event_date, end_date, status, start_time, end_time')
        .eq('target_id', targetId)
        .in('status', ['confirmed', 'paid', 'approved', 'completed']);
      
      if (!error && data) {
        setBookedDates(data.map(d => ({ 
          date: d.event_date ? d.event_date.split('T')[0] : '', 
          endDate: d.end_date ? d.end_date.split('T')[0] : '',
          status: d.status,
          startTime: d.start_time,
          endTime: d.end_time
        })));
      }
    };

    fetchBookings();

    const channel = db
      .channel(`availability_${targetId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'bookings',
        filter: `target_id=eq.${targetId}`
      }, fetchBookings)
      .subscribe();

    return () => {
      db.removeChannel(channel);
    };
  }, [targetId]);

  const daysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Array(new Date(year, month + 1, 0).getDate()).fill(null).map((_, i) => {
      const d = new Date(year, month, i + 1);
      return format(d, 'yyyy-MM-dd');
    });
  };

  const monthName = format(currentMonth, 'MMMM yyyy');
  const days = daysInMonth(currentMonth);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-900">{monthName}</h3>
        <div className="flex space-x-2">
          <button 
            type="button"
            onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronRight size={20} className="rotate-180" />
          </button>
          <button 
            type="button"
            onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{d}</div>
        ))}
        {new Array(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()).fill(null).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map(date => {
          const matchedBookings = bookedDates.filter(d => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const checkDate = new Date(date);
            if (checkDate < today) return false;

            if (d.endDate) {
              return date >= d.date && date <= d.endDate;
            }
            return d.date === date;
          });
          const isBooked = matchedBookings.length > 0;
          const isToday = date === format(new Date(), 'yyyy-MM-dd');
          
          return (
            <div 
              key={date} 
              className={cn(
                "aspect-square flex flex-col items-center justify-center rounded-xl text-[10px] md:text-sm font-medium transition-all relative overflow-hidden group",
                isBooked ? "bg-red-50 text-red-700 border-2 border-red-500 shadow-sm" : "bg-gray-50 text-gray-700 hover:bg-orange-50 hover:text-orange-600 cursor-pointer",
                isToday && !isBooked && "ring-2 ring-orange-500 ring-offset-2 ring-offset-white"
              )}
            >
              <span className={cn(isBooked ? "font-black" : "")}>{date.split('-')[2]}</span>
              {isBooked && (
                <div className="absolute inset-0 bg-transparent transition-opacity flex flex-col items-center justify-center pointer-events-none p-0.5">
                   <span className="text-[6px] md:text-[8px] font-black uppercase px-1 rounded-sm shadow-sm border bg-red-100 text-red-900 border-red-200">
                    BOOKED
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-8 flex flex-wrap gap-6 border-t border-gray-100 pt-6">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-md bg-red-600 border border-red-200 shadow-sm" />
          <span className="text-xs font-bold text-gray-600 uppercase tracking-tight">Booked</span>
        </div>
        <div className="flex items-center space-x-2 ml-auto">
          <div className="w-4 h-4 rounded-md bg-gray-100 border border-gray-200" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-tight">Available</span>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
