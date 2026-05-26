const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Read .env.local file
const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const MONGODB_URI = env.MONGODB_URI || 'mongodb://localhost:27017/pickle_app';

const schema = new mongoose.Schema({
  testimonials: Array
}, { collection: 'settings' });

const Settings = mongoose.models.Settings || mongoose.model('Settings', schema);

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    const settings = await Settings.findOne({});
    if (!settings) {
      console.log('No settings document found');
    } else {
      console.log('Settings document testimonials count:', settings.testimonials ? settings.testimonials.length : 0);
      console.log('Testimonials:');
      console.log(JSON.stringify(settings.testimonials, null, 2));
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
