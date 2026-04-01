const router = require('express').Router();
const Config = require('../models/Config');
const { adminAuth } = require('../middleware/auth');

router.get('/', adminAuth, async (req, res) => {
  try {
    const configs = await Config.find();
    const result = {};
    configs.forEach(c => { result[c.key] = c.value; });
    // Don't expose SMTP password
    if (result.smtp) delete result.smtp.pass;
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/smtp', adminAuth, async (req, res) => {
  try {
    const { host, port, user, pass, from } = req.body;
    await Config.findOneAndUpdate(
      { key: 'smtp' },
      { value: { host, port, user, pass, from } },
      { upsert: true, new: true }
    );
    res.json({ message: 'SMTP config saved' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/cors', adminAuth, async (req, res) => {
  try {
    const { allowedOrigins } = req.body;
    await Config.findOneAndUpdate(
      { key: 'cors' },
      { value: { allowedOrigins } },
      { upsert: true, new: true }
    );
    res.json({ message: 'CORS config saved' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
