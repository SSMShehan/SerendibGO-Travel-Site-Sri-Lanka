const nodemailer = require('nodemailer');

// Create a transporter (you can configure this with your email service)
const createTransporter = () => {
  // For development, you can use a test account or configure with your email service
  // This is a basic configuration - you should replace with your actual email service
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASS || 'your-app-password'
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Send email function
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // Check if email is properly configured
    const emailUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const emailPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
    
    if (!emailUser || !emailPass || emailUser === 'your-gmail@gmail.com' || emailPass === 'your-app-password' || emailPass === 'REPLACE_WITH_NEW_GMAIL_APP_PASSWORD' || emailPass === 'YOUR_NEW_APP_PASSWORD_HERE') {
      console.log('Email not configured properly. Email would be sent to:', to);
      console.log('Subject:', subject);
      console.log('Please configure SMTP_USER and SMTP_PASS in your .env file');
      
      // Return success for development/testing
      return { 
        success: true, 
        messageId: 'dev-mode-' + Date.now(),
        message: 'Email not configured - would be sent in production'
      };
    }
    
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@serendibgo.com',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML tags for text version
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    console.log('Email sent to:', to);
    console.log('Subject:', subject);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      message: error.message
    });
    
    // Provide specific error messages based on error type
    let errorMessage = error.message;
    if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Please check your SMTP credentials.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Could not connect to email server. Please check your SMTP settings.';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Email server connection timed out. Please try again.';
    }
    
    // If it's an authentication error in development mode, return success for testing
    if (error.code === 'EAUTH' && process.env.NODE_ENV === 'development') {
      console.log('Development mode: Authentication failed, but returning success for testing');
      console.log('Email would be sent to:', to);
      console.log('Subject:', subject);
      return { 
        success: true, 
        messageId: 'dev-mode-' + Date.now(),
        message: 'Email authentication failed - would be sent in production with correct credentials'
      };
    }
    
    return { success: false, error: errorMessage };
  }
};

// Send booking confirmation email
const sendBookingConfirmation = async (bookingData) => {
  const { user, booking, service } = bookingData;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Booking Confirmation</h2>
      <p>Dear ${user.name},</p>
      <p>Your booking has been confirmed!</p>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Booking Details</h3>
        <p><strong>Service:</strong> ${service.name}</p>
        <p><strong>Booking ID:</strong> ${booking._id}</p>
        <p><strong>Date:</strong> ${new Date(booking.startDate).toLocaleDateString()}</p>
        <p><strong>Total Amount:</strong> ${booking.currency} ${booking.totalAmount}</p>
      </div>
      
      <p>Thank you for choosing SerendibGo!</p>
      <p>Best regards,<br>The SerendibGo Team</p>
    </div>
  `;

  return await sendEmail({
    to: user.email,
    subject: `Booking Confirmation - ${service.name}`,
    html
  });
};

// Send rental confirmation email
const sendRentalConfirmation = async (rentalData) => {
  const { user, rental, vehicle } = rentalData;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Vehicle Rental Confirmation</h2>
      <p>Dear ${user.name},</p>
      <p>Your vehicle rental has been confirmed!</p>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Rental Details</h3>
        <p><strong>Vehicle:</strong> ${vehicle.brand} ${vehicle.model}</p>
        <p><strong>Rental ID:</strong> ${rental._id}</p>
        <p><strong>Start Date:</strong> ${new Date(rental.startDate).toLocaleDateString()}</p>
        <p><strong>End Date:</strong> ${new Date(rental.endDate).toLocaleDateString()}</p>
        <p><strong>Duration:</strong> ${rental.rentalDuration} ${rental.rentalType}</p>
        <p><strong>Total Amount:</strong> ${rental.currency} ${rental.totalAmount}</p>
      </div>
      
      <p>Thank you for choosing SerendibGo!</p>
      <p>Best regards,<br>The SerendibGo Team</p>
    </div>
  `;

  return await sendEmail({
    to: user.email,
    subject: `Vehicle Rental Confirmation - ${vehicle.brand} ${vehicle.model}`,
    html
  });
};

// Send password reset email
const sendPasswordResetEmail = async (userData, resetToken) => {
  const { name, email } = userData;
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Password Reset Request</h2>
      <p>Dear ${name},</p>
      <p>You have requested to reset your password for your SerendibGo account.</p>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
      </div>
      
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
      
      <p><strong>This link will expire in 1 hour.</strong></p>
      <p>If you didn't request this password reset, please ignore this email.</p>
      
      <p>Best regards,<br>The SerendibGo Team</p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: 'Password Reset Request - SerendibGo',
    html
  });
};

// Send email verification email
const sendEmailVerification = async (userData, verificationToken) => {
  const { name, email } = userData;
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Verify Your Email Address</h2>
      <p>Dear ${name},</p>
      <p>Welcome to SerendibGo! Please verify your email address to complete your registration.</p>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p>Click the button below to verify your email:</p>
        <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a>
      </div>
      
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #6b7280;">${verificationUrl}</p>
      
      <p><strong>This link will expire in 24 hours.</strong></p>
      
      <p>Thank you for choosing SerendibGo!</p>
      <p>Best regards,<br>The SerendibGo Team</p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: 'Verify Your Email - SerendibGo',
    html
  });
};

// Send booking reminder email
const sendBookingReminder = async (bookingData) => {
  const { user, booking, service } = bookingData;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Upcoming Booking Reminder</h2>
      <p>Dear ${user.name},</p>
      <p>This is a friendly reminder about your upcoming booking!</p>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Booking Details</h3>
        <p><strong>Service:</strong> ${service.name}</p>
        <p><strong>Booking ID:</strong> ${booking._id}</p>
        <p><strong>Date:</strong> ${new Date(booking.startDate).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${new Date(booking.startDate).toLocaleTimeString()}</p>
        <p><strong>Total Amount:</strong> ${booking.currency} ${booking.totalAmount}</p>
      </div>
      
      <p>Please arrive on time and bring any required documents.</p>
      <p>If you need to make any changes, please contact us as soon as possible.</p>
      
      <p>Thank you for choosing SerendibGo!</p>
      <p>Best regards,<br>The SerendibGo Team</p>
    </div>
  `;

  return await sendEmail({
    to: user.email,
    subject: `Booking Reminder - ${service.name}`,
    html
  });
};

// Send payment confirmation email
const sendPaymentConfirmation = async (paymentData) => {
  const { user, payment, booking } = paymentData;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Payment Confirmation</h2>
      <p>Dear ${user.name},</p>
      <p>Your payment has been processed successfully!</p>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Payment Details</h3>
        <p><strong>Payment ID:</strong> ${payment.orderId}</p>
        <p><strong>Amount:</strong> ${payment.currency} ${payment.amount}</p>
        <p><strong>Payment Method:</strong> ${payment.paymentMethod}</p>
        <p><strong>Status:</strong> ${payment.status}</p>
        <p><strong>Date:</strong> ${new Date(payment.createdAt).toLocaleDateString()}</p>
      </div>
      
      <p>Your booking is now confirmed. You will receive a separate confirmation email with booking details.</p>
      
      <p>Thank you for choosing SerendibGo!</p>
      <p>Best regards,<br>The SerendibGo Team</p>
    </div>
  `;

  return await sendEmail({
    to: user.email,
    subject: 'Payment Confirmation - SerendibGo',
    html
  });
};

// Send booking confirmation with detailed itinerary and professional invoice
const sendBookingConfirmationWithItinerary = async (bookingData, tripRequestData = null) => {
  const { user, booking } = bookingData;
  const isCustomTrip = tripRequestData !== null;
  
  // Detect booking type
  const isGuideBooking = booking.guide || booking.tourType;
  const isVehicleBooking = booking.vehicle || booking.vehicleType;
  const isHotelBooking = booking.hotel || booking.roomType;
  
  console.log('Email Service - Booking type detection:', {
    isCustomTrip,
    isGuideBooking,
    isVehicleBooking,
    isHotelBooking,
    booking: {
      guide: booking.guide,
      vehicle: booking.vehicle,
      hotel: booking.hotel,
      tourType: booking.tourType,
      vehicleType: booking.vehicleType,
      roomType: booking.roomType
    }
  });
  
  // Determine trip details based on booking type
  let tripTitle, tripDescription, tripDuration, tripLocation;
  
  if (isCustomTrip) {
    tripTitle = tripRequestData.title;
    tripDescription = tripRequestData.description;
    tripDuration = tripRequestData.duration;
    tripLocation = tripRequestData.location;
  } else if (isGuideBooking) {
    tripTitle = `Guide Service - ${booking.guide?.name || 'Professional Guide'}`;
    tripDescription = `Professional guide service with ${booking.guide?.name || 'our expert guide'}`;
    if (booking.startDate && booking.endDate) {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      tripDuration = `${days} day${days > 1 ? 's' : ''}`;
    } else {
      tripDuration = 'N/A';
    }
    tripLocation = booking.guide?.location || booking.meetingPoint || 'N/A';
  } else if (isVehicleBooking) {
    tripTitle = `Vehicle Rental - ${booking.vehicle?.brand || 'Vehicle'} ${booking.vehicle?.model || ''}`;
    tripDescription = `Vehicle rental service with ${booking.vehicle?.brand || 'Vehicle'} ${booking.vehicle?.model || ''}`;
    if (booking.startDate && booking.endDate) {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      tripDuration = `${days} day${days > 1 ? 's' : ''} rental`;
    } else {
      tripDuration = 'N/A';
    }
    tripLocation = booking.vehicle?.location || booking.pickupLocation || 'N/A';
  } else if (isHotelBooking) {
    tripTitle = `Hotel Booking - ${booking.hotel?.name || 'Hotel'}`;
    tripDescription = `Hotel accommodation at ${booking.hotel?.name || 'our partner hotel'}`;
    if (booking.startDate && booking.endDate) {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      tripDuration = `${days} night${days > 1 ? 's' : ''} stay`;
    } else {
      tripDuration = 'N/A';
    }
    tripLocation = booking.hotel?.location || booking.hotel?.address || 'N/A';
  } else {
    // Default to tour booking
    tripTitle = booking.title || 'Adventure Awaits';
    tripDescription = booking.description || 'Experience the beauty of Sri Lanka';
    tripDuration = booking.duration || 'N/A';
    tripLocation = booking.location || 'N/A';
  }
  
  console.log('Email Service - Trip details determined:', {
    tripTitle,
    tripDescription,
    tripDuration,
    tripLocation
  });
  
  const startDate = booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A';
  const endDate = booking.endDate ? new Date(booking.endDate).toLocaleDateString() : 'N/A';
  const participants = booking.participants || booking.guests || 'N/A';
  const totalAmount = booking.totalAmount || booking.amount || 0;
  const currency = booking.currency || 'LKR';
  
  // Calculate per person cost
  const perPersonCost = participants > 0 ? totalAmount / participants : totalAmount;
  
  // Generate invoice number
  const invoiceNumber = `INV-${booking._id.toString().slice(-8).toUpperCase()}`;
  
  // Get current date for invoice
  const invoiceDate = new Date().toLocaleDateString();
  
  // Calculate due date (same as invoice date for paid bookings)
  const dueDate = invoiceDate;
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Invoice - SerendibGo</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8fafc;
        }
        .invoice-container {
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .invoice-header {
          background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
          color: white;
          padding: 40px;
          text-align: center;
          position: relative;
        }
        .invoice-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="1" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="1" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
          opacity: 0.3;
        }
        .invoice-header h1 {
          margin: 0;
          font-size: 32px;
          font-weight: bold;
          position: relative;
          z-index: 1;
        }
        .invoice-header p {
          margin: 10px 0 0 0;
          font-size: 18px;
          opacity: 0.9;
          position: relative;
          z-index: 1;
        }
        .invoice-title {
          background-color: #f0f9ff;
          padding: 20px 40px;
          border-bottom: 3px solid #1e40af;
          text-align: center;
        }
        .invoice-title h2 {
          margin: 0;
          font-size: 24px;
          color: #1e40af;
          font-weight: bold;
        }
        .invoice-info {
          padding: 40px;
        }
        .invoice-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }
        .invoice-meta-item {
          background-color: #f8fafc;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #1e40af;
          min-width: 200px;
          margin-bottom: 10px;
        }
        .invoice-meta-item h4 {
          margin: 0 0 5px 0;
          color: #1e40af;
          font-size: 14px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .invoice-meta-item p {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }
        .billing-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }
        .billing-info {
          background-color: #f0f9ff;
          padding: 20px;
          border-radius: 8px;
          border: 2px solid #0ea5e9;
          min-width: 300px;
          margin-bottom: 20px;
        }
        .billing-info h3 {
          margin: 0 0 15px 0;
          color: #0ea5e9;
          font-size: 18px;
          font-weight: bold;
        }
        .billing-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          padding: 5px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .billing-row:last-child {
          border-bottom: none;
        }
        .billing-label {
          font-weight: 600;
          color: #374151;
        }
        .billing-value {
          color: #1f2937;
          font-weight: 500;
        }
        .trip-details {
          background-color: #f0fdf4;
          padding: 25px;
          border-radius: 8px;
          border: 2px solid #10b981;
          margin-bottom: 30px;
        }
        .trip-details h3 {
          margin: 0 0 20px 0;
          color: #10b981;
          font-size: 20px;
          font-weight: bold;
        }
        .trip-title {
          font-size: 24px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 15px;
          text-align: center;
        }
        .trip-badge {
          display: inline-block;
          background-color: ${isCustomTrip ? '#f59e0b' : isGuideBooking ? '#10b981' : isVehicleBooking ? '#3b82f6' : isHotelBooking ? '#8b5cf6' : '#1e40af'};
          color: white;
          padding: 6px 16px;
          border-radius: 25px;
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .trip-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }
        .trip-item {
          background-color: white;
          padding: 15px;
          border-radius: 6px;
          border-left: 4px solid #10b981;
        }
        .trip-item h4 {
          margin: 0 0 8px 0;
          color: #10b981;
          font-size: 14px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .trip-item p {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }
        .invoice-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          background-color: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .invoice-table th {
          background-color: #1e40af;
          color: white;
          padding: 15px;
          text-align: left;
          font-weight: bold;
          font-size: 16px;
        }
        .invoice-table td {
          padding: 15px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 15px;
        }
        .invoice-table tr:last-child td {
          border-bottom: none;
        }
        .invoice-table .total-row {
          background-color: #f0f9ff;
          font-weight: bold;
          font-size: 18px;
        }
        .invoice-table .total-row td {
          color: #1e40af;
          border-top: 2px solid #1e40af;
        }
        .payment-status {
          background-color: #f0fdf4;
          padding: 20px;
          border-radius: 8px;
          border: 2px solid #10b981;
          text-align: center;
          margin-bottom: 30px;
        }
        .payment-status h3 {
          margin: 0 0 10px 0;
          color: #10b981;
          font-size: 20px;
          font-weight: bold;
        }
        .payment-status .status-badge {
          display: inline-block;
          background-color: #10b981;
          color: white;
          padding: 8px 20px;
          border-radius: 25px;
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 15px;
        }
        .payment-status .amount {
          font-size: 28px;
          font-weight: bold;
          color: #059669;
          margin: 10px 0;
        }
        .next-steps {
          background-color: #fef3c7;
          padding: 25px;
          border-radius: 8px;
          border: 2px solid #f59e0b;
          margin-bottom: 30px;
        }
        .next-steps h3 {
          margin: 0 0 15px 0;
          color: #f59e0b;
          font-size: 18px;
          font-weight: bold;
        }
        .next-steps ul {
          margin: 0;
          padding-left: 20px;
        }
        .next-steps li {
          margin-bottom: 8px;
          color: #92400e;
          font-weight: 500;
        }
        .footer {
          background-color: #f8fafc;
          padding: 30px 40px;
          text-align: center;
          border-top: 3px solid #1e40af;
        }
        .footer h3 {
          margin: 0 0 15px 0;
          color: #374151;
          font-size: 20px;
          font-weight: bold;
        }
        .contact-info {
          color: #6b7280;
          font-size: 15px;
          line-height: 1.6;
        }
        .contact-info p {
          margin: 8px 0;
          font-weight: 500;
        }
        .footer-note {
          margin-top: 25px;
          font-size: 12px;
          color: #9ca3af;
          border-top: 1px solid #e5e7eb;
          padding-top: 15px;
        }
        @media (max-width: 768px) {
          body {
            padding: 10px;
          }
          .invoice-header {
            padding: 30px 20px;
          }
          .invoice-info {
            padding: 20px;
          }
          .invoice-meta {
            flex-direction: column;
          }
          .billing-section {
            flex-direction: column;
          }
          .trip-grid {
            grid-template-columns: 1fr;
          }
          .invoice-table {
            font-size: 14px;
          }
          .invoice-table th,
          .invoice-table td {
            padding: 10px;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="invoice-header">
          <h1>SERENDIB GO</h1>
          <p>Premium Travel Experience</p>
        </div>
        
        <div class="invoice-title">
          <h2>📋 BOOKING INVOICE & CONFIRMATION</h2>
        </div>
        
        <div class="invoice-info">
          <div class="invoice-meta">
            <div class="invoice-meta-item">
              <h4>Invoice Number</h4>
              <p>${invoiceNumber}</p>
            </div>
            <div class="invoice-meta-item">
              <h4>Invoice Date</h4>
              <p>${invoiceDate}</p>
            </div>
            <div class="invoice-meta-item">
              <h4>Due Date</h4>
              <p>${dueDate}</p>
            </div>
            <div class="invoice-meta-item">
              <h4>Booking ID</h4>
              <p>${booking._id}</p>
            </div>
          </div>
          
          <div class="billing-section">
            <div class="billing-info">
              <h3>👤 Customer Information</h3>
              <div class="billing-row">
                <span class="billing-label">Full Name:</span>
                <span class="billing-value">${user.name || 'N/A'}</span>
              </div>
              <div class="billing-row">
                <span class="billing-label">Email Address:</span>
                <span class="billing-value">${user.email || 'N/A'}</span>
              </div>
              <div class="billing-row">
                <span class="billing-label">Phone Number:</span>
                <span class="billing-value">${user.phone || 'N/A'}</span>
              </div>
              <div class="billing-row">
                <span class="billing-label">Booking Date:</span>
                <span class="billing-value">${new Date(booking.createdAt || new Date()).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div class="billing-info">
              <h3>🏢 SerendibGo Information</h3>
              <div class="billing-row">
                <span class="billing-label">Company:</span>
                <span class="billing-value">SerendibGo Travel</span>
              </div>
              <div class="billing-row">
                <span class="billing-label">Email:</span>
                <span class="billing-value">support@serendibgo.lk</span>
              </div>
              <div class="billing-row">
                <span class="billing-label">Phone:</span>
                <span class="billing-value">+94 11 234 5678</span>
              </div>
              <div class="billing-row">
                <span class="billing-label">Website:</span>
                <span class="billing-value">www.serendibgo.lk</span>
              </div>
            </div>
          </div>
          
          <div class="trip-details">
            <h3>🎯 Trip Details</h3>
            <div class="trip-title">${tripTitle || 'Adventure Awaits'}</div>
            <div class="trip-badge">${isCustomTrip ? 'Custom Trip' : isGuideBooking ? 'Guide Service' : isVehicleBooking ? 'Vehicle Rental' : isHotelBooking ? 'Hotel Booking' : 'Pre-designed Tour'}</div>
            
            <div class="trip-grid">
              <div class="trip-item">
                <h4>Duration</h4>
                <p>${tripDuration || 'N/A'}</p>
              </div>
              <div class="trip-item">
                <h4>Location</h4>
                <p>${tripLocation || 'N/A'}</p>
              </div>
              <div class="trip-item">
                <h4>Start Date</h4>
                <p>${startDate}</p>
              </div>
              <div class="trip-item">
                <h4>End Date</h4>
                <p>${endDate}</p>
              </div>
              <div class="trip-item">
                <h4>Participants</h4>
                <p>${participants} people</p>
              </div>
              <div class="trip-item">
                <h4>Status</h4>
                <p style="color: #10b981; font-weight: bold;">Confirmed</p>
              </div>
            </div>
            
            ${tripDescription ? `
              <div style="margin-top: 20px; padding: 15px; background-color: white; border-radius: 6px;">
                <h4 style="margin: 0 0 10px 0; color: #10b981; font-size: 16px;">Description</h4>
                <p style="margin: 0; color: #6b7280; line-height: 1.6;">${tripDescription}</p>
              </div>
            ` : ''}
            
            ${isGuideBooking ? `
              <div style="margin-top: 20px; padding: 15px; background-color: white; border-radius: 6px;">
                <h4 style="margin: 0 0 10px 0; color: #10b981; font-size: 16px;">Guide Information</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                  <div>
                    <strong>Guide Name:</strong><br>
                    <span style="color: #6b7280;">${booking.guide?.name || 'Professional Guide'}</span>
                  </div>
                  <div>
                    <strong>Tour Type:</strong><br>
                    <span style="color: #6b7280;">${booking.tourType ? booking.tourType.charAt(0).toUpperCase() + booking.tourType.slice(1) : 'General'}</span>
                  </div>
                  <div>
                    <strong>Meeting Point:</strong><br>
                    <span style="color: #6b7280;">${booking.meetingPoint || 'To be confirmed'}</span>
                  </div>
                  <div>
                    <strong>Special Requests:</strong><br>
                    <span style="color: #6b7280;">${booking.specialRequests || 'None'}</span>
                  </div>
                </div>
              </div>
            ` : ''}
            
            ${isVehicleBooking ? `
              <div style="margin-top: 20px; padding: 15px; background-color: white; border-radius: 6px;">
                <h4 style="margin: 0 0 10px 0; color: #3b82f6; font-size: 16px;">Vehicle Information</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                  <div>
                    <strong>Vehicle:</strong><br>
                    <span style="color: #6b7280;">${booking.vehicle?.brand || 'Vehicle'} ${booking.vehicle?.model || ''}</span>
                  </div>
                  <div>
                    <strong>Pickup Location:</strong><br>
                    <span style="color: #6b7280;">${booking.pickupLocation || 'To be confirmed'}</span>
                  </div>
                  <div>
                    <strong>Return Location:</strong><br>
                    <span style="color: #6b7280;">${booking.returnLocation || 'Same as pickup'}</span>
                  </div>
                  <div>
                    <strong>Fuel Policy:</strong><br>
                    <span style="color: #6b7280;">${booking.fuelPolicy || 'Full to full'}</span>
                  </div>
                </div>
              </div>
            ` : ''}
            
            ${isHotelBooking ? `
              <div style="margin-top: 20px; padding: 15px; background-color: white; border-radius: 6px;">
                <h4 style="margin: 0 0 10px 0; color: #8b5cf6; font-size: 16px;">Hotel Information</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                  <div>
                    <strong>Hotel:</strong><br>
                    <span style="color: #6b7280;">${booking.hotel?.name || 'Hotel'}</span>
                  </div>
                  <div>
                    <strong>Room Type:</strong><br>
                    <span style="color: #6b7280;">${booking.roomType || 'Standard'}</span>
                  </div>
                  <div>
                    <strong>Check-in Time:</strong><br>
                    <span style="color: #6b7280;">${booking.hotel?.checkInTime || '2:00 PM'}</span>
                  </div>
                  <div>
                    <strong>Check-out Time:</strong><br>
                    <span style="color: #6b7280;">${booking.hotel?.checkOutTime || '11:00 AM'}</span>
                  </div>
                </div>
              </div>
            ` : ''}
          </div>
          
          <table class="invoice-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>${tripTitle || 'Travel Package'}</strong><br>
                  <small style="color: #6b7280;">${isCustomTrip ? 'Custom Trip Package' : 'Pre-designed Tour Package'}</small>
                </td>
                <td>${participants}</td>
                <td>${currency} ${perPersonCost.toLocaleString()}</td>
                <td>${currency} ${totalAmount.toLocaleString()}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="3"><strong>TOTAL AMOUNT</strong></td>
                <td><strong>${currency} ${totalAmount.toLocaleString()}</strong></td>
              </tr>
            </tfoot>
          </table>
          
          <div class="payment-status">
            <h3>💳 Payment Information</h3>
            <div class="status-badge">PAID</div>
            <div class="amount">${currency} ${totalAmount.toLocaleString()}</div>
            <div style="margin-top: 15px;">
              <p style="margin: 5px 0; color: #374151;"><strong>Payment Method:</strong> Stripe Gateway</p>
              <p style="margin: 5px 0; color: #374151;"><strong>Payment ID:</strong> ${booking.paymentId || 'N/A'}</p>
              <p style="margin: 5px 0; color: #374151;"><strong>Transaction Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
          
          <div class="next-steps">
            <h3>📅 Important Information & Next Steps</h3>
            <ul>
              <li>✅ Your booking has been confirmed and payment processed successfully</li>
              <li>📧 You will receive a detailed itinerary via email within 24 hours</li>
              <li>📞 Our team will contact you 48 hours before your tour for final arrangements</li>
              <li>⏰ Please arrive 15 minutes before the scheduled start time</li>
              <li>🎒 Don't forget to bring comfortable clothing and sunscreen</li>
              <li>📱 Keep this invoice with you during your trip for reference</li>
              <li>🆘 For any emergencies, contact our 24/7 support line</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f0f9ff; border-radius: 8px; border: 2px solid #1e40af;">
            <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 20px;">Thank You for Choosing SerendibGo!</h3>
            <p style="margin: 0; color: #374151; font-size: 16px; font-weight: 500;">
              We look forward to providing you with an unforgettable travel experience in beautiful Sri Lanka.
            </p>
          </div>
        </div>
        
        <div class="footer">
          <h3>Need Help or Have Questions?</h3>
          <div class="contact-info">
            <p>📧 Email: support@serendibgo.lk</p>
            <p>📞 Phone: +94 11 234 5678</p>
            <p>💬 Live Chat: Use our AI chatbot for instant assistance</p>
            <p>🌐 Website: www.serendibgo.lk</p>
            <p>📍 Address: Colombo, Sri Lanka</p>
          </div>
          <div class="footer-note">
            <p>This is an automated invoice generated on ${new Date().toLocaleString()}</p>
            <p>© 2024 SerendibGo Travel. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: user.email,
    subject: `📋 Booking Invoice & Confirmation - ${tripTitle || 'Your Trip'} | SerendibGo`,
    html
  });
};

// Send refund notification email
const sendRefundNotification = async (refundData) => {
  const { user, payment, refundAmount, reason } = refundData;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Refund Processed</h2>
      <p>Dear ${user.name},</p>
      <p>Your refund has been processed successfully!</p>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Refund Details</h3>
        <p><strong>Original Payment ID:</strong> ${payment.orderId}</p>
        <p><strong>Refund Amount:</strong> ${payment.currency} ${refundAmount}</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p><strong>Refund Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
      
      <p>The refund will be credited to your original payment method within 5-10 business days.</p>
      
      <p>If you have any questions, please contact our support team.</p>
      
      <p>Best regards,<br>The SerendibGo Team</p>
    </div>
  `;

  return await sendEmail({
    to: user.email,
    subject: 'Refund Processed - SerendibGo',
    html
  });
};

module.exports = {
  sendEmail,
  sendBookingConfirmation,
  sendRentalConfirmation,
  sendPasswordResetEmail,
  sendEmailVerification,
  sendBookingReminder,
  sendPaymentConfirmation,
  sendRefundNotification,
  sendBookingConfirmationWithItinerary
};
