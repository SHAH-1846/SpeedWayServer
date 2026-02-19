const Property = require('../models/Property');

/**
 * @desc    Get all properties (with filtering, sorting, pagination)
 * @route   GET /api/properties
 * @access  Public
 */
const getProperties = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      sort = '-createdAt',
      type,
      city,
      minPrice,
      maxPrice,
      bedrooms,
      guests,
      amenities,
      featured,
      search,
      status,
    } = req.query;

    const query = {};

    // Filters
    if (type) query.type = type;
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (status) query.status = status;
    else query.status = 'active'; // Only active by default for public
    if (featured === 'true') query.featured = true;
    if (bedrooms) query.bedrooms = { $gte: Number(bedrooms) };
    if (guests) query.maxGuests = { $gte: Number(guests) };
    if (minPrice || maxPrice) {
      query['price.perNight'] = {};
      if (minPrice) query['price.perNight'].$gte = Number(minPrice);
      if (maxPrice) query['price.perNight'].$lte = Number(maxPrice);
    }
    if (amenities) {
      const list = amenities.split(',');
      query.amenities = { $all: list };
    }
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { 'location.city': new RegExp(search, 'i') },
        { 'location.country': new RegExp(search, 'i') },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Property.countDocuments(query);

    const properties = await Property.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate('owner', 'name avatar');

    res.json({
      success: true,
      data: properties,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single property by ID or slug
 * @route   GET /api/properties/:id
 * @access  Public
 */
const getProperty = async (req, res, next) => {
  try {
    let property;

    // Try ObjectId first, then slug
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      property = await Property.findById(req.params.id).populate('owner', 'name avatar');
    } else {
      property = await Property.findOne({ slug: req.params.id }).populate('owner', 'name avatar');
    }

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    res.json({ success: true, data: property });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new property
 * @route   POST /api/properties
 * @access  Private/Admin
 */
const createProperty = async (req, res, next) => {
  try {
    req.body.owner = req.user.id;
    const property = await Property.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update property
 * @route   PUT /api/properties/:id
 * @access  Private/Admin
 */
const updateProperty = async (req, res, next) => {
  try {
    const property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    res.json({
      success: true,
      message: 'Property updated successfully',
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete property
 * @route   DELETE /api/properties/:id
 * @access  Private/Admin
 */
const deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    res.json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get featured properties
 * @route   GET /api/properties/featured
 * @access  Public
 */
const getFeaturedProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ featured: true, status: 'active' })
      .limit(6)
      .populate('owner', 'name avatar');

    res.json({ success: true, data: properties });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getFeaturedProperties,
};
