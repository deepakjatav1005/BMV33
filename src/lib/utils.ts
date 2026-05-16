import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export const formatTime12h = (timeStr: string | null | undefined) => {
  if (!timeStr) return '';
  try {
    const d = new Date(timeStr);
    if (!isNaN(d.getTime())) return format(d, 'hh:mm a');
    
    const [hours, minutes] = timeStr.split(':');
    const d2 = new Date();
    d2.setHours(parseInt(hours), parseInt(minutes));
    return format(d2, 'hh:mm a');
  } catch {
    return timeStr;
  }
};

export const formatDateTime12h = (date: Date | string | null | undefined) => {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return typeof date === 'string' ? date : '';
    return format(d, 'dd/MM/yyyy hh:mm a');
  } catch {
    return typeof date === 'string' ? date : '';
  }
};

export const formatDateDDMMYYYY = (date: Date | string | null | undefined) => {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return typeof date === 'string' ? date : '';
    return format(d, 'dd/MM/yyyy');
  } catch {
    return typeof date === 'string' ? date : '';
  }
};

export const generateTransactionId = (ownerRegId: string, count: number, isManual: boolean = false) => {
  const idNumber = ownerRegId.replace(/\D/g, '') || '000000';
  const type = isManual ? 'MB' : 'PB';
  const serial = (count + 1).toString().padStart(4, '0');
  return `BVO/${idNumber}/${type}/${serial}`;
};

export const imageUrlToBase64 = async (url: string): Promise<string | null> => {
  if (!url) return null;
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error('Error converting image to base64:', err);
    return null;
  }
};
