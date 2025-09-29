const mongoose = require('mongoose');
const Guide = require('../models/Guide');
const User = require('../models/User');
require('dotenv').config({ path: '../env.local' });

// Sample guide data
const sampleGuides = [
  {
    profile: {
      bio: 'Experienced cultural guide with 8 years of experience in showcasing Sri Lanka\'s rich heritage and traditions.',
      experience: 8,
      specializations: ['cultural', 'historical', 'religious'],
      languages: [
        { language: 'English', proficiency: 'fluent' },
        { language: 'Sinhala', proficiency: 'native' },
        { language: 'Tamil', proficiency: 'conversational' }
      ],
      profileImage: {
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
        caption: 'Cultural Guide'
      }
    },
    services: {
      tourTypes: ['private', 'group', 'custom', 'day-trip', 'multi-day'],
      locations: [
        { city: 'Kandy', region: 'Central Province', country: 'Sri Lanka' },
        { city: 'Anuradhapura', region: 'North Central Province', country: 'Sri Lanka' },
        { city: 'Polonnaruwa', region: 'North Central Province', country: 'Sri Lanka' }
      ],
      groupSize: { min: 1, max: 15 },
      duration: { min: 1, max: 7 }
    },
    pricing: {
      hourly: 2000,
      daily: 8000,
      weekly: 45000,
      currency: 'LKR',
      includes: ['transportation', 'entrance_fees', 'none']
    },
    availability: {
      isAvailable: true,
      schedule: [
        { day: 'monday', startTime: '08:00', endTime: '18:00', isAvailable: true },
        { day: 'tuesday', startTime: '08:00', endTime: '18:00', isAvailable: true },
        { day: 'wednesday', startTime: '08:00', endTime: '18:00', isAvailable: true },
        { day: 'thursday', startTime: '08:00', endTime: '18:00', isAvailable: true },
        { day: 'friday', startTime: '08:00', endTime: '18:00', isAvailable: true },
        { day: 'saturday', startTime: '08:00', endTime: '18:00', isAvailable: true },
        { day: 'sunday', startTime: '08:00', endTime: '18:00', isAvailable: true }
      ],
      advanceBooking: 1,
      maxBookingsPerDay: 2
    },
    rating: {
      average: 4.8,
      count: 45
    },
    statistics: {
      totalTours: 120,
      totalClients: 95,
      completionRate: 98,
      responseTime: 2
    },
    status: 'active',
    verification: {
      isVerified: true,
      verifiedAt: new Date('2024-01-15')
    }
  },
  {
    profile: {
      bio: 'Wildlife and nature specialist with expertise in national parks and conservation areas across Sri Lanka.',
      experience: 12,
      specializations: ['wildlife', 'nature', 'adventure', 'eco-tourism'],
      languages: [
        { language: 'English', proficiency: 'fluent' },
        { language: 'Sinhala', proficiency: 'native' },
        { language: 'German', proficiency: 'conversational' }
      ],
      profileImage: {
        url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500',
        caption: 'Wildlife Guide'
      }
    },
    services: {
      tourTypes: ['private', 'group', 'custom', 'day-trip', 'multi-day', 'luxury'],
      locations: [
        { city: 'Yala', region: 'Southern Province', country: 'Sri Lanka' },
        { city: 'Wilpattu', region: 'North Western Province', country: 'Sri Lanka' },
        { city: 'Udawalawe', region: 'Sabaragamuwa Province', country: 'Sri Lanka' }
      ],
      groupSize: { min: 1, max: 8 },
      duration: { min: 1, max: 5 }
    },
    pricing: {
      hourly: 2500,
      daily: 10000,
      weekly: 60000,
      currency: 'LKR',
      includes: ['transportation', 'equipment', 'none']
    },
    availability: {
      isAvailable: true,
      schedule: [
        { day: 'monday', startTime: '06:00', endTime: '20:00', isAvailable: true },
        { day: 'tuesday', startTime: '06:00', endTime: '20:00', isAvailable: true },
        { day: 'wednesday', startTime: '06:00', endTime: '20:00', isAvailable: true },
        { day: 'thursday', startTime: '06:00', endTime: '20:00', isAvailable: true },
        { day: 'friday', startTime: '06:00', endTime: '20:00', isAvailable: true },
        { day: 'saturday', startTime: '06:00', endTime: '20:00', isAvailable: true },
        { day: 'sunday', startTime: '06:00', endTime: '20:00', isAvailable: true }
      ],
      advanceBooking: 2,
      maxBookingsPerDay: 1
    },
    rating: {
      average: 4.9,
      count: 78
    },
    statistics: {
      totalTours: 200,
      totalClients: 150,
      completionRate: 100,
      responseTime: 1
    },
    status: 'active',
    verification: {
      isVerified: true,
      verifiedAt: new Date('2024-01-10')
    }
  },
  {
    profile: {
      bio: 'Adventure and photography guide specializing in hiking, trekking, and capturing Sri Lanka\'s natural beauty.',
      experience: 6,
      specializations: ['adventure', 'photography', 'nature', 'eco-tourism'],
      languages: [
        { language: 'English', proficiency: 'fluent' },
        { language: 'Sinhala', proficiency: 'native' },
        { language: 'French', proficiency: 'conversational' }
      ],
      profileImage: {
        url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500',
        caption: 'Adventure Guide'
      }
    },
    services: {
      tourTypes: ['private', 'group', 'custom', 'day-trip', 'multi-day'],
      locations: [
        { city: 'Ella', region: 'Uva Province', country: 'Sri Lanka' },
        { city: 'Nuwara Eliya', region: 'Central Province', country: 'Sri Lanka' },
        { city: 'Horton Plains', region: 'Central Province', country: 'Sri Lanka' }
      ],
      groupSize: { min: 1, max: 12 },
      duration: { min: 1, max: 5 }
    },
    pricing: {
      hourly: 1800,
      daily: 7000,
      weekly: 40000,
      currency: 'LKR',
      includes: ['transportation', 'equipment', 'none']
    },
    availability: {
      isAvailable: true,
      schedule: [
        { day: 'monday', startTime: '07:00', endTime: '19:00', isAvailable: true },
        { day: 'tuesday', startTime: '07:00', endTime: '19:00', isAvailable: true },
        { day: 'wednesday', startTime: '07:00', endTime: '19:00', isAvailable: true },
        { day: 'thursday', startTime: '07:00', endTime: '19:00', isAvailable: true },
        { day: 'friday', startTime: '07:00', endTime: '19:00', isAvailable: true },
        { day: 'saturday', startTime: '07:00', endTime: '19:00', isAvailable: true },
        { day: 'sunday', startTime: '07:00', endTime: '19:00', isAvailable: true }
      ],
      advanceBooking: 1,
      maxBookingsPerDay: 2
    },
    rating: {
      average: 4.7,
      count: 32
    },
    statistics: {
      totalTours: 85,
      totalClients: 68,
      completionRate: 96,
      responseTime: 3
    },
    status: 'active',
    verification: {
      isVerified: true,
      verifiedAt: new Date('2024-02-01')
    }
  }
];

async function addSampleGuides() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if guides already exist
    const existingGuides = await Guide.find({});
    console.log(`📊 Found ${existingGuides.length} existing guides`);

    if (existingGuides.length > 0) {
      console.log('✅ Guides already exist in database');
      console.log('\n🧭 Existing Guides:');
      existingGuides.forEach(guide => {
        console.log(`   - ${guide.profile?.specializations?.join(', ') || 'General'} Guide - LKR ${guide.pricing?.daily || 0}/day`);
      });
    } else {
      // Get a sample user to assign as guide owner
      const sampleUser = await User.findOne({});
      if (!sampleUser) {
        console.log('❌ No users found. Please create a user first.');
        return;
      }

      console.log(`👤 Using user: ${sampleUser.name || sampleUser.email}`);

      // Create guides with the sample user
      const guidesWithUser = sampleGuides.map(guide => ({
        ...guide,
        user: sampleUser._id
      }));
      
      const createdGuides = await Guide.insertMany(guidesWithUser);
      console.log(`🧭 Created ${createdGuides.length} guides`);

      console.log('\n🧭 New Guides:');
      createdGuides.forEach(guide => {
        console.log(`   - ${guide.profile.specializations.join(', ')} Guide - LKR ${guide.pricing.daily}/day`);
      });
    }

    console.log('\n✅ Guide setup completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run if this file is executed directly
if (require.main === module) {
  addSampleGuides();
}

module.exports = addSampleGuides;
