import jsPDF from 'jspdf';

/**
 * Generate a professional PDF itinerary for a booking
 * @param {Object} bookingData - The booking data
 * @param {Object} tripRequestData - The trip request data (for custom trips)
 * @param {string} filename - The filename for the PDF
 */
export const generateSimpleItineraryPDF = (bookingData, tripRequestData = null, filename = 'itinerary.pdf') => {
  try {
    console.log('=== PDF GENERATION DEBUG START ===');
    console.log('Raw bookingData received:', JSON.stringify(bookingData, null, 2));
    console.log('Raw tripRequestData received:', JSON.stringify(tripRequestData, null, 2));
    console.log('=== PDF GENERATION DEBUG END ===');
    
    // Validate input data
    if (!bookingData) {
      throw new Error('Booking data is required');
    }
    
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      throw new Error('PDF generation requires a browser environment');
    }
    
    // Create new PDF document
    const doc = new jsPDF('p', 'mm', 'a4');
    console.log('PDF document created');
    
    // Professional color palette
    const colors = {
      primary: [30, 64, 175],      // Blue-600
      primaryLight: [59, 130, 246], // Blue-500
      secondary: [16, 185, 129],   // Emerald-500
      accent: [245, 158, 11],      // Amber-500
      gray100: [243, 244, 246],    // Gray-100
      gray200: [229, 231, 235],    // Gray-200
      gray400: [156, 163, 175],    // Gray-400
      gray600: [75, 85, 99],       // Gray-600
      gray800: [31, 41, 55],       // Gray-800
      white: [255, 255, 255],      // White
      success: [34, 197, 94],      // Green-500
      warning: [245, 158, 11],     // Amber-500
      error: [239, 68, 68]        // Red-500
    };
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    
    // Helper function to add text with styling
    const addText = (text, x, y, options = {}) => {
      const {
        fontSize = 10,
        color = colors.gray800,
        align = 'left',
        fontStyle = 'normal'
      } = options;
      
      // Ensure text is always a string
      const textString = String(text || '');
      
      doc.setFontSize(fontSize);
      doc.setTextColor(...color);
      doc.setFont('helvetica', fontStyle);
      
      if (align === 'center') {
        const textWidth = doc.getTextWidth(textString);
        x = (pageWidth - textWidth) / 2;
      } else if (align === 'right') {
        const textWidth = doc.getTextWidth(textString);
        x = pageWidth - margin - textWidth;
      }
      
      doc.text(textString, x, y);
    };
    
    // Helper function to add a rectangle with styling
    const addRect = (x, y, width, height, options = {}) => {
      const {
        fillColor = null,
        strokeColor = colors.gray200,
        strokeWidth = 0.5
      } = options;
      
      if (fillColor) {
        doc.setFillColor(...fillColor);
        doc.rect(x, y, width, height, 'F');
      }
      
      if (strokeColor) {
        doc.setDrawColor(...strokeColor);
        doc.setLineWidth(strokeWidth);
        doc.rect(x, y, width, height, 'S');
      }
    };
    
    // Helper function to add a line
    const addLine = (x1, y1, x2, y2, color = colors.gray200, width = 0.5) => {
      doc.setDrawColor(...color);
      doc.setLineWidth(width);
      doc.line(x1, y1, x2, y2);
    };
    
    let yPosition = margin;
    
    // Professional Header
    addRect(0, 0, pageWidth, 35, { fillColor: colors.primary });
    
    // Company name
    addText('SERENDIB GO', pageWidth / 2, 18, {
      fontSize: 18,
      color: colors.white,
      align: 'center',
      fontStyle: 'bold'
    });
    
    addText('Premium Travel Experience', pageWidth / 2, 25, {
      fontSize: 9,
      color: colors.white,
      align: 'center'
    });
    
    yPosition = 45;
    
    // Document title
    addText('TRAVEL ITINERARY & BOOKING CONFIRMATION', pageWidth / 2, yPosition, {
      fontSize: 12,
      color: colors.primary,
      align: 'center',
      fontStyle: 'bold'
    });
    
    yPosition += 12;
    
    // Invoice details row
    const invoiceNumber = `INV-${(bookingData._id || bookingData.id || 'BOOKING').toString().slice(-8).toUpperCase()}`;
    const invoiceDate = new Date().toLocaleDateString();
    const bookingId = String(bookingData._id || bookingData.id || 'N/A');
    
    addText(`Invoice Number: ${invoiceNumber}`, margin, yPosition, { fontSize: 8, color: colors.gray800 });
    addText(`Invoice Date: ${invoiceDate}`, pageWidth / 2, yPosition, { fontSize: 8, color: colors.gray800 });
    addText(`Booking ID: ${bookingId}`, pageWidth - margin, yPosition, { fontSize: 8, color: colors.gray800, align: 'right' });
    
    yPosition += 10;
    
    // Customer and Company Information (Side by side)
    const leftWidth = (pageWidth - 2 * margin - 8) / 2;
    const rightWidth = leftWidth;
    
    // Customer Information
    addRect(margin, yPosition, leftWidth, 40, {
      fillColor: colors.gray100,
      strokeColor: colors.secondary,
      strokeWidth: 1
    });
    
    addText('CUSTOMER INFORMATION', margin + 3, yPosition + 6, {
      fontSize: 9,
      color: colors.secondary,
      fontStyle: 'bold'
    });
    
    // Extract customer information
    const customerName = String(
      bookingData.customerName || 
      bookingData.user?.name || 
      tripRequestData?.contactInfo?.name || 
      bookingData.name || 
      'N/A'
    );
    const customerEmail = String(
      bookingData.customerEmail || 
      bookingData.user?.email || 
      tripRequestData?.contactInfo?.email || 
      bookingData.email || 
      'N/A'
    );
    const customerPhone = String(
      bookingData.customerPhone || 
      bookingData.user?.phone || 
      tripRequestData?.contactInfo?.phone || 
      bookingData.phone || 
      'N/A'
    );
    const bookingDate = new Date(bookingData.createdAt || bookingData.bookingDate || new Date()).toLocaleDateString();
    
    addText(`Name: ${customerName}`, margin + 3, yPosition + 14, { fontSize: 7, color: colors.gray800 });
    addText(`Email: ${customerEmail}`, margin + 3, yPosition + 22, { fontSize: 7, color: colors.gray800 });
    addText(`Phone: ${customerPhone}`, margin + 3, yPosition + 30, { fontSize: 7, color: colors.gray800 });
    addText(`Booking Date: ${bookingDate}`, margin + 3, yPosition + 38, { fontSize: 7, color: colors.gray800 });
    
    // Company Information
    addRect(margin + leftWidth + 8, yPosition, rightWidth, 40, {
      fillColor: colors.gray100,
      strokeColor: colors.primary,
      strokeWidth: 1
    });
    
    addText('SERENDIBGO INFORMATION', margin + leftWidth + 11, yPosition + 6, {
      fontSize: 9,
      color: colors.primary,
      fontStyle: 'bold'
    });
    
    addText('Company: SerendibGo Travel', margin + leftWidth + 11, yPosition + 14, { fontSize: 7, color: colors.gray800 });
    addText('Email: support@serendibgo.lk', margin + leftWidth + 11, yPosition + 22, { fontSize: 7, color: colors.gray800 });
    addText('Phone: +94 11 234 5678', margin + leftWidth + 11, yPosition + 30, { fontSize: 7, color: colors.gray800 });
    addText('Website: www.serendibgo.lk', margin + leftWidth + 11, yPosition + 38, { fontSize: 7, color: colors.gray800 });
    
    yPosition += 50;
    
    // Booking Status Section
    addRect(margin, yPosition, pageWidth - 2 * margin, 20, {
      fillColor: colors.gray100,
      strokeColor: colors.success,
      strokeWidth: 1
    });
    
    addText('BOOKING STATUS & PAYMENT SUMMARY', margin + 3, yPosition + 6, {
      fontSize: 9,
      color: colors.success,
      fontStyle: 'bold'
    });
    
    const bookingStatus = String(bookingData.status || 'Confirmed');
    const paymentStatus = String(bookingData.paymentStatus || 'Paid');
    const confirmationNumber = String(bookingData.confirmationNumber || `CONF-${(bookingData._id || bookingData.id || 'BOOKING').toString().slice(-8)}`);
    
    addText(`Status: ${bookingStatus}`, margin + 3, yPosition + 14, { fontSize: 7, color: colors.gray800 });
    addText(`Payment: ${paymentStatus}`, margin + 60, yPosition + 14, { fontSize: 7, color: colors.gray800 });
    addText(`Confirmation: ${confirmationNumber}`, margin + 120, yPosition + 14, { fontSize: 7, color: colors.gray800 });
    
    yPosition += 28;
    
    // Trip Details Section
    addRect(margin, yPosition, pageWidth - 2 * margin, 45, {
      fillColor: colors.gray100,
      strokeColor: colors.secondary,
      strokeWidth: 1
    });
    
    addText('TRIP DETAILS', margin + 3, yPosition + 6, {
      fontSize: 9,
      color: colors.secondary,
      fontStyle: 'bold'
    });
    
    // Extract trip information with better booking type detection
    const isCustomTrip = tripRequestData !== null;
    
    // More robust booking type detection
    const hasGuide = bookingData.guide || bookingData.guideId;
    const hasTourType = bookingData.tourType;
    const hasVehicle = bookingData.vehicle || bookingData.vehicleId;
    const hasVehicleType = bookingData.vehicleType;
    const hasHotel = bookingData.hotel || bookingData.hotelId;
    const hasRoomType = bookingData.roomType;
    const hasTitle = bookingData.title;
    const hasTour = bookingData.tour;
    
    // Additional checks for custom trip detection
    const hasTripRequest = bookingData.tripRequest;
    const hasNotes = bookingData.notes && bookingData.notes.includes('trip request:');
    const isCustomTripFromBooking = hasTripRequest || hasNotes;
    
    const isGuideBooking = hasGuide || hasTourType;
    const isVehicleBooking = hasVehicle || hasVehicleType;
    const isHotelBooking = hasHotel || hasRoomType;
    
    console.log('PDF Generation - Detailed booking type detection:', {
      isCustomTrip,
      isCustomTripFromBooking,
      hasTripRequest,
      hasNotes,
      hasGuide,
      hasTourType,
      hasVehicle,
      hasVehicleType,
      hasHotel,
      hasRoomType,
      hasTitle,
      hasTour,
      isGuideBooking,
      isVehicleBooking,
      isHotelBooking,
      bookingDataKeys: Object.keys(bookingData),
      tripRequestDataKeys: tripRequestData ? Object.keys(tripRequestData) : 'No trip request data'
    });
    
    // Determine trip title based on booking type
    let tripTitle = 'Adventure Awaits';
    if (isCustomTrip || isCustomTripFromBooking) {
      tripTitle = tripRequestData?.title || bookingData.title || 'Custom Trip';
      console.log('PDF Generation - Using custom trip title:', tripTitle, 'From tripRequestData:', tripRequestData?.title, 'From bookingData:', bookingData.title);
    } else if (isGuideBooking) {
      tripTitle = `Guide Service - ${bookingData.guide?.name || 'Professional Guide'}`;
      console.log('PDF Generation - Using guide booking title:', tripTitle, 'Guide data:', bookingData.guide);
    } else if (isVehicleBooking) {
      tripTitle = `Vehicle Rental - ${bookingData.vehicle?.brand || 'Vehicle'} ${bookingData.vehicle?.model || ''}`;
      console.log('PDF Generation - Using vehicle booking title:', tripTitle, 'Vehicle data:', bookingData.vehicle);
    } else if (isHotelBooking) {
      tripTitle = `Hotel Booking - ${bookingData.hotel?.name || 'Hotel'}`;
      console.log('PDF Generation - Using hotel booking title:', tripTitle, 'Hotel data:', bookingData.hotel);
    } else {
      tripTitle = bookingData.title || bookingData.tour?.title || 'Adventure Awaits';
      console.log('PDF Generation - Using default/tour title:', tripTitle, 'Title data:', bookingData.title, 'Tour data:', bookingData.tour);
    }
    
    console.log('PDF Generation - Final trip title determined:', tripTitle);
    
    // Determine duration based on booking type
    let tripDuration = 'N/A';
    if (isCustomTrip || isCustomTripFromBooking) {
      tripDuration = tripRequestData?.duration || bookingData.duration || 'N/A';
      console.log('PDF Generation - Using custom trip duration:', tripDuration, 'From tripRequestData:', tripRequestData?.duration, 'From bookingData:', bookingData.duration);
    } else if (isGuideBooking) {
      const start = new Date(bookingData.startDate);
      const end = new Date(bookingData.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      tripDuration = `${days} day${days > 1 ? 's' : ''}`;
      console.log('PDF Generation - Using guide booking duration:', tripDuration, 'Days calculated:', days);
    } else if (isVehicleBooking) {
      const start = new Date(bookingData.startDate);
      const end = new Date(bookingData.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      tripDuration = `${days} day${days > 1 ? 's' : ''} rental`;
      console.log('PDF Generation - Using vehicle booking duration:', tripDuration, 'Days calculated:', days);
    } else if (isHotelBooking) {
      const start = new Date(bookingData.startDate);
      const end = new Date(bookingData.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      tripDuration = `${days} night${days > 1 ? 's' : ''} stay`;
      console.log('PDF Generation - Using hotel booking duration:', tripDuration, 'Days calculated:', days);
    } else {
      tripDuration = bookingData.duration || bookingData.tour?.duration || 'N/A';
      console.log('PDF Generation - Using default/tour duration:', tripDuration);
    }
    
    console.log('PDF Generation - Final duration determined:', tripDuration);
    
    // Determine location based on booking type
    let tripLocation = 'N/A';
    if (isCustomTrip || isCustomTripFromBooking) {
      tripLocation = tripRequestData?.location || bookingData.location || 'N/A';
      console.log('PDF Generation - Using custom trip location:', tripLocation, 'From tripRequestData:', tripRequestData?.location, 'From bookingData:', bookingData.location);
    } else if (isGuideBooking) {
      tripLocation = bookingData.guide?.location || bookingData.meetingPoint || 'N/A';
      console.log('PDF Generation - Using guide booking location:', tripLocation, 'Guide location:', bookingData.guide?.location, 'Meeting point:', bookingData.meetingPoint);
    } else if (isVehicleBooking) {
      tripLocation = bookingData.vehicle?.location || bookingData.pickupLocation || 'N/A';
      console.log('PDF Generation - Using vehicle booking location:', tripLocation, 'Vehicle location:', bookingData.vehicle?.location, 'Pickup location:', bookingData.pickupLocation);
    } else if (isHotelBooking) {
      tripLocation = bookingData.hotel?.location || bookingData.hotel?.address || 'N/A';
      console.log('PDF Generation - Using hotel booking location:', tripLocation, 'Hotel location:', bookingData.hotel?.location, 'Hotel address:', bookingData.hotel?.address);
    } else {
      tripLocation = bookingData.location || bookingData.tour?.location || 'N/A';
      console.log('PDF Generation - Using default/tour location:', tripLocation);
    }
    
    console.log('PDF Generation - Final location determined:', tripLocation);
    
    const startDate = bookingData.startDate ? new Date(bookingData.startDate).toLocaleDateString() : 'N/A';
    const endDate = bookingData.endDate ? new Date(bookingData.endDate).toLocaleDateString() : 'N/A';
    const participants = String(bookingData.participants || bookingData.guests || bookingData.tour?.maxParticipants || 'N/A');
    
    // Trip title
    addText(tripTitle, margin + 3, yPosition + 15, {
      fontSize: 11,
      color: colors.gray800,
      fontStyle: 'bold'
    });
    
    // Trip details in two columns
    const tripDetailsLeft = [
      `Duration: ${tripDuration}`,
      `Location: ${tripLocation}`,
      `Start Date: ${startDate}`
    ];
    
    const tripDetailsRight = [
      `End Date: ${endDate}`,
      `Participants: ${participants}`,
      `Type: ${(isCustomTrip || isCustomTripFromBooking) ? 'Custom Trip' : isGuideBooking ? 'Guide Service' : isVehicleBooking ? 'Vehicle Rental' : isHotelBooking ? 'Hotel Booking' : 'Pre-designed Tour'}`
    ];
    
    tripDetailsLeft.forEach((detail, index) => {
      addText(detail, margin + 3, yPosition + 25 + (index * 6), { fontSize: 7, color: colors.gray800 });
    });
    
    tripDetailsRight.forEach((detail, index) => {
      addText(detail, margin + 90, yPosition + 25 + (index * 6), { fontSize: 7, color: colors.gray800 });
    });
    
    yPosition += 55;
    
    // Payment Information Table
    addText('PAYMENT INFORMATION', margin, yPosition, {
      fontSize: 9,
      color: colors.primary,
      fontStyle: 'bold'
    });
    
    yPosition += 8;
    
    // Payment table
    const tableWidth = pageWidth - 2 * margin;
    const colWidths = [tableWidth * 0.5, tableWidth * 0.15, tableWidth * 0.2, tableWidth * 0.15];
    
    // Table header
    addRect(margin, yPosition, tableWidth, 10, {
      fillColor: colors.primary,
      strokeColor: null
    });
    
    const headers = ['Description', 'Qty', 'Unit Price', 'Total'];
    headers.forEach((header, index) => {
      const x = margin + colWidths.slice(0, index).reduce((sum, width) => sum + width, 0);
      addText(header, x + 2, yPosition + 6, {
        fontSize: 8,
        color: colors.white,
        fontStyle: 'bold'
      });
    });
    
    yPosition += 10;
    
    // Table row
    const totalAmount = Number(bookingData.totalAmount || bookingData.amount || 0);
    const currency = String(bookingData.currency || 'LKR');
    const participantsNum = Number(participants) || 1;
    const perPersonCost = participantsNum > 0 ? totalAmount / participantsNum : totalAmount;
    
    addRect(margin, yPosition, tableWidth, 12, {
      fillColor: colors.white,
      strokeColor: colors.gray200,
      strokeWidth: 1
    });
    
    // Determine service description based on booking type
    let serviceDescription = tripTitle;
    if (isCustomTrip || isCustomTripFromBooking) {
      serviceDescription = tripRequestData?.title || bookingData.title || 'Custom Trip';
      console.log('PDF Generation - Using custom trip service description:', serviceDescription);
    } else if (isGuideBooking) {
      serviceDescription = `Guide Service - ${bookingData.guide?.name || 'Professional Guide'}`;
      if (bookingData.tourType) {
        serviceDescription += ` (${bookingData.tourType.charAt(0).toUpperCase() + bookingData.tourType.slice(1)} Tour)`;
      }
      console.log('PDF Generation - Using guide service description:', serviceDescription);
    } else if (isVehicleBooking) {
      serviceDescription = `Vehicle Rental - ${bookingData.vehicle?.brand || 'Vehicle'} ${bookingData.vehicle?.model || ''}`;
      if (bookingData.vehicleType) {
        serviceDescription += ` (${bookingData.vehicleType})`;
      }
      console.log('PDF Generation - Using vehicle service description:', serviceDescription, 'Vehicle data:', bookingData.vehicle);
    } else if (isHotelBooking) {
      serviceDescription = `Hotel Booking - ${bookingData.hotel?.name || 'Hotel'}`;
      if (bookingData.roomType) {
        serviceDescription += ` (${bookingData.roomType})`;
      }
      console.log('PDF Generation - Using hotel service description:', serviceDescription);
    } else {
      console.log('PDF Generation - Using default service description:', serviceDescription);
    }
    
    const rowData = [
      serviceDescription,
      String(participants),
      `${currency} ${perPersonCost.toLocaleString()}`,
      `${currency} ${totalAmount.toLocaleString()}`
    ];
    
    rowData.forEach((data, index) => {
      const x = margin + colWidths.slice(0, index).reduce((sum, width) => sum + width, 0);
      addText(data, x + 2, yPosition + 8, {
        fontSize: 8,
        color: colors.gray800
      });
    });
    
    yPosition += 12;
    
    // Total row
    addRect(margin, yPosition, tableWidth, 10, {
      fillColor: colors.gray100,
      strokeColor: colors.primary,
      strokeWidth: 1
    });
    
    addText('TOTAL AMOUNT', margin + 2, yPosition + 6, {
      fontSize: 9,
      color: colors.primary,
      fontStyle: 'bold'
    });
    
    addText(`${currency} ${totalAmount.toLocaleString()}`, pageWidth - margin - 2, yPosition + 6, {
      fontSize: 9,
      color: colors.primary,
      align: 'right',
      fontStyle: 'bold'
    });
    
    yPosition += 18;
    
    // Payment Status
    addRect(margin, yPosition, pageWidth - 2 * margin, 15, {
      fillColor: colors.gray100,
      strokeColor: colors.success,
      strokeWidth: 1
    });
    
    addText('PAYMENT STATUS: PAID', margin + 3, yPosition + 6, {
      fontSize: 8,
      color: colors.success,
      fontStyle: 'bold'
    });
    
    addText(`Amount: ${currency} ${totalAmount.toLocaleString()}`, margin + 3, yPosition + 12, {
      fontSize: 7,
      color: colors.gray800
    });
    
    addText('Payment Method: Stripe Gateway', pageWidth - margin - 3, yPosition + 6, {
      fontSize: 7,
      color: colors.gray800,
      align: 'right'
    });
    
    yPosition += 22;
    
    // Important Notes
    addText('IMPORTANT INFORMATION', margin, yPosition, {
      fontSize: 9,
      color: colors.warning,
      fontStyle: 'bold'
    });
    
    yPosition += 6;
    
    // Generate notes based on booking type
    let notes = [
      '• Your booking has been confirmed and payment processed successfully',
      '• You will receive a detailed itinerary via email within 24 hours',
      '• Our team will contact you 48 hours before your tour',
      '• Please arrive 15 minutes before the scheduled start time',
      '• Bring comfortable clothing and sunscreen'
    ];
    
    if (isCustomTrip || isCustomTripFromBooking) {
      notes = [
        '• Your custom trip has been confirmed and payment processed successfully',
        '• Our team will contact you within 24 hours to discuss your trip details',
        '• We will create a personalized itinerary based on your requirements',
        '• Trip title: ' + (tripRequestData?.title || bookingData.title || 'Custom Trip'),
        '• Duration: ' + (tripRequestData?.duration || bookingData.duration || 'N/A'),
        '• Location: ' + (tripRequestData?.location || bookingData.location || 'N/A'),
        '• Special requests: ' + (tripRequestData?.specialRequests || bookingData.specialRequests || 'None'),
        '• Please bring comfortable clothing and sunscreen',
        '• Contact: SerendibGo Support for any questions'
      ];
      console.log('PDF Generation - Using custom trip-specific notes');
    } else if (isGuideBooking) {
      notes = [
        '• Your guide booking has been confirmed and payment processed successfully',
        '• Your guide will contact you 24 hours before your tour',
        '• Please arrive at the meeting point 15 minutes before start time',
        '• Meeting point: ' + (bookingData.meetingPoint || 'To be confirmed'),
        '• Tour type: ' + (bookingData.tourType ? bookingData.tourType.charAt(0).toUpperCase() + bookingData.tourType.slice(1) : 'General'),
        '• Bring comfortable clothing, sunscreen, and water',
        '• Special requests: ' + (bookingData.specialRequests || 'None')
      ];
      console.log('PDF Generation - Using guide-specific notes');
    } else if (isVehicleBooking) {
      notes = [
        '• Your vehicle rental has been confirmed and payment processed successfully',
        '• Pickup location: ' + (bookingData.pickupLocation || 'To be confirmed'),
        '• Return location: ' + (bookingData.returnLocation || 'Same as pickup'),
        '• Please bring a valid driving license and ID',
        '• Vehicle inspection will be done at pickup time',
        '• Fuel policy: ' + (bookingData.fuelPolicy || 'Full to full'),
        '• Contact: ' + (bookingData.vehicle?.contact || 'SerendibGo Support'),
        '• Vehicle: ' + (bookingData.vehicle?.brand || 'Vehicle') + ' ' + (bookingData.vehicle?.model || ''),
        '• Insurance: ' + (bookingData.insurance || 'Included'),
        '• Mileage limit: ' + (bookingData.mileageLimit || 'Unlimited')
      ];
      console.log('PDF Generation - Using vehicle-specific notes');
    } else if (isHotelBooking) {
      notes = [
        '• Your hotel booking has been confirmed and payment processed successfully',
        '• Check-in time: ' + (bookingData.hotel?.checkInTime || '2:00 PM'),
        '• Check-out time: ' + (bookingData.hotel?.checkOutTime || '11:00 AM'),
        '• Room type: ' + (bookingData.roomType || 'Standard'),
        '• Please bring a valid ID for check-in',
        '• Hotel contact: ' + (bookingData.hotel?.contact || 'SerendibGo Support'),
        '• Special requests: ' + (bookingData.specialRequests || 'None')
      ];
      console.log('PDF Generation - Using hotel-specific notes');
    } else {
      console.log('PDF Generation - Using default notes');
    }
    
    notes.forEach((note, index) => {
      addText(note, margin, yPosition + (index * 4), {
        fontSize: 7,
        color: colors.gray800
      });
    });
    
    yPosition += 25;
    
    // Footer
    addLine(margin, yPosition, pageWidth - margin, yPosition, colors.gray200, 1);
    
    yPosition += 3;
    
    addText('Thank you for choosing SerendibGo!', pageWidth / 2, yPosition, {
      fontSize: 8,
      color: colors.primary,
      align: 'center',
      fontStyle: 'bold'
    });
    
    yPosition += 5;
    
    addText('For support: support@serendibgo.lk | +94 11 234 5678 | www.serendibgo.lk', pageWidth / 2, yPosition, {
      fontSize: 7,
      color: colors.gray600,
      align: 'center'
    });
    
    yPosition += 4;
    
    addText(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, {
      fontSize: 6,
      color: colors.gray400,
      align: 'center'
    });
    
    // Save the PDF
    console.log('Saving professional PDF with filename:', filename);
    doc.save(filename);
    console.log('Professional PDF saved successfully');
    
    return true;
  } catch (error) {
    console.error('Error generating professional PDF:', error);
    console.error('Error stack:', error.stack);
    throw new Error(`Failed to generate PDF itinerary: ${error.message}`);
  }
};

/**
 * Format currency for display
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'LKR') => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${currency} 0`;
  }
  
  return `${currency} ${amount.toLocaleString()}`;
};