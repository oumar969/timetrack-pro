const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const authController = require('../controllers/authController');
const employeeController = require('../controllers/employeeController');
const clockController = require('../controllers/clockController');
const sessionController = require('../controllers/sessionController');

// Auth
router.post('/auth/login', authController.login);
router.post('/auth/change-password', auth, authController.changePassword);

// Clock in/out (public - employees use this)
router.post('/clock/in', clockController.clockIn);
router.post('/clock/out', clockController.clockOut);
router.get('/clock/status/:name', clockController.getStatus);

// Employees (admin only)
router.get('/employees', auth, employeeController.getAll);
router.post('/employees', auth, employeeController.create);
router.put('/employees/:id', auth, employeeController.update);
router.delete('/employees/:id', auth, employeeController.remove);

// Sessions & analytics (admin only)
router.get('/sessions', auth, sessionController.getAll);
router.get('/sessions/today', auth, sessionController.getToday);
router.get('/analytics/week', auth, sessionController.getWeekAnalytics);

module.exports = router;
