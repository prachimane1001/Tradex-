const db = require('../db/database');
const { hashPassword, verifyPassword, generateToken } = require('../utils/security');
const { authenticate } = require('../middleware/auth');

function handleRegister(req, res) {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.statusCode = 400;
    return res.json({ success: false, message: 'Please provide name, email, and password.' });
  }

  const existingUser = db.findOne('users', { email: email.toLowerCase().trim() });
  if (existingUser) {
    res.statusCode = 400;
    return res.json({ success: false, message: 'User with this email already exists.' });
  }

  const startingBalance = parseFloat(process.env.STARTING_BALANCE || 100000);
  const userRole = role === 'admin' ? 'admin' : 'user';

  const newUser = db.insertOne('users', {
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashPassword(password),
    role: userRole,
    virtualBalance: startingBalance
  });

  const token = generateToken({ id: newUser._id, email: newUser.email, role: newUser.role });

  res.statusCode = 201;
  res.json({
    success: true,
    message: 'Registration successful! Welcome to TradeX.',
    token,
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      virtualBalance: newUser.virtualBalance
    }
  });
}

function handleLogin(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    res.statusCode = 400;
    return res.json({ success: false, message: 'Please enter both email and password.' });
  }

  const user = db.findOne('users', { email: email.toLowerCase().trim() });
  if (!user) {
    res.statusCode = 401;
    return res.json({ success: false, message: 'Invalid credentials. User not found.' });
  }

  const isMatch = verifyPassword(password, user.password);
  if (!isMatch) {
    res.statusCode = 401;
    return res.json({ success: false, message: 'Invalid credentials. Password incorrect.' });
  }

  const token = generateToken({ id: user._id, email: user.email, role: user.role });

  res.statusCode = 200;
  res.json({
    success: true,
    message: `Welcome back, ${user.name}!`,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      virtualBalance: user.virtualBalance
    }
  });
}

function handleMe(req, res) {
  authenticate(req, res, () => {
    const user = db.findOne('users', { _id: req.user.id });
    if (!user) {
      res.statusCode = 404;
      return res.json({ success: false, message: 'User not found.' });
    }

    res.statusCode = 200;
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        virtualBalance: user.virtualBalance
      }
    });
  });
}

module.exports = {
  handleRegister,
  handleLogin,
  handleMe
};
