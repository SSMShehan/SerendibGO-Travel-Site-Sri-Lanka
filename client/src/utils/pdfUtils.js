import jsPDF from 'jspdf';

/**
 * Generate and download a PDF itinerary for a booking
 * @param {Object} bookingData - The booking data
 * @param {Object} tripRequestData - The trip request data (for custom trips)
 * @param {string} filename - The filename for the PDF
 */
export const generateItineraryPDF = (bookingData, tripRequestData = null, filename = 'itinerary.pdf') => {
  try {
    console.log('PDF generation started with:', { bookingData, tripRequestData, filename });
    
    // Validate input data
    if (!bookingData) {
      throw new Error('Booking data is required');
    }
    
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      throw new Error('PDF generation requires a browser environment');
    }
    
    // Create new PDF document with landscape orientation for better layout
    const doc = new jsPDF('p', 'mm', 'a4');
    console.log('PDF document created');
    
    // Ultra-professional color palette with sophisticated gradients
    const colors = {
      // Premium brand colors
      primary: [30, 64, 175],         // Professional Blue
      primaryDark: [30, 58, 138],     // Darker Blue
      primaryLight: [59, 130, 246],   // Light Blue
      
      // Luxury accent colors
      accent: [16, 185, 129],         // Premium Emerald
      accentDark: [5, 150, 105],      // Darker Emerald
      accentLight: [52, 211, 153],    // Light Emerald
      
      // Professional secondary colors
      secondary: [71, 85, 105],       // Professional Gray
      secondaryDark: [51, 65, 85],    // Darker Gray
      secondaryLight: [148, 163, 184], // Light Gray
      
      // Status colors
      success: [34, 197, 94],         // Success Green
      warning: [245, 158, 11],        // Warning Amber
      danger: [239, 68, 68],          // Danger Red
      info: [59, 130, 246],           // Info Blue
      
      // Premium neutral colors
      white: [255, 255, 255],         // Pure white
      black: [15, 23, 42],            // Rich black
      gray50: [248, 250, 252],        // Very light gray
      gray100: [241, 245, 249],       // Light gray
      gray200: [226, 232, 240],       // Medium light gray
      gray300: [203, 213, 225],       // Medium gray
      gray400: [148, 163, 184],       // Medium dark gray
      gray500: [100, 116, 139],       // Dark gray
      gray600: [71, 85, 105],         // Darker gray
      gray700: [51, 65, 85],          // Very dark gray
      gray800: [30, 41, 59],          // Almost black
      gray900: [15, 23, 42]           // Rich black
    };
    
    // Ultra-professional helper functions with sophisticated styling
    const addText = (text, x, y, options = {}) => {
      const { fontSize = 12, color = colors.gray800, font = 'helvetica', style = 'normal', align = 'left', weight = 'normal', letterSpacing = 0 } = options;
      doc.setFont(font, style);
      doc.setFontSize(fontSize);
      doc.setTextColor(...color);
      
      if (align === 'center') {
        const pageWidth = doc.internal.pageSize.width;
        const textWidth = doc.getTextWidth(text);
        x = (pageWidth - textWidth) / 2;
      } else if (align === 'right') {
        const pageWidth = doc.internal.pageSize.width;
        const textWidth = doc.getTextWidth(text);
        x = pageWidth - textWidth - 20;
      }
      
      doc.text(text, x, y);
    };
    
    // Professional typography system
    const addHeading = (text, x, y, level = 1) => {
      const sizes = { 1: 18, 2: 14, 3: 12, 4: 10 };
      const colors = { 1: colors.gray900, 2: colors.gray800, 3: colors.gray700, 4: colors.gray600 };
      addText(text, x, y, { 
        fontSize: sizes[level], 
        color: colors[level], 
        style: 'bold' 
      });
    };
    
    const addSubheading = (text, x, y) => {
      addText(text, x, y, { 
        fontSize: 10, 
        color: colors.gray600, 
        style: 'bold' 
      });
    };
    
    const addBodyText = (text, x, y, options = {}) => {
      addText(text, x, y, { 
        fontSize: 9, 
        color: colors.gray700, 
        ...options 
      });
    };
    
    const addCaption = (text, x, y) => {
      addText(text, x, y, { 
        fontSize: 8, 
        color: colors.gray500 
      });
    };
    
    // Advanced gradient effect with multiple color stops
    const addAdvancedGradient = (x, y, width, height, colorStops) => {
      const steps = 20;
      const stepHeight = height / steps;
      
      for (let i = 0; i < steps; i++) {
        const ratio = i / (steps - 1);
        
        // Find which color stop this ratio falls into
        let color1, color2, stop1, stop2;
        for (let j = 0; j < colorStops.length - 1; j++) {
          if (ratio >= colorStops[j].stop && ratio <= colorStops[j + 1].stop) {
            color1 = colorStops[j].color;
            color2 = colorStops[j + 1].color;
            stop1 = colorStops[j].stop;
            stop2 = colorStops[j + 1].stop;
            break;
          }
        }
        
        const localRatio = (ratio - stop1) / (stop2 - stop1);
        const r = Math.round(color1[0] + (color2[0] - color1[0]) * localRatio);
        const g = Math.round(color1[1] + (color2[1] - color1[1]) * localRatio);
        const b = Math.round(color1[2] + (color2[2] - color1[2]) * localRatio);
        
        doc.setFillColor(r, g, b);
        doc.rect(x, y + i * stepHeight, width, stepHeight, 'F');
      }
    };
    
    // Ultra-professional card with sophisticated styling
    const addProfessionalCard = (x, y, width, height, title, color = colors.primary, hasShadow = true) => {
      // Professional shadow effect with multiple layers
      if (hasShadow) {
        doc.setFillColor(...colors.gray200);
        doc.rect(x + 3, y + 3, width, height, 'F');
        doc.setFillColor(...colors.gray100);
        doc.rect(x + 1, y + 1, width, height, 'F');
      }
      
      // Professional card background
      doc.setFillColor(...colors.white);
      doc.rect(x, y, width, height, 'F');
      
      // Professional border with subtle styling
      doc.setDrawColor(...colors.gray300);
      doc.setLineWidth(0.5);
      doc.rect(x, y, width, height);
      
      // Professional header with sophisticated gradient
      const headerHeight = 14;
      addAdvancedGradient(x, y, width, headerHeight, [
        { color: color, stop: 0 },
        { color: colors.primaryDark, stop: 0.8 },
        { color: colors.gray800, stop: 1 }
      ]);
      
      // Professional header text
      addText(title, x + 10, y + 9, { 
        fontSize: 12, 
        color: colors.white, 
        style: 'bold' 
      });
      
      // Professional accent elements
      doc.setFillColor(...colors.accent);
      doc.rect(x + 6, y + headerHeight - 3, 25, 2, 'F');
      
      // Subtle inner border
      doc.setDrawColor(...colors.gray200);
      doc.setLineWidth(0.3);
      doc.rect(x + 1, y + 1, width - 2, height - 2);
      
      return { 
        contentX: x + 10, 
        contentY: y + headerHeight + 6, 
        contentWidth: width - 20,
        contentHeight: height - headerHeight - 12
      };
    };
    
    // Professional icon system with sophisticated styling
    const addProfessionalIcon = (x, y, type, color = colors.primary, size = 3) => {
      doc.setFillColor(...color);
      
      switch (type) {
        case 'check':
          // Professional check mark with sophisticated design
          doc.circle(x, y, size, 'F');
          doc.setFillColor(...colors.white);
          doc.circle(x, y, size * 0.7, 'F');
          doc.setFillColor(...color);
          doc.circle(x, y, size * 0.4, 'F');
          break;
        case 'star':
          // Professional star with gradient effect
          doc.circle(x, y, size, 'F');
          doc.setFillColor(...colors.white);
          doc.circle(x, y, size * 0.5, 'F');
          break;
        case 'calendar':
          // Professional calendar icon
          doc.rect(x - size, y - size * 0.8, size * 2, size * 1.6, 'F');
          doc.setFillColor(...colors.white);
          doc.rect(x - size * 0.8, y - size * 0.6, size * 1.6, size * 1.2, 'F');
          break;
        case 'location':
          // Professional location pin
          doc.circle(x, y, size, 'F');
          doc.setFillColor(...colors.white);
          doc.circle(x, y, size * 0.6, 'F');
          break;
        case 'dollar':
          // Professional dollar sign
          doc.circle(x, y, size, 'F');
          doc.setFillColor(...colors.white);
          doc.circle(x, y, size * 0.7, 'F');
          break;
        case 'shield':
          // Professional shield icon
          doc.rect(x - size * 0.8, y - size, size * 1.6, size * 1.2, 'F');
          doc.setFillColor(...colors.white);
          doc.rect(x - size * 0.6, y - size * 0.8, size * 1.2, size * 0.8, 'F');
          break;
        case 'document':
          // Professional document icon
          doc.rect(x - size * 0.8, y - size * 0.6, size * 1.6, size * 1.2, 'F');
          doc.setFillColor(...colors.white);
          doc.rect(x - size * 0.6, y - size * 0.4, size * 1.2, size * 0.8, 'F');
          break;
        case 'user':
          // Professional user icon
          doc.circle(x, y - size * 0.3, size * 0.8, 'F');
          doc.setFillColor(...colors.white);
          doc.circle(x, y - size * 0.3, size * 0.5, 'F');
          doc.setFillColor(...color);
          doc.rect(x - size * 0.6, y + size * 0.2, size * 1.2, size * 0.8, 'F');
          break;
      }
    };
    
    // Professional badge/tag system
    const addProfessionalBadge = (x, y, text, color = colors.accent, size = 'medium') => {
      const fontSize = size === 'small' ? 7 : size === 'large' ? 11 : 9;
      const padding = size === 'small' ? 3 : size === 'large' ? 6 : 4;
      
      const textWidth = doc.getTextWidth(text);
      const badgeWidth = textWidth + (padding * 2);
      const badgeHeight = fontSize + (padding * 2);
      
      // Professional badge background with gradient
      addAdvancedGradient(x, y, badgeWidth, badgeHeight, [
        { color: color, stop: 0 },
        { color: colors.accentDark, stop: 1 }
      ]);
      
      // Professional badge text
      addText(text, x + padding, y + fontSize + padding * 0.5, {
        fontSize: fontSize,
        color: colors.white,
        style: 'bold'
      });
      
      // Professional badge border
      doc.setDrawColor(...colors.gray400);
      doc.setLineWidth(0.3);
      doc.rect(x, y, badgeWidth, badgeHeight);
      
      return { width: badgeWidth, height: badgeHeight };
    };
    
    // Professional divider system
    const addProfessionalDivider = (x1, y1, x2, y2, color = colors.gray300, width = 0.5) => {
      doc.setDrawColor(...color);
      doc.setLineWidth(width);
      doc.line(x1, y1, x2, y2);
      
      // Professional decorative elements
      const dotSpacing = 4;
      const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      const numDots = Math.floor(lineLength / dotSpacing);
      
      for (let i = 0; i < numDots; i += 3) {
        const ratio = i / numDots;
        const dotX = x1 + (x2 - x1) * ratio;
        const dotY = y1 + (y2 - y1) * ratio;
        
        doc.setFillColor(...colors.accent);
        doc.circle(dotX, dotY, 0.4, 'F');
      }
    };
    
    let yPosition = 10;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    
    // Ultra-Professional Header with Sophisticated Design
    addAdvancedGradient(margin, yPosition, contentWidth, 40, [
      { color: colors.primary, stop: 0 },
      { color: colors.primaryDark, stop: 0.6 },
      { color: colors.gray800, stop: 0.9 },
      { color: colors.gray900, stop: 1 }
    ]);
    
    // Professional company branding with sophisticated typography
    addHeading('SERENDIB GO', margin + 20, yPosition + 18, 1);
    
    // Professional subtitle with elegant styling
    addText('Premium Travel Itinerary', margin + 20, yPosition + 28, { 
      fontSize: 12, 
      color: colors.gray200,
      style: 'normal'
    });
    
    // Professional decorative elements
    addProfessionalIcon(margin + contentWidth - 25, yPosition + 12, 'star', colors.accent, 4);
    addProfessionalIcon(margin + contentWidth - 40, yPosition + 12, 'star', colors.accentLight, 3);
    addProfessionalIcon(margin + contentWidth - 55, yPosition + 12, 'star', colors.accent, 2);
    
    // Professional accent line with sophisticated styling
    doc.setFillColor(...colors.accent);
    doc.rect(margin + 20, yPosition + 32, 35, 2.5, 'F');
    
    // Professional document icon
    addProfessionalIcon(margin + contentWidth - 20, yPosition + 25, 'document', colors.white, 3);
    
    yPosition += 50;
    
    // Ultra-Professional Booking Confirmation Section
    const bookingCard = addProfessionalCard(margin, yPosition, contentWidth, 45, 'BOOKING CONFIRMATION', colors.primary);
    
    // Professional booking details layout
    const bookingId = bookingData.id || bookingData._id || 'N/A';
    const confirmationNumber = bookingData.confirmationNumber || `CONF-${bookingId.toString().slice(-8)}`;
    const bookingDate = new Date(bookingData.createdAt || bookingData.bookingDate || new Date()).toLocaleDateString();
    const status = bookingData.status || 'Confirmed';
    const paymentStatus = bookingData.paymentStatus || 'Paid';
    
    // Professional two-column layout with sophisticated spacing
    const leftCol = bookingCard.contentX;
    const rightCol = bookingCard.contentX + (bookingCard.contentWidth / 2) + 5;
    let cardY = bookingCard.contentY;
    
    // Left column with professional styling
    addCaption(`BOOKING ID`, leftCol, cardY);
    addBodyText(bookingId, leftCol, cardY + 3, { style: 'bold' });
    
    addCaption(`BOOKING DATE`, leftCol, cardY + 10);
    addBodyText(bookingDate, leftCol, cardY + 13);
    
    // Right column with professional styling
    addCaption(`CONFIRMATION #`, rightCol, cardY);
    addBodyText(confirmationNumber, rightCol, cardY + 3, { style: 'bold' });
    
    addCaption(`STATUS`, rightCol, cardY + 10);
    addBodyText(status, rightCol, cardY + 13, { style: 'bold' });
    
    // Professional status badges
    const statusBadge = addProfessionalBadge(rightCol + 30, cardY + 11, paymentStatus, 
      paymentStatus === 'Paid' ? colors.success : colors.warning, 'small');
    
    // Professional icons with sophisticated styling
    addProfessionalIcon(leftCol - 8, cardY + 1, 'shield', colors.primary, 2.5);
    addProfessionalIcon(leftCol - 8, cardY + 11, 'calendar', colors.accent, 2.5);
    addProfessionalIcon(rightCol - 8, cardY + 1, 'check', colors.success, 2.5);
    
    yPosition += 55;
    
    // Ultra-Professional Trip Information Section
    const tripCard = addProfessionalCard(margin, yPosition, contentWidth, 50, 'TRIP INFORMATION', colors.accent);
    
    // Determine trip type and details
    const isCustomTrip = tripRequestData !== null;
    const tripTitle = isCustomTrip ? tripRequestData.title : bookingData.title;
    const tripDescription = isCustomTrip ? tripRequestData.description : bookingData.description;
    const tripDuration = isCustomTrip ? tripRequestData.duration : bookingData.duration;
    const tripLocation = isCustomTrip ? tripRequestData.location : bookingData.location;
    const startDate = bookingData.startDate ? new Date(bookingData.startDate).toLocaleDateString() : 'N/A';
    const participants = bookingData.participants || bookingData.guests || 'N/A';
    
    // Professional trip details layout
    const tripLeftCol = tripCard.contentX;
    const tripRightCol = tripCard.contentX + (tripCard.contentWidth / 2) + 5;
    let tripCardY = tripCard.contentY;
    
    // Trip title with professional styling
    addHeading(tripTitle || 'N/A', tripLeftCol, tripCardY, 2);
    tripCardY += 8;
    
    // Professional trip type badge
    const tripTypeBadge = addProfessionalBadge(tripLeftCol, tripCardY, 
      isCustomTrip ? 'Custom Trip' : 'Pre-designed Tour', 
      isCustomTrip ? colors.warning : colors.info, 'small');
    tripCardY += 8;
    
    // Left column with professional styling
    addCaption(`DURATION`, tripLeftCol, tripCardY);
    addBodyText(tripDuration || 'N/A', tripLeftCol, tripCardY + 3);
    
    addCaption(`LOCATION`, tripLeftCol, tripCardY + 10);
    addBodyText(tripLocation || 'N/A', tripLeftCol, tripCardY + 13);
    
    // Right column with professional styling
    addCaption(`START DATE`, tripRightCol, tripCardY);
    addBodyText(startDate, tripRightCol, tripCardY + 3);
    
    addCaption(`PARTICIPANTS`, tripRightCol, tripCardY + 10);
    addBodyText(participants, tripRightCol, tripCardY + 13);
    
    // Professional icons with sophisticated styling
    addProfessionalIcon(tripLeftCol - 8, tripCardY + 1, 'star', colors.accent, 2.5);
    addProfessionalIcon(tripLeftCol - 8, tripCardY + 11, 'location', colors.accent, 2.5);
    addProfessionalIcon(tripRightCol - 8, tripCardY + 1, 'calendar', colors.accent, 2.5);
    
    yPosition += 60;
    
    // Custom Trip Details (if applicable)
    if (isCustomTrip && tripRequestData) {
      const customCard = addProfessionalCard(margin, yPosition, contentWidth, 35, 'CUSTOM TRIP DETAILS', colors.warning);
      let customY = customCard.contentY;
      
      // Destinations
      if (tripRequestData.destinations && tripRequestData.destinations.length > 0) {
        addCaption('DESTINATIONS', customCard.contentX, customY);
        customY += 3;
        
        tripRequestData.destinations.forEach((destination, index) => {
          addBodyText(`${index + 1}. ${destination.name} (${destination.duration} days)`, customCard.contentX, customY);
          customY += 4;
        });
        customY += 3;
      }
      
      // Activities
      if (tripRequestData.activities && tripRequestData.activities.length > 0) {
        addCaption('ACTIVITIES', customCard.contentX, customY);
        customY += 3;
        
        tripRequestData.activities.forEach((activity, index) => {
          addBodyText(`${index + 1}. ${activity}`, customCard.contentX, customY);
          customY += 4;
        });
      }
      
      yPosition += 45;
    }
    
    // Ultra-Professional Payment Information Section
    const paymentCard = addProfessionalCard(margin, yPosition, contentWidth, 45, 'PAYMENT INFORMATION', colors.success);
    
    const totalAmount = bookingData.totalAmount || bookingData.amount || 0;
    const currency = bookingData.currency || 'LKR';
    const paymentId = bookingData.paymentId || 'N/A';
    const paymentDate = new Date().toLocaleDateString();
    
    // Professional payment details layout
    const paymentLeftCol = paymentCard.contentX;
    const paymentRightCol = paymentCard.contentX + (paymentCard.contentWidth / 2) + 5;
    let paymentCardY = paymentCard.contentY;
    
    // Left column with professional styling
    addCaption(`TOTAL AMOUNT`, paymentLeftCol, paymentCardY);
    addBodyText(`${currency} ${totalAmount.toLocaleString()}`, paymentLeftCol, paymentCardY + 3, { style: 'bold' });
    
    addCaption(`PAYMENT METHOD`, paymentLeftCol, paymentCardY + 10);
    addBodyText(`Stripe Gateway`, paymentLeftCol, paymentCardY + 13);
    
    // Right column with professional styling
    addCaption(`PAYMENT ID`, paymentRightCol, paymentCardY);
    addBodyText(paymentId, paymentRightCol, paymentCardY + 3);
    
    addCaption(`PAYMENT DATE`, paymentRightCol, paymentCardY + 10);
    addBodyText(paymentDate, paymentRightCol, paymentCardY + 13);
    
    // Professional payment success indicator
    addProfessionalIcon(paymentLeftCol - 8, paymentCardY + 1, 'check', colors.success, 3);
    addProfessionalIcon(paymentLeftCol - 8, paymentCardY + 11, 'dollar', colors.success, 2.5);
    
    yPosition += 55;
    
    // Ultra-Professional Contact Information Section
    const contactCard = addProfessionalCard(margin, yPosition, contentWidth, 40, 'CONTACT INFORMATION', colors.info);
    
    const customerName = bookingData.customerName || tripRequestData?.contactInfo?.name || 'N/A';
    const customerEmail = bookingData.customerEmail || tripRequestData?.contactInfo?.email || 'N/A';
    const customerPhone = bookingData.customerPhone || tripRequestData?.contactInfo?.phone || 'N/A';
    
    // Professional contact details layout
    const contactLeftCol = contactCard.contentX;
    const contactRightCol = contactCard.contentX + (contactCard.contentWidth / 2) + 5;
    let contactCardY = contactCard.contentY;
    
    // Left column with professional styling
    addCaption(`CUSTOMER`, contactLeftCol, contactCardY);
    addBodyText(customerName, contactLeftCol, contactCardY + 3, { style: 'bold' });
    
    addCaption(`EMAIL`, contactLeftCol, contactCardY + 10);
    addBodyText(customerEmail, contactLeftCol, contactCardY + 13);
    
    // Right column with professional styling
    addCaption(`PHONE`, contactRightCol, contactCardY);
    addBodyText(customerPhone, contactRightCol, contactCardY + 3);
    
    // Professional contact icons
    addProfessionalIcon(contactLeftCol - 8, contactCardY + 1, 'user', colors.info, 2.5);
    
    yPosition += 50;
    
    // Ultra-Professional Important Notes Section
    const notesCard = addProfessionalCard(margin, yPosition, contentWidth, 35, 'IMPORTANT NOTES', colors.warning);
    
    const notes = [
      '• Please arrive 15 minutes before the scheduled start time',
      '• Bring comfortable clothing and sunscreen',
      '• Contact us 24 hours before your trip for any changes',
      '• Keep this itinerary with you during your trip'
    ];
    
    let notesY = notesCard.contentY;
    notes.forEach(note => {
      addBodyText(note, notesCard.contentX, notesY);
      notesY += 5;
    });
    
    yPosition += 45;
    
    // Ultra-Professional Footer with Sophisticated Styling
    addProfessionalDivider(margin, yPosition, pageWidth - margin, yPosition, colors.gray300, 1);
    yPosition += 15;
    
    // Professional footer content
    addHeading('Thank you for choosing Serendib Go!', margin, yPosition, 1);
    
    yPosition += 10;
    addText('Premium Travel Experience', margin, yPosition, { 
      fontSize: 11, 
      color: colors.gray500,
      align: 'center'
    });
    
    yPosition += 8;
    addText('For support, contact us at: support@serendibgo.com', margin, yPosition, { 
      fontSize: 10, 
      color: colors.gray400,
      align: 'center'
    });
    
    yPosition += 6;
    addText(`Generated on: ${new Date().toLocaleString()}`, margin, yPosition, { 
      fontSize: 9, 
      color: colors.gray400,
      align: 'center'
    });
    
    // Sophisticated footer decorative elements
    addProfessionalIcon(margin + 30, yPosition - 25, 'star', colors.accent, 3);
    addProfessionalIcon(pageWidth - margin - 30, yPosition - 25, 'star', colors.accentLight, 2.5);
    addProfessionalIcon(pageWidth / 2, yPosition - 25, 'star', colors.accent, 2);
    
    // Save the PDF
    doc.save(filename);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF itinerary');
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
