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

router.post('/login', login);
router.post('/send-signup-otp', sendSignupOtp);
router.post('/verify-signup', verifySignup);
router.post('/send-login-otp', sendLoginOtp);
router.post('/verify-login-otp', verifyLoginOtp);
router.post('/forgot-password/send-otp', sendForgotPasswordOtp);
router.post('/forgot-password/verify-otp', verifyForgotPasswordOtp);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);

module.exports = router;
