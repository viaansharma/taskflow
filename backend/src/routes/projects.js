const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/projects — user's projects
router.get('/', auth, async (req, res) => {
  try {
    const query = req.user.role === 'admin'
      ? { $or: [{ adminId: req.user._id }, { memberIds: req.user._id }] }
      : { memberIds: req.user._id };
    const projects = await Project.find(query)
      .populate('adminId', 'name email color role')
      .populate('memberIds', 'name email color role');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects
router.post('/', auth, [
  body('name').notEmpty().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, desc, color, memberIds } = req.body;
    const allMembers = [...new Set([req.user._id.toString(), ...(memberIds || [])])];
    const project = await Project.create({
      name, desc, color: color || '#4f8ef7',
      adminId: req.user._id,
      memberIds: allMembers
    });
    await project.populate(['adminId', 'memberIds']);
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/projects/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('adminId', 'name email color role')
      .populate('memberIds', 'name email color role');
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const isMember = project.memberIds.some(m => m._id.equals(req.user._id));
    const isAdmin = project.adminId._id.equals(req.user._id) || req.user.role === 'admin';
    if (!isMember && !isAdmin) return res.status(403).json({ error: 'Access denied' });

    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/projects/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const isAdmin = project.adminId.equals(req.user._id) || req.user.role === 'admin';
    if (!isAdmin) return res.status(403).json({ error: 'Admin access required' });

    const { name, desc, color, memberIds } = req.body;
    if (name) project.name = name;
    if (desc !== undefined) project.desc = desc;
    if (color) project.color = color;
    if (memberIds) project.memberIds = memberIds;

    await project.save();
    await project.populate(['adminId', 'memberIds']);
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const isAdmin = project.adminId.equals(req.user._id) || req.user.role === 'admin';
    if (!isAdmin) return res.status(403).json({ error: 'Admin access required' });

    await Task.deleteMany({ projectId: project._id });
    await project.deleteOne();
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
