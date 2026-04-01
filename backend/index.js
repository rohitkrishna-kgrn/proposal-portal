require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Dynamic CORS - needs to be set up before mongoose connects
// so we use a sync fallback initially
const corsOptions = {
  origin: async (origin, callback) => {
    try {
      // Lazy require to avoid circular init issues
      const Config = require('./models/Config');
      const corsConfig = await Config.findOne({ key: 'cors' });
      const allowedOrigins = corsConfig?.value?.allowedOrigins ||
        (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(o => o.trim());
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed'));
      }
    } catch {
      // fallback: allow env origins
      const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(o => o.trim());
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // permissive on error
      }
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '10mb' }));

// Rate limiting for auth
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });

// Routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/proposals', require('./routes/proposals'));
app.use('/api/proposals', require('./routes/pdf'));
app.use('/api/proposals', require('./routes/email'));
app.use('/api/config', require('./routes/config'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Webhook: separate CORS
const webhookCors = cors({
  origin: (origin, callback) => {
    const allowed = (process.env.WEBHOOK_ALLOWED_ORIGINS || '')
      .split(',').map(o => o.trim()).filter(Boolean);
    if (!origin || allowed.length === 0 || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Webhook CORS not allowed'));
    }
  }
});
app.use('/api/webhooks', webhookCors, require('./routes/webhook'));

// Templates list endpoint
app.get('/api/templates', (_req, res) => {
  res.json([{
    id: 'einvoicing-proposal',
    name: 'eInvoicing Proposal',
    description: 'UAE eInvoicing Compliance & Implementation Proposal',
    services: ['Gap Analysis', 'Implementation', 'Annual Subscription']
  }]);
});

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/proposal_portal')
  .then(async () => {
    console.log('MongoDB connected');
    const User = require('./models/User');
    // Seed admin user
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({ name: 'Admin', email: 'admin@kgrn.com', password: 'Admin@123', role: 'admin' });
      console.log('Admin user created: admin@kgrn.com / Admin@123');
    }
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
