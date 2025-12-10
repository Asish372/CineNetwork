const { body, validationResult } = require('express-validator');

// Validation Middleware
const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format errors
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

    return res.status(400).json({
      message: 'Validation Error',
      errors: extractedErrors,
    });
  };
};

// Validation Rules
const authValidation = {
  signup: [
    body('username').optional(), // Not used in controller, but good to have
    body('fullName').notEmpty().withMessage('Full Name is required').trim().escape(),
    body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'), // Matched controller min length
    body('phone').isMobilePhone().withMessage('Invalid phone number'),
  ],
  login: [
    body('email').custom((value) => {
      if (value === 'admin') return true;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        throw new Error('Valid Email is required');
      }
      return true;
    }),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  otp: [
    body('phone').isMobilePhone().withMessage('Invalid phone number'),
  ],
  verifyOtp: [
    body('phone').isMobilePhone().withMessage('Invalid phone number'),
    body('otp').isLength({ min: 4, max: 6 }).withMessage('OTP must be 4-6 digits'),
  ]
};

module.exports = {
  validate,
  authValidation,
};
