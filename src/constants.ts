export const SERVICE_TYPES = [
  'caterers',
  'dhol and bands',
  'drone photo and videography',
  'dj and sound service',
  'event managers',
  'event cloth and jewelry',
  'fast foods service',
  'flower decorators',
  'gifts and hampers',
  'ghoda gadi',
  'halwai',
  'helpers',
  'laundry services',
  'light decorators',
  'makeup artist',
  'mehendi artist',
  'musical group',
  'other related services',
  'photo and videography',
  'pujari ji',
  'stage decorator',
  'tent house',
  'vehicle on rent'
] as const;

export type ServiceType = typeof SERVICE_TYPES[number];

export const VENUE_TYPES = [
  'community halls',
  'hotel',
  'marriage garden',
  'marriage hall',
  'restorent'
] as const;

export type VenueType = typeof VENUE_TYPES[number];

export const VENUE_FACILITIES = [
  'ROOMS(AC)', 'ROOMS(NON AC)', 'DINNER HALL', 'WEDDING HALL', 'STAGE SITE', 
  'CATTERING HALL', 'PARKING SIDE', 'PARTY HALL', 'MEETING HALL', 'RESHORT SITE', 
  'RECEPTION SITE', 'GARDEN SITE', 'GROUND', 'INDOOR SITE', 'OUTDOOR SITE'
] as const;

export const VENUE_SITE_LEVELS = [
  'rooms(non ac)', 'rooms(ac)', 'wedding hall', 'dinner hall', 'reception', 
  'stage site', 'ground', 'garden', 'dinning hall', 'kitchin hall', 
  'parking site', 'party hall', 'seminar hall', 'meeting hall'
] as const;

export const EVENT_TYPES = [
  'WEDDING', 'SANGEET', 'ENGAGEMENT', 'HALDI', 'BIRTHDAY PARTY', 'ANIVVIVERSARY', 
  'CORPORATE EVENTS', 'SEMINAR', 'WORKSHOP', 'EXHIBITION', 'MUSIC CONCERT', 'SPECIAL OCCASION'
] as const;

export const AVAILABLE_FOR_OPTIONS = [
  'marriage', 'party', 'function', 'meetings', 'special event', 'conferences'
] as const;

export const VENUE_FACILITY_OPTIONS = [
  'ac rooms', 'non ac rooms', 'conference halls', 'lowns', 'parking', 'halls', 
  'dyning hall', 'marriage hall', 'party hall', 'meeting hall', 'enterence', 
  'securities', 'stage site', 'gardens', 'sweeming pools', 'receptions'
] as const;

export const SERVICE_FACILITY_OPTIONS = [
  'service with full garrenty', 'doorstep service', 'supply service only', 
  'take from shope service', 'as per work service', 'delavery service'
] as const;

export const DEFAULT_MOCK_DATA = {
  users: [],
  venues: [],
  service_providers: [],
  bookings: [],
  reviews: [],
  user_subscriptions: [],
  global_settings: [{ id: 'default', subscriptionEnabled: true, appName: 'Best Venue Option' }]
};
