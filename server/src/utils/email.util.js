const { client, isEmailConfigured } = require('../config/email');

const senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@example.com';
const senderName = process.env.BREVO_SENDER_NAME || 'Enterprise Rental Platform';

/**
 * Send OTP verification email to admin
 */
const sendOtpEmail = async (toEmail, toName, otp) => {
  if (!isEmailConfigured()) return;

  try {
    const sendSmtpEmail = {
      sender: { email: senderEmail, name: senderName },
      to: [{ email: toEmail, name: toName }],
      subject: 'Your Login Verification Code',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #1e293b; margin-bottom: 16px;">Login Verification</h2>
          <p style="color: #475569; font-size: 15px;">Hi ${toName},</p>
          <p style="color: #475569; font-size: 15px;">Your verification code is:</p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0f172a;">${otp}</span>
          </div>
          <p style="color: #475569; font-size: 14px;">This code expires in 5 minutes. Do not share it with anyone.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 12px;">${senderName}</p>
        </div>
      `,
    };

    await client.transactionalEmails.sendTransacEmail(sendSmtpEmail);
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error.message);
  }
};

/**
 * Send booking notification email to admin
 */
const sendBookingNotificationEmail = async (booking) => {
  if (!isEmailConfigured()) return;

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) return;

  try {
    const property = booking.property;
    const user = booking.user;
    const checkIn = new Date(booking.checkIn).toLocaleDateString('en-US', { dateStyle: 'medium' });
    const checkOut = new Date(booking.checkOut).toLocaleDateString('en-US', {
      dateStyle: 'medium',
    });

    const sendSmtpEmail = {
      sender: { email: senderEmail, name: senderName },
      to: [{ email: adminEmail }],
      subject: `New Booking Confirmed: ${property?.title || 'Property'}`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #1e293b; margin-bottom: 16px;">New Booking Confirmed</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #334155;">
            <tr>
              <td style="padding: 8px 0; font-weight: 600; width: 140px;">Property</td>
              <td style="padding: 8px 0;">${property?.title || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600;">Guest Name</td>
              <td style="padding: 8px 0;">${user?.name || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600;">Guest Email</td>
              <td style="padding: 8px 0;">${user?.email || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600;">Check-in</td>
              <td style="padding: 8px 0;">${checkIn}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600;">Check-out</td>
              <td style="padding: 8px 0;">${checkOut}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600;">Nights</td>
              <td style="padding: 8px 0;">${booking.numberOfNights}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600;">Total Price</td>
              <td style="padding: 8px 0;">AED ${booking.totalPrice?.toLocaleString() || '0'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600;">Payment ID</td>
              <td style="padding: 8px 0;">${booking.paymentId || 'N/A'}</td>
            </tr>
          </table>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 12px;">${senderName} - Admin Notification</p>
        </div>
      `,
    };

    await client.transactionalEmails.sendTransacEmail(sendSmtpEmail);
  } catch (error) {
    console.error('❌ Failed to send booking notification email:', error.message);
  }
};

module.exports = { sendOtpEmail, sendBookingNotificationEmail };
