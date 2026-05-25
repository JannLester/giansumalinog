const nodemailer = require('nodemailer');
const crypto = require('crypto');

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
    
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 mins

    // Hash the OTP to verify later (without a DB)
    const secret = process.env.OTP_SECRET || 'default_secret_for_local_dev_123';
    const data = `${email}.${otp}.${expiresAt}`;
    const hash = crypto.createHmac('sha256', secret).update(data).digest('hex');

    // Setup Nodemailer
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Verification Code',
            text: `Hi ${name || 'there'},\n\nYour verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nBest,\nGian Sumalinog's Portfolio`,
            html: `<h3>Hi ${name || 'there'},</h3><p>Your verification code is: <strong style="font-size:1.5rem; color:#00BAFF">${otp}</strong></p><p>This code will expire in 10 minutes.</p>`
        });
        
        res.status(200).json({ hash, expiresAt });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to send verification email' });
    }
};
