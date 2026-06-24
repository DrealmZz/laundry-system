const express = require('express');
const router = express.Router();

// Placeholder for booking routes
router.get('/', (req, res) => res.json({ message: 'Booking history' }));
router.post('/', (req, res) => res.json({ message: 'Create booking' }));

module.exports = router;
