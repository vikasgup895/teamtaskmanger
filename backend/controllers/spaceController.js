const { validationResult } = require('express-validator');
const Space = require('../models/Space');
const User = require('../models/User');
const Task = require('../models/Task');

const createSpace = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, description, memberIds } = req.body;

    let members = [req.user._id.toString()];
    if (memberIds && Array.isArray(memberIds)) {
      members = [...new Set([...members, ...memberIds])];
    }

    const space = await Space.create({
      name,
      description,
      createdBy: req.user._id,
      members
    });

    await space.populate('createdBy', 'name email');
    await space.populate('members', 'name email role');

    res.status(201).json({ message: 'Space created.', space });
  } catch (error) {
    res.status(500).json({ message: 'Error creating space.' });
  }
};

const getSpaces = async (req, res) => {
  try {
    let spaces;
    if (req.user.role === 'admin') {
      spaces = await Space.find({ createdBy: req.user._id })
        .populate('createdBy', 'name email')
        .populate('members', 'name email role')
        .sort({ createdAt: -1 });
    } else {
      spaces = await Space.find({ members: req.user._id })
        .populate('createdBy', 'name email')
        .populate('members', 'name email role')
        .sort({ createdAt: -1 });
    }
    res.json({ spaces });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching spaces.' });
  }
};

const getSpace = async (req, res) => {
  try {
    const space = await Space.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    if (!space) return res.status(404).json({ message: 'Space not found.' });

    const isMember = space.members.some(m => m._id.toString() === req.user._id.toString());
    if (!isMember && space.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.json({ space });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching space.' });
  }
};

const addMember = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const space = await Space.findById(req.params.id);
    if (!space) return res.status(404).json({ message: 'Space not found.' });

    if (space.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only space owner can add members.' });
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) return res.status(404).json({ message: 'User not found with that email.' });

    if (space.members.includes(userToAdd._id)) {
      return res.status(400).json({ message: 'User is already a member.' });
    }

    space.members.push(userToAdd._id);
    await space.save();
    await space.populate('members', 'name email role');
    await space.populate('createdBy', 'name email');

    res.json({ message: 'Member added.', space });
  } catch (error) {
    res.status(500).json({ message: 'Error adding member.' });
  }
};

const removeMember = async (req, res) => {
  try {
    const space = await Space.findById(req.params.id);
    if (!space) return res.status(404).json({ message: 'Space not found.' });

    if (space.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only space owner can remove members.' });
    }

    const { memberId } = req.params;
    if (memberId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot remove space owner.' });
    }

    space.members = space.members.filter(m => m.toString() !== memberId);
    await space.save();
    await space.populate('members', 'name email role');
    await space.populate('createdBy', 'name email');

    res.json({ message: 'Member removed.', space });
  } catch (error) {
    res.status(500).json({ message: 'Error removing member.' });
  }
};

const deleteSpace = async (req, res) => {
  try {
    const space = await Space.findById(req.params.id);
    if (!space) return res.status(404).json({ message: 'Space not found.' });

    if (space.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only space owner can delete it.' });
    }

    await Task.deleteMany({ spaceId: req.params.id });
    await Space.findByIdAndDelete(req.params.id);

    res.json({ message: 'Space deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting space.' });
  }
};

module.exports = { createSpace, getSpaces, getSpace, addMember, removeMember, deleteSpace };
