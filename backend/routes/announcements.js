const express = require('express');
const {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementStatus
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .post(protect, authorize('admin', 'superadmin'), createAnnouncement)
  .get(protect, getAllAnnouncements);

router
  .route('/:id')
  .get(protect, getAnnouncement)
  .put(protect, authorize('admin', 'superadmin'), updateAnnouncement);

// Only super admin can delete announcements
router.route('/:id')
  .delete(protect, authorize('superadmin'), deleteAnnouncement);

router
  .route('/:id/toggle')
  .patch(protect, authorize('admin', 'superadmin'), toggleAnnouncementStatus);

module.exports = router;
