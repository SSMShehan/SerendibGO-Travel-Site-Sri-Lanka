import jsPDF from 'jspdf';

/**
 * Generate a premium professional PDF itinerary for a booking
 * @param {Object} bookingData - The booking data
 * @param {Object} tripRequestData - The trip request data (for custom trips)
 * @param {string} filename - The filename for the PDF
 */
export const generateSimpleItineraryPDF = (bookingData, tripRequestData = null, filename = 'itinerary.pdf') => {
  try {
    console.log('Premium PDF generation started');
    
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
    
    // Premium color palette
    const colors = {
      primary: [15, 46, 83],        // Navy Blue
      primaryLight: [30, 64, 175],  // Royal Blue
      secondary: [220, 163, 34],    // Gold
      accent: [16, 185, 129],       // Emerald
      lightBg: [248, 250, 252],     // Light Blue Gray
      cardBg: [255, 255, 255],      // White
      textDark: [15, 23, 42],       // Dark Blue Gray
      textLight: [100, 116, 139],   // Slate
      border: [226, 232, 240],      // Light Border
      success: [34, 197, 94],       // Green
      warning: [245, 158, 11],      // Amber
      error: [239, 68, 68]          // Red
    };
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 25;
    
    // Helper function to add gradient background
    const addGradient = (x, y, width, height, color1, color2) => {
      const gradient = doc.context2d.createLinearGradient(x, y, x, y + height);
      gradient.addColorStop(0, `rgb(${color1.join(',')})`);
      gradient.addColorStop(1, `rgb(${color2.join(',')})`);
      
      doc.setFillColor(...color1);
      doc.rect(x, y, width, height, 'F');
    };
    
    // Helper function to add text with styling
    const addText = (text, x, y, options = {}) => {
      const {
        fontSize = 12,
        color = colors.textDark,
        align = 'left',
        fontStyle = 'normal',
        font = 'helvetica',
        maxWidth = null
      } = options;
      
      // Ensure text is always a string
      const textString = String(text || '');
      
      doc.setFontSize(fontSize);
      doc.setTextColor(...color);
      doc.setFont(font, fontStyle);
      
      let finalX = x;
      if (align === 'center') {
        const textWidth = doc.getTextWidth(textString);
        finalX = (pageWidth - textWidth) / 2;
      } else if (align === 'right') {
        const textWidth = doc.getTextWidth(textString);
        finalX = pageWidth - margin - textWidth;
      }
      
      if (maxWidth) {
        const lines = doc.splitTextToSize(textString, maxWidth);
        doc.text(lines, finalX, y);
      } else {
        doc.text(textString, finalX, y);
      }
    };
    
    // Helper function to add rounded rectangle
    const addRoundedRect = (x, y, width, height, radius = 5, options = {}) => {
      const {
        fillColor = null,
        strokeColor = colors.border,
        strokeWidth = 1
      } = options;
      
      // Simplified rounded rectangle (jsPDF doesn't support native rounded rect)
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
    
    // Helper function to add badge
    const addBadge = (text, x, y, color = colors.secondary) => {
      const textWidth = doc.getTextWidth(text) + 12;
      addRoundedRect(x, y, textWidth, 18, 10, {
        fillColor: color,
        strokeColor: null
      });
      
      addText(text, x + textWidth / 2, y + 11, {
        fontSize: 9,
        color: colors.textDark,
        align: 'center',
        fontStyle: 'bold'
      });
    };
    
    // Helper function to add icon with text
    const addIconText = (icon, text, x, y, options = {}) => {
      const { iconSize = 12, textSize = 11, color = colors.textDark } = options;
      
      addText(icon, x, y + 1, { fontSize: iconSize, color });
      addText(text, x + 15, y, { fontSize: textSize, color, maxWidth: pageWidth - x - 30 });
    };
    
    // Helper function to add section header
    const addSectionHeader = (title, subtitle, x, y) => {
      addText(title, x, y, {
        fontSize: 18,
        color: colors.primary,
        fontStyle: 'bold'
      });
      
      if (subtitle) {
        addText(subtitle, x, y + 8, {
          fontSize: 12,
          color: colors.textLight
        });
      }
    };
    
    // Helper function to add divider
    const addDivider = (y, length = pageWidth - 2 * margin) => {
      doc.setDrawColor(...colors.border);
      doc.setLineWidth(0.5);
      doc.line(margin, y, margin + length, y);
    };
    
    let yPosition = 0;
    
    // Premium Header with sophisticated design
    addGradient(0, 0, pageWidth, 120, colors.primary, [8, 28, 58]);
    
    // Add decorative elements to header
    for (let i = 0; i < pageWidth; i += 25) {
      doc.setFillColor(255, 255, 255, 0.1);
      doc.circle(i, 60, 2, 'F');
    }
    
    // Company logo and title
    addText('✈️', pageWidth / 2, 45, {
      fontSize: 32,
      color: colors.secondary,
      align: 'center'
    });
    
    addText('SERENDIB GO', pageWidth / 2, 60, {
      fontSize: 24,
      color: [255, 255, 255],
      align: 'center',
      fontStyle: 'bold',
      font: 'helvetica'
    });
    
    addText('LUXURY TRAVEL EXPERIENCES', pageWidth / 2, 70, {
      fontSize: 12,
      color: [255, 255, 255, 0.8],
      align: 'center',
      font: 'helvetica'
    });
    
    // Main title with accent
    addRoundedRect(margin, 85, pageWidth - 2 * margin, 25, 8, {
      fillColor: [255, 255, 255, 0.95],
      strokeColor: colors.secondary
    });
    
    addText('TRAVEL ITINERARY & CONFIRMATION', pageWidth / 2, 100, {
      fontSize: 16,
      color: colors.primary,
      align: 'center',
      fontStyle: 'bold'
    });
    
    yPosition = 125;
    
    // Quick Info Cards
    const quickInfoData = [
      { icon: '📅', label: 'Booking Date', value: new Date(bookingData.createdAt || new Date()).toLocaleDateString() },
      { icon: '👥', label: 'Travelers', value: String(bookingData.participants || bookingData.guests || 1) },
      { icon: '⏱️', label: 'Duration', value: String(bookingData.duration || bookingData.tour?.duration || 'N/A') },
      { icon: '📍', label: 'Location', value: String(bookingData.location || bookingData.tour?.location || 'Sri Lanka') }
    ];
    
    const cardWidth = (pageWidth - 2 * margin - 15) / 4;
    quickInfoData.forEach((info, index) => {
      const x = margin + index * (cardWidth + 5);
      
      addRoundedRect(x, yPosition, cardWidth, 50, 8, {
        fillColor: colors.cardBg,
        strokeColor: colors.border
      });
      
      addText(info.icon, x + cardWidth / 2, yPosition + 15, {
        fontSize: 16,
        align: 'center'
      });
      
      addText(info.label, x + cardWidth / 2, yPosition + 28, {
        fontSize: 9,
        color: colors.textLight,
        align: 'center'
      });
      
      addText(info.value, x + cardWidth / 2, yPosition + 38, {
        fontSize: 11,
        color: colors.primary,
        align: 'center',
        fontStyle: 'bold'
      });
    });
    
    yPosition += 65;
    
    // Trip Overview Section
    addSectionHeader('Trip Overview', 'Your journey details', margin, yPosition);
    yPosition += 25;
    
    const isCustomTrip = tripRequestData !== null;
    const tripTitle = String(isCustomTrip ? tripRequestData.title : bookingData.title || bookingData.tour?.title || 'Premium Sri Lankan Experience');
    
    addRoundedRect(margin, yPosition, pageWidth - 2 * margin, 80, 8, {
      fillColor: colors.lightBg,
      strokeColor: colors.border
    });
    
    // Trip title with badge
    addText(tripTitle, margin + 15, yPosition + 20, {
      fontSize: 20,
      color: colors.primary,
      fontStyle: 'bold',
      maxWidth: pageWidth - 2 * margin - 30
    });
    
    addBadge(isCustomTrip ? 'CUSTOM JOURNEY' : 'CURATED EXPERIENCE', margin + 15, yPosition + 30, 
             isCustomTrip ? colors.accent : colors.secondary);
    
    // Trip details in two columns
    const tripDetails = [
      { icon: '🗓️', label: 'Start Date', value: bookingData.startDate ? new Date(bookingData.startDate).toLocaleDateString() : 'To be confirmed' },
      { icon: '🏁', label: 'End Date', value: bookingData.endDate ? new Date(bookingData.endDate).toLocaleDateString() : 'To be confirmed' },
      { icon: '⭐', label: 'Experience Level', value: 'Premium' },
      { icon: '👑', label: 'Service Tier', value: 'Luxury' }
    ];
    
    tripDetails.forEach((detail, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = margin + 15 + col * ((pageWidth - 2 * margin - 30) / 2);
      const y = yPosition + 50 + row * 15;
      
      addIconText(detail.icon, `${detail.label}: ${detail.value}`, x, y, {
        textSize: 10,
        color: colors.textDark
      });
    });
    
    yPosition += 95;
    
    // Booking & Payment Status Section
    addSectionHeader('Booking Status', 'Current reservation details', margin, yPosition);
    yPosition += 25;
    
    addRoundedRect(margin, yPosition, pageWidth - 2 * margin, 60, 8, {
      fillColor: colors.cardBg,
      strokeColor: colors.border
    });
    
    const statusData = [
      { label: 'Booking Status', value: String(bookingData.status || 'Confirmed'), color: colors.success },
      { label: 'Payment Status', value: String(bookingData.paymentStatus || 'Paid'), color: colors.success },
      { label: 'Confirmation ID', value: String(bookingData.confirmationNumber || `CONF-${(bookingData._id || bookingData.id || 'BOOKING').toString().slice(-8)}`), color: colors.primary },
      { label: 'Invoice Number', value: `INV-${bookingData._id?.toString().slice(-8).toUpperCase() || 'BOOKING'}`, color: colors.primary }
    ];
    
    statusData.forEach((item, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = margin + 20 + col * ((pageWidth - 2 * margin - 40) / 2);
      const y = yPosition + 20 + row * 20;
      
      addText(item.label, x, y, {
        fontSize: 10,
        color: colors.textLight
      });
      
      addText(item.value, x, y + 8, {
        fontSize: 12,
        color: item.color,
        fontStyle: 'bold'
      });
    });
    
    yPosition += 75;
    
    // Payment Breakdown Section
    addSectionHeader('Payment Summary', 'Complete financial overview', margin, yPosition);
    yPosition += 25;
    
    addRoundedRect(margin, yPosition, pageWidth - 2 * margin, 80, 8, {
      fillColor: colors.cardBg,
      strokeColor: colors.border
    });
    
    const totalAmount = Number(bookingData.totalAmount || bookingData.amount || 0);
    const currency = String(bookingData.currency || 'LKR');
    const participantsNum = Number(bookingData.participants || bookingData.guests || 1);
    const perPersonCost = participantsNum > 0 ? totalAmount / participantsNum : totalAmount;
    
    // Payment details table
    const tableHeaders = ['Description', 'Quantity', 'Unit Price', 'Amount'];
    const colWidths = [0.45, 0.15, 0.2, 0.2].map(w => (pageWidth - 2 * margin - 30) * w);
    
    // Table header
    addRoundedRect(margin + 15, yPosition + 15, pageWidth - 2 * margin - 30, 20, 5, {
      fillColor: colors.primary,
      strokeColor: colors.primary
    });
    
    tableHeaders.forEach((header, index) => {
      const x = margin + 15 + colWidths.slice(0, index).reduce((sum, width) => sum + width, 0);
      addText(header, x + 8, yPosition + 27, {
        fontSize: 11,
        color: colors.cardBg,
        fontStyle: 'bold'
      });
    });
    
    // Table row
    const rowData = [
      tripTitle,
      String(participantsNum),
      `${currency} ${perPersonCost.toLocaleString()}`,
      `${currency} ${totalAmount.toLocaleString()}`
    ];
    
    addRoundedRect(margin + 15, yPosition + 35, pageWidth - 2 * margin - 30, 25, 5, {
      fillColor: colors.lightBg,
      strokeColor: colors.border
    });
    
    rowData.forEach((data, index) => {
      const x = margin + 15 + colWidths.slice(0, index).reduce((sum, width) => sum + width, 0);
      addText(data, x + 8, yPosition + 49, {
        fontSize: 11,
        color: colors.textDark,
        maxWidth: colWidths[index] - 10
      });
    });
    
    // Total amount
    addRoundedRect(margin + 15, yPosition + 60, pageWidth - 2 * margin - 30, 15, 5, {
      fillColor: colors.secondary,
      strokeColor: colors.secondary
    });
    
    addText('TOTAL AMOUNT', margin + 20, yPosition + 70, {
      fontSize: 12,
      color: colors.textDark,
      fontStyle: 'bold'
    });
    
    addText(`${currency} ${totalAmount.toLocaleString()}`, pageWidth - margin - 20, yPosition + 70, {
      fontSize: 14,
      color: colors.textDark,
      align: 'right',
      fontStyle: 'bold'
    });
    
    yPosition += 95;
    
    // Contact & Support Section
    addSectionHeader('Contact & Support', 'We are here to help', margin, yPosition);
    yPosition += 25;
    
    addRoundedRect(margin, yPosition, pageWidth - 2 * margin, 50, 8, {
      fillColor: colors.lightBg,
      strokeColor: colors.border
    });
    
    const contactInfo = [
      { icon: '📧', detail: 'support@serendibgo.lk' },
      { icon: '📞', detail: '+94 11 234 5678' },
      { icon: '🌐', detail: 'www.serendibgo.lk' },
      { icon: '📍', detail: 'Colombo, Sri Lanka' }
    ];
    
    contactInfo.forEach((contact, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = margin + 20 + col * ((pageWidth - 2 * margin - 40) / 2);
      const y = yPosition + 18 + row * 15;
      
      addIconText(contact.icon, contact.detail, x, y, {
        textSize: 10,
        color: colors.textDark
      });
    });
    
    yPosition += 65;
    
    // Important Notes Section
    addRoundedRect(margin, yPosition, pageWidth - 2 * margin, 70, 8, {
      fillColor: [255, 248, 235],
      strokeColor: colors.warning
    });
    
    addText('💡 Important Information', margin + 15, yPosition + 15, {
      fontSize: 14,
      color: colors.warning,
      fontStyle: 'bold'
    });
    
    const notes = [
      '• Your booking is confirmed and payment has been processed',
      '• Detailed itinerary will be sent via email within 24 hours',
      '• Our concierge will contact you 48 hours before departure',
      '• Please arrive 15 minutes before scheduled start time',
      '• Luxury amenities and premium services included'
    ];
    
    notes.forEach((note, index) => {
      addText(note, margin + 20, yPosition + 28 + index * 8, {
        fontSize: 9,
        color: colors.textDark,
        maxWidth: pageWidth - 2 * margin - 40
      });
    });
    
    yPosition += 85;
    
    // Footer with sophisticated design
    addGradient(0, yPosition, pageWidth, pageHeight - yPosition, colors.primary, [8, 28, 58]);
    
    addText('Thank You for Choosing Excellence', pageWidth / 2, yPosition + 20, {
      fontSize: 14,
      color: colors.secondary,
      align: 'center',
      fontStyle: 'bold'
    });
    
    addText('We are committed to providing you with an unforgettable luxury travel experience', pageWidth / 2, yPosition + 30, {
      fontSize: 10,
      color: [255, 255, 255, 0.8],
      align: 'center',
      maxWidth: pageWidth - 2 * margin
    });
    
    addDivider(yPosition + 45, pageWidth - 4 * margin);
    
    addText(`Document generated on ${new Date().toLocaleString()}`, pageWidth / 2, yPosition + 55, {
      fontSize: 9,
      color: [255, 255, 255, 0.6],
      align: 'center'
    });
    
    addText('Serendib Go © 2024 | Luxury Travel Redefined', pageWidth / 2, yPosition + 62, {
      fontSize: 9,
      color: [255, 255, 255, 0.6],
      align: 'center'
    });
    
    // Add final decorative elements
    addText('✈️', margin + 30, yPosition + 20, { fontSize: 16, color: colors.secondary });
    addText('⭐', pageWidth - margin - 30, yPosition + 20, { fontSize: 16, color: colors.secondary });
    
    // Save the PDF
    console.log('Saving premium PDF with filename:', filename);
    doc.save(filename);
    console.log('Premium PDF saved successfully');
    
    return true;
  } catch (error) {
    console.error('Error generating premium PDF:', error);
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

/**
 * Calculate available slots for a tour
 * @param {Object} tour - The tour object
 * @param {Array} bookings - Array of existing bookings for this tour (legacy parameter)
 * @param {string} selectedDate - The selected date (optional, legacy parameter)
 * @returns {number} Number of available slots
 */
export const calculateAvailableSlots = (tour, bookings = [], selectedDate = null) => {
  try {
    if (!tour) {
      return 0;
    }

    // Use the availableSlots virtual property if available (server-side calculation)
    if (tour.availableSlots !== undefined) {
      return tour.availableSlots;
    }

    // Fallback: Calculate manually using current participants
    const maxParticipants = tour.maxParticipants || 10;
    const currentParticipants = tour.currentParticipants || 0;
    const availableSlots = Math.max(0, maxParticipants - currentParticipants);
    
    return availableSlots;
  } catch (error) {
    console.error('Error calculating available slots:', error);
    return 0;
  }
};

/**
 * Check if a tour is available for booking
 * @param {Object} tour - The tour object
 * @param {Array} bookings - Array of existing bookings for this tour
 * @param {string} selectedDate - The selected date (optional)
 * @param {number} requestedParticipants - Number of participants requested
 * @returns {Object} Availability status with details
 */
export const isTourAvailable = (tour, bookings = [], selectedDate = null, requestedParticipants = 1) => {
  try {
    if (!tour) {
      return {
        available: false,
        reason: 'Tour not found',
        availableSlots: 0
      };
    }

    // Check if tour is active (using isActive from server)
    if (!tour.isActive) {
      return {
        available: false,
        reason: 'Tour is not available',
        availableSlots: 0
      };
    }

    // Check if tour has ended
    if (tour.endDate && new Date(tour.endDate) < new Date()) {
      return {
        available: false,
        reason: 'Tour has ended',
        availableSlots: 0
      };
    }

    // Check if tour starts in the future
    if (tour.startDate && new Date(tour.startDate) > new Date()) {
      return {
        available: false,
        reason: 'Tour has not started yet',
        availableSlots: 0
      };
    }

    // Calculate available slots
    const availableSlots = calculateAvailableSlots(tour, bookings, selectedDate);

    // Check if there are enough slots for the requested participants
    if (availableSlots < requestedParticipants) {
      return {
        available: false,
        reason: `Only ${availableSlots} slots available`,
        availableSlots: availableSlots
      };
    }

    // Check minimum participants requirement
    const minParticipants = tour.minParticipants || 1;
    if (requestedParticipants < minParticipants) {
      return {
        available: false,
        reason: `Minimum ${minParticipants} participants required`,
        availableSlots: availableSlots
      };
    }

    return {
      available: true,
      reason: 'Tour is available',
      availableSlots: availableSlots
    };
  } catch (error) {
    console.error('Error checking tour availability:', error);
    return {
      available: false,
      reason: 'Error checking availability',
      availableSlots: 0
    };
  }
};