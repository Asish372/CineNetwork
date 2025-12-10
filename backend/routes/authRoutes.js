const express = require('express');
const router = express.Router();
const { 
  login, 
  sendSignupOtp, 
  verifySignup, 
  sendLoginOtp, 
  verifyLoginOtp,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPassword,
  getMe
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const { validate, authValidation } = require('../middleware/validator');

router.post('/login', validate(authValidation.login), login);
router.post('/send-signup-otp', validate(authValidation.signup), sendSignupOtp); // Signup initiates otp
router.post('/verify-signup', validate(authValidation.verifyOtp), verifySignup);
router.post('/send-login-otp', validate(authValidation.otp), sendLoginOtp);
router.post('/verify-login-otp', validate(authValidation.verifyOtp), verifyLoginOtp);
router.post('/forgot-password/send-otp', sendForgotPasswordOtp);
router.post('/forgot-password/verify-otp', verifyForgotPasswordOtp);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);

module.exports = router;
