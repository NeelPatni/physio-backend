import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

// -------------------- CORS --------------------
const allowedOrigins = [
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'http://localhost:3000',
  'https://mcorephysio.co.uk',
  'https://www.mcorephysio.co.uk'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow same-origin or Postman
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS not allowed for this origin: ' + origin), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// -------------------- JSON parser --------------------
app.use(express.json());

// -------------------- Test Route --------------------
app.get('/', (req, res) => res.send('Server is running'));

// -------------------- Nodemailer Transporter --------------------
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 465,
  secure: parseInt(process.env.SMTP_PORT) === 465, // SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false // required in some hosting environments
  }
});


// Verify SMTP connection
transporter.verify((err, success) => {
  if (err) console.error('SMTP Error:', err);
  else console.log('SMTP is ready to send emails');
});

// -------------------- Appointment Route --------------------
app.post('/sendmail', async (req, res) => {
  const { first_name, surname, age, sex, location_problem, email, preferred_time, service } = req.body;

  // Validate required fields
  if (!first_name || !surname || !age || !sex || !location_problem || !email || !service) {
    return res.status(400).json({ message: 'Please fill all required fields' });
  }

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: process.env.RECEIVER_EMAIL,
    subject: 'New Appointment Inquiry',
    html: `
      <h3>New Appointment Inquiry</h3>
      <p><strong>First Name:</strong> ${first_name}</p>
      <p><strong>Surname:</strong> ${surname}</p>
      <p><strong>Age:</strong> ${age}</p>
      <p><strong>Sex:</strong> ${sex}</p>
      <p><strong>Location:</strong> ${location_problem}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Preferred Time:</strong> ${preferred_time || 'Not provided'}</p>
      <p><strong>Service:</strong> ${service}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Appointment email sent successfully!' });
  } catch (err) {
    console.error('Error sending appointment email:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// -------------------- Contact Route --------------------
// -------------------- Contact Route (Fixed) --------------------
app.options('/contact', cors()); // enable preflight request for contact

app.post('/contact', cors(), async (req, res) => {
  const { username, email, message } = req.body;

  if (!username || !email || !message) {
    return res.status(400).json({ message: 'Please fill all required contact fields' });
  }

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: process.env.RECEIVER_EMAIL,
    subject: 'New Contact Form Submission',
    html: `
      <h3>New Contact Form Inquiry</h3>
      <p><strong>Name:</strong> ${username}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Contact form sent successfully!' });
  } catch (err) {
    console.error('Error sending contact email:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});


// -------------------- Start Server --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

