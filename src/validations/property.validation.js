const { z } = require('zod');

const locationSchema = z.object({
  address: z.string({ required_error: 'Address is required' }).min(1),
  city: z.string({ required_error: 'City is required' }).min(1),
  state: z.string().optional().default(''),
  country: z.string({ required_error: 'Country is required' }).min(1),
  zipCode: z.string().optional().default(''),
  coordinates: z
    .object({
      lat: z.number().optional().default(0),
      lng: z.number().optional().default(0),
    })
    .optional(),
});

const availabilitySchema = z.object({
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
});

const imageSchema = z.object({
  url: z.string({ required_error: 'Image URL is required' }),
  alt: z.string().optional().default(''),
});

const amenitiesEnum = z.enum([
  'wifi', 'pool', 'parking', 'kitchen', 'air-conditioning', 'heating',
  'washer', 'dryer', 'tv', 'gym', 'hot-tub', 'fireplace', 'balcony',
  'garden', 'bbq', 'pet-friendly', 'beach-access', 'ski-access',
  'ev-charger', 'security',
]);

const createPropertySchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(3, 'Title must be at least 3 characters')
    .max(120, 'Title cannot exceed 120 characters'),
  description: z
    .string({ required_error: 'Description is required' })
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters'),
  type: z.enum(['villa', 'apartment', 'cottage', 'cabin', 'penthouse', 'beach-house'], {
    required_error: 'Property type is required',
  }),
  price: z.object({
    perNight: z.number({ required_error: 'Price per night is required' }).min(0),
    cleaningFee: z.number().optional().default(0),
    serviceFee: z.number().optional().default(0),
  }),
  location: locationSchema,
  amenities: z.array(amenitiesEnum).optional().default([]),
  images: z.array(imageSchema).optional().default([]),
  bedrooms: z.number({ required_error: 'Bedrooms is required' }).int().min(0),
  bathrooms: z.number({ required_error: 'Bathrooms is required' }).int().min(0),
  maxGuests: z.number({ required_error: 'Max guests is required' }).int().min(1),
  availability: z.array(availabilitySchema).optional().default([]),
  featured: z.boolean().optional().default(false),
  status: z.enum(['active', 'inactive', 'maintenance']).optional().default('active'),
});

const updatePropertySchema = createPropertySchema.partial();

module.exports = { createPropertySchema, updatePropertySchema };
