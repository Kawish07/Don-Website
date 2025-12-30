const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const mongoose = require('mongoose');

exports.signup = async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Missing required fields' });
    // Basic email format check
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: 'Invalid email' });
    if (typeof password !== 'string' || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'User already exists' });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const created = await Admin.create({ email: email.toLowerCase(), passwordHash: hash, name: name || '' });
    const token = jwt.sign({ id: created._id, email: created.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, admin: { id: created._id, email: created.email, name: created.name } });
  } catch (e) {
    console.error('Admin signup error', e);
    res.status(500).json({ error: 'Failed to create admin' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Missing required fields' });
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: admin._id, email: admin.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, admin: { id: admin._id, email: admin.email, name: admin.name } });
  } catch (e) {
    console.error('Admin login error', e && e.message);
    res.status(500).json({ error: 'Failed to login' });
  }
};

exports.me = async (req, res) => {
  try {
    if (!req.admin || !req.admin.id) return res.status(401).json({ error: 'Unauthorized' });
    const admin = await Admin.findById(req.admin.id).select('-passwordHash');
    if (!admin) return res.status(404).json({ error: 'Not found' });
    res.json({ admin });
  } catch (e) {
    console.error('Admin me error', e && e.message);
    res.status(500).json({ error: 'Failed to fetch admin' });
  }
};

// List all admins (no password hashes)
exports.listAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json(admins);
  } catch (e) {
    console.error('List admins error', e);
    res.status(500).json({ error: 'Failed to list admins' });
  }
};

// Update an admin (name, email, password)
exports.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid admin id' });
    const { email, name, password } = req.body || {};
    const update = {};
    if (email) {
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: 'Invalid email' });
      const existing = await Admin.findOne({ email: email.toLowerCase(), _id: { $ne: id } });
      if (existing) return res.status(409).json({ error: 'Email already in use' });
      update.email = email.toLowerCase();
    }
    if (name !== undefined) update.name = name;
    if (password) {
      if (typeof password !== 'string' || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
      const salt = await bcrypt.genSalt(10);
      update.passwordHash = await bcrypt.hash(password, salt);
    }
    const updated = await Admin.findByIdAndUpdate(id, update, { new: true }).select('-passwordHash');
    if (!updated) return res.status(404).json({ error: 'Admin not found' });
    res.json({ admin: updated });
  } catch (e) {
    console.error('Update admin error', e && e.message);
    res.status(500).json({ error: 'Failed to update admin' });
  }
};

// Delete an admin
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Delete admin requested:', { requestedId: id, by: req.admin && req.admin.id });
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid admin id' });
    // Prevent self-delete
    if (req.admin && String(req.admin.id) === String(id)) return res.status(403).json({ error: 'Cannot delete own account' });
    // Prevent deleting the last remaining admin
    const total = await Admin.countDocuments();
    if (total <= 1) return res.status(400).json({ error: 'Cannot delete the last admin account' });
    const deleted = await Admin.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Admin not found' });
    res.json({ ok: true });
  } catch (e) {
    console.error('Delete admin error', e && e.message);
    res.status(500).json({ error: 'Failed to delete admin' });
  }
};
