const mongoose = require('mongoose');

/**
 * GlobalSettings — Singleton document for website content management.
 * Only one document exists; it is upserted on first access.
 */
const heroSlideSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, default: '' },
    heading: { type: String, required: true },
    subheading: { type: String, default: '' },
  },
  { _id: true }
);

const partnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    logoUrl: { type: String, default: '' },
    icon: { type: String, default: '' },
  },
  { _id: true }
);

const auditEntrySchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    adminName: { type: String, required: true },
    section: { type: String, required: true },
    action: { type: String, default: 'updated' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: true }
);

const globalSettingsSchema = new mongoose.Schema(
  {
    // Singleton key — always "global"
    key: { type: String, default: 'global', unique: true },

    // Hero Section
    hero: {
      type: [heroSlideSchema],
      default: [
        {
          imageUrl: '',
          heading: 'Discover Your Perfect Getaway',
          subheading:
            'Your comfort is our priority — ensuring a seamless and pleasant experience at every step.',
        },
      ],
    },

    // Chairman's Note
    chairmansNote: {
      type: String,
      default:
        'For nearly two decades, our team has been deeply rooted in the region\'s real estate landscape. What began as a commitment to providing exceptional property services has evolved into a vision — to become the No. 1 Real Estate service provider in the region.',
    },

    // Company Stats
    companyStats: {
      yearsExperience: { type: String, default: '20+' },
      propertiesManaged: { type: String, default: '100+' },
      satisfiedClients: { type: String, default: '50+' },
      guestRating: { type: String, default: '4.8' },
    },

    // Partners
    partners: {
      type: [partnerSchema],
      default: [
        { name: 'Al Attar Group', logoUrl: '' },
        { name: 'Modern Real Estate', logoUrl: '' },
        { name: 'Emerald Properties', logoUrl: '' },
        { name: 'Bin Ghalita', logoUrl: '' },
      ],
    },

    // Company Contact Info
    companyInfo: {
      phone: { type: String, default: '+971 4 548 4800' },
      email: { type: String, default: 'hello@speedwayproperties.ae' },
      address: {
        type: String,
        default:
          'The Atrium Building, Al Mankhool, 2nd Floor, Office No: 208, Dubai, United Arab Emirates',
      },
      workingHours: { type: String, default: 'Sun – Thu: 9:00 AM – 6:00 PM' },
    },

    // Google Maps Embed URL (top-level for reliable CRUD)
    googleMapsEmbedUrl: {
      type: String,
      default:
        'https://maps.google.com/maps?q=Speedway+Properties+LLC,Al+Mankhool,Bur+Dubai&t=&z=15&ie=UTF8&iwloc=&output=embed',
    },

    // About Content
    aboutContent: {
      philosophy: {
        type: String,
        default:
          'Your comfort is our priority — ensuring a seamless and pleasant experience at every step.',
      },
      coreServices: {
        type: [{
          name: { type: String, required: true },
          icon: { type: String, default: '' },
        }],
        default: [
          { name: 'Residential Sales', icon: 'Building2' },
          { name: 'Commercial Leasing', icon: 'TrendingUp' },
          { name: 'Property Management', icon: 'MapPin' },
          { name: 'Vacation Home Rentals', icon: 'Lightbulb' },
          { name: 'Investment Advisory', icon: 'Target' },
        ],
      },
      keyProjects: {
        type: [String],
        default: ['Rotana Building (Bur Dubai)', 'Barsha Star (Barsha-1)'],
      },
    },

    // Audit Log — capped at 50 entries
    auditLog: {
      type: [auditEntrySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('GlobalSettings', globalSettingsSchema);
