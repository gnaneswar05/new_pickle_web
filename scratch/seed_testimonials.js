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

const defaultTestimonials = [
  { quote: "The Mango Avakaya is just out of this world! It tastes exactly like the pickle my grandmother used to make in Rajahmundry. Purity at its best.", author: "Srinivas K.", roleOrLocation: "Hyderabad • Verified Buyer", rating: 5 },
  { quote: "I was skeptical about ordering online, but Kanvi changed my mind. The Gongura pickle is perfectly spicy and sour. Premium packaging too!", author: "Priya Sharma", roleOrLocation: "Bangalore • Food Blogger", rating: 5 },
  { quote: "Exceptional quality. The garlic pickle is fresh, aromatic, and goes perfectly with hot rice and ghee. Will definitely order again.", author: "Ramanathan M.", roleOrLocation: "Chennai • Satisfied Customer", rating: 5 }
];

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected');
    
    const settings = await Settings.findOne({});
    if (!settings) {
      console.log('No settings document found to update.');
    } else {
      console.log('Current testimonials count:', settings.testimonials ? settings.testimonials.length : 0);
      if (!settings.testimonials || settings.testimonials.length === 0) {
        settings.testimonials = defaultTestimonials;
        await settings.save();
        console.log('Successfully seeded default testimonials!');
      } else {
        console.log('Testimonials are not empty. No seeding required.');
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
