const express = require('express');
const router = express.Router();
const certController = require('../controllers/certController');

// Issue new HMAC signed certificate
router.post('/issue', certController.issueCertificate);

// AI Document / PDF extraction and verification
router.post('/extract-and-verify', certController.extractAndVerifyDocument);

// Zero-trust public verification
router.get('/verify/:certId', certController.verifyCertificate);

// Get user certificates
router.get('/user/:userId', certController.getUserCertificates);

module.exports = router;
