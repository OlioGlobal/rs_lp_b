const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

app.post("/api/mail", async (req, res) => {
  const { fullName, email, phone, businessName } = req.body;

  if (!fullName || !email || !phone || !businessName) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to:email,
      subject: "thanks for contacting us",
      text: `thanks for contacting us ${fullName}, we will get back to you soon`,
    };

    await transporter.sendMail(mailOptions);

    const googleSheetUrl = process.env.SCRIPT;
      const sheetResponse = await fetch(googleSheetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullName, email, phone, businessName }),
      });

      if (!sheetResponse.ok) {
        throw new Error("Failed to send data to Google Sheets");
      }



    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email." });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
