const nodemailer = require('nodemailer');
const crypto = require('crypto');

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
    
    const { email, name, message, code, hash, expiresAt } = req.body;
    
    if (Date.now() > expiresAt) {
        return res.status(400).json({ error: 'Code has expired' });
    }

    const secret = process.env.OTP_SECRET || 'default_secret_for_local_dev_123';
    const data = `${email}.${code}.${expiresAt}`;
    const expectedHash = crypto.createHmac('sha256', secret).update(data).digest('hex');

    if (hash !== expectedHash) {
        return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Code is valid! Now forward the contact message to the owner
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
            to: process.env.EMAIL_USER, // Send to the owner
            subject: `New Portfolio Message from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
            replyTo: email
        });
        
        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to deliver message' });
    }
};
