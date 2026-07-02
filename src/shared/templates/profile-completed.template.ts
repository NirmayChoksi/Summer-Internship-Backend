import { UserRole } from "../../modules/user/user.model.js";

export const profileCompletedTemplate = (firstName: string, role: UserRole) => `
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
                Profile Completed!
              </h2>

              <p
                style="
                  margin:0;
                  color:#4b5563;
                  font-size:16px;
                  line-height:24px;
                "
              >
                Hi ${firstName},
              </p>

              <p
                style="
                  margin:20px 0;
                  color:#4b5563;
                  font-size:16px;
                  line-height:26px;
                "
              >
                Congratulations! Your <strong>${role}</strong> profile has been
                successfully completed and is now ready to use.
              </p>

              <div
                style="
                  background:#eff6ff;
                  border-radius:12px;
                  padding:20px;
                  margin:32px 0;
                  text-align:left;
                "
              >
                <h3
                  style="
                    margin:0 0 12px;
                    color:#2563eb;
                    font-size:18px;
                  "
                >
                  What's next?
                </h3>

                ${
                  role === UserRole.Influencer
                    ? `
                      <ul style="margin:0;padding-left:20px;color:#4b5563;line-height:28px;">
                        <li>Browse campaigns from brands.</li>
                        <li>Upload your catalogue and showcase your work.</li>
                        <li>Apply to campaigns that match your niche.</li>
                        <li>Grow your collaborations.</li>
                      </ul>
                    `
                    : `
                      <ul style="margin:0;padding-left:20px;color:#4b5563;line-height:28px;">
                        <li>Create your first campaign.</li>
                        <li>Review influencer applications.</li>
                        <li>Collaborate with creators.</li>
                        <li>Manage your campaigns from one place.</li>
                      </ul>
                    `
                }
              </div>

              <p
                style="
                  color:#4b5563;
                  font-size:16px;
                  line-height:24px;
                "
              >
                We're excited to have you as part of the Influencer Hub
                community and can't wait to see what you accomplish.
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
