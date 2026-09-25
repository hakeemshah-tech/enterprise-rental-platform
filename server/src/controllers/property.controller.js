const Property = require('../models/Property');
const path = require('path');
const fs = require('fs');
const { isStoredFilename } = require('../utils/uploads.util');

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads', 'properties');

/**
 * Delete an uploaded file given its URL. Silently skips external URLs.
 *
 * The filename is taken from a URL stored in MongoDB, so it is only as
 * trustworthy as the admin account that wrote it. It is checked against the
 * shape this API itself generates before it is ever joined to a path: the
 * capture group excludes '/' but not '\' or '..', and `path.join` treats a
 * backslash as a separator on Windows, which would otherwise turn this into
 * an unlink primitive outside the uploads directory.
 */
function deleteUploadedFile(url) {
  if (!url) return;
  try {
    const match = url.match(/\/uploads\/properties\/([^/?#]+)/);
    if (!match) return;
    if (!isStoredFilename(match[1])) return; // Not a name this API wrote
    const filePath = path.join(UPLOADS_DIR, match[1]);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // Silently ignore
  }
}

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
    // Snapshot old image URLs before update
    const oldProperty = await Property.findById(req.params.id);
    if (!oldProperty) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    const oldUrls = new Set((oldProperty.images || []).map((img) => img.url).filter(Boolean));

    const property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Delete orphaned images (old URLs not present in updated property)
    const newUrls = new Set((property.images || []).map((img) => img.url).filter(Boolean));
    for (const oldUrl of oldUrls) {
      if (!newUrls.has(oldUrl)) {
        deleteUploadedFile(oldUrl);
      }
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
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Clean up all images for this property
    for (const img of property.images || []) {
      if (img.url) deleteUploadedFile(img.url);
    }

    res.json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

const { checkAvailability, getUnavailableDates } = require('../utils/availability.util');

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

/**
 * @desc    Get unavailable dates for a property (bookings + blocked)
 * @route   GET /api/properties/:id/availability
 * @access  Public
 */
const getPropertyAvailability = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const ranges = await getUnavailableDates(req.params.id);
    res.json({ success: true, data: ranges });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Block dates on a property (maintenance, etc.)
 * @route   POST /api/properties/:id/block-dates
 * @access  Private/Admin
 */
const blockDates = async (req, res, next) => {
  try {
    const { startDate, endDate, reason } = req.body;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ success: false, message: 'startDate and endDate are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return res.status(400).json({ success: false, message: 'endDate must be after startDate' });
    }

    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Check for conflicts with existing bookings
    const { available, conflicts } = await checkAvailability(req.params.id, start, end);
    const bookingConflicts = conflicts.filter((c) => c.type === 'booking');
    if (bookingConflicts.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Cannot block dates: there are confirmed bookings in this range',
        conflicts: bookingConflicts,
      });
    }

    property.blockedDates.push({ startDate: start, endDate: end, reason: reason || 'maintenance' });
    await property.save();

    res.json({
      success: true,
      message: 'Dates blocked successfully',
      data: property.blockedDates,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Unblock dates on a property
 * @route   DELETE /api/properties/:id/unblock-dates
 * @access  Private/Admin
 */
const unblockDates = async (req, res, next) => {
  try {
    const { blockId } = req.body;

    if (!blockId) {
      return res.status(400).json({ success: false, message: 'blockId is required' });
    }

    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const blockIndex = property.blockedDates.findIndex((b) => b._id.toString() === blockId);

    if (blockIndex === -1) {
      return res.status(404).json({ success: false, message: 'Block not found' });
    }

    property.blockedDates.splice(blockIndex, 1);
    await property.save();

    res.json({
      success: true,
      message: 'Dates unblocked successfully',
      data: property.blockedDates,
    });
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
  getPropertyAvailability,
  blockDates,
  unblockDates,
};
