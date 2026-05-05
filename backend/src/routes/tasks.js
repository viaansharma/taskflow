const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/tasks?projectId=&assigneeId=
router.get('/', auth, async (req, res) => {
  try {
    const query = {};
    if (req.query.projectId) query.projectId = req.query.projectId;
    if (req.query.assigneeId) query.assigneeId = req.query.assigneeId;

    const tasks = await Task.find(query)
      .populate('assigneeId', 'name email color')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tasks
router.post('/', auth, [
  body('title').notEmpty().trim(),
  body('projectId').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { projectId, title, desc, priority, status, assigneeId, dueDate } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const isAdmin = project.adminId.equals(req.user._id) || req.user.role === 'admin';
    if (!isAdmin) return res.status(403).json({ error: 'Only admins can create tasks' });

    const task = await Task.create({
      projectId, title, desc, priority, status,
      assigneeId: assigneeId || null,
      dueDate,
      createdBy: req.user._id
    });
    await task.populate(['assigneeId', 'createdBy']);
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tasks/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assigneeId', 'name email color')
      .populate('createdBy', 'name');
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/tasks/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const project = await Project.findById(task.projectId);
    const isAdmin = project?.adminId.equals(req.user._id) || req.user.role === 'admin';
    const isAssignee = task.assigneeId?.equals(req.user._id);

    if (!isAdmin && !isAssignee) return res.status(403).json({ error: 'Access denied' });

    // Members can only update status
    if (!isAdmin) {
      if (Object.keys(req.body).some(k => !['status'].includes(k))) {
        return res.status(403).json({ error: 'Members can only update task status' });
      }
    }

    const { title, desc, priority, status, assigneeId, dueDate } = req.body;
    if (title !== undefined) task.title = title;
    if (desc !== undefined) task.desc = desc;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;
    if (assigneeId !== undefined) task.assigneeId = assigneeId;
    if (dueDate !== undefined) task.dueDate = dueDate;

    await task.save();
    await task.populate(['assigneeId', 'createdBy']);
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const project = await Project.findById(task.projectId);
    const isAdmin = project?.adminId.equals(req.user._id) || req.user.role === 'admin';
    if (!isAdmin) return res.status(403).json({ error: 'Only admins can delete tasks' });

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tasks/dashboard/stats
router.get('/dashboard/stats', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const projectQuery = req.user.role === 'admin'
      ? {}
      : { memberIds: req.user._id };
    const projects = await Project.find(projectQuery).select('_id');
    const projectIds = projects.map(p => p._id);

    const [total, todo, inProgress, done, overdue] = await Promise.all([
      Task.countDocuments({ projectId: { $in: projectIds } }),
      Task.countDocuments({ projectId: { $in: projectIds }, status: 'todo' }),
      Task.countDocuments({ projectId: { $in: projectIds }, status: 'in-progress' }),
      Task.countDocuments({ projectId: { $in: projectIds }, status: 'done' }),
      Task.countDocuments({ projectId: { $in: projectIds }, status: { $ne: 'done' }, dueDate: { $lt: today } }),
    ]);

    res.json({ total, todo, inProgress, done, overdue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
