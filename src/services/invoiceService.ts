import { format } from 'date-fns';
import { db } from '../lib/supabase';
import { resolveUrl } from './dataService';
import { Booking, UserProfile } from '../types';
import { formatDateDDMMYYYY, formatTime12h } from '../lib/utils';

export const generateInvoice = async (booking: Booking, expenditure: number, providerProfile?: UserProfile | null, allBookings: Booking[] = [], globalSettings: any = null) => {
  const { jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  const doc = new jsPDF();
  
  // Fetch App Branding from admin_settings
  let appLogoUrl = '/logo.png';
  let appName = 'BEST VENUE OPTION';
  let appTagline = 'VENUE & EVENT & SERVICE PROVIDERS';
  
  try {
    const { data: settings } = await db.from('admin_settings').select('*');
    if (settings) {
      const logo = settings.find(s => s.key === 'app_logo_url')?.value;
      const name = settings.find(s => s.key === 'app_name')?.value;
      const tagline = settings.find(s => s.key === 'app_tagline')?.value;
      if (logo) appLogoUrl = logo;
      if (name) appName = name;
      if (tagline) appTagline = tagline;
    }
  } catch (e) {
    console.warn('Error fetching app settings for invoice:', e);
  }

  const fullTotalRecord = Number(booking.updatedAmount || 0) || Number(booking.totalAmount || 0) || 0;
  const extraServicesTotal = (booking.extra_services || []).reduce((sum, s) => sum + (Number(s.amount || 0) || 0), 0);
  const baseAmount = Math.max(0, fullTotalRecord - extraServicesTotal);
  const subTotalActual = Number(fullTotalRecord + (Number(expenditure || 0) || 0));
  
  // Accurately sum all payments, fetch if empty
  let invoicePayments = (booking.payments || []).map(p => ({...p, amount: Number(p.amount || 0) || 0}));
  if (invoicePayments.length === 0) {
    try {
      const { data } = await db.from('booking_payments').select('*').eq('booking_id', booking.id);
      if (data) {
        invoicePayments = data.map((p: any) => ({
          id: p.id,
          bookingId: p.booking_id,
          amount: Number(p.amount) || 0,
          paymentMode: p.payment_mode,
          paymentDate: p.payment_date,
          paymentType: p.payment_type,
          transaction_id: p.transaction_id || p.id?.substring(0, 8).toUpperCase(),
          createdAt: p.created_at
        }));
      }
    } catch (e) {
      console.error('Invoice: Failed to fetch payments', e);
    }
  }

  const totalReceived = invoicePayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const balanceDue = Math.max(0, subTotalActual - totalReceived);
  
  const isPaid = balanceDue <= 0 && subTotalActual > 0;
  const partyName = booking.isManual ? booking.partyName : (booking.visitorName || booking.partyName);
  const partyMobile = booking.isManual ? booking.visitorMobile : (booking.visitorMobile || '');

  const bookingTypePrefix = booking.isManual ? 'MB' : 'PB';
  const currentYear = new Date().getFullYear();
  const providerBookingsThisYear = allBookings
    .filter(b => {
      const bYear = new Date(b.createdAt || new Date()).getFullYear();
      const bOwnerId = b.ownerId;
      return bOwnerId === booking.ownerId && bYear === currentYear;
    })
    .sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
  
  const bookingIndex = providerBookingsThisYear.findIndex(b => b.id === booking.id);
  const serialNo = (bookingIndex !== -1 ? bookingIndex + 1 : providerBookingsThisYear.length + 1).toString().padStart(4, '0');
  const customInvoiceNo = `BVO/${bookingTypePrefix}/${serialNo}`;
  
  const getDisplayStatus = () => {
    const status = (booking.status || 'pending').toLowerCase();
    if (isPaid || status === 'completed') return 'COMPLETED';
    if (globalSettings && !globalSettings.subscriptionEnabled) return 'PAID'; 
    if (status === 'confirmed' || status === 'approved' || status === 'paid') return 'CONFIRMED';
    return status.toUpperCase();
  };

  const addTransactionHistory = (startY: number) => {
    let localY = startY;
    if (invoicePayments.length > 0) {
      if (localY > 210) { doc.addPage(); localY = 30; }
      doc.setDrawColor(200);
      doc.line(10, localY, 200, localY);
      localY += 10;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(234, 88, 12);
      doc.text("TRANSACTION HISTORY", 10, localY);
      localY += 8;
      
      doc.setFontSize(8);
      doc.setTextColor(100);
      const headerY = localY;
      doc.text("Date", 10, headerY);
      doc.text("Type", 50, headerY);
      doc.text("Mode", 100, headerY);
      doc.text("Amount", 185, headerY, { align: "right" });
      localY += 3;
      doc.line(10, localY, 200, localY);
      localY += 8;
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0);
      invoicePayments.forEach(p => {
        if (localY > 260) { 
          doc.addPage(); 
          localY = 30; 
          doc.setFont("helvetica", "bold");
          doc.text("TRANSACTION HISTORY (CONT.)", 10, localY);
          localY += 10;
        }
        const dateStr = p.paymentDate || format(new Date(p.createdAt), 'dd/MM/yyyy');
        const justDate = dateStr.includes(' ') ? dateStr.split(' ')[0] : dateStr;
        doc.text(justDate, 10, localY);
        doc.text((p.paymentType || 'Payment').toUpperCase(), 50, localY);
        doc.text((p.paymentMode || 'N/A').toUpperCase(), 100, localY);
        doc.text(`₹ ${Number(p.amount || 0).toLocaleString()}`, 185, localY, { align: "right" });
        localY += 8;
      });
      doc.line(10, localY, 200, localY);
      localY += 12;
    }
    return localY;
  };
  
  const headerTitle = (booking.targetName || "BUSINESS").split('(')[0].trim().toUpperCase();
  
  doc.setFontSize(22);
  doc.setTextColor(234, 88, 12); 
  doc.setFont("helvetica", "bold");
  doc.text(headerTitle, 105, 30, { align: 'center', maxWidth: 170 });
  
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.setFont("helvetica", "normal");
  doc.text(`Owner: ${providerProfile?.displayName || 'N/A'}`, 20, 50);
  doc.text(`Mobile: ${providerProfile?.mobileNumber || 'N/A'}`, 20, 55);
  
  if (providerProfile) {
    const address = `${providerProfile.block || ''}, ${providerProfile.district || ''}, ${providerProfile.state || ''} - ${providerProfile.pincode || ''}`;
    doc.text(address, 190, 50, { align: 'right', maxWidth: 80 });
  }
  
  doc.setDrawColor(234, 88, 12);
  doc.setLineWidth(0.5);
  doc.line(20, 60, 190, 60);
  
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", 20, 70);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Invoice No: ${customInvoiceNo}`, 190, 70, { align: 'right' });
  doc.text(`Date: ${formatDateDDMMYYYY(new Date())}`, 190, 75, { align: 'right' });
  doc.text(`Time: ${formatTime12h(new Date().toLocaleTimeString())}`, 190, 80, { align: 'right' });

  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text("BILL TO:", 20, 90);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${partyName || 'N/A'}`, 20, 98);
  doc.text(`Mobile: ${partyMobile}`, 20, 103);
  
  let currentY_BillTo = 108;
  if (booking.partyAddress) {
    const addr = `Address: ${booking.partyAddress}`;
    const splitAddr = doc.splitTextToSize(addr, 100);
    doc.text(splitAddr, 20, currentY_BillTo);
    currentY_BillTo += (splitAddr.length * 5);
  }
  
  doc.text(`Event: ${booking.eventType || 'N/A'}`, 20, currentY_BillTo + 2);
  doc.text(`Date: ${formatDateDDMMYYYY(booking.eventDate)}${booking.endDate ? ' to ' + formatDateDDMMYYYY(booking.endDate) : ''}`, 20, currentY_BillTo + 7);
  if (booking.startTime) {
    doc.text(`Timing: ${formatTime12h(booking.startTime)} - ${formatTime12h(booking.endTime)}`, 20, currentY_BillTo + 12);
  }

  doc.setFont("helvetica", "bold");
  doc.text(`Booking Status:`, 140, 90);
  doc.setFont("helvetica", "normal");
  doc.text(`${getDisplayStatus()}`, 190, 90, { align: 'right' });
  
  doc.setFont("helvetica", "bold");
  doc.text(`Payment Status:`, 140, 96);
  doc.setFont("helvetica", "normal");
  doc.text(`${(isPaid ? 'PAID' : 'PENDING')}`, 190, 96, { align: 'right' });

  const tableRows = [];
  if (baseAmount > 0) {
    tableRows.push([`Base Booking Amount for ${booking.targetName.split('(')[0].trim()}`, `₹ ${baseAmount.toLocaleString()}`]);
  }
  if (expenditure > 0) {
    tableRows.push(['Additional Expenditure', `₹ ${Math.round(expenditure).toLocaleString()}`]);
  }
  if (booking.extra_services && booking.extra_services.length > 0) {
    booking.extra_services.forEach(s => {
      tableRows.push([s.name, `₹ ${Math.round(s.amount || 0).toLocaleString()}`]);
    });
  }

  autoTable(doc, {
    startY: Math.max(140, currentY_BillTo + 20),
    head: [['Description', 'Amount']],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [234, 88, 12] },
    margin: { left: 20, right: 20 },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: 50, halign: 'right' }
    }
  });

  let currentY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text("Final Booking Total:", 110, currentY);
  doc.text(`₹ ${Number(subTotalActual || 0).toLocaleString()}`, 190, currentY, { align: 'right' });
  currentY += 8;
  
  doc.setFontSize(10);
  doc.text("Total Amount Paid:", 110, currentY);
  doc.text(`₹ ${Number(totalReceived || 0).toLocaleString()}`, 190, currentY, { align: 'right' });
  currentY += 8;
  
  doc.setFontSize(12);
  if (balanceDue > 0) {
    doc.setTextColor(220, 38, 38); 
  } else {
    doc.setTextColor(22, 163, 74); 
  }
  doc.text("Balance Due:", 110, currentY);
  doc.text(`₹ ${Number(balanceDue || 0).toLocaleString()}`, 190, currentY, { align: 'right' });
  currentY += 12;

  const finalY = addTransactionHistory(currentY);

  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.setFont("helvetica", "italic");
  doc.text("Thank you for choosing our services!", 105, finalY + 10, { align: 'center' });
  
  return doc.output('blob');
};
