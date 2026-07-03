import nodemailer from "nodemailer";

// Lazy init/get of transport to prevent crash on startup if credentials are not configured.
let transporter: any = null;

function getTransporter() {
  if (transporter) return transporter;

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn("⚠️ EMAIL_USER or EMAIL_PASS environment variables are missing. Mail service will log emails to console instead.");
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });
    return transporter;
  } catch (error) {
    console.error("❌ Failed to create nodemailer transporter:", error);
    return null;
  }
}

export async function sendMail(to: string, subject: string, html: string) {
  const client = getTransporter();
  const from = process.env.EMAIL_USER || "noreply@xexit.com";

  if (!client) {
    console.log(`✉️ [Mail Log - Missing Config]
To: ${to}
Subject: ${subject}
Content: ${html.replace(/<[^>]*>/g, " ").trim().substring(0, 200)}...
    `);
    return;
  }

  try {
    await client.sendMail({
      from,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent successfully to ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error);
  }
}

// Custom helpers for XEXIT triggers
export async function sendResignationSubmissionEmail(employeeName: string, employeeEmail: string, managerName: string, lastWorkingDate: string) {
  const subject = `Resignation Submitted - ${employeeName}`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #4f46e5;">Resignation Notification</h2>
      <p>Hello HR Administrator,</p>
      <p>This is to inform you that <strong>${employeeName}</strong> has submitted a resignation request.</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Employee Email:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${employeeEmail}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Reporting Manager:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${managerName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Requested Last Working Date:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${lastWorkingDate}</td>
        </tr>
      </table>
      <p style="margin-top: 20px;">Please login to the XEXIT Admin Dashboard to review and conclude this request.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin-top: 25px;" />
      <p style="font-size: 12px; color: #777; text-align: center;">This is an automated system notification from XEXIT.</p>
    </div>
  `;
  await sendMail("admin@xexit.com", subject, html);
  await sendMail(employeeEmail, `A copy of your resignation submission`, html);
}

export async function sendResignationConclusionEmail(
  employeeName: string,
  employeeEmail: string,
  status: "approved" | "rejected",
  remarks?: string,
  finalLastWorkingDate?: string
) {
  const isApproved = status === "approved";
  const subject = `Resignation Request: ${isApproved ? "Approved" : "Rejected"}`;
  const statusColor = isApproved ? "#10b981" : "#ef4444";
  
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: ${statusColor};">Resignation Request Update</h2>
      <p>Dear ${employeeName},</p>
      <p>Your resignation request status has been updated to: <strong style="color: ${statusColor}; text-transform: uppercase;">${status}</strong>.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        ${finalLastWorkingDate ? `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Final Last Working Date:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #4f46e5; font-weight: bold;">${finalLastWorkingDate}</td>
        </tr>` : ""}
        ${remarks ? `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>HR Remarks:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-style: italic;">${remarks}</td>
        </tr>` : ""}
      </table>
      
      ${isApproved ? `
      <div style="margin-top: 20px; background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 6px;">
        <h4 style="margin: 0 0 8px 0; color: #166534;">Exit Interview Required</h4>
        <p style="margin: 0; font-size: 14px;">Since your resignation has been approved, you are now required to complete the Exit Interview form before your departure. Please login to your Employee Dashboard to submit it.</p>
      </div>` : ""}
      
      <p style="margin-top: 20px;">If you have any questions, please contact the HR team.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin-top: 25px;" />
      <p style="font-size: 12px; color: #777; text-align: center;">This is an automated system notification from XEXIT.</p>
    </div>
  `;

  await sendMail(employeeEmail, subject, html);
}

export async function sendLastWorkingDateChangeEmail(employeeName: string, employeeEmail: string, newDate: string, remarks?: string) {
  const subject = `Notification: Change in Final Last Working Date`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #4f46e5;">Final Last Working Date Updated</h2>
      <p>Dear ${employeeName},</p>
      <p>The HR Department has updated your <strong>Final Last Working Date</strong>.</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>New Last Working Date:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #4f46e5; font-weight: bold;">${newDate}</td>
        </tr>
        ${remarks ? `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>HR Remarks:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-style: italic;">${remarks}</td>
        </tr>` : ""}
      </table>
      <p style="margin-top: 20px;">If you have any questions or find any discrepancies, please reach out to the HR desk.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin-top: 25px;" />
      <p style="font-size: 12px; color: #777; text-align: center;">This is an automated system notification from XEXIT.</p>
    </div>
  `;

  await sendMail(employeeEmail, subject, html);
}
