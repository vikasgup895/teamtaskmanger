const express = require('express');
const { body } = require('express-validator');
const { createSpace, getSpaces, getSpace, addMember, removeMember, deleteSpace } = require('../controllers/spaceController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', adminOnly, [
  body('name').trim().notEmpty().withMessage('Space name is required').isLength({ max: 100 }),
  body('description').optional().isLength({ max: 500 })
], createSpace);

router.get('/', getSpaces);
router.get('/:id', getSpace);

router.post('/:id/members', adminOnly, [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail()
], addMember);

router.delete('/:id/members/:memberId', adminOnly, removeMember);
router.delete('/:id', adminOnly, deleteSpace);

module.exports = router;
