const nodemailer = require("nodemailer");

exports.sendMail = async (config) => {
  let account = await nodemailer.createTestAccount();
  try {
    const transporter = nodemailer.createTransport({
      host: "payercoins.com",
      port: 465,
      secure: true,
      auth: {
        user: "hello@payercoins.com",
        pass: "zEjP_f6MrLAw",
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const info = await transporter.sendMail({
      from: "Payercoins hello@payercoins.com",
      ...config,
    });

    return `Preview URL: %s', ${nodemailer.getTestMessageUrl(info)}`;
  } catch (err) {
    throw new Error(err.message);
  }
};
