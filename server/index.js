const express = require('express');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.post('/referrals', async (req, res) => {
  const { yourName, yourEmail, refereeName, refereeEmail } = req.body;

  if (!yourName || !yourEmail || !refereeName || !refereeEmail) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const referral = await prisma.referral.create({
      data: { yourName, yourEmail, refereeName, refereeEmail },
    });

    // Send referral email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: refereeEmail,
      subject: 'Referral Program',
      text: `Hi ${refereeName},\n\n${yourName} has referred you to join our program. Please visit our website for more details.\n\nThanks,\nTeam`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ error: 'Failed to send email' });
      } else {
        console.log('Email sent: ' + info.response);
        return res.status(200).json(referral);
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'An error occurred while saving referral data' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});