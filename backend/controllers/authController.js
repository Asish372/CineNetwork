const User = require('../models/User');
const Otp = require('../models/Otp');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    return 'Password must be at least 8 characters long.';
  }
  if (!hasUpperCase) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!hasLowerCase) {
    return 'Password must contain at least one lowercase letter.';
  }
  if (!hasNumber) {
    return 'Password must contain at least one number.';
  }
  if (!hasSpecialChar) {
    return 'Password must contain at least one special character.';
  }
  return null;
};

// --- SIGNUP FLOW ---

// @desc    Send OTP for Signup (Verify phone before creating account)
// @route   POST /api/auth/send-signup-otp
// @access  Public
const sendSignupOtp = async (req, res) => {
  const { fullName, email, phone, password } = req.body;

  const passwordError = validatePassword(password);
  if (passwordError) {
    return res.status(400).json({ message: passwordError });
  }

  try {
    // Check if user already exists
    const userExists = await User.findOne({
      where: {
        [Op.or]: [
          { email: email || '' },
          { phone: phone || '' }
        ]
      }
    });

    if (userExists) {
      return res.status(400).json({ message: 'User with this email or phone already exists' });
    }

    // Generate 4-digit OTP
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in Otp table
    console.log('Storing tempUserData:', { fullName, email, phone, password });
    await Otp.create({
      phone,
      otp: otpCode,
      expiresAt,
      tempUserData: { fullName, email, phone, password }
    });

    console.log(`Signup OTP for ${phone}: ${otpCode}`); // For testing

    res.json({ message: 'OTP sent successfully', otp: otpCode });
  } catch (error) {
    console.error('Error in sendSignupOtp:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP and Create Account
// @route   POST /api/auth/verify-signup
// @access  Public
const verifySignup = async (req, res) => {
  const { phone, otp } = req.body;

  try {
    // Find latest OTP for this phone
    const otpRecord = await Otp.findOne({
      where: { phone },
      order: [['createdAt', 'DESC']]
    });

    if (!otpRecord) {
      return res.status(404).json({ message: 'OTP not found or expired' });
    }

    if (otpRecord.otp === otp && otpRecord.expiresAt > Date.now()) {
      // Create User
      let userData = otpRecord.tempUserData;
      console.log('Retrieved tempUserData type:', typeof userData);
      console.log('Retrieved tempUserData:', userData);

      if (typeof userData === 'string') {
          try {
              userData = JSON.parse(userData);
          } catch (e) {
              console.error('Failed to parse userData:', e);
          }
      }
      
      if (!userData || !userData.fullName) {
          console.error('Missing fullName in userData:', userData);
          return res.status(400).json({ message: 'Session expired or invalid data. Please signup again.' });
      }

      const user = await User.create(userData);

      // Delete used OTP
      await otpRecord.destroy();

      if (user) {
        res.status(201).json({
          _id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          token: generateToken(user.id),
        });
      } else {
        res.status(400).json({ message: 'Invalid user data' });
      }
    } else {
      res.status(400).json({ message: 'Invalid or expired OTP' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// --- LOGIN FLOW ---

// @desc    Authenticate user & get token (Email + Password)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send OTP for Login
// @route   POST /api/auth/send-login-otp
// @access  Public
const sendLoginOtp = async (req, res) => {
  const { phone } = req.body;

  try {
    const user = await User.findOne({ where: { phone } });

    if (!user) {
      return res.status(404).json({ message: 'User not found with this phone number' });
    }

    // Generate 4-digit OTP
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    user.otp = otpCode;
    user.otpExpires = expiresAt;
    await user.save();

    console.log(`Login OTP for ${phone}: ${otpCode}`); // For testing

    res.json({ message: 'OTP sent successfully', otp: otpCode });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP & Login
// @route   POST /api/auth/verify-login-otp
// @access  Public
const verifyLoginOtp = async (req, res) => {
  const { phone, otp } = req.body;

  try {
    const user = await User.findOne({ where: { phone } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.otp === otp && user.otpExpires > Date.now()) {
      // Clear OTP
      user.otp = null;
      user.otpExpires = null;
      await user.save();

      res.json({
        _id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: 'Invalid or expired OTP' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- FORGOT PASSWORD FLOW ---

// @desc    Send OTP for Forgot Password
// @route   POST /api/auth/forgot-password/send-otp
// @access  Public
const sendForgotPasswordOtp = async (req, res) => {
  let { email } = req.body;
  
  // Normalize email
  email = email ? email.trim().toLowerCase() : '';

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Generate 4-digit OTP
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in Otp table
    await Otp.create({
      email,
      otp: otpCode,
      expiresAt,
    });

    console.log(`Forgot Password OTP for ${email}: ${otpCode}`); // For testing

    res.json({ message: 'OTP sent successfully', otp: otpCode });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP for Forgot Password
// @route   POST /api/auth/forgot-password/verify-otp
// @access  Public
const verifyForgotPasswordOtp = async (req, res) => {
  let { email, otp } = req.body;
  
  // Normalize inputs
  email = email ? email.trim().toLowerCase() : '';
  otp = otp ? otp.trim() : '';

  console.log('Verifying Forgot Password OTP (Normalized):', { email, otp });

  try {
    const otpRecord = await Otp.findOne({
      where: { email },
      order: [['createdAt', 'DESC']]
    });

    if (otpRecord) {
        console.log('Found OTP Record:', { 
            storedOtp: otpRecord.otp, 
            storedEmail: otpRecord.email,
            expiresAt: otpRecord.expiresAt,
            now: new Date(),
            isMatch: otpRecord.otp === otp,
            isNotExpired: otpRecord.expiresAt > Date.now()
        });
    } else {
        console.log('No OTP record found for email:', email);
    }

    if (!otpRecord) {
      return res.status(404).json({ message: 'OTP not found or expired' });
    }

    if (otpRecord.otp === otp && otpRecord.expiresAt > Date.now()) {
      res.json({ message: 'OTP verified successfully' });
    } else {
      console.log('OTP Verification Failed:', {
          received: otp,
          stored: otpRecord.otp,
          match: otpRecord.otp === otp,
          expired: otpRecord.expiresAt <= Date.now()
      });
      res.status(400).json({ message: 'Invalid or expired OTP' });
    }
  } catch (error) {
    console.error('Error in verifyForgotPasswordOtp:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const passwordError = validatePassword(newPassword);
  if (passwordError) {
    return res.status(400).json({ message: passwordError });
  }

  try {
    // Verify OTP again to be safe
    const otpRecord = await Otp.findOne({
      where: { email },
      order: [['createdAt', 'DESC']]
    });

    if (!otpRecord || otpRecord.otp !== otp || otpRecord.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Delete used OTP
    await otpRecord.destroy();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.status(200).json(req.user);
};

module.exports = {
  sendSignupOtp,
  verifySignup,
  login,
  sendLoginOtp,
  verifyLoginOtp,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPassword,
  getMe
};
