const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

async function sendEmailNotification(email, subject, message) {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject,
            text: message
        });
        console.log(`Email sent to ${email}`);
    } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
    }
}

module.exports = { sendEmailNotification };
