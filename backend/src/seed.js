const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  const User = require('./models/User');
  const Project = require('./models/Project');
  const Task = require('./models/Task');

  // Clear existing
  await Promise.all([User.deleteMany(), Project.deleteMany(), Task.deleteMany()]);
  console.log('🗑️  Cleared existing data');

  // Create users
  const admin = await User.create({ name: 'Alice Admin', email: 'admin@taskflow.com', password: 'admin123', role: 'admin', color: '#4f8ef7' });
  const bob   = await User.create({ name: 'Bob Builder', email: 'bob@taskflow.com',   password: 'member123', role: 'member', color: '#34d399' });
  const carol = await User.create({ name: 'Carol Chen',  email: 'carol@taskflow.com', password: 'member123', role: 'member', color: '#fbbf24' });
  const dan   = await User.create({ name: 'Dan Dev',     email: 'dan@taskflow.com',   password: 'member123', role: 'member', color: '#a78bfa' });
  console.log('👥 Created 4 users');

  // Create projects
  const p1 = await Project.create({ name: 'Website Redesign', desc: 'Complete overhaul of the company website', color: '#4f8ef7', adminId: admin._id, memberIds: [admin._id, bob._id, carol._id] });
  const p2 = await Project.create({ name: 'Mobile App v2',    desc: 'New features and performance improvements',  color: '#34d399', adminId: admin._id, memberIds: [admin._id, bob._id, dan._id] });
  const p3 = await Project.create({ name: 'API Integration',  desc: 'Connect third-party services to backend',    color: '#fbbf24', adminId: bob._id,   memberIds: [bob._id, carol._id, dan._id] });
  console.log('📁 Created 3 projects');

  const today = new Date();
  const d = (days) => { const dt = new Date(today); dt.setDate(dt.getDate() + days); return dt.toISOString().split('T')[0]; };

  // Create tasks
  await Task.insertMany([
    { projectId: p1._id, title: 'Design homepage wireframes',    desc: 'Create low/high fidelity wireframes',          priority: 'high',   status: 'done',        assigneeId: bob._id,   dueDate: d(-10), createdBy: admin._id },
    { projectId: p1._id, title: 'Implement responsive navbar',   desc: 'Build mobile-first navigation component',      priority: 'high',   status: 'in-progress', assigneeId: carol._id, dueDate: d(6),   createdBy: admin._id },
    { projectId: p1._id, title: 'SEO optimization',              desc: 'Add meta tags, sitemap, structured data',       priority: 'medium', status: 'todo',        assigneeId: bob._id,   dueDate: d(16),  createdBy: admin._id },
    { projectId: p1._id, title: 'Landing page copy',             desc: 'Write and finalize all landing page text',      priority: 'low',    status: 'todo',        assigneeId: carol._id, dueDate: d(-2),  createdBy: admin._id },
    { projectId: p2._id, title: 'Auth module refactor',          desc: 'Replace session auth with JWT',                 priority: 'high',   status: 'in-progress', assigneeId: dan._id,   dueDate: d(4),   createdBy: admin._id },
    { projectId: p2._id, title: 'Push notifications',            desc: 'Integrate FCM for iOS and Android',             priority: 'medium', status: 'todo',        assigneeId: bob._id,   dueDate: d(21),  createdBy: admin._id },
    { projectId: p2._id, title: 'Performance audit',             desc: 'Profile and fix memory leaks',                  priority: 'low',    status: 'todo',        assigneeId: dan._id,   dueDate: d(28),  createdBy: admin._id },
    { projectId: p3._id, title: 'Stripe payment setup',          desc: 'Integrate Stripe billing and webhooks',         priority: 'high',   status: 'done',        assigneeId: carol._id, dueDate: d(-5),  createdBy: bob._id },
    { projectId: p3._id, title: 'Email service integration',     desc: 'Configure SendGrid transactional emails',       priority: 'medium', status: 'in-progress', assigneeId: dan._id,   dueDate: d(8),   createdBy: bob._id },
  ]);
  console.log('✅ Created 9 tasks');

  console.log('\n🎉 Seed complete!\n');
  console.log('Demo accounts:');
  console.log('  Admin  → admin@taskflow.com  / admin123');
  console.log('  Member → bob@taskflow.com    / member123');
  console.log('  Member → carol@taskflow.com  / member123');
  console.log('  Member → dan@taskflow.com    / member123\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
