
export const DEFAULT_MOCK_DATA: Record<string, any[]> = {
  venues: [],
  service_providers: [],
  banners: [],
  notifications: [
    { id: '1', title: 'Welcome!', message: 'Welcome to BOOK MY VANUE! Start by exploring venues and services.', created_at: new Date().toISOString() },
  ],
  bookings: [],
  reviews: [],
  app_feedback: [],
  users: [
    { id: 'admin-id', uid: 'admin-id', email: 'admin@eventmanager.com', password: 'admin', role: 'admin', display_name: 'System Admin', mobile_number: '0000000000' }
  ],
  subscription_plans: [
    { id: '1', name: 'Basic', price: 999, role: 'venue_owner', is_active: true, duration: '1 Year' },
    { id: '2', name: 'Premium', price: 2999, role: 'venue_owner', is_active: true, duration: '1 Year' },
    { id: '3', name: 'Service Provider', price: 499, role: 'provider', is_active: true, duration: '1 Year' },
  ],
  user_subscriptions: [],
  service_type_photos: []
};
