const nodemailer = require('nodemailer');
const crypto = require('crypto');
const Token = require('../models/Token');
const { nanoid } = require('nanoid');

// Create a transporter object
const createTransporter = () => {
  try {
    // Log all email configuration for debugging
    console.log('Email Configuration:');
    console.log('- SERVICE:', process.env.EMAIL_SERVICE);
    console.log('- HOST:', process.env.EMAIL_HOST);
    console.log('- PORT:', process.env.EMAIL_PORT);
    console.log('- SECURE:', process.env.EMAIL_SECURE);
    console.log('- USER:', process.env.EMAIL_USER);
    console.log('- FROM:', process.env.EMAIL_FROM);
    console.log('- FRONTEND_URL:', process.env.FRONTEND_URL);

    // Create transporter with the configuration that worked in the test
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      debug: true,
      logger: true
    });

    // Verify the connection configuration
    transporter.verify(function(error, success) {
      if (error) {
        console.error('SMTP connection verification failed:', error);
      } else {
        console.log('SMTP connection verified successfully');
      }
    });

    return transporter;
  } catch (error) {
    console.error('Error creating email transporter:', error);
    // Return a dummy transporter that logs instead of sending
    return {
      sendMail: (options) => {
        console.log('Email would have been sent with options:', options);
        return Promise.resolve({ messageId: 'dummy-id' });
      }
    };
  }
};

/**
 * Generate a random token
 * @returns {string} Random token
 */
const generateToken = () => {
  try {
    console.log('Generating random token using nanoid...');
    // Generate a secure random token of 32 characters
    return nanoid(32);
  } catch (error) {
    console.error('Error generating token with nanoid:', error);
    // Fallback to crypto.randomBytes if nanoid fails
    console.log('Falling back to crypto.randomBytes');
    return crypto.randomBytes(16).toString('hex');
  }
};

/**
 * Send a password reset email
 * @param {Object} user - User object
 * @param {string} token - Reset token
 * @param {string} resetUrl - URL for password reset
 * @returns {Promise<boolean>} Success status
 */
const sendPasswordResetEmail = async (user, token, resetUrl) => {
  try {
    console.log('Attempting to send password reset email to:', user.email);
    console.log('Using reset URL:', resetUrl);

    const transporter = createTransporter();
    console.log('Email configuration:', {
      service: process.env.EMAIL_SERVICE,
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE,
      user: process.env.EMAIL_USER ? '***' : 'not set',
      from: process.env.EMAIL_FROM
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"MES Chaitanya SMS" <noreply@meschaitanya.edu.in>',
      to: user.email,
      subject: 'Password Reset - MES Chaitanya SMS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4a5568;">Password Reset</h2>
          <p>Hello ${user.firstName},</p>
          <p>An account has been created for you in the MES Chaitanya SMS system.</p>
          <p>Please click the button below to set your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Set Password</a>
          </div>
          <p>If the button doesn't work, copy and paste this URL into your browser:</p>
          <p>${resetUrl}</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
          <p>Regards,<br>MES Chaitanya SMS Team</p>
        </div>
      `,
      // Also include plain text version for email clients that don't support HTML
      text: `
        Hello ${user.firstName},

        An account has been created for you in the MES Chaitanya SMS system.

        Please visit the following link to set your password:
        ${resetUrl}

        This link will expire in 1 hour.

        Regards,
        MES Chaitanya SMS Team
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully!');
    console.log('Message ID:', info.messageId);

    // If using Ethereal, provide a link to view the email
    if (process.env.EMAIL_HOST === 'smtp.ethereal.email') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    if (error.code === 'EAUTH') {
      console.error('Authentication error. Check your email credentials.');
    }
    return false;
  }
};

/**
 * Create a password reset token and send email
 * @param {Object} user - User object
 * @returns {Promise<boolean>} Success status
 */
const sendPasswordSetupEmail = async (user) => {
  try {
    console.log('Starting password setup email process for user:', user.email);

    // Generate token
    const resetToken = generateToken();
    console.log('Generated reset token');

    // Save token to database
    const tokenDoc = await Token.create({
      userId: user._id,
      token: resetToken,
      type: 'password-reset'
    });
    console.log('Saved token to database with ID:', tokenDoc._id);

    // Create reset URL
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${baseUrl}/reset-password/${resetToken}`;
    console.log('Created reset URL with base URL:', baseUrl);

    // Send email
    console.log('Sending password reset email...');
    const emailResult = await sendPasswordResetEmail(user, resetToken, resetUrl);

    if (emailResult) {
      console.log('Password setup email process completed successfully');
    } else {
      console.log('Password setup email sending failed');
    }

    return emailResult;
  } catch (error) {
    console.error('Error in sendPasswordSetupEmail:', error);
    if (error.name === 'ValidationError') {
      console.error('Validation error details:', error.errors);
    }
    return false;
  }
};

module.exports = {
  sendPasswordSetupEmail,
  generateToken
};
