const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'event4264@gmail.com',
    pass: 'kl01cn2811'
  }
});

app.post('/send-otp', (req, res) => {
  const { to, otp, eventName } = req.body;
  
  const mailOptions = {
    from: '"SERAS" <event4264@gmail.com>',
    to: to,
    subject: `[SERAS] Email Verification OTP: ${otp}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; border: 1px solid #ddd; border-radius: 8px; margin: 0 auto; background-color: #f7f9ff;">
        <h2 style="color: #3f51b5; text-align: center;">SERAS Verification Code</h2>
        <p>Thank you for registering. Please use the following one-time passcode (OTP) to verify your college email address for <strong>${eventName || 'SERAS'}</strong>:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; padding: 10px 20px; background-color: #f5f5f5; border-radius: 6px; border: 1px solid #ccc; display: inline-block;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 12px; color: #777; text-align: center;">This code will expire shortly. If you did not request this, you can ignore this email.</p>
      </div>
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Nodemailer SMTP error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
    console.log('Email sent successfully:', info.response);
    res.json({ success: true, message: 'Email sent successfully!' });
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Email SMTP server running on port ${PORT}`);
});
