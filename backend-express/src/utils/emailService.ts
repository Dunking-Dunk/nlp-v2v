import nodemailer from 'nodemailer';
import { config } from '../config';

// Configure nodemailer with environment variables
const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
        user: config.email.user,
        pass: config.email.pass,
    },
});

/**
 * Send verification email to user
 */
export const sendVerificationEmail = async (email: string, token: string): Promise<void> => {
    try {
        const verificationUrl = `${config.frontendUrl}/auth/verify?token=${token}`;

        const mailOptions = {
            from: config.email.from,
            to: email,
            subject: 'Verify Your Email',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Verification</h2>
          <p>Thank you for registering! Please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
            Verify Email
          </a>
          <p>If the button doesn't work, you can copy and paste the following link into your browser:</p>
          <p>${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
        </div>
      `
        };

        // In development mode, log the verification URL instead of sending email
        if (config.nodeEnv === 'development' && !config.email.user) {
            console.log('Verification URL (development mode):', verificationUrl);
            return;
        }

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Failed to send verification email:', error);
        throw new Error('Failed to send verification email');
    }
};

/**
 * Send password reset email to user
 */
export const sendPasswordResetEmail = async (email: string, token: string): Promise<void> => {
    try {
        const resetUrl = `${config.frontendUrl}/auth/reset-password?token=${token}`;

        const mailOptions = {
            from: config.email.from,
            to: email,
            subject: 'Reset Your Password',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset</h2>
          <p>You requested a password reset. Click the button below to create a new password:</p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
            Reset Password
          </a>
          <p>If the button doesn't work, you can copy and paste the following link into your browser:</p>
          <p>${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, you can ignore this email.</p>
        </div>
      `
        };

        // In development mode, log the reset URL instead of sending email
        if (config.nodeEnv === 'development' && !config.email.user) {
            console.log('Password reset URL (development mode):', resetUrl);
            return;
        }

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Failed to send password reset email:', error);
        throw new Error('Failed to send password reset email');
    }
};