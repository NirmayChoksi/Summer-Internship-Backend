import { InfluencerCampaignStatus } from "../../modules/campaign/campaign.model.js";

export const campaignStatusTemplate = (
  name: string,
  campaignTitle: string,
  companyName: string,
  status: InfluencerCampaignStatus,
) => {
  const isAccepted = status === InfluencerCampaignStatus.Accepted;

  return `
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
                  color:${isAccepted ? "#16a34a" : "#dc2626"};
                  font-size:26px;
                "
              >
                ${isAccepted ? "Congratulations!" : "Campaign Update"}
              </h2>

              <p
                style="
                  margin:0;
                  color:#4b5563;
                  font-size:16px;
                  line-height:24px;
                "
              >
                Hi ${name},
              </p>

              <p
                style="
                  margin:20px 0;
                  color:#4b5563;
                  font-size:16px;
                  line-height:26px;
                "
              >
                ${
                  isAccepted
                    ? `Great news! Your application for <strong>${campaignTitle}</strong> by <strong>${companyName}</strong> has been accepted.`
                    : `Thank you for applying to <strong>${campaignTitle}</strong> by <strong>${companyName}</strong>. Unfortunately, your application wasn't selected this time.`
                }
              </p>

              <div
                style="
                  margin:32px 0;
                  padding:24px;
                  background:${isAccepted ? "#f0fdf4" : "#fef2f2"};
                  border:1px solid ${isAccepted ? "#bbf7d0" : "#fecaca"};
                  border-radius:12px;
                "
              >
                <h3
                  style="
                    margin:0 0 12px;
                    color:${isAccepted ? "#16a34a" : "#dc2626"};
                    font-size:20px;
                  "
                >
                  ${isAccepted ? "You're In!" : "Don't Give Up!"}
                </h3>

                <p
                  style="
                    margin:0;
                    color:#4b5563;
                    font-size:15px;
                    line-height:24px;
                  "
                >
                  ${
                    isAccepted
                      ? "The brand is interested in collaborating with you. You can now coordinate with them and prepare your campaign content."
                      : "Competition can be tough, but new campaigns are added regularly. Keep improving your profile and portfolio to increase your chances of getting selected."
                  }
                </p>
              </div>

              ${
                isAccepted
                  ? `
                    <p
                      style="
                        color:#4b5563;
                        font-size:16px;
                        line-height:24px;
                      "
                    >
                      We wish you a successful collaboration and hope it's the first of many!
                    </p>
                  `
                  : `
                    <p
                      style="
                        color:#4b5563;
                        font-size:16px;
                        line-height:24px;
                      "
                    >
                      Thank you for being part of the Influencer Hub community. Keep applying—you'll find the right opportunity soon!
                    </p>
                  `
              }

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
};
