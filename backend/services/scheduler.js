// services/scheduler.js - Scheduled Tasks

const cron = require('node-cron');
const Hospital = require('../models/Hospital');
const Laboratory = require('../models/Laboratory');

// ========== Update Google Ratings ==========
const updateGoogleRatings = async () => {
  console.log('🔄 Starting scheduled Google ratings update...');
  console.log('⏰ Time:', new Date().toLocaleString());

  try {
    const googlePlaces = require('./googlePlaces');
    const result = await googlePlaces.updateAllGoogleRatings();

    if (result.success) {
      console.log(`✅ Scheduled update complete: ${result.message}`);
    } else {
      console.log(`⚠️ Scheduled update failed: ${result.message}`);
    }
  } catch (error) {
    console.error('❌ Scheduler error:', error.message);
  }
};

// ========== Log Database Stats ==========
const logDatabaseStats = async () => {
  try {
    const hospitalCount = await Hospital.countDocuments();
    const labCount = await Laboratory.countDocuments();

    console.log('📊 Daily Stats:');
    console.log(`   Hospitals: ${hospitalCount}`);
    console.log(`   Labs: ${labCount}`);
  } catch (error) {
    console.error('❌ Stats error:', error.message);
  }
};

// ========== Start All Schedulers ==========
const startSchedulers = () => {
  console.log('⏰ Starting schedulers...');

  // Update Google ratings every 24 hours at 2:00 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('🔄 Running daily Google ratings update...');
    await updateGoogleRatings();
  }, {
    scheduled: true,
    timezone: 'Asia/Kolkata'
  });

  // Log stats every day at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('📊 Running daily stats log...');
    await logDatabaseStats();
  }, {
    scheduled: true,
    timezone: 'Asia/Kolkata'
  });

  // Update ratings every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    console.log('🔄 Running 6-hourly Google ratings update...');
    await updateGoogleRatings();
  }, {
    scheduled: true,
    timezone: 'Asia/Kolkata'
  });

  console.log('✅ Schedulers started!');
  console.log('📅 Schedule:');
  console.log('   Google ratings: Every 6 hours');
  console.log('   Daily stats: Every midnight');
};

module.exports = { startSchedulers, updateGoogleRatings };