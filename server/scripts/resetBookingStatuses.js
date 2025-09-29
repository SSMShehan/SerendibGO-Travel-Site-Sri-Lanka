// Reset existing tour bookings to pending status for testing
const mongoose = require('mongoose');
const TourBooking = require('../models/TourBooking');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://reweivApp:IeXlWgAxLjJFTPtm@cluster0.dthhhte.mongodb.net/serendibgo?retryWrites=true&w=majority&appName=Cluster0');

async function resetBookingStatuses() {
  try {
    console.log('Resetting tour booking statuses...');
    
    // Update all tour bookings to pending status
    const result = await TourBooking.updateMany(
      { 
        $or: [
          { status: 'confirmed' },
          { status: 'paid' },
          { paymentStatus: 'paid' }
        ]
      },
      { 
        $set: { 
          status: 'pending',
          paymentStatus: 'pending'
        }
      }
    );
    
    console.log(`Updated ${result.modifiedCount} tour bookings to pending status`);
    
    // List current bookings
    const bookings = await TourBooking.find({}).select('_id status paymentStatus totalAmount');
    console.log('Current bookings:', bookings);
    
  } catch (error) {
    console.error('Error resetting booking statuses:', error);
  } finally {
    mongoose.connection.close();
  }
}

resetBookingStatuses();
