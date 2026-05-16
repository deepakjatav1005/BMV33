import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, CheckCircle, Check, Shield } from 'lucide-react';
import { db } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { UserProfile, SubscriptionPlan, UserSubscription } from '../../types';
import { format } from 'date-fns';
import { cn, resolveUrl, generateUUID } from '../../lib/utils';
import AppLogo from '../../components/AppLogo';

declare const Razorpay: any;

interface SubscriptionManageViewProps {
  user: any;
  profile: UserProfile | null;
}

const SubscriptionManageView: React.FC<SubscriptionManageViewProps> = ({ user, profile }) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSub, setCurrentSub] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [appLogoUrl, setAppLogoUrl] = useState('/logo.png');

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!user || !profile) return;
      setLoading(true);
      try {
        // Fetch App Logo
        const { data: logoData } = await db.from('admin_settings').select('value').eq('key', 'app_logo_url').maybeSingle();
        if (logoData?.value) setAppLogoUrl(logoData.value);

        const { data: pData } = await db.from('subscription_plans').select('*').eq('role', profile.role).eq('is_active', true);
        if (pData) {
          setPlans(pData.map(d => ({ 
            id: d.id, 
            name: d.name, 
            price: d.price, 
            duration: d.duration, 
            role: d.role, 
            isActive: d.is_active, 
            benefits: d.benefits || [],
            createdAt: d.created_at 
          } as SubscriptionPlan)));
        }

        const { data: sData } = await db.from('user_subscriptions').select('*').eq('user_id', user?.uid).eq('status', 'active').order('end_date', { ascending: false }).limit(1);
        if (sData && sData.length > 0) {
          const d = sData[0];
          setCurrentSub({ 
            id: d.id, 
            userId: d.user_id, 
            planId: d.plan_id, 
            startDate: d.start_date, 
            endDate: d.end_date, 
            status: d.status, 
            amount: d.amount, 
            createdAt: d.created_at 
          } as UserSubscription);
        }
      } catch (err) {
        console.error('Subscription data error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptionData();
  }, [user, profile]);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!user || !profile) return;
    
    try {
      // 1. Create order on server
      const response = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: plan.price,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
          notes: {
            userId: user?.uid,
            planId: plan.id,
            planName: plan.name
          }
        })
      });
      
      if (!response.ok) throw new Error('Failed to create order');
      const order = await response.json();
      
      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "BEST VENUE OPTION",
        description: `Subscription for ${plan.name}`,
        image: resolveUrl(appLogoUrl),
        order_id: order.id,
        handler: async function (response: any) {
          // 3. On success, update database
          const startDate = new Date();
          const endDate = new Date();
          const duration = plan.duration.toLowerCase();
          
          if (duration.includes('year')) {
            endDate.setFullYear(endDate.getFullYear() + 1);
          } else if (duration.includes('6 month') || duration.includes('half')) {
            endDate.setMonth(endDate.getMonth() + 6);
          } else if (duration.includes('3 month') || duration.includes('quarter')) {
            endDate.setMonth(endDate.getMonth() + 3);
          } else {
            endDate.setMonth(endDate.getMonth() + 1);
          }

          try {
            const { error: subError } = await db.from('user_subscriptions').insert([{
              id: generateUUID(),
              user_id: user?.uid,
              plan_id: plan.id,
              plan_name: plan.name || 'Premium Plan',
              duration: plan.duration || 'Monthly',
              validation_duration: plan.duration || 'Monthly',
              start_date: startDate.toISOString().split('T')[0],
              end_date: endDate.toISOString().split('T')[0],
              status: 'active',
              amount: plan.price,
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
              signature: response.razorpay_signature,
              created_at: new Date().toISOString()
            }]);
            
            if (subError) throw subError;
            
            toast.success(`Subscribed to ${plan.name}`);
            window.location.reload();
          } catch (err: any) {
            console.error('Subscription Insert Error:', err);
            toast.error('Failed to record subscription detail: ' + (err.message || 'Unknown error'));
          }
        },
        prefill: {
          name: profile.displayName || profile.mobileNumber,
          email: profile.email || '',
          contact: profile.mobileNumber
        },
        theme: {
          color: "#ea580c"
        }
      };
      
      const rzp = new Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error('Payment Failed: ' + response.error.description);
      });
      rzp.open();
      
    } catch (err) {
      console.error('Razorpay error:', err);
      toast.error('Payment initialization failed');
    }
  };

  if (loading) return (
    <div className="py-40 flex flex-col items-center justify-center space-y-4">
      <RefreshCw className="animate-spin text-orange-600" size={48} />
      <p className="text-orange-600 font-bold animate-pulse">Loading Premium Plans...</p>
    </div>
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 md:p-10 rounded-[2.5rem] border border-orange-100 shadow-2xl shadow-orange-100/20 gap-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full -mr-20 -mt-20 blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-700" />
        <div className="flex items-center gap-8 relative z-10">
          <div className="bg-white p-4 rounded-3xl shadow-xl border border-orange-50">
            <AppLogo size="xl" />
          </div>
        </div>
        <div className="text-center md:text-right relative z-10">
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter leading-none mb-3">ELITE <span className="text-orange-600">PLANS</span></h2>
          <p className="text-gray-500 font-black uppercase tracking-widest text-[10px] md:text-xs">Professional Business Expansion Protocol</p>
          <div className="flex justify-center md:justify-end gap-2 mt-4">
            <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse delay-100" />
            <span className="w-2 h-2 rounded-full bg-orange-200 animate-pulse delay-200" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-12">
        {currentSub && (
          <div className="bg-green-50 border border-green-200 p-8 rounded-[2rem] flex flex-col md:flex-row justify-between items-center shadow-sm">
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <div className="bg-green-600 p-4 rounded-2xl text-white shadow-lg">
                <ShieldCheck size={32} />
              </div>
              <div>
                <h3 className="text-xl font-black text-green-800 uppercase tracking-tight">Active Plan Benefits</h3>
                <p className="text-green-600 font-bold">Valid until: {format(new Date(currentSub.endDate), 'dd MMM yyyy')}</p>
              </div>
            </div>
            <div className="bg-white px-6 py-3 rounded-2xl border border-green-100 font-black text-green-600 shadow-sm">
              PREMIUM STATUS
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map(plan => (
            <div key={plan.id} className={cn(
              "bg-white border-4 p-8 rounded-[2.5rem] relative overflow-hidden transition-all hover:scale-[1.02] shadow-xl",
              currentSub?.planId === plan.id ? "border-green-500 shadow-green-100" : "border-gray-50 hover:border-orange-200 shadow-gray-100"
            )}>
              {currentSub?.planId === plan.id && (
                <div className="absolute top-0 right-0 bg-green-500 text-white px-6 py-2 rounded-bl-3xl font-black text-[10px] uppercase tracking-widest">
                  Active
                </div>
              )}
              <div className="relative z-10">
                <h3 className="text-2xl font-black mb-1 uppercase tracking-tight text-gray-900">{plan.name}</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Designed for professional {plan.role}s</p>
                <div className="text-5xl font-black text-orange-600 mb-8 tracking-tighter">
                  ₹{plan.price}
                  <span className="text-sm text-gray-400 font-bold uppercase tracking-widest ml-2">/ {plan.duration}</span>
                </div>
                
                <div className="space-y-4 mb-10">
                  {(plan.benefits && plan.benefits.length > 0 ? plan.benefits : ['Unlimited Listing', 'Direct Customer Contact', 'Featured Visibility']).map((benefit, i) => (
                    <div key={i} className="flex items-center space-x-3 text-gray-600 font-medium">
                      <div className="bg-orange-100 p-1 rounded-lg text-orange-600">
                        <Check size={14} />
                      </div>
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => handleSubscribe(plan)}
                  disabled={currentSub?.planId === plan.id}
                  className={cn(
                    "w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all",
                    currentSub?.planId === plan.id 
                      ? "bg-green-50 text-green-600 cursor-default" 
                      : "bg-gray-900 text-white hover:bg-orange-600 hover:shadow-2xl hover:shadow-orange-200 active:scale-95"
                  )}
                >
                  {currentSub?.planId === plan.id ? 'Active Plan' : 'Buy This Plan'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManageView;
