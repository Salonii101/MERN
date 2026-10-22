import { generateVerificationOtpEmailTemplate } from "./emailTemplates.js";
import { sendEmail } from "./sendEmail.js";

export async function sendVerificationCode(verificationCode, email, res) {
  try {
    const message = generateVerificationOtpEmailTemplate(verificationCode);
    await sendEmail({
      email,
      subject: "Verification Code (SafeNet Security System)",
      message,
    });
    return res.status(200).json({
      success: true,
      message: "Verification OTP sent to your email.",
    });
  } catch (error) {
    console.error("Email send error:", error.message);
    // In local dev/demo mode, allow registration to proceed so user can verify with OTP
    return res.status(200).json({
      success: true,
      message: "Registration initiated. If email is not received, check spam or server logs.",
      devOtp: process.env.NODE_ENV === "development" ? verificationCode : undefined,
    });
  }
}