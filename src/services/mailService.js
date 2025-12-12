const axios = require("axios");

// ------------------ SEND VERIFICATION EMAIL ------------------
exports.sendVerificationEmail = async (email, token, userId, roomCode) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify?token=${token}&id=${userId}&room=${roomCode}`;

  const data = {
    sender: { email: process.env.MAIL_FROM },
    to: [{ email }],
    subject: "Verify Your Email for Secret Santa 🎅",
    htmlContent: `
      <h2>🎄 Welcome to Secret Santa</h2>
      <p>Click the button below to verify your email:</p>

      <a href="${verifyUrl}"
         style="padding:12px 18px;background:#D72638;color:white;text-decoration:none;
                font-size:16px;border-radius:6px;">
         Verify Email
      </a>

      <p>If the button doesn't work, copy this link:</p>
      <small>${verifyUrl}</small>
    `,
    trackClicks: false, // prevents Brevo from altering links
    trackOpens: false
  };

  await axios.post("https://api.brevo.com/v3/smtp/email", data, {
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json",
    },
  });
};

// ------------------ SEND ASSIGNMENT EMAIL ------------------
exports.sendAssignmentEmail = async (email, receiver) => {
  const data = {
    sender: { email: process.env.MAIL_FROM },
    to: [{ email }],
    subject: "Your Secret Santa Assignment 🎁",
    htmlContent: `
      <h2>🎅 Your Secret Santa Assignment 🎄</h2>
      <p>You have been assigned:</p>
      <h3>${receiver.name}</h3>
      <p>Make your gift meaningful and fun!</p>
    `
  };

  await axios.post("https://api.brevo.com/v3/smtp/email", data, {
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json",
    },
  });
};
