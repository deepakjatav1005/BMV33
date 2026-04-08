export type UserRole = 'user' | 'owner' | 'provider' | 'admin';
export type VenueType = 'Marriage Garden' | 'Hotel' | 'Marriage Hall' | 'Resort';

export interface UserProfile {
  uid: string;
  registrationId: string;
  displayName: string | null;
  fatherName?: string;
  mobileNumber: string;
  password?: string;
  email: string | null;
  photoURL: string | null;
  role: UserRole;
  state?: string;
  district?: string;
  block?: string;
  pincode?: string;
  venueType?: VenueType;
  status: 'active' | 'disabled';
  createdAt: any;
}

export interface SubscriptionPlan {
  id: string;
  role: 'owner' | 'provider';
  name: string;
  price: number;
  duration: 'month' | 'year';
  isActive: boolean;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired';
  amount: number;
  paymentId?: string;
  orderId?: string;
  signature?: string;
  createdAt: any;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  targetRole?: UserRole | 'all';
  createdAt: any;
}

export interface AppBanner {
  id: string;
  title: string;
  imageUrl: string;
  link?: string;
  isActive: boolean;
  createdAt: any;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  mobileNumber?: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export type CatalogueLevel = 
  | 'rooms(ac)' 
  | 'rooms(non ac)' 
  | 'dinner hall' 
  | 'wedding hall' 
  | 'stage site' 
  | 'cattering hall' 
  | 'parking site' 
  | 'party hall' 
  | 'meeting hall' 
  | 'reshort site' 
  | 'counter site' 
  | 'garden site' 
  | 'ground'
  | 'work sample'
  | 'portfolio'
  | 'Indoor'
  | 'Outdoor';

export interface CatalogueItem {
  level: CatalogueLevel;
  capacity: number;
  images: string[];
  videos?: string[];
  description: string;
}

export interface Venue {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  venueType: VenueType;
  address: string;
  state: string;
  district: string;
  block: string;
  pincode: string;
  capacity: number;
  pricePerDay: number;
  images: string[];
  facilities: string[];
  rating: number;
  reviewCount?: number;
  rateChart?: { item: string; price: number }[];
  catalogue?: CatalogueItem[];
  createdAt: any;
}

export type ServiceType = 
  | 'Caterer' 
  | 'DJ and Sounds' 
  | 'Tent House' 
  | 'Photo and Videographer' 
  | 'Stage Decorator' 
  | 'Flower Decorator' 
  | 'Makeup Artist' 
  | 'Halbai' 
  | 'Event Manager' 
  | 'Waiters' 
  | 'Dhol Bands'
  | 'Light Decorator'
  | 'Drone Camera'
  | 'Mehendi Service'
  | 'Event Cloth and Jwellary on Rent'
  | 'Fast food stalls'
  | 'Loundry service'
  | 'Helper'
  | 'Pandit Ji Brahman'
  | 'SPARKS AND Firecrackers'
  | 'Other Related Services';

export interface ServiceProvider {
  id: string;
  providerId: string;
  name: string;
  serviceType: ServiceType;
  description: string;
  priceRange: string;
  priceLevel?: 'per day' | 'as per hour' | 'as per time' | 'as per item' | 'as per plate' | 'as per work';
  state: string;
  district?: string;
  block?: string;
  images: string[];
  rating: number;
  reviewCount?: number;
  reviews?: Review[];
  rateChart?: { item: string; price: number }[];
  catalogue?: CatalogueItem[];
  createdAt: any;
}

export interface ServiceTypePhoto {
  id: string;
  serviceType: ServiceType;
  imageUrl: string;
  createdAt: any;
}

export interface Booking {
  id: string;
  userId: string; // Can be 'visitor' if not logged in
  visitorName?: string;
  visitorMobile?: string;
  eventType?: string;
  targetId: string;
  targetType: 'venue' | 'service';
  targetName: string;
  ownerId: string;
  eventDate: string;
  endDate?: string; // For periods
  startTime?: string; // e.g., "10:00 AM"
  endTime?: string; // e.g., "02:00 PM"
  status: 'pending' | 'confirmed' | 'cancelled' | 'paid';
  totalAmount: number;
  updatedAmount?: number; // For manual updates by owner
  message?: string;
  partyName?: string; // For manual booking
  partyAddress?: string; // For manual booking
  paymentMode?: 'Cash' | 'Online';
  isManual?: boolean;
  is_invoice_generated?: boolean;
  additional_service_name?: string;
  additional_service_amount?: number;
  createdAt: any;
}
