import mongoose, { Schema, model, models } from 'mongoose';

const settingsSchema = new Schema({
  cgst: { type: Number, default: 0 },
  sgst: { type: Number, default: 0 },
  igst: { type: Number, default: 0 },
  platformFee: { type: Number, default: 0 },
  aboutUs: { type: String, default: '' },
  ourMission: { type: String, default: 'Our mission is to preserve the authentic flavors of Godavari and deliver them to pickle lovers across the globe. We believe in quality without compromise, using only the finest ingredients sourced directly from local farmers.' },
  termsConditions: { type: String, default: '' },
  cancellationPolicy: { type: String, default: '' },
  refundPolicy: { type: String, default: '' },
  privacyPolicy: { type: String, default: '' },
  maxCodAmount: { type: Number, default: 2000 }, // Default 2000
  razorpayKeyId: { type: String, default: '' },
  razorpayKeySecret: { type: String, default: '' },
  isCodEnabled: { type: Boolean, default: true },
  isRazorpayEnabled: { type: Boolean, default: true },
  topBannerText: { type: String, default: 'Authentic Godavari • Global Shipping Available' },
  defaultProductImage: { type: String, default: 'https://images.unsplash.com/photo-1599021419847-d8a7a6ac599d?q=80&w=1000' },
  productsPerPage: { type: Number, default: 8 },
  contactPhone: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
  contactAddress: { type: String, default: '' },
  fssaiNumber: { type: String, default: '' },
  instagramUrl: { type: String, default: '' },
  whatsappUrl: { type: String, default: '' },
  trustFeatures: {
    type: [{
      icon: { type: String, default: 'Sparkles' },
      title: { type: String, default: '' },
      description: { type: String, default: '' }
    }],
    default: [
      { icon: 'Sparkles', title: 'Traditional Recipes', description: 'Handed down through generations, cooked with authentic Godavari spices, sun-dried ingredients, and traditional cold-pressed oils.' },
      { icon: 'Leaf', title: '100% Natural & Pure', description: 'No chemical preservatives, zero artificial colors, and no MSG. We only pack pure, wholesome flavor inspired by nature.' },
      { icon: 'Truck', title: 'Express Fresh Delivery', description: 'Directly shipped from our kitchen in Visakhapatnam to your home. Double-sealed premium glass jars ensure freshness.' }
    ]
  },
  testimonials: {
    type: [{
      quote: { type: String, required: true },
      author: { type: String, required: true },
      roleOrLocation: { type: String, default: 'Verified Buyer' },
      rating: { type: Number, default: 5 }
    }],
    default: [
      { quote: "The Mango Avakaya is just out of this world! It tastes exactly like the pickle my grandmother used to make in Rajahmundry. Purity at its best.", author: "Srinivas K.", roleOrLocation: "Hyderabad • Verified Buyer", rating: 5 },
      { quote: "I was skeptical about ordering online, but Kanvi changed my mind. The Gongura pickle is perfectly spicy and sour. Premium packaging too!", author: "Priya Sharma", roleOrLocation: "Bangalore • Food Blogger", rating: 5 },
      { quote: "Exceptional quality. The garlic pickle is fresh, aromatic, and goes perfectly with hot rice and ghee. Will definitely order again.", author: "Ramanathan M.", roleOrLocation: "Chennai • Satisfied Customer", rating: 5 }
    ]
  },
  middleBannerText: {
    type: String,
    default: "100% Sun-Dried Godavari Recipes • No Chemical Preservatives • Cured in Cold-Pressed Oils • Free Shipping Above ₹999"
  },
  craftSteps: {
    type: [{
      stepNumber: { type: Number },
      title: { type: String, required: true },
      description: { type: String, required: true }
    }],
    default: [
      { stepNumber: 1, title: 'Godavari Sourcing', description: 'We source fresh green mangoes, aromatic ginger, plump garlic, and local red chillies directly from Godavari farmers at their peak harvest.' },
      { stepNumber: 2, title: 'Sun-Dried Curing', description: 'Sliced ingredients are dried under natural sunlight to remove excess moisture and preserve their structural goodness and natural tang.' },
      { stepNumber: 3, title: 'Cold-Pressed Oils', description: 'We cure our pickles in high-quality cold-pressed mustard oil and sesame oil, ensuring they stay preserved naturally and taste richly aromatic.' },
      { stepNumber: 4, title: 'Hand-Spiced & Sealed', description: 'Each batch is hand-mixed with ancestral spice ratios and sealed in premium glass jars to protect the home-made aroma and taste.' }
    ]
  },
  isBundleEnabled: { type: Boolean, default: true },
  bundlePrice: { type: Number, default: 499 },
  bundleQuantity: { type: Number, default: 3 },
  bundleTitle: { type: String, default: "Curate Your Gourmet Sample Box" },
  bundleDescription: { type: String, default: "Choose any 3 of our premium pickles (150g jars) and get them delivered in a handcrafted luxury wooden gift box." }
}, { timestamps: true });

export const Settings = models.Settings || model('Settings', settingsSchema);
