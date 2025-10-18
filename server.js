// import express from 'express';
// import bodyParser from 'body-parser';
// import cors from 'cors';
// import nodemailer from 'nodemailer';

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// app.post('/sendmail', async (req, res) => {
//     const { first_name, surname, Age, sex, location_problem, email, preferred_time, service } = req.body;

//     // create transporter
//     const transporter = nodemailer.createTransport({
//     host: "smtp.hostinger.com", // use Hostinger SMTP host
//     port: 465,                  // SSL port
//     secure: true,               // true for port 465
//     auth: {
//         user: "neel@taniyaweb.site", // your email
//         pass: "Client@2025n"         // your email password
//     }
// });


//     const mailOptions = {
//         from: 'neel@taniyaweb.site',
//         to: 'neel@taniyaweb.site', // where you want to receive the form
//         subject: 'New Appointment Inquiry',
//         html: `
//             <h3>New Inquiry</h3>
//             <p><strong>First Name:</strong> ${first_name}</p>
//             <p><strong>Surname:</strong> ${surname}</p>
//             <p><strong>Age:</strong> ${Age}</p>
//             <p><strong>Sex:</strong> ${sex}</p>
//             <p><strong>Location:</strong> ${location_problem}</p>
//             <p><strong>Email:</strong> ${email}</p>
//             <p><strong>Preferred Time:</strong> ${preferred_time}</p>
//             <p><strong>Service:</strong> ${service}</p>
//         `
//     };

//     try {
//         await transporter.sendMail(mailOptions);
//         res.status(200).json({ message: 'Email sent successfully' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error', error });
//     }
// });

// app.listen(5000, () => console.log('Server running on port 5000'));
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

// Enable CORS for your frontend
app.use(cors({
    origin: 'http://127.0.0.1:5500', // Matches the client's origin
}));

// Parse JSON body
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.send('Server is running');
});

// ------------------------------------------
// 1. Appointment Form Route (Existing - /sendmail)
// ------------------------------------------
app.post('/sendmail', async (req, res) => {
    const { first_name, surname, Age, sex, location_problem, email, preferred_time, service } = req.body;

    if (!first_name || !surname || !Age || !sex || !location_problem || !email || !service) {
        return res.status(400).json({ message: 'Please fill all required fields' });
    }

    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.hostinger.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: process.env.SMTP_USER,
            subject: 'New Appointment Inquiry',
            html: `
                <h3>New Appointment Inquiry</h3>
                <p><strong>First Name:</strong> ${first_name}</p>
                <p><strong>Surname:</strong> ${surname}</p>
                <p><strong>Age:</strong> ${Age}</p>
                <p><strong>Sex:</strong> ${sex}</p>
                <p><strong>Location:</strong> ${location_problem}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Preferred Time:</strong> ${preferred_time || 'Not provided'}</p>
                <p><strong>Service:</strong> ${service}</p>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Appointment email sent successfully' });

    } catch (error) {
        console.error('Error sending appointment email:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// ------------------------------------------
// 2. Contact Form Route (Handles the /contact POST)
// ------------------------------------------
app.post('/contact', async (req, res) => {
    const { username, email, message } = req.body;

    if (!username || !email || !message) {
        return res.status(400).json({ message: 'Please fill all required contact fields' });
    }

    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.hostinger.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: process.env.SMTP_USER, // The receiver email
            subject: 'New Contact Form Submission',
            html: `
                <h3>New Contact form Inquiry</h3>
                <p><strong>Name:</strong> ${username}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Your message has been sent successfully!' });

    } catch (error) {
        console.error('Error sending contact email:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));