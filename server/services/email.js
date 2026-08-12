/* =============================================
   Email Notification Service (Nodemailer + Gmail)
   Sends inquiry alerts to the Mars Engineering team
   ============================================= */

const nodemailer = require('nodemailer');

let transporter = null;

/**
 * Initialize the email transporter.
 * Uses Gmail SMTP with an App Password.
 */
function initEmailService() {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;

    if (!user || !pass) {
        console.warn('⚠️  Gmail credentials not set in .env — emails will be logged to console instead.');
        console.warn('   Set GMAIL_USER and GMAIL_APP_PASSWORD to enable email notifications.');
        return false;
    }

    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: user,
            pass: pass
        }
    });

    // Verify the connection
    transporter.verify()
        .then(() => console.log('✅ Email service connected (Gmail SMTP)'))
        .catch(err => {
            console.error('❌ Email service connection failed:', err.message);
            console.warn('   Check your GMAIL_USER and GMAIL_APP_PASSWORD in .env');
            transporter = null;
        });

    return true;
}

/**
 * Map service value to human-readable name.
 */
function getServiceName(serviceKey) {
    const serviceMap = {
        'ht-lt-electrical': 'HT & LT Electrical Works',
        'mechanical': 'Mechanical Works',
        'fire-fighting': 'Fire Fighting System',
        'civil': 'Civil Works',
        'fabrication': 'Fabrication Works',
        'peb': 'PEB Works',
        'interior': 'Interior Works',
        'plumbing': 'Plumbing Works',
        'other': 'Other'
    };
    return serviceMap[serviceKey] || serviceKey;
}

/**
 * Send an email notification to the client about a new inquiry.
 */
async function sendInquiryNotification({ name, email, phone, service, message }) {
    const clientEmail = process.env.CLIENT_EMAIL || 'marsesolutions09@gmail.com';
    const serviceName = getServiceName(service);
    const timestamp = new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'full',
        timeStyle: 'short'
    });

    // Build the email content
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: 'Segoe UI', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #12121f; border-radius: 16px; border: 1px solid rgba(232, 65, 24, 0.2); overflow: hidden;">
                        
                        <!-- Header with gradient bar -->
                        <tr>
                            <td style="height: 4px; background: linear-gradient(90deg, #e84118, #ff6348, #f0932b);"></td>
                        </tr>
                        
                        <!-- Logo Area -->
                        <tr>
                            <td style="padding: 32px 40px 16px; text-align: center;">
                                <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 3px;">
                                    <span style="background: linear-gradient(135deg, #e84118, #ff6348, #f0932b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">MARS</span>
                                </h1>
                                <p style="margin: 4px 0 0; font-size: 10px; color: #a0a0b8; letter-spacing: 3px; text-transform: uppercase;">Engineering Solutions</p>
                            </td>
                        </tr>

                        <!-- Alert Badge -->
                        <tr>
                            <td style="padding: 8px 40px 24px; text-align: center;">
                                <span style="display: inline-block; padding: 8px 20px; background: rgba(232, 65, 24, 0.1); border: 1px solid rgba(232, 65, 24, 0.3); border-radius: 50px; color: #ff6348; font-size: 13px; font-weight: 600;">
                                    🔔 New Customer Inquiry
                                </span>
                            </td>
                        </tr>

                        <!-- Inquiry Details -->
                        <tr>
                            <td style="padding: 0 40px 32px;">
                                <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(232, 65, 24, 0.04); border: 1px solid rgba(232, 65, 24, 0.12); border-radius: 12px; overflow: hidden;">
                                    
                                    <!-- Name -->
                                    <tr>
                                        <td style="padding: 20px 24px 8px;">
                                            <p style="margin: 0; font-size: 11px; color: #6a6a82; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Customer Name</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 0 24px 16px;">
                                            <p style="margin: 0; font-size: 18px; color: #f0f0f5; font-weight: 700;">${escapeHtml(name)}</p>
                                        </td>
                                    </tr>

                                    <!-- Divider -->
                                    <tr><td style="padding: 0 24px;"><div style="height: 1px; background: rgba(232, 65, 24, 0.1);"></div></td></tr>

                                    <!-- Phone -->
                                    <tr>
                                        <td style="padding: 16px 24px 8px;">
                                            <p style="margin: 0; font-size: 11px; color: #6a6a82; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">📞 Phone Number</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 0 24px 16px;">
                                            <a href="tel:${escapeHtml(phone)}" style="margin: 0; font-size: 17px; color: #ff6348; font-weight: 600; text-decoration: none;">${escapeHtml(phone)}</a>
                                        </td>
                                    </tr>

                                    <!-- Divider -->
                                    <tr><td style="padding: 0 24px;"><div style="height: 1px; background: rgba(232, 65, 24, 0.1);"></div></td></tr>

                                    <!-- Email -->
                                    <tr>
                                        <td style="padding: 16px 24px 8px;">
                                            <p style="margin: 0; font-size: 11px; color: #6a6a82; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">✉️ Email Address</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 0 24px 16px;">
                                            <a href="mailto:${escapeHtml(email)}" style="margin: 0; font-size: 16px; color: #ff6348; text-decoration: none;">${escapeHtml(email)}</a>
                                        </td>
                                    </tr>

                                    <!-- Divider -->
                                    <tr><td style="padding: 0 24px;"><div style="height: 1px; background: rgba(232, 65, 24, 0.1);"></div></td></tr>

                                    <!-- Service -->
                                    <tr>
                                        <td style="padding: 16px 24px 8px;">
                                            <p style="margin: 0; font-size: 11px; color: #6a6a82; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">🔧 Service Requested</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 0 24px 16px;">
                                            <span style="display: inline-block; padding: 6px 16px; background: rgba(232, 65, 24, 0.15); border-radius: 50px; color: #ff6348; font-size: 14px; font-weight: 600;">${escapeHtml(serviceName)}</span>
                                        </td>
                                    </tr>

                                    <!-- Divider -->
                                    <tr><td style="padding: 0 24px;"><div style="height: 1px; background: rgba(232, 65, 24, 0.1);"></div></td></tr>

                                    <!-- Message -->
                                    <tr>
                                        <td style="padding: 16px 24px 8px;">
                                            <p style="margin: 0; font-size: 11px; color: #6a6a82; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">💬 Message</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 0 24px 24px;">
                                            <p style="margin: 0; font-size: 15px; color: #a0a0b8; line-height: 1.7; white-space: pre-wrap;">${escapeHtml(message)}</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Call to Action -->
                        <tr>
                            <td style="padding: 0 40px 32px; text-align: center;">
                                <a href="tel:${escapeHtml(phone)}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #e84118, #ff6348); color: white; text-decoration: none; border-radius: 50px; font-size: 15px; font-weight: 700; letter-spacing: 0.5px;">
                                    📞 Call ${escapeHtml(name)} Now
                                </a>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="padding: 24px 40px; background: rgba(0,0,0,0.2); border-top: 1px solid rgba(232, 65, 24, 0.1); text-align: center;">
                                <p style="margin: 0; font-size: 12px; color: #6a6a82;">
                                    Received on ${timestamp}
                                </p>
                                <p style="margin: 8px 0 0; font-size: 11px; color: #4a4a62;">
                                    This is an automated notification from your website contact form.
                                </p>
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    // Plain text fallback
    const textContent = `
🔔 NEW CUSTOMER INQUIRY — Mars Engineering Solutions
====================================================

Customer Name:   ${name}
Phone Number:    ${phone}
Email Address:   ${email}
Service:         ${serviceName}

Message:
${message}

----------------------------------------------------
Received: ${timestamp}
Reply to this email or call the customer directly.
    `.trim();

    const mailOptions = {
        from: `"Mars Engineering 🔔" <${process.env.GMAIL_USER}>`,
        to: clientEmail,
        subject: `🔔 New Inquiry: ${name} — ${serviceName}`,
        text: textContent,
        html: htmlContent
    };

    // If transporter is not configured, log to console
    if (!transporter) {
        console.log('\n📧 EMAIL NOTIFICATION (console fallback — set Gmail credentials to send real emails):');
        console.log('─'.repeat(60));
        console.log(textContent);
        console.log('─'.repeat(60));
        return { sent: false, reason: 'Email credentials not configured' };
    }

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email notification sent to ${clientEmail} (Message ID: ${info.messageId})`);
        return { sent: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Failed to send email notification:', error.message);
        return { sent: false, reason: error.message };
    }
}

/**
 * Escape HTML special characters to prevent injection in email templates.
 */
function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

module.exports = { initEmailService, sendInquiryNotification };
