const nodemailer = require('nodemailer');
const logger = require('../config/logger');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send verification email
 */
const sendVerificationEmail = async (email, name, token) => {
  try {
    const transporter = createTransporter();
    const verificationUrl = `${process.env.APP_URL}/api/v1/auth/verify-email?token=${token}`;

    const mailOptions = {
      from: `"GlobeTrotter" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify Your GlobeTrotter Account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Account</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to GlobeTrotter!</h1>
          </div>
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${name},</h2>
            <p style="font-size: 16px; margin-bottom: 20px;">
              Thank you for joining GlobeTrotter! To start planning your amazing trips, please verify your email address.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; font-size: 16px;">
                Verify Email Address
              </a>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
              If you didn't create a GlobeTrotter account, please ignore this email.
            </p>
            <p style="font-size: 14px; color: #666;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${verificationUrl}" style="color: #667eea;">${verificationUrl}</a>
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to GlobeTrotter!
        
        Hi ${name},
        
        Thank you for joining GlobeTrotter! To start planning your amazing trips, please verify your email address by clicking the link below:
        
        ${verificationUrl}
        
        If you didn't create a GlobeTrotter account, please ignore this email.
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Verification email sent to ${email}`);
  } catch (error) {
    logger.error('Error sending verification email:', error);
    throw error;
  }
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, name, token) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: `"GlobeTrotter" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Reset Your GlobeTrotter Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
          </div>
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${name},</h2>
            <p style="font-size: 16px; margin-bottom: 20px;">
              We received a request to reset your GlobeTrotter account password. Click the button below to reset it.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; font-size: 16px;">
                Reset Password
              </a>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
              This link will expire in 10 minutes for security reasons.
            </p>
            <p style="font-size: 14px; color: #666;">
              If you didn't request a password reset, please ignore this email. Your password will not be changed.
            </p>
            <p style="font-size: 14px; color: #666;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #667eea;">${resetUrl}</a>
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Password Reset Request
        
        Hi ${name},
        
        We received a request to reset your GlobeTrotter account password. Click the link below to reset it:
        
        ${resetUrl}
        
        This link will expire in 10 minutes for security reasons.
        
        If you didn't request a password reset, please ignore this email. Your password will not be changed.
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to ${email}`);
  } catch (error) {
    logger.error('Error sending password reset email:', error);
    throw error;
  }
};

/**
 * Send welcome email after verification
 */
const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"GlobeTrotter" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Welcome to GlobeTrotter - Start Your Journey!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to GlobeTrotter</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🌍 Welcome to GlobeTrotter!</h1>
          </div>
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${name},</h2>
            <p style="font-size: 16px; margin-bottom: 20px;">
              Congratulations! Your email has been verified and you're now ready to start planning incredible trips with GlobeTrotter.
            </p>
            <h3 style="color: #667eea;">What you can do now:</h3>
            <ul style="font-size: 16px; margin-bottom: 20px;">
              <li>Create your first trip itinerary</li>
              <li>Add stops and activities to your journey</li>
              <li>Set budgets and track expenses</li>
              <li>Share your trips with friends and family</li>
              <li>Explore public trips from other travelers</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.APP_URL}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; font-size: 16px;">
                Start Planning Your Trip
              </a>
            </div>
            <p style="font-size: 14px; color: #666;">
              Happy travels!<br>
              The GlobeTrotter Team
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to GlobeTrotter!
        
        Hi ${name},
        
        Congratulations! Your email has been verified and you're now ready to start planning incredible trips with GlobeTrotter.
        
        What you can do now:
        - Create your first trip itinerary
        - Add stops and activities to your journey  
        - Set budgets and track expenses
        - Share your trips with friends and family
        - Explore public trips from other travelers
        
        Start planning: ${process.env.APP_URL}
        
        Happy travels!
        The GlobeTrotter Team
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Welcome email sent to ${email}`);
  } catch (error) {
    logger.error('Error sending welcome email:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
};