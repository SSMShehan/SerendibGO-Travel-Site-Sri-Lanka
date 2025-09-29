const mongoose = require('mongoose');
require('dotenv').config({ path: '../env.local' });

// Import all booking models
const Booking = require('../models/Booking');
const TourBooking = require('../models/TourBooking');
const VehicleBooking = require('../models/VehicleBooking');
const GuideBooking = require('../models/GuideBooking');
const Payment = require('../models/Payment');

async function resetAllBookings() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/serendibgo');
    console.log('Connected to MongoDB');

    // Reset all booking collections
    console.log('\n🔄 Resetting all bookings...');

    // Reset regular bookings (hotels)
    const hotelBookingsResult = await Booking.deleteMany({});
    console.log(`✅ Deleted ${hotelBookingsResult.deletedCount} hotel bookings`);

    // Reset tour bookings
    const tourBookingsResult = await TourBooking.deleteMany({});
    console.log(`✅ Deleted ${tourBookingsResult.deletedCount} tour bookings`);

    // Reset vehicle bookings
    const vehicleBookingsResult = await VehicleBooking.deleteMany({});
    console.log(`✅ Deleted ${vehicleBookingsResult.deletedCount} vehicle bookings`);

    // Reset guide bookings
    const guideBookingsResult = await GuideBooking.deleteMany({});
    console.log(`✅ Deleted ${guideBookingsResult.deletedCount} guide bookings`);

    // Reset payments
    const paymentsResult = await Payment.deleteMany({});
    console.log(`✅ Deleted ${paymentsResult.deletedCount} payments`);

    // Reset tour current participants
    const Tour = require('../models/Tour');
    const tourUpdateResult = await Tour.updateMany(
      { currentParticipants: { $gt: 0 } },
      { $set: { currentParticipants: 0 } }
    );
    console.log(`✅ Reset current participants for ${tourUpdateResult.modifiedCount} tours`);

    console.log('\n🎉 All bookings have been reset successfully!');
    console.log('\n📋 Summary:');
    console.log(`   • Hotel bookings: ${hotelBookingsResult.deletedCount} deleted`);
    console.log(`   • Tour bookings: ${tourBookingsResult.deletedCount} deleted`);
    console.log(`   • Vehicle bookings: ${vehicleBookingsResult.deletedCount} deleted`);
    console.log(`   • Guide bookings: ${guideBookingsResult.deletedCount} deleted`);
    console.log(`   • Payments: ${paymentsResult.deletedCount} deleted`);
    console.log(`   • Tours reset: ${tourUpdateResult.modifiedCount} tours`);

  } catch (error) {
    console.error('❌ Error resetting bookings:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the reset function
resetAllBookings();
