export function generateVerificationOtpEmailTemplate(otpCode) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head><meta charset="UTF-8"><title>OTP Verification</title></head>
  <body style="margin:0; padding:0; background-color:#ffffff; font-family:Segoe UI, Tahoma, Geneva, Verdana, sans-serif; color:#000;">
    <div style="max-width:600px; margin:40px auto; border:1px solid #ddd; border-radius:10px; box-shadow:0 0 10px rgba(0,0,0,0.08); overflow:hidden;">
      <div style="background-color:#000; color:#fff; padding:20px; text-align:center; font-size:24px; font-weight:bold;">
        SafeNet Security System
      </div>
      <div style="padding:30px; text-align:center;">
        <p style="font-size:16px; margin-bottom:20px;">Use the OTP below to verify your email address:</p>
        <div style="font-size:32px; letter-spacing:12px; margin:20px 0; background-color:#f0f0f0; display:inline-block; padding:15px 30px; border-radius:8px; font-weight:bold; color:#000;">
          ${otpCode}
        </div>
        <p style="font-size:16px; margin-top:20px;">This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
      </div>
      <div style="background-color:#f9f9f9; text-align:center; padding:20px; font-size:14px; color:#555;">
        &copy; 2025 SafeNet. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
}


export function generateForgotPasswordEmailTemplate(resetPasswordUrl) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head><meta charset="UTF-8"><title>Password Reset</title></head>
  <body style="margin:0; padding:0; background-color:#ffffff; font-family:Segoe UI, Tahoma, Geneva, Verdana, sans-serif; color:#000;">
    <div style="max-width:600px; margin:50px auto; background-color:#fff; border-radius:10px; border:1px solid #ddd; box-shadow:0 0 10px rgba(0,0,0,0.08);">
      <div style="background-color:#000; color:#fff; text-align:center; padding:30px; font-size:24px; font-weight:bold;">
        Password Reset Request
      </div>
      <div style="padding:30px; text-align:center;">
        <p style="font-size:16px; margin-bottom:20px;">Hello,</p>
        <p style="font-size:16px; margin-bottom:20px;">
          We received a request to reset your password for your SafeNet Security System account. Click the button below to reset your password:
        </p>
        <a href="${resetPasswordUrl}" style="display:inline-block; margin-top:20px; background-color:#000; color:#fff; padding:14px 28px; border-radius:6px; text-decoration:none; font-weight:bold;">
          Reset Password
        </a>
        <p style="font-size:16px; margin-top:30px;">
          If you didn’t request this, you can safely ignore this email. This password reset link is valid for the next 30 minutes.
          </p>
          <p style="font-size: 16px; color: word-wrap: break-word;">${resetPasswordUrl}</p>
      </div>
      <div style="background-color:#f9f9f9; text-align:center; padding:20px; font-size:14px; color:#555;">
        &copy; 2025 SafeNet. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
}
