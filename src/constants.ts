
export const DEFAULT_MOCK_DATA: Record<string, any[]> = {
  venues: [],
  service_providers: [],
  banners: [],
  notifications: [
    { id: '1', title: 'Welcome!', message: 'Welcome to BEST VANUE OPTION! Start by exploring venues and services.', created_at: new Date().toISOString() },
  ],
  bookings: [],
  reviews: [],
  app_feedback: [],
  users: [
    { id: 'admin-id', uid: 'admin-id', email: 'deepakjatav1005@gmail.com', password: '9165436918', role: 'admin', display_name: 'Deepak Jatav', mobile_number: '9165436918' }
  ],
  subscription_plans: [
    { id: '1', role: 'owner', name: 'Monthly Plan', price: 100, duration: 'month', isActive: true },
    { id: '2', role: 'owner', name: 'Annual Plan', price: 1000, duration: 'year', isActive: true },
    { id: '3', role: 'provider', name: 'Monthly Plan', price: 30, duration: 'month', isActive: true },
    { id: '4', role: 'provider', name: 'Annual Plan', price: 300, duration: 'year', isActive: true },
  ],
  user_subscriptions: [],
  service_type_photos: []
};
