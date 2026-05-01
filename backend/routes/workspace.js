const express = require('express');
const { getWorkspace } = require('../controllers/workspaceController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getWorkspace);

module.exports = router;
