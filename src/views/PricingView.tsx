import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { db } from '../services/dataService';
import { cn } from '../lib/utils';
import { SubscriptionPlan } from '../types';

const PricingView = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await db.from('subscription_plans').select('*').eq('is_active', true);
        if (error) throw error;
        if (data) {
          setPlans(data.map((d: any) => ({
            id: d.id,
            name: d.name,
            price: d.price,
            duration: d.duration,
            benefits: d.benefits || [],
            role: d.role,
            isActive: d.is_active,
            createdAt: d.created_at
          })));
        }
      } catch (err) {
        console.error('Error fetching pricing plans:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-32">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-4 tracking-tighter uppercase">Subscription Plans</h1>
        <p className="text-xl text-gray-500">Simple, transparent pricing for growing your business.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <div key={plan.id} className={cn(
              "bg-white rounded-[3rem] p-10 border-2 transition-all hover:scale-[1.02] flex flex-col",
              i === 1 ? "border-orange-500 shadow-2xl shadow-orange-100 scale-105 relative z-10" : "border-gray-100 shadow-xl"
            )}>
              {i === 1 && <span className="absolute top-0 right-10 -translate-y-1/2 bg-orange-600 text-white px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">Most Popular</span>}
              <div className="mb-2 flex justify-between items-start">
                <h3 className="text-2xl font-black uppercase">{plan.name}</h3>
                <span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded-md uppercase text-gray-500">{plan.role}</span>
              </div>
              <div className="mb-8">
                <span className="text-5xl font-black">₹{plan.price}</span>
                <span className="text-gray-500 ml-2 font-bold tracking-tight">/{plan.duration}</span>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                {plan.benefits.map((b, idx) => (
                  <li key={idx} className="flex items-center text-gray-600 font-medium text-sm">
                    <CheckCircle size={18} className="text-green-500 mr-3 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => navigate('/login')}
                className={cn(
                  "w-full py-5 rounded-[1.5rem] font-black text-lg transition-all shadow-lg",
                  i === 1 ? "bg-orange-600 text-white hover:bg-orange-700 shadow-orange-200" : "bg-gray-900 text-white hover:bg-black shadow-gray-200"
                )}
              >
                Get Started Now
              </button>
            </div>
          ))}
          {plans.length === 0 && (
            <div className="col-span-full text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
              <p className="text-gray-500 font-bold">No active plans available at the moment. Please check back later.</p>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-20 text-center">
        <button onClick={() => navigate('/login')} className="text-gray-400 font-bold hover:text-gray-600 transition-colors uppercase tracking-wider text-sm">
          Already have an account? Login here
        </button>
      </div>
    </div>
  );
};

export default PricingView;
