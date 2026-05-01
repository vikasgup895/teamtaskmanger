const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Space = require('../models/Space');

// Helper to fully populate a task
const populateTask = (query) =>
  query
    .populate('assignedTo', 'name email')
    .populate('spaceId', 'name')
    .populate('createdBy', 'name email');

const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { title, description, assignedTo, spaceId, deadline, priority, isImportant } = req.body;

    const space = await Space.findById(spaceId);
    if (!space) return res.status(404).json({ message: 'Space not found.' });

    // Only admin who owns the space can create tasks
    if (req.user.role !== 'admin' || space.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to create tasks in this space.' });
    }

    // Assigned user must be a space member
    const isMember = space.members.some((m) => m.toString() === assignedTo);
    if (!isMember) {
      return res.status(400).json({ message: 'Assigned user is not a space member.' });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      spaceId,
      deadline: deadline || undefined,
      priority: priority || 'Medium',
      isImportant: isImportant || false,
      createdBy: req.user._id,
    });

    const populated = await populateTask(Task.findById(task._id));

    res.status(201).json({ message: 'Task created.', task: populated });
  } catch (error) {
    console.error('createTask error:', error.message);
    res.status(500).json({ message: 'Error creating task.' });
  }
};

const getTasks = async (req, res) => {
  try {
    const { spaceId, status } = req.query;
    let filter = {};

    if (spaceId) {
      const space = await Space.findById(spaceId);
      if (!space) return res.status(404).json({ message: 'Space not found.' });

      const isMember = space.members.some((m) => m.toString() === req.user._id.toString());
      const isOwner = space.createdBy.toString() === req.user._id.toString();
      if (!isMember && !isOwner) {
        return res.status(403).json({ message: 'Access denied.' });
      }
      filter.spaceId = spaceId;
    } else {
      // No space filter: members see only their own tasks; admins see all
      if (req.user.role === 'member') {
        filter.assignedTo = req.user._id;
      }
    }

    if (status) filter.status = status;

    const tasks = await populateTask(Task.find(filter).sort({ createdAt: -1 }));

    res.json({ tasks });
  } catch (error) {
    console.error('getTasks error:', error.message);
    res.status(500).json({ message: 'Error fetching tasks.' });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await populateTask(Task.findById(req.params.id));
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    // Verify requester is a space member or owner
    const space = await Space.findById(task.spaceId);
    if (!space) return res.status(404).json({ message: 'Space not found.' });

    const isMember = space.members.some((m) => m.toString() === req.user._id.toString());
    const isOwner = space.createdBy.toString() === req.user._id.toString();
    if (!isMember && !isOwner) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.json({ task });
  } catch (error) {
    console.error('getTaskById error:', error.message);
    res.status(500).json({ message: 'Error fetching task.' });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    const space = await Space.findById(task.spaceId);
    if (!space) return res.status(404).json({ message: 'Space not found.' });

    const isOwner = space.createdBy.toString() === req.user._id.toString();
    const isAssignee = task.assignedTo.toString() === req.user._id.toString();
    const isAdminOwner = req.user.role === 'admin' && isOwner;

    if (!isAdminOwner && !isAssignee) {
      return res.status(403).json({ message: 'Not authorized to update this task.' });
    }

    // Admin owners can update all fields; assignees can only update status and isImportant
    const allowedUpdates = ['status', 'isImportant'];
    if (isAdminOwner) {
      allowedUpdates.push('title', 'description', 'assignedTo', 'deadline', 'priority');
    }

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    await task.save();
    const populated = await populateTask(Task.findById(task._id));

    res.json({ message: 'Task updated.', task: populated });
  } catch (error) {
    console.error('updateTask error:', error.message);
    res.status(500).json({ message: 'Error updating task.' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    const space = await Space.findById(task.spaceId);
    if (!space) return res.status(404).json({ message: 'Space not found.' });

    const isOwner = space.createdBy.toString() === req.user._id.toString();

    if (!isOwner || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this task.' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted.' });
  } catch (error) {
    console.error('deleteTask error:', error.message);
    res.status(500).json({ message: 'Error deleting task.' });
  }
};

module.exports = { createTask, getTasks, getTaskById, updateTask, deleteTask };
