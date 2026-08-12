/* =============================================
   Contact API Route — POST /api/contact
   Validates, sanitizes, stores, and notifies.
   ============================================= */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { saveInquiry, markEmailSent } = require('../db/database');
const { sendInquiryNotification } = require('../services/email');

const router = express.Router();

/**
 * Sanitize a string — strip HTML tags and trim.
 */
function stripHtml(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/<[^>]*>/g, '').trim();
}

/**
 * POST /api/contact
 * Receives form submissions, validates, stores, and sends email notification.
 */
router.post(
    '/',
    [
        // Server-side validation rules
        body('name')
            .trim()
            .notEmpty().withMessage('Name is required.')
            .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters.')
            .matches(/^[A-Za-z\s.'\-]+$/).withMessage('Name contains invalid characters.'),

        body('phone')
            .trim()
            .notEmpty().withMessage('Phone number is required.')
            .matches(/^\+?[0-9\s\-]{10,15}$/).withMessage('Enter a valid phone number (10–15 digits).'),

        body('email')
            .trim()
            .notEmpty().withMessage('Email is required.')
            .isEmail().withMessage('Enter a valid email address.')
            .isLength({ max: 254 }).withMessage('Email is too long.')
            .normalizeEmail(),

        body('service')
            .trim()
            .notEmpty().withMessage('Please select a service.')
            .isIn([
                'ht-lt-electrical', 'mechanical', 'fire-fighting', 'civil',
                'fabrication', 'peb', 'interior', 'plumbing', 'other'
            ]).withMessage('Invalid service selection.'),

        body('message')
            .trim()
            .notEmpty().withMessage('Message is required.')
            .isLength({ min: 10, max: 2000 }).withMessage('Message must be 10–2000 characters.')
    ],
    async (req, res) => {
        try {
            // 1. Check honeypot — if filled, it's a bot
            if (req.body.website && req.body.website.trim() !== '') {
                // Silently return success to not alert the bot
                return res.json({
                    success: true,
                    message: 'Thank you! Your message has been sent.'
                });
            }

            // 2. Check validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array().map(err => ({
                        field: err.path,
                        message: err.msg
                    }))
                });
            }

            // 3. Sanitize inputs
            const sanitizedData = {
                name: stripHtml(req.body.name),
                email: stripHtml(req.body.email),
                phone: stripHtml(req.body.phone),
                service: stripHtml(req.body.service),
                message: stripHtml(req.body.message)
            };

            // 4. Get client IP for rate tracking
            const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

            // 5. Store in database (encrypted)
            const inquiryId = saveInquiry({
                ...sanitizedData,
                ipAddress
            });

            console.log(`📝 New inquiry #${inquiryId} saved from ${sanitizedData.name}`);

            // 6. Send email notification (async — don't block the response)
            sendInquiryNotification(sanitizedData)
                .then(result => {
                    if (result.sent) {
                        markEmailSent(inquiryId);
                    }
                })
                .catch(err => {
                    console.error('Email notification error:', err.message);
                });

            // 7. Return success response
            return res.json({
                success: true,
                message: `Thank you, ${sanitizedData.name}! Your inquiry has been received. We'll get back to you within 24 hours.`
            });

        } catch (error) {
            console.error('❌ Contact form error:', error);
            return res.status(500).json({
                success: false,
                message: 'Something went wrong. Please try again later or contact us directly.'
            });
        }
    }
);

module.exports = router;
