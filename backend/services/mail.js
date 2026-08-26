import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.myGMAIL,
    pass: process.env.password,
  },
});

async function sendMail(to, subject, htmlContent) {
  if (!process.env.myGMAIL || !process.env.password) {
    console.warn("Mail service credentials not configured. Skipping email dispatch.");
    return true; // Don't block registration if SMTP credentials are blank in development
  }

  const mailOptions = {
    from: `"SwasthaKosh Health Platform" <${process.env.myGMAIL}>`,
    to: to,
    subject: subject,
    html: htmlContent,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    return !!result;
  } catch (err) {
    console.error("Nodemailer error:", err.message);
    return false;
  }
}

export { sendMail };