const Task = require('../models/Task');
const Space = require('../models/Space');

const getWorkspace = async (req, res) => {
  try {
    const now = new Date();
    
    let myTasksFilter = { assignedTo: req.user._id };
    
    // My Tasks (Assigned to me, sorted by due date)
    const myTasks = await Task.find({ ...myTasksFilter, status: { $ne: 'Done' } })
      .populate('spaceId', 'name')
      .sort({ isImportant: -1, deadline: 1 });

    // Today's tasks (due today)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayTasks = await Task.find({
      ...myTasksFilter,
      status: { $ne: 'Done' },
      deadline: { $gte: startOfToday, $lte: endOfToday }
    }).populate('spaceId', 'name');

    // Overdue tasks
    const overdueTasks = await Task.find({
      ...myTasksFilter,
      status: { $ne: 'Done' },
      deadline: { $lt: now }
    }).populate('spaceId', 'name');

    // Recent Activity (Tasks recently updated in spaces the user is part of)
    let spaceIds = [];
    if (req.user.role === 'admin') {
      const spaces = await Space.find({ createdBy: req.user._id }).select('_id');
      spaceIds = spaces.map(s => s._id);
    } else {
      const spaces = await Space.find({ members: req.user._id }).select('_id');
      spaceIds = spaces.map(s => s._id);
    }

    const recentActivity = await Task.find({ spaceId: { $in: spaceIds } })
      .populate('assignedTo', 'name')
      .populate('spaceId', 'name')
      .sort({ updatedAt: -1 })
      .limit(10);

    // Progress stats for my tasks
    const totalMyTasks = await Task.countDocuments(myTasksFilter);
    const completedMyTasks = await Task.countDocuments({ ...myTasksFilter, status: 'Done' });

    res.json({
      myTasks,
      todayTasks,
      overdueTasks,
      recentActivity,
      stats: {
        total: totalMyTasks,
        completed: completedMyTasks
      }
    });
  } catch (error) {
    console.error('getWorkspace error:', error.message);
    res.status(500).json({ message: 'Error fetching workspace data.' });
  }
};

module.exports = { getWorkspace };
