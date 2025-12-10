const express = require('express');
const router = express.Router();
const secureController = require('../controllers/secureController');

router.get('/get-token', secureController.getToken);
// Wildcard route to capture all HLS files
router.get(/^\/stream\/([^\/]+)\/(.*)$/, secureController.secureStream);

module.exports = router;
