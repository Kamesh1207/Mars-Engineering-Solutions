/* =============================================
   JSON File Database — Secure Inquiry Storage
   Pure JS implementation (no native C++ build needed)
   Encrypts PII fields (name, email, phone, message) at rest
   ============================================= */

const fs = require('fs');
const path = require('path');
const { encrypt, decrypt } = require('../utils/encryption');

const DB_PATH = path.join(__dirname, 'inquiries.json');

/**
 * Initialize the database file if it does not exist.
 */
function initDatabase() {
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2), 'utf8');
    }
    console.log('✅ Database initialized at:', DB_PATH);
}

/**
 * Read raw records from JSON file safely.
 */
function readData() {
    try {
        if (!fs.existsSync(DB_PATH)) {
            return [];
        }
        const content = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(content || '[]');
    } catch (err) {
        console.error('Error reading database file:', err.message);
        return [];
    }
}

/**
 * Write records to JSON file atomically using a temp file.
 */
function writeData(data) {
    const tempPath = `${DB_PATH}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempPath, DB_PATH);
}

/**
 * Save a new inquiry with encrypted PII fields.
 */
function saveInquiry({ name, email, phone, service, message, ipAddress }) {
    const inquiries = readData();
    const nextId = inquiries.length > 0 ? Math.max(...inquiries.map(i => i.id || 0)) + 1 : 1;

    const record = {
        id: nextId,
        name: encrypt(name),
        email: encrypt(email),
        phone: encrypt(phone),
        service: service, // non-PII
        message: encrypt(message),
        ip_address: ipAddress || 'unknown',
        created_at: new Date().toISOString(),
        email_sent: 0
    };

    inquiries.push(record);
    writeData(inquiries);

    return nextId;
}

/**
 * Mark an inquiry as having had its email notification sent.
 */
function markEmailSent(id) {
    const inquiries = readData();
    const target = inquiries.find(i => i.id === id);
    if (target) {
        target.email_sent = 1;
        writeData(inquiries);
    }
}

/**
 * Get all inquiries (decrypted). For admin use only.
 */
function getAllInquiries() {
    const inquiries = readData();

    return inquiries.map(row => ({
        id: row.id,
        name: decrypt(row.name),
        email: decrypt(row.email),
        phone: decrypt(row.phone),
        service: row.service,
        message: decrypt(row.message),
        ipAddress: row.ip_address,
        createdAt: row.created_at,
        emailSent: row.email_sent === 1
    }));
}

/**
 * Get total inquiry count.
 */
function getInquiryCount() {
    const inquiries = readData();
    return inquiries.length;
}

module.exports = {
    initDatabase,
    saveInquiry,
    markEmailSent,
    getAllInquiries,
    getInquiryCount
};
