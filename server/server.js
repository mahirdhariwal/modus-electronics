import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
 
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;
 
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '200kb' }));
app.use(cors({
  origin: process.env.ALLOW_ORIGIN ? process.env.ALLOW_ORIGIN.split(',') : '*'
}));
 
const limiter = rateLimit({ windowMs: 60 * 1000, max: 20 });
app.use('/api/', limiter);
 
app.get('/api/health', (_req, res) => res.json({ ok: true }));
 
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});
 
app.post('/api/contact', async (req, res) => {
  const { name = '', email = '', company = '', phone = '', message = '' } = req.body || {};
  if (!name.trim() || !email.trim() || !message.trim()) return res.status(400).json({ error: 'Missing required fields' });
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Invalid email' });
 
  const html = `
    <h2>New website enquiry</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Company:</strong> ${escapeHtml(company)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
    <p><strong>Message:</strong><br>${escapeHtml(message).replace(/\n/g,'<br>')}</p>
    <p style="color:#888">— Modus Electronics website</p>
  `.trim();
 
  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: process.env.TO_EMAIL,
      subject: `Website enquiry — ${name}`,
      replyTo: email,
      html
    });
 
    const row = `"${new Date().toISOString()}","${name.replace(/"/g,'""')}","${email.replace(/"/g,'""')}","${company.replace(/"/g,'""')}","${phone.replace(/"/g,'""')}","${message.replace(/"/g,'""')}"\n`;
    const logPath = path.resolve('contact-log.csv');
    fs.appendFile(logPath, row, () => {});
    res.json({ ok: true });
  } catch (err) {
    console.error('Mail error:', err);
    res.status(500).json({ error: 'Failed to send' });
  }
});
 
function escapeHtml(str=''){
  return String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}
 
app.listen(PORT, () => console.log(`Server running`));
