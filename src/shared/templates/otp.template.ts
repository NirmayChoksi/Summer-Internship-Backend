export const otpTemplate = (email: string, otp: string, isResend?: boolean) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>

<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table
          role="presentation"
          width="100%"
          style="
            max-width:600px;
            background:#ffffff;
            border-radius:12px;
            padding:40px;
          "
        >
          <tr>
            <td align="center">
              <h1
                style="
                  margin:0;
                  color:#2563eb;
                  font-size:30px;
                  font-weight:bold;
                "
              >
                Influencer Hub
              </h1>

              <h2
                style="
                  margin:32px 0 16px;
                  color:#111827;
                  font-size:24px;
                "
              >
                ${isResend ? "Your New Verification Code" : "Verify Your Email"}
              </h2>

              <p
                style="
                  margin:0;
                  color:#4b5563;
                  font-size:16px;
                  line-height:24px;
                "
              >
                Hi ${email},
              </p>

              <p
                style="
                  margin:20px 0 32px;
                  color:#4b5563;
                  font-size:16px;
                  line-height:24px;
                "
              >
                ${
                  isResend
                    ? "You requested a new verification code. Please use the OTP below to continue verifying your account."
                    : "Thank you for signing up! Please use the verification code below to verify your email address."
                }
              </p>

              <div
                style="
                  display:inline-block;
                  background:#eff6ff;
                  border:2px dashed #2563eb;
                  border-radius:12px;
                  padding:16px 32px;
                  margin-bottom:24px;
                "
              >
                <span
                  style="
                    font-size:36px;
                    font-weight:bold;
                    color:#2563eb;
                    letter-spacing:8px;
                  "
                >
                  ${otp}
                </span>
              </div>

              <p
                style="
                  margin:0;
                  color:#6b7280;
                  font-size:14px;
                "
              >
                This code is valid for
                <strong>10 minutes</strong>.
              </p>

              <p
                style="
                  margin-top:32px;
                  color:#6b7280;
                  font-size:14px;
                  line-height:22px;
                "
              >
                If you didn't request this verification code, you can safely
                ignore this email.
              </p>

              <hr
                style="
                  border:none;
                  border-top:1px solid #e5e7eb;
                  margin:40px 0 24px;
                "
              />

              <p
                style="
                  margin:0;
                  color:#9ca3af;
                  font-size:12px;
                "
              >
                © ${new Date().getFullYear()} Influencer Hub. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
