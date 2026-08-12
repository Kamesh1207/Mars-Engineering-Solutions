/* =============================================
   MARS ENGINEERING SOLUTIONS — Backend Server
   Express + SQLite + Nodemailer (Gmail)
   ============================================= */

// Load environment variables first
require('dotenv').config();

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const { initDatabase } = require('./db/database');
const { initEmailService } = require('./services/email');
const contactRoute = require('./routes/contact');

const app = express();
const PORT = process.env.PORT || 3000;

// ========== Security Middleware ==========

// Helmet — secure HTTP headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:"],
            connectSrc: ["'self'"]
        }
    }
}));

// CORS — restrict to same origin in production
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.ALLOWED_ORIGIN || false
        : true, // allow all in development
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// Body parser
app.use(express.json({ limit: '10kb' }));       // limit payload size
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// ========== Rate Limiting ==========

// General rate limit — 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Please try again later.' }
});
app.use(generalLimiter);

// Strict rate limit for contact form — 5 submissions per 15 minutes per IP
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many submissions. Please wait 15 minutes before trying again.'
    }
});

// ========== API Routes ==========
app.use('/api/contact', contactLimiter, contactRoute);

// ========== Serve Static Files ==========
// Serve the frontend from the parent directory
const frontendPath = path.join(__dirname, '..');
app.use(express.static(frontendPath));

// Fallback to index.html for SPA-like behavior
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// ========== Initialize Services & Start ==========

async function startServer() {
    try {
        // 1. Initialize database
        initDatabase();

        // 2. Initialize email service
        initEmailService();

        // 3. Start the server
        app.listen(PORT, () => {
            console.log('\n' + '='.repeat(55));
            console.log('  🚀 MARS ENGINEERING SOLUTIONS — Server Running');
            console.log('='.repeat(55));
            console.log(`  🌐 Website:  http://localhost:${PORT}`);
            console.log(`  📡 API:      http://localhost:${PORT}/api/contact`);
            console.log(`  📁 Database: server/db/inquiries.json`);
            console.log('='.repeat(55));

            if (!process.env.ENCRYPTION_KEY) {
                console.warn('\n⚠️  WARNING: ENCRYPTION_KEY not set!');
                console.warn('   Run this to generate one:');
                console.warn('   node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
                console.warn('   Then add it to server/.env\n');
            }

            if (!process.env.GMAIL_APP_PASSWORD) {
                console.warn('⚠️  WARNING: GMAIL_APP_PASSWORD not set!');
                console.warn('   Email notifications will be logged to console.');
                console.warn('   See .env.example for setup instructions.\n');
            }
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
