const Enquiry = require('../models/Enquiry');

/**
 * @desc    Submit an enquiry
 * @route   POST /api/enquiries
 * @access  Public
 */
const createEnquiry = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully! We will get back to you soon.',
      data: enquiry,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all enquiries (admin)
 * @route   GET /api/enquiries
 * @access  Private/Admin
 */
const getEnquiries = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search, property, startDate, endDate } = req.query;
    const query = {};
    if (status) query.status = status;
    if (property) query.property = property;

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // Global search across name, email, subject, message
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ name: regex }, { email: regex }, { subject: regex }, { message: regex }];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Enquiry.countDocuments(query);

    const enquiries = await Enquiry.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .populate('property', 'title slug');

    res.json({
      success: true,
      data: enquiries,
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
 * @desc    Update enquiry status (admin)
 * @route   PUT /api/enquiries/:id
 * @access  Private/Admin
 */
const updateEnquiryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    res.json({
      success: true,
      message: 'Enquiry status updated',
      data: enquiry,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createEnquiry, getEnquiries, updateEnquiryStatus };
