import nodemailer from "nodemailer";

export async function sendMealUpdateEmail(to, message) {
  if (!to || typeof to !== "string" || !to.includes("@")) {
    throw new Error(`Invalid or missing recipient email: ${to}`);
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Tiffin Hub" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Meal Update Notification",
      text: message,
      html: `<p>${message.replace(/\n/g, "<br>")}</p>`, // Convert newlines to <br> for HTML
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(
      `Email error for recipient ${to}:`,
      error.message,
      error.stack
    );
    throw new Error(`Failed to send email: ${error.message}`);
  }
}
